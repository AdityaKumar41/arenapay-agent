import { motion } from "framer-motion";

interface ThreatAlertProps {
  flags: string[];
  riskScore: number;
  onDismiss?: () => void;
}

export default function ThreatAlert({
  flags,
  riskScore,
  onDismiss,
}: ThreatAlertProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="bg-arena-red/20 border border-arena-red/50 rounded-xl p-4 mx-4 mb-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-arena-red/30 rounded-full flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF4757"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-arena-red">
              Threat Detected
            </p>
            <p className="text-xs text-white/50">
              Risk score: {(riskScore * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-white/30 hover:text-white/60 text-xs"
          >
            Dismiss
          </button>
        )}
      </div>
      <div className="mt-2 space-y-1">
        {flags.map((flag, i) => (
          <p key={i} className="text-xs text-arena-red/80 font-mono">
            {flag}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
