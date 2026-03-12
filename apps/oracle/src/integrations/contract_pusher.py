from src.config import settings


async def push_score_onchain(address: str, score: int) -> dict:
    """Push an ARES score update to the AresRegistry contract on TON testnet.

    For hackathon demo, this returns a mock result.
    In production, this would sign and send an UpdateScore message.
    """
    if not settings.registry_contract_address:
        return {
            "success": False,
            "error": "Registry contract address not configured",
        }

    # TODO: Implement real contract interaction with tonsdk/tonutils
    # For now, return mock success for demo
    return {
        "success": True,
        "address": address,
        "score": score,
        "registry": settings.registry_contract_address,
        "tx_hash": f"mock_tx_{address[:8]}_{score}",
    }
