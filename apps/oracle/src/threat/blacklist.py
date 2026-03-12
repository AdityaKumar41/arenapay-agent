"""Blacklist backed by Redis for persistence across restarts.

PRD §12.2: `threat:blacklist:{contract_address}` Redis keys.
Falls back to in-memory set if Redis is unavailable.
"""
import json
import os
from src.integrations.redis_client import get_redis

REDIS_KEY_PREFIX = "threat:blacklist:"

# Seed from JSON file on startup
_data_path = os.path.join(os.path.dirname(__file__), "..", "data", "malicious_addresses.json")
_seed_addresses: set[str] = set()
if os.path.exists(_data_path):
    try:
        with open(_data_path, "r") as f:
            _seed_addresses = set(json.load(f))
    except Exception:
        pass

# In-memory fallback (used when Redis is down)
_fallback: set[str] = set(_seed_addresses)


def _seed_redis() -> None:
    """Push JSON seed addresses into Redis on first startup."""
    r = get_redis()
    if r is None:
        return
    for addr in _seed_addresses:
        try:
            r.set(f"{REDIS_KEY_PREFIX}{addr}", "1")
        except Exception:
            pass


# Seed Redis once at import time
_seed_redis()


def is_blacklisted(address: str) -> bool:
    """Check if an address is blacklisted (Redis-backed with in-memory fallback)."""
    r = get_redis()
    if r is not None:
        try:
            return r.exists(f"{REDIS_KEY_PREFIX}{address}") > 0
        except Exception:
            pass
    return address in _fallback


def add_to_blacklist(address: str) -> None:
    """Add an address to the blacklist (Redis-backed with in-memory fallback)."""
    r = get_redis()
    if r is not None:
        try:
            r.set(f"{REDIS_KEY_PREFIX}{address}", "1")
            return
        except Exception:
            pass
    _fallback.add(address)
