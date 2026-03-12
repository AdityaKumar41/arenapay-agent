from src.threat.blacklist import is_blacklisted


class ThreatDetector:
    """Real-time threat detection for arenapay transactions."""

    def analyze_transaction(self, tx: dict) -> dict:
        risk_flags = []
        risk_score = 0.0

        # Check 1: Known malicious contract interaction
        if is_blacklisted(tx.get("destination", "")):
            risk_flags.append("KNOWN_MALICIOUS_CONTRACT")
            risk_score = 1.0

        # Check 2: Unusual amount pattern (drainer signature)
        sender_balance = tx.get("sender_balance", 0)
        amount = tx.get("amount", 0)
        if sender_balance > 0 and amount >= sender_balance * 0.95:
            risk_flags.append("POTENTIAL_DRAIN_PATTERN")
            risk_score = max(risk_score, 0.8)

        # Check 3: New contract with no history
        if tx.get("dest_contract_age_hours", float("inf")) < 24:
            risk_flags.append("NEW_UNVERIFIED_CONTRACT")
            risk_score = max(risk_score, 0.4)

        # Check 4: Rapid sequential transactions (bot behavior)
        if tx.get("sender_tx_last_minute", 0) > 10:
            risk_flags.append("RAPID_TX_PATTERN")
            risk_score = max(risk_score, 0.6)

        if risk_score > 0.7:
            action = "BLOCK"
        elif risk_score > 0.3:
            action = "WARN"
        else:
            action = "ALLOW"

        return {
            "risk_score": round(risk_score, 2),
            "flags": risk_flags,
            "action": action,
        }
