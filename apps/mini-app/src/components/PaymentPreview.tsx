import { formatNanoton, formatBps } from "../utils/formatters";
import { TIER_CONFIG } from "../utils/constants";
import type { PaymentPreview as PaymentPreviewType } from "../types";

const BASE_FEE_BPS = 100;

interface PaymentPreviewProps {
  preview: PaymentPreviewType;
}

export default function PaymentPreview({ preview }: PaymentPreviewProps) {
  const tierConfig = TIER_CONFIG[preview.tier];
  const riskColors: Record<string, string> = {
    low: "text-arena-green bg-arena-green/10",
    medium: "text-arena-yellow bg-arena-yellow/10",
    high: "text-arena-orange bg-arena-orange/10",
    critical: "text-arena-red bg-arena-red/10",
  };

  const discountPct = preview.feeBps < BASE_FEE_BPS
    ? Math.round(((BASE_FEE_BPS - preview.feeBps) / BASE_FEE_BPS) * 100)
    : 0;

  const riskStyle = riskColors[preview.riskAssessment.level] || "text-white/50";

  return (
    <div className="card space-y-3">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Settlement Preview</h3>

      <div className="space-y-2.5">
        <Row label="Your score">
          <span className="font-semibold">{preview.senderScore}</span>
          <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded-md" style={{ color: tierConfig.color, backgroundColor: `${tierConfig.color}1a` }}>
            {tierConfig.label}
          </span>
        </Row>

        <Row label="Collateral">
          <span className="font-medium">{formatNanoton(preview.collateralRequired)}</span>
        </Row>

        <Row label="Fee">
          <span className="font-medium">{formatNanoton(preview.feeAmountNanoton)}</span>
          <span className="text-xs text-white/40 ml-1.5">({formatBps(preview.feeBps)})</span>
          {discountPct > 0 && (
            <span className="text-[11px] text-arena-green ml-1 font-medium">{discountPct}% off</span>
          )}
        </Row>

        <Row label="Est. time">
          <span className="text-white/70">~{preview.estimatedTimeSeconds}s</span>
        </Row>

        <Row label="Risk">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${riskStyle}`}>
            {preview.riskAssessment.level.toUpperCase()}
          </span>
        </Row>
      </div>

      {preview.riskAssessment.flags.length > 0 && (
        <div className="p-2.5 bg-arena-red/[0.06] rounded-xl border border-arena-red/20">
          {preview.riskAssessment.flags.map((flag, i) => (
            <p key={i} className="text-xs text-arena-red/80 font-mono">{flag}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/40">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}
