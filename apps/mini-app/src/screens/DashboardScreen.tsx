import { useEffect, useState } from "react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useAppStore } from "../stores/appStore";
import { useAresScore } from "../hooks/useAresScore";
import { useRealtimeScore } from "../hooks/useRealtimeScore";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { api } from "../services/api";
import { formatTon } from "../utils/formatters";
import { TIER_CONFIG } from "../utils/constants";
import { useQueryClient } from "@tanstack/react-query";
import ReputationGauge from "../components/ReputationGauge";
import WalletHeader from "../components/WalletHeader";
import { ScoreSkeleton } from "../components/SkeletonLoader";

export default function DashboardScreen() {
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const { setScreen, setWallet } = useAppStore();
  const { data: score, isLoading, isError } = useAresScore(address || null);
  const { data: balance } = useWalletBalance(address || null);
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  useRealtimeScore(address || null);

  useEffect(() => {
    if (!address) setScreen("onboarding");
  }, [address, setScreen]);

  const handleDisconnect = async () => {
    await tonConnectUI.disconnect();
    setWallet(null);
    setScreen("onboarding");
  };

  const handleRefresh = async () => {
    if (!address || refreshing) return;
    setRefreshing(true);
    try {
      await api.refreshScore(address);
      await queryClient.invalidateQueries({ queryKey: ["score", address] });
      await queryClient.invalidateQueries({ queryKey: ["balance", address] });
    } catch { /* Ignore */ }
    setRefreshing(false);
  };

  if (!address) return null;

  const tierConfig = score ? TIER_CONFIG[score.tier] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <WalletHeader address={address} balance={balance} onDisconnect={handleDisconnect} />

      <div className="flex-1 px-4 py-4 space-y-5">
        {isLoading ? (
          <ScoreSkeleton />
        ) : isError ? (
          <div className="text-center py-8">
            <p className="text-white/50 text-sm mb-3">Unable to load score</p>
            <button onClick={handleRefresh} className="text-xs text-arena-purple hover:text-arena-purple/80 transition-colors">
              Try again
            </button>
          </div>
        ) : score ? (
          <>
            {/* Balance */}
            {balance !== undefined && (
              <div className="text-center pt-2">
                <p className="text-3xl font-bold text-white">{formatTon(balance)}</p>
                <p className="text-xs text-white/40 mt-1">Available Balance</p>
              </div>
            )}

            {/* Gauge + refresh */}
            <div className="relative">
              <ReputationGauge score={score.score} tier={score.tier} />
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh score"
                className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-colors disabled:opacity-30"
              >
                <svg
                  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={refreshing ? "animate-spin text-arena-purple" : "text-white/40"}
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </div>

            {/* Tier badge inline */}
            {tierConfig && (
              <div className="card flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-2.5 h-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tierConfig.color }} />
                    {score.tier === "elite" && (
                      <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: tierConfig.color }} />
                    )}
                  </div>
                  <span className="text-sm font-semibold">{tierConfig.label} Tier</span>
                </div>
                <div className="flex gap-3 text-xs text-white/50">
                  <span>{Math.round(score.collateralRequiredBps / 100)}% collateral</span>
                  <span className="text-arena-green">{score.feeDiscountPct}% discount</span>
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* Action buttons */}
        <div className="space-y-3 pt-1">
          <button
            onClick={() => setScreen("send-payment")}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            Send Payment
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setScreen("receive")} className="btn-secondary flex items-center justify-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              Receive
            </button>
            <button onClick={() => setScreen("score-breakdown")} className="btn-secondary flex items-center justify-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Score Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
