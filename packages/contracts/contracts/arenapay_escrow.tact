import "@stdlib/deploy";
import "@stdlib/ownable";

const MIN_COLLATERAL_BPS: Int = 2000; // 20% floor — PRD §14.3

message InitiateSettlement {
    recipient: Address;
    amount: Int as coins;
    requiredCollateralBps: Int as uint16;
}

message ReleaseSettlement {
    settlementId: Int as uint64;
}

message ClaimCollateral {
    settlementId: Int as uint64;
}

message Pause {}
message Unpause {}

struct Settlement {
    sender: Address;
    recipient: Address;
    amount: Int as coins;
    collateral: Int as coins;
    status: Int as uint8;
    createdAt: Int as uint64;
    expiresAt: Int as uint64;
}

contract ArenapayEscrow with Deployable, Ownable {
    owner: Address;
    registryAddress: Address;
    settlements: map<Int, Settlement>;
    nextSettlementId: Int as uint64;
    totalSettlements: Int as uint64;
    isPaused: Bool;

    init(registry: Address) {
        self.owner = sender();
        self.registryAddress = registry;
        self.nextSettlementId = 1;
        self.totalSettlements = 0;
        self.isPaused = false;
    }

    receive(msg: InitiateSettlement) {
        require(!self.isPaused, "Contract is paused");
        require(msg.amount > 0, "Amount must be positive");

        // PRD §14.3 — enforce minimum 20% collateral floor
        let effectiveBps: Int = msg.requiredCollateralBps;
        if (effectiveBps < MIN_COLLATERAL_BPS) {
            effectiveBps = MIN_COLLATERAL_BPS;
        }

        let collateralRequired: Int = (msg.amount * effectiveBps) / 10000;
        require(context().value >= collateralRequired, "Insufficient collateral sent");

        let id: Int = self.nextSettlementId;
        self.nextSettlementId = self.nextSettlementId + 1;
        self.totalSettlements = self.totalSettlements + 1;

        self.settlements.set(id, Settlement{
            sender: sender(),
            recipient: msg.recipient,
            amount: msg.amount,
            collateral: context().value,
            status: 0,
            createdAt: now(),
            expiresAt: now() + 86400
        });
    }

    receive(msg: ReleaseSettlement) {
        self.requireOwner();
        require(!self.isPaused, "Contract is paused");

        let settlement: Settlement? = self.settlements.get(msg.settlementId);
        require(settlement != null, "Settlement not found");
        require(settlement!!.status == 0, "Settlement not in pending state");

        send(SendParameters{
            to: settlement!!.recipient,
            value: settlement!!.amount,
            bounce: true,
            body: "arenapay settlement".asComment()
        });

        let remaining: Int = settlement!!.collateral - settlement!!.amount;
        if (remaining > ton("0.01")) {
            send(SendParameters{
                to: settlement!!.sender,
                value: remaining,
                bounce: true,
                body: "collateral refund".asComment()
            });
        }

        self.settlements.set(msg.settlementId, Settlement{
            sender: settlement!!.sender,
            recipient: settlement!!.recipient,
            amount: settlement!!.amount,
            collateral: settlement!!.collateral,
            status: 1,
            createdAt: settlement!!.createdAt,
            expiresAt: settlement!!.expiresAt
        });
    }

    receive(msg: ClaimCollateral) {
        let settlement: Settlement? = self.settlements.get(msg.settlementId);
        require(settlement != null, "Settlement not found");
        require(settlement!!.status == 0, "Settlement not in pending state");
        require(now() > settlement!!.expiresAt, "Settlement has not expired yet");
        require(sender() == settlement!!.sender, "Only sender can claim expired collateral");

        send(SendParameters{
            to: settlement!!.sender,
            value: settlement!!.collateral,
            bounce: true,
            body: "expired collateral return".asComment()
        });

        self.settlements.set(msg.settlementId, Settlement{
            sender: settlement!!.sender,
            recipient: settlement!!.recipient,
            amount: settlement!!.amount,
            collateral: settlement!!.collateral,
            status: 3,
            createdAt: settlement!!.createdAt,
            expiresAt: settlement!!.expiresAt
        });
    }

    // PRD §14.3 — emergency pause (owner only)
    receive(msg: Pause) {
        self.requireOwner();
        self.isPaused = true;
    }

    receive(msg: Unpause) {
        self.requireOwner();
        self.isPaused = false;
    }

    get fun getSettlement(id: Int): Settlement? {
        return self.settlements.get(id);
    }

    get fun getNextSettlementId(): Int {
        return self.nextSettlementId;
    }

    get fun getTotalSettlements(): Int {
        return self.totalSettlements;
    }

    get fun isPausedState(): Bool {
        return self.isPaused;
    }

    get fun getMinCollateralBps(): Int {
        return MIN_COLLATERAL_BPS;
    }
}
