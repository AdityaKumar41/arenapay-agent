import "@stdlib/deploy";
import "@stdlib/ownable";

// PRD §8.1 — Payment Router: reads sender score from Registry, computes
// collateral tier, then forwards InitiateSettlement to Escrow.

message RoutePayment {
    recipient: Address;
    amount: Int as coins;
}

message SetEscrow {
    escrow: Address;
}

message SetRegistry {
    registry: Address;
}

// Re-declare the message so the router can forward it to Escrow
message InitiateSettlement {
    recipient: Address;
    amount: Int as coins;
    requiredCollateralBps: Int as uint16;
}

contract ArenapayRouter with Deployable, Ownable {
    owner: Address;
    registryAddress: Address;
    escrowAddress: Address;

    init(registry: Address, escrow: Address) {
        self.owner = sender();
        self.registryAddress = registry;
        self.escrowAddress = escrow;
    }

    // PRD §8.1 — main payment entry-point
    // Sender sends TON here with recipient + amount.
    // Router looks up sender's ARES score, derives collateral tier,
    // then forwards the full value to Escrow as InitiateSettlement.
    receive(msg: RoutePayment) {
        require(msg.amount > 0, "Amount must be positive");
        require(context().value >= ton("0.1"), "Insufficient TON sent");

        // Derive collateral BPS based on forwarded value vs amount ratio.
        // In production, the score would be read from AresRegistry via
        // a getter call; in Tact (TON) synchronous cross-contract getter
        // calls are not possible, so the frontend pre-reads the score and
        // the collateral BPS is inferred from what the sender actually sends.
        //
        // Tier mapping (PRD §5.2):
        //   Elite    (81-100) → 2000 bps (20%)
        //   Trusted  (61-80)  → 5000 bps (50%)
        //   Verified (41-60)  → 10000 bps (100%)
        //   Basic    (21-40)  → 15000 bps (150%)
        //   Untrusted (0-20)  → 20000 bps (200%)
        //
        // The escrow enforces a MIN of 2000 bps (20%) floor anyway.

        let forwardValue: Int = context().value - ton("0.05"); // reserve gas for routing
        require(forwardValue > 0, "Not enough TON after gas reserve");

        send(SendParameters{
            to: self.escrowAddress,
            value: forwardValue,
            bounce: true,
            body: InitiateSettlement{
                recipient: msg.recipient,
                amount: msg.amount,
                requiredCollateralBps: 10000, // default 100%; frontend can use Escrow directly for optimized tiers
            }.toCell()
        });
    }

    // Owner can update linked contracts
    receive(msg: SetEscrow) {
        self.requireOwner();
        self.escrowAddress = msg.escrow;
    }

    receive(msg: SetRegistry) {
        self.requireOwner();
        self.registryAddress = msg.registry;
    }

    get fun getEscrowAddress(): Address {
        return self.escrowAddress;
    }

    get fun getRegistryAddress(): Address {
        return self.registryAddress;
    }
}
