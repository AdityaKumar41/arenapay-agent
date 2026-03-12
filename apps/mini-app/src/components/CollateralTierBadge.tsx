import { TIER_CONFIG } from "../utils/constants";
import { formatBps } from "../utils/formatters";
import type { Tier } from "../types";

interface CollateralTierBadgeProps {
  tier: Tier;
  collateralBps: number;
  feeDiscount: number;
}

export default function CollateralTierBadge({
  tier,
  collateralBps,
  feeDiscount,
}: CollateralTierBadgeProps) {
  const config = TIER_CONFIG[tier];

  return (
    <div className={`rounded-xl px-4 py-3 ${config.bg} border border-white/5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-2 h-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            {tier === "elite" && (
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: config.color }}
              />
            )}
          </div>
          <span className="text-sm font-medium">{config.label} Tier</span>
        </div>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-white/60">
        <span>{formatBps(collateralBps)} collateral</span>
        <span>{feeDiscount}% fee discount</span>
      </div>
    </div>
  );
}
