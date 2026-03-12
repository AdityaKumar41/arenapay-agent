def extract_features(transactions: list, wallet_age_days: int = 0) -> dict:
    """Extract features from wallet transaction history for scoring."""
    if not transactions:
        return {
            "wallet_age_days": wallet_age_days,
            "total_tx_count": 0,
            "successful_tx_ratio": 0.0,
            "avg_tx_volume_ton": 0.0,
            "unique_counterparties": 0,
            "interaction_diversity_score": 0.0,
            "temporal_regularity_score": 0.0,
        }

    total = len(transactions)
    successful = sum(1 for tx in transactions if tx.get("success", True))

    volumes = [tx.get("volume", 0) for tx in transactions]
    counterparties = set()
    for tx in transactions:
        if tx.get("destination"):
            counterparties.add(tx["destination"])

    return {
        "wallet_age_days": wallet_age_days,
        "total_tx_count": total,
        "successful_tx_ratio": successful / max(total, 1),
        "avg_tx_volume_ton": sum(volumes) / max(total, 1),
        "unique_counterparties": len(counterparties),
        "interaction_diversity_score": min(len(counterparties) / 20.0, 1.0),
        "temporal_regularity_score": min(total / 50.0, 1.0),
    }
