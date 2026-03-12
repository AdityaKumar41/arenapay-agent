from pydantic import BaseModel
from typing import Optional


class ScoreRequest(BaseModel):
    address: str


class ScoreComponent(BaseModel):
    transaction: float
    did: float
    behavioral: float


class ScoreResponse(BaseModel):
    address: str
    score: int
    tier: str
    components: ScoreComponent
    collateral_required_bps: int
    fee_discount_pct: int
    max_tx_limit_ton: int
    computed_at: str


class ThreatRequest(BaseModel):
    sender: str
    destination: str
    amount: int
    sender_balance: Optional[int] = None


class ThreatResponse(BaseModel):
    risk_score: float
    action: str
    flags: list[str]


class IdentityResponse(BaseModel):
    did: str
    verified: bool
    credentials: list[dict]
    sybil_resistance_level: str
