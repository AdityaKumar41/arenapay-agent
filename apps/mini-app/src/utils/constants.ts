import { Tier } from "../types";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3000";
export const NETWORK = import.meta.env.VITE_NETWORK || "testnet";

export const TIER_CONFIG: Record<
  Tier,
  { color: string; label: string; bg: string }
> = {
  untrusted: { color: "#FF4757", label: "Untrusted", bg: "bg-red-500/20" },
  basic: { color: "#FFA502", label: "Basic", bg: "bg-orange-500/20" },
  verified: { color: "#FECA57", label: "Verified", bg: "bg-yellow-500/20" },
  trusted: { color: "#00D2A0", label: "Trusted", bg: "bg-green-500/20" },
  elite: { color: "#6C5CE7", label: "Elite", bg: "bg-purple-500/20" },
};

export function tierColor(tier: Tier): string {
  return TIER_CONFIG[tier]?.color || "#A0A0B0";
}
