import { motion } from "framer-motion";

type Status = "pending" | "settled" | "failed" | "cancelled";

interface StatusBadgeProps {
  status: Status | string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  settled: {
    label: "Settled",
    color: "text-arena-green",
    bg: "bg-arena-green/10",
  },
  failed: { label: "Failed", color: "text-arena-red", bg: "bg-arena-red/10" },
  cancelled: { label: "Cancelled", color: "text-white/40", bg: "bg-white/5" },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${cfg.bg} ${cfg.color} ${padding}`}
    >
      {status === "pending" && (
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-yellow-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
      {cfg.label}
    </span>
  );
}
