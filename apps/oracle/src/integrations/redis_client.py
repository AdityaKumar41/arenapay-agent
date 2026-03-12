import json
import redis as redis_client
from src.config import settings

_redis = None


def get_redis():
    global _redis
    if _redis is None:
        try:
            _redis = redis_client.from_url(
                getattr(settings, "redis_url", "redis://localhost:6379"),
                decode_responses=True,
                socket_connect_timeout=2,
            )
            _redis.ping()
        except Exception:
            _redis = None
    return _redis


def cache_get(key: str):
    r = get_redis()
    if r is None:
        return None
    try:
        val = r.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None


def cache_set(key: str, value: dict, ttl: int = 300):
    r = get_redis()
    if r is None:
        return
    try:
        r.setex(key, ttl, json.dumps(value))
    except Exception:
        pass


def cache_sadd(key: str, member: str):
    r = get_redis()
    if r is None:
        return
    try:
        r.sadd(key, member)
        r.expire(key, 86400)  # 24h TTL on tracked-wallets set
    except Exception:
        pass


def cache_smembers(key: str):
    r = get_redis()
    if r is None:
        return set()
    try:
        return r.smembers(key)
    except Exception:
        return set()
