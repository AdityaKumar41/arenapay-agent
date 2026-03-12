import { useTonAddress } from "@tonconnect/ui-react";
import { useAppStore } from "../stores/appStore";
import { useAresScore } from "../hooks/useAresScore";
import { useScoreHistory } from "../hooks/useScoreHistory";
import ScreenHeader from "../components/ScreenHeader";
import ScoreComponentBar from "../components/ScoreComponentBar";
import ScoreHistoryChart from "../components/ScoreHistoryChart";
import { ScoreSkeleton } from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import { TIER_CONFIG } from "../utils/constants";

const LAMBDA = 0.5;
const KAPPA = 0.3;
const MU = 0.2;

const TIER_ORDER = ["untrusted", "basic", "verified", "trusted", "elite"] as const;

export default function ScoreBreakdownScreen() {
  const address = useTonAddress();
  const { setScreen } = useAppStore();
  const { data: score, isLoading, isError } = useAresScore(address || null);
  const { data: history } = useScoreHistory(address || null, 30);

  const txContrib = ((score?.components.transaction || 0) * LAMBDA * 100);
  const didContrib = ((score?.components.did || 0) * KAPPA * 100);
  const behavContrib = ((score?.components.behavioral || 0) * MU * 100);

  const tips: { text: string; action?: string }[] = [];
  if ((score?.components.did || 0) < 0.5)
    tips.push({ text: "Verify your identity on IdentityHub", action: "Up to +30 points" });
  if ((score?.components.transaction || 0) < 0.5)
    tips.push({ text: "Build transaction history with successful payments", action: "Up to +50 points" });
  if ((score?.components.behavioral || 0) < 0.5)
    tips.push({ text: "Interact with more dApps and contracts", action: "Up to +20 points" });

  // Next tier info
  const currentTierIdx = score ? TIER_ORDER.indexOf(score.tier as typeof TIER_ORDER[number]) : -1;
  const nextTier = currentTierIdx >= 0 && currentTierIdx < 4 ? TIER_ORDER[currentTierIdx + 1] : null;
  const nextTierConfig = nextTier ? TIER_CONFIG[nextTier] : null;
  const nextTierMinScore = nextTier ? [0, 21, 41, 61, 81][TIER_ORDER.indexOf(nextTier)] : 0;
  const pointsToNext = score && nextTier ? Math.max(nextTierMinScore - score.score, 0) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <ScreenHeader title="Score Breakdown" onBack={() => setScreen("dashboard")} />

      <div className="flex-1 px-4 py-4 space-y-5">
        {isLoading ? (
          <ScoreSkeleton />
        ) : isError ? (
          <EmptyState icon="alert" title="Unable to load score" description="Check your connection and try again" />
        ) : !score ? (
          <EmptyState icon="chart" title="No score data" description="Connect your wallet and make transactions to build your ARES score" />
        ) : (
          <>
            {/* Final Score */}
            <div className="text-center py-2">
              <span className="text-5xl font-bold text-arena-purple">{score.score}</span>
              <span className="text-lg text-white/30 ml-1">/100</span>

              {/* Tier progression */}
              {nextTierConfig && pointsToNext > 0 && (
                <div className="mt-3 max-w-[240px] mx-auto">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-white/40">{TIER_CONFIG[score.tier].label}</span>
                    <span style={{ color: nextTierConfig.color }} className="font-medium">
                      {nextTierConfig.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(((score.score - [0, 0, 21, 41, 61][currentTierIdx]) / (nextTierMinScore - [0, 0, 21, 41, 61][currentTierIdx])) * 100, 100)}%`,
                        backgroundColor: nextTierConfig.color,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-white/30 mt-1">
                    {pointsToNext} more points to {nextTierConfig.label}
                  </p>
                </div>
              )}
            </div>

            {/* Component Bars */}
            <div className="card space-y-1">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                Score Components
              </h3>
              <ScoreComponentBar
                label="On-Chain History"
                value={txContrib}
                max={LAMBDA * 100}
                color="#0088CC"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0088CC" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                }
              />
              <ScoreComponentBar
                label="IdentityHub DID"
                value={didContrib}
                max={KAPPA * 100}
                color="#00D2A0"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D2A0" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                }
              />
              <ScoreComponentBar
                label="Behavioral"
                value={behavContrib}
                max={MU * 100}
                color="#6C5CE7"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                }
              />
            </div>

            {/* Score History */}
            <div>
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Score History — 30 Days</h3>
              {history && history.length > 0 ? (
                <div className="card !p-2">
                  <ScoreHistoryChart data={history} />
                </div>
              ) : (
                <div className="card text-center">
                  <p className="text-xs text-white/30">History will appear after your first score update</p>
                </div>
              )}
            </div>

            {/* Tips */}
            {tips.length > 0 && (
              <div className="card">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">How to improve</h3>
                <div className="space-y-2.5">
                  {tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-arena-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-arena-purple">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white/70">{tip.text}</p>
                        {tip.action && (
                          <p className="text-[11px] text-arena-green mt-0.5">{tip.action}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
