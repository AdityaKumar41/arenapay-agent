import hashlib


def get_identity(ton_address: str) -> dict:
    """Mock IdentityHub DID response.

    Deterministic: same address always produces the same identity.
    Addresses are bucketed by hash to produce different DID levels.
    """
    h = int(hashlib.sha256(ton_address.encode()).hexdigest(), 16) % 100

    if h < 20:
        # Unverified user
        return {
            "did": f"did:ton:{ton_address}",
            "verified": False,
            "credentials": [],
        }
    elif h < 50:
        # Low sybil resistance
        return {
            "did": f"did:ton:{ton_address}",
            "verified": True,
            "credentials": [
                {
                    "type": "HumanityProof",
                    "issuer": "did:ton:identityhub",
                    "issuanceDate": "2025-06-01T00:00:00Z",
                    "credentialSubject": {
                        "sybilResistanceLevel": "low",
                    },
                }
            ],
        }
    elif h < 80:
        # Medium sybil resistance
        return {
            "did": f"did:ton:{ton_address}",
            "verified": True,
            "credentials": [
                {
                    "type": "HumanityProof",
                    "issuer": "did:ton:identityhub",
                    "issuanceDate": "2025-03-15T00:00:00Z",
                    "credentialSubject": {
                        "sybilResistanceLevel": "medium",
                    },
                }
            ],
        }
    else:
        # High sybil resistance + KYC
        return {
            "did": f"did:ton:{ton_address}",
            "verified": True,
            "credentials": [
                {
                    "type": "HumanityProof",
                    "issuer": "did:ton:identityhub",
                    "issuanceDate": "2025-01-10T00:00:00Z",
                    "credentialSubject": {
                        "sybilResistanceLevel": "high",
                    },
                },
                {
                    "type": "KYCVerified",
                    "issuer": "did:ton:identityhub",
                    "issuanceDate": "2025-02-20T00:00:00Z",
                    "credentialSubject": {
                        "kycLevel": "full",
                    },
                },
            ],
        }


def compute_did_weight(did_response: dict) -> float:
    """Convert IdentityHub DID data to the I_DID(u) score component."""
    if not did_response.get("verified"):
        return 0.0

    base = 0.3  # baseline for any verified DID

    for cred in did_response.get("credentials", []):
        if cred.get("type") == "HumanityProof":
            level = cred.get("credentialSubject", {}).get("sybilResistanceLevel", "")
            if level == "high":
                base += 0.5
            elif level == "medium":
                base += 0.3
            elif level == "low":
                base += 0.1

        if cred.get("type") == "KYCVerified":
            base += 0.2

    return min(base, 1.0)
