from src.integrations.redis_client import cache_smembers


async def periodic_score_refresh():
    """Periodically refresh ARES scores for all tracked wallets."""
    from src.api.routes import _compute_score_internal
    tracked = cache_smembers("ares:tracked_wallets")
    for address in tracked:
        try:
            await _compute_score_internal(address)
        except Exception:
            pass
