from fastapi import APIRouter
from datetime import datetime, timezone

from src.api.schemas import ScoreRequest, ScoreResponse, ScoreComponent, ThreatRequest, ThreatResponse, IdentityResponse
from src.scoring.engine import compute_ares_score
from src.scoring.tiers import score_to_tier, get_collateral_bps, get_fee_discount, get_max_tx_limit
from src.threat.detector import ThreatDetector
from src.integrations.identity_hub import get_identity, compute_did_weight
from src.integrations.ton_indexer import fetch_wallet_transactions

router = APIRouter()
threat_detector = ThreatDetector()


@router.post("/score/compute", response_model=ScoreResponse)
async def compute_score(req: ScoreRequest):
    transactions = await fetch_wallet_transactions(req.address)
    did_response = get_identity(req.address)
    did_weight = compute_did_weight(did_response)

    # Simple behavioral score based on transaction patterns
    behavioral = 0.5
    if len(transactions) > 10:
        success_ratio = sum(1 for tx in transactions if tx["success"]) / max(len(transactions), 1)
        behavioral = min(success_ratio, 1.0)

    current_time = datetime.now(timezone.utc).timestamp()
    score = compute_ares_score(
        transactions=transactions,
        did_credential_weight=did_weight,
        behavioral_score=behavioral,
        current_time=current_time,
    )

    tier = score_to_tier(score)
    tx_component = min(len(transactions) / 100, 1.0)

    return ScoreResponse(
        address=req.address,
        score=int(score),
        tier=tier,
        components=ScoreComponent(
            transaction=round(tx_component, 4),
            did=round(did_weight, 4),
            behavioral=round(behavioral, 4),
        ),
        collateral_required_bps=get_collateral_bps(score),
        fee_discount_pct=get_fee_discount(score),
        max_tx_limit_ton=get_max_tx_limit(score),
        computed_at=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/score/{address}", response_model=ScoreResponse)
async def get_score(address: str):
    # For now, compute fresh each time. In production, cache in Redis.
    from src.api.schemas import ScoreRequest
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
