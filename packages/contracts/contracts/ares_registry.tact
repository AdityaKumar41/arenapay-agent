import "@stdlib/deploy";
import "@stdlib/ownable";

message UpdateScore {
    wallet: Address;
    score: Int as uint8;
    timestamp: Int as uint64;
}

message ChangeOracle {
    newOracle: Address;
}

struct WalletReputation {
    score: Int as uint8;
    lastUpdated: Int as uint64;
    totalTransactions: Int as uint32;
    successfulSettlements: Int as uint32;
}

contract AresRegistry with Deployable, Ownable {
    owner: Address;
    oracleAddress: Address;
    reputations: map<Address, WalletReputation>;
    totalWallets: Int as uint32;

    init(oracle: Address) {
        self.owner = sender();
        self.oracleAddress = oracle;
        self.totalWallets = 0;
    }

    receive(msg: UpdateScore) {
        require(sender() == self.oracleAddress, "Unauthorized: only oracle can update scores");
        require(msg.score <= 100, "Invalid score: must be 0-100");

        // PRD §8.2 — reject stale updates (> 1 hour old) and future timestamps
        require(msg.timestamp <= now() + 60, "Timestamp is in the future");
        require(msg.timestamp >= now() - 3600, "Score update is too stale (>1h)");

        let existing: WalletReputation? = self.reputations.get(msg.wallet);
        let txCount: Int = 0;
        let successCount: Int = 0;

        if (existing != null) {
            txCount = existing!!.totalTransactions;
            successCount = existing!!.successfulSettlements;
        } else {
            self.totalWallets = self.totalWallets + 1;
        }

        self.reputations.set(msg.wallet, WalletReputation{
            score: msg.score,
            lastUpdated: msg.timestamp,
            totalTransactions: txCount + 1,
            successfulSettlements: successCount + 1
        });
    }

    receive(msg: ChangeOracle) {
        self.requireOwner();
        self.oracleAddress = msg.newOracle;
    }

    get fun getScore(wallet: Address): Int {
        let rep: WalletReputation? = self.reputations.get(wallet);
        if (rep != null) {
            return rep!!.score;
        }
        return 0;
    }

    get fun getFullReputation(wallet: Address): WalletReputation? {
        return self.reputations.get(wallet);
    }

    get fun getOracleAddress(): Address {
        return self.oracleAddress;
    }

    get fun getTotalWallets(): Int {
        return self.totalWallets;
    }
}
