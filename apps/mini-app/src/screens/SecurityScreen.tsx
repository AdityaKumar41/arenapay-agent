import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTonAddress } from "@tonconnect/ui-react";
import { useAppStore } from "../stores/appStore";
import { api } from "../services/api";
import EmptyState from "../components/EmptyState";

export default function SecurityScreen() {
  const address = useTonAddress();
  const { notifications } = useAppStore();
  const [checkTarget, setCheckTarget] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    riskScore: number;
    action: string;
    flags: string[];
  } | null>(null);

  const threatAlerts = notifications.filter((n) => n.type === "threat_alert");
  const hasThreats = threatAlerts.length > 0;

  const handleCheckAddress = async () => {
    if (!checkTarget.trim()) return;
    setChecking(true);
    setCheckResult(null);
    try {
      const result = await api.checkThreat(address || "", checkTarget.trim(), 0);
      setCheckResult(result);
    } catch {
      setCheckResult({ riskScore: 0, action: "ERROR", flags: ["Check failed"] });
    }
    setChecking(false);
  };

  const riskColor =
    checkResult?.action === "BLOCK"
      ? "text-arena-red border-arena-red/20 bg-arena-red/[0.06]"
      : checkResult?.action === "WARN"
        ? "text-arena-yellow border-arena-yellow/20 bg-arena-yellow/[0.06]"
        : checkResult?.action === "ERROR"
          ? "text-white/50 border-white/10 bg-white/[0.04]"
          : "text-arena-green border-arena-green/20 bg-arena-green/[0.06]";

  const protections = [
    { label: "Malicious contract scanning", desc: "Blocks known scam contracts" },
    { label: "Drain pattern detection", desc: "Detects wallet drain attempts" },
    { label: "Bot behavior analysis", desc: "Identifies automated attacks" },
    { label: "Real-time threat monitoring", desc: "Continuous transaction screening" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Inline header (no ScreenHeader since Security is a tab) */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold">Security</h1>
        <p className="text-xs text-white/40 mt-1">Real-time protection powered by ARES</p>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Overall Status */}
        <div className={`rounded-2xl p-4 border flex items-center gap-3 ${
          hasThreats
            ? "bg-arena-red/[0.06] border-arena-red/20"
            : "bg-arena-green/[0.06] border-arena-green/20"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${hasThreats ? "bg-arena-red/10" : "bg-arena-green/10"}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={hasThreats ? "#FF4757" : "#00D2A0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                {!hasThreats && <path d="M9 12l2 2 4-4" strokeWidth="2" />}
              </svg>
            </div>
            <div>
              <p className={`font-semibold text-sm ${hasThreats ? "text-arena-red" : "text-arena-green"}`}>
                {hasThreats ? "Threats Detected" : "All Clear"}
              </p>
              <p className="text-xs text-white/40">
                {hasThreats
                  ? `${threatAlerts.length} threat alert${threatAlerts.length > 1 ? "s" : ""} recorded`
                  : "No threats detected in your transactions"}
              </p>
            </div>
          </div>
        </div>

        {/* Manual Threat Check */}
        <div className="card">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Check an Address</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={checkTarget}
              onChange={(e) => setCheckTarget(e.target.value)}
              placeholder="EQ... destination address"
              className="input-field !py-2.5"
              onKeyDown={(e) => e.key === "Enter" && handleCheckAddress()}
            />
            <button
              onClick={handleCheckAddress}
              disabled={checking || !checkTarget.trim()}
              className="px-4 py-2.5 rounded-2xl bg-arena-purple text-white text-sm font-medium disabled:opacity-40 hover:bg-arena-purple/80 transition-colors active:scale-[0.97] flex-shrink-0"
            >
              {checking ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              ) : "Check"}
            </button>
          </div>

          <AnimatePresence>
            {checkResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-3 rounded-xl p-3 border ${riskColor}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{checkResult.action}</span>
                  <span className="text-xs opacity-70">Risk: {(checkResult.riskScore * 100).toFixed(0)}%</span>
                </div>
                {checkResult.flags.length > 0 && (
                  <ul className="space-y-0.5 mt-1">
                    {checkResult.flags.map((f, i) => (
                      <li key={i} className="text-xs opacity-70 font-mono">{f}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Protections */}
        <div className="card">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Active Protections</h3>
          <div className="space-y-3">
            {protections.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-white/70">{item.label}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-arena-green"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  />
                  <span className="text-arena-green text-xs font-medium">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Log */}
        <div>
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Recent Alerts</h3>
          {threatAlerts.length === 0 ? (
            <EmptyState icon="shield" title="No alerts recorded" description="Threat alerts will appear here when suspicious activity is detected" />
          ) : (
            <div className="space-y-2">
              {threatAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card !border-arena-red/20 !bg-arena-red/[0.04]"
                >
                  <p className="text-xs text-arena-red font-medium">{alert.message}</p>
                  <p className="text-xs text-white/30 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
