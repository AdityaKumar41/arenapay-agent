from fastapi import APIRouter
from datetime import datetime, timezone

from src.api.schemas import (
    ScoreRequest, ScoreResponse, ScoreComponent,
    ThreatRequest, ThreatResponse, IdentityResponse,
)
from src.scoring.engine import compute_ares_score
from src.scoring.features import extract_features
from src.scoring.tiers import score_to_tier, get_collateral_bps, get_fee_discount, get_max_tx_limit
from src.threat.detector import ThreatDetector
from src.integrations.identity_hub import get_identity, compute_did_weight
from src.integrations.ton_indexer import fetch_wallet_transactions
from src.integrations.redis_client import cache_get, cache_set, cache_sadd

router = APIRouter()
threat_detector = ThreatDetector()

SCORE_CACHE_TTL = 300  # 5 minutes


def _compute_behavioral(transactions: list, did_response: dict) -> float:
    """Derive behavioral score from extracted wallet features + identity context.

    Combines 5 signals:
      - successful_tx_ratio      (0-1)
      - interaction_diversity    (0-1, capped at 20 unique counterparties)
      - temporal_regularity      (0-1, capped at 50 txs)
      - identity_bonus           +0.1 if DID verified
      - credential_depth_bonus   +0.05 per credential (capped at +0.15)

    Final value is clamped to [0, 1].
    """
    features = extract_features(transactions)

    score = (
        features["successful_tx_ratio"] * 0.4
        + features["interaction_diversity_score"] * 0.3
        + features["temporal_regularity_score"] * 0.3
    )

    # Identity bonus
    if did_response.get("verified"):
        score += 0.10
    cred_count = len(did_response.get("credentials", []))
    score += min(cred_count * 0.05, 0.15)

    return min(round(score, 4), 1.0)


async def _compute_score_internal(address: str) -> dict:
    """Core scoring logic — shared between POST /score/compute and scheduler."""
    transactions = await fetch_wallet_transactions(address)
    did_response = get_identity(address)
    did_weight = compute_did_weight(did_response)
    behavioral = _compute_behavioral(transactions, did_response)

    current_time = datetime.now(timezone.utc).timestamp()
    result_engine = compute_ares_score(
        transactions=transactions,
        did_credential_weight=did_weight,
        behavioral_score=behavioral,
        current_time=current_time,
    )

    score = result_engine["score"]
    tier = score_to_tier(score)

    result = {
        "address": address,
        "score": int(score),
        "tier": tier,
        "components": {
            # Use the actual engine-computed components, not proxy calculations
            "transaction": result_engine["tx_score"],
            "did": result_engine["did_score"],
            "behavioral": result_engine["behavioral"],
        },
        "collateral_required_bps": get_collateral_bps(score),
        "fee_discount_pct": get_fee_discount(score),
        "max_tx_limit_ton": get_max_tx_limit(score),
        "computed_at": datetime.now(timezone.utc).isoformat(),
    }

    # Cache result and track wallet for periodic refresh
    cache_set(f"ares:score:{address}", result, SCORE_CACHE_TTL)
    cache_sadd("ares:tracked_wallets", address)
    return result


@router.post("/score/compute", response_model=ScoreResponse)
async def compute_score(req: ScoreRequest):
    data = await _compute_score_internal(req.address)
    return ScoreResponse(
        address=data["address"],
        score=data["score"],
        tier=data["tier"],
        components=ScoreComponent(**data["components"]),
        collateral_required_bps=data["collateral_required_bps"],
        fee_discount_pct=data["fee_discount_pct"],
        max_tx_limit_ton=data["max_tx_limit_ton"],
        computed_at=data["computed_at"],
    )


@router.get("/score/{address}", response_model=ScoreResponse)
async def get_score(address: str):
    # Cache hit
    cached = cache_get(f"ares:score:{address}")
    if cached:
        return ScoreResponse(
            address=cached["address"],
            score=cached["score"],
            tier=cached["tier"],
            components=ScoreComponent(**cached["components"]),
            collateral_required_bps=cached["collateral_required_bps"],
            fee_discount_pct=cached["fee_discount_pct"],
            max_tx_limit_ton=cached["max_tx_limit_ton"],
            computed_at=cached["computed_at"],
        )
    return await compute_score(ScoreRequest(address=address))


@router.post("/threat/analyze", response_model=ThreatResponse)
async def analyze_threat(req: ThreatRequest):
    result = threat_detector.analyze_transaction({
        "sender": req.sender,
        "destination": req.destination,
        "amount": req.amount,
        "sender_balance": req.sender_balance or req.amount * 2,
    })
    return ThreatResponse(**result)


@router.get("/identity/{address}", response_model=IdentityResponse)
async def get_identity_endpoint(address: str):
    identity = get_identity(address)
    level = "none"
    for cred in identity.get("credentials", []):
        if cred.get("type") == "HumanityProof":
            level = cred["credentialSubject"]["sybilResistanceLevel"]
    return IdentityResponse(
        did=identity.get("did", f"did:ton:{address}"),
        verified=identity.get("verified", False),
        credentials=identity.get("credentials", []),
        sybil_resistance_level=level,
    )
