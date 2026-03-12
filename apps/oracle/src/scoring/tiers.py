from typing import Tuple

TIERS = [
    ("elite", 81, 100, 2000, 40, 10000),
    ("trusted", 61, 80, 5000, 25, 1000),
    ("verified", 41, 60, 10000, 15, 200),
    ("basic", 21, 40, 15000, 5, 50),
    ("untrusted", 0, 20, 20000, 0, 10),
]


def score_to_tier(score: float) -> str:
    for name, low, high, *_ in TIERS:
        if low <= score <= high:
            return name
    return "untrusted"


def get_collateral_bps(score: float) -> int:
    for _, low, high, bps, *_ in TIERS:
        if low <= score <= high:
            return bps
    return 20000


def get_fee_discount(score: float) -> int:
    for _, low, high, _bps, discount, *_ in TIERS:
        if low <= score <= high:
            return discount
    return 0


def get_max_tx_limit(score: float) -> int:
    for _, low, high, _bps, _discount, limit in TIERS:
        if low <= score <= high:
            return limit
    return 10


def calculate_fee(base_fee_bps: int, ares_score: float) -> float:
    discount = get_fee_discount(ares_score) / 100.0
    return base_fee_bps * (1 - discount)
