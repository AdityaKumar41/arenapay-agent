import StatusBadge from "./StatusBadge";
import { truncateAddress, formatTon } from "../utils/formatters";
import type { PaymentHistoryItem } from "../types";

interface TransactionRowProps {
  item: PaymentHistoryItem;
  myAddress: string;
}

export default function TransactionRow({ item, myAddress }: TransactionRowProps) {
  const isSent = item.senderAddress === myAddress;
  const counterpart = isSent ? item.recipientAddress : item.senderAddress;
  const sign = isSent ? "-" : "+";
  const signColor = isSent ? "text-arena-red" : "text-arena-green";

  const date = new Date(item.createdAt);
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-surface rounded-2xl border border-white/[0.06] hover:bg-surface-light transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSent ? "bg-arena-red/10" : "bg-arena-green/10"}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isSent ? "#FF4757" : "#00D2A0"} strokeWidth="2.5">
          {isSent ? (
            <>
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </>
          ) : (
            <>
              <path d="M17 7L7 17" />
              <path d="M17 17H7V7" />
            </>
          )}
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">
          {isSent ? "To " : "From "}
          <span className="text-white/50">{truncateAddress(counterpart)}</span>
        </p>
        <p className="text-xs text-white/30 mt-0.5">{label} · {time}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-semibold ${signColor}`}>
          {sign}{formatTon(item.amountNanoton)}
        </p>
        <div className="flex justify-end mt-1">
          <StatusBadge status={item.status} size="sm" />
        </div>
      </div>
    </div>
  );
}
