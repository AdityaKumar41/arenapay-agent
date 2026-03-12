import { motion } from "framer-motion";
import { tierColor } from "../utils/constants";
import type { Tier } from "../types";

interface ReputationGaugeProps {
  score: number;
  tier: Tier;
}

export default function ReputationGauge({ score, tier }: ReputationGaugeProps) {
  const color = tierColor(tier);
  const radius = 72;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        {/* Glow effect */}
        <div
          className="absolute inset-2 rounded-full blur-2xl opacity-20"
          style={{ backgroundColor: color }}
        />
        <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 180 180">
          {/* Background track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="white"
            strokeOpacity="0.06"
            strokeWidth={strokeWidth}
          />
          {/* Animated score arc */}
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <motion.span
            className="text-[42px] font-bold leading-none"
            style={{ color }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-white/50 uppercase tracking-widest mt-1.5 font-medium">
            {tier}
          </span>
        </div>
      </div>
    </div>
  );
}
