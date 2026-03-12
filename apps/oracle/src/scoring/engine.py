import numpy as np
from typing import Optional


def compute_ares_score(
    transactions: list,
    did_credential_weight: float,
    behavioral_score: float,
    current_time: float,
    lambda_w: float = 0.5,
    kappa: float = 0.3,
    mu: float = 0.2,
    delta: float = 0.01,
) -> float:
    """Compute discrete ARES reputation score.

    Args:
        transactions: List of dicts with {timestamp, volume, success}.
        did_credential_weight: 0.0-1.0 from IdentityHub DID verification.
        behavioral_score: 0.0-1.0 from ML behavioral model.
        current_time: Current UNIX timestamp.
        lambda_w: Transaction history weight.
        kappa: DID credential weight.
        mu: Behavioral weight.
        delta: Time decay factor.

    Returns:
        ARES reputation score (0-100).
    """
    # Discrete approximation of the time-decayed integral
    tx_score = 0.0
    for tx in transactions:
        age = current_time - tx["timestamp"]
        decay = np.exp(-delta * age)
        value = tx["volume"] * (1.0 if tx["success"] else -0.5)
        tx_score += decay * value

    # Normalize transaction score to [0, 1]
    tx_score = float(np.clip(tx_score / (tx_score + 100), 0, 1))

    # Weighted combination
    raw = (lambda_w * tx_score) + (kappa * did_credential_weight) + (mu * behavioral_score)

    # Scaled sigmoid activation -> [0, 100]
    reputation = 100.0 / (1.0 + np.exp(-10 * (raw - 0.5)))

    return round(float(reputation), 2)
