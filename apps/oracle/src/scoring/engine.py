import numpy as np


def compute_ares_score(
    transactions: list,
    did_credential_weight: float,
    behavioral_score: float,
    current_time: float,
    lambda_w: float = 0.5,
    kappa: float = 0.3,
    mu: float = 0.2,
    delta: float = 0.00001,  # per-second decay: exp(-0.00001*86400)~0.42 for 1-day-old tx
) -> dict:
    """Compute ARES reputation score with full component breakdown.

    Returns:
        dict with keys: score, tx_score, did_score, behavioral, raw
    """
    # --- Transaction component (time-decayed, normalised to [0,1]) ---
    tx_raw = 0.0
    for tx in transactions:
        age = current_time - tx["timestamp"]
        decay = float(np.exp(-delta * max(age, 0)))
        value = tx["volume"] * (1.0 if tx["success"] else -0.5)
        tx_raw += decay * value

    # x/(x+100): ~100 TON of decayed volume = 0.5 normalised score
    tx_score = float(np.clip(tx_raw / (tx_raw + 100) if tx_raw > 0 else 0.0, 0.0, 1.0))

    # --- Weighted combination ---
    raw = (lambda_w * tx_score) + (kappa * float(did_credential_weight)) + (mu * float(behavioral_score))

    # --- Scaled sigmoid -> [0, 100] ---
    reputation = 100.0 / (1.0 + float(np.exp(-10.0 * (raw - 0.5))))

    return {
        "score": round(reputation, 2),
        "tx_score": round(tx_score, 4),
        "did_score": round(float(did_credential_weight), 4),
        "behavioral": round(float(behavioral_score), 4),
        "raw": round(raw, 4),
    }
