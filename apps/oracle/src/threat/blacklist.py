import json
import os

MALICIOUS_ADDRESSES: set[str] = set()

_data_path = os.path.join(os.path.dirname(__file__), "..", "data", "malicious_addresses.json")
if os.path.exists(_data_path):
    with open(_data_path, "r") as f:
        MALICIOUS_ADDRESSES = set(json.load(f))


def is_blacklisted(address: str) -> bool:
    return address in MALICIOUS_ADDRESSES


def add_to_blacklist(address: str) -> None:
    MALICIOUS_ADDRESSES.add(address)
