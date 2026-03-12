import { truncateAddress, formatTon } from "../utils/formatters";

interface WalletHeaderProps {
  address: string;
  balance?: string;
  onDisconnect?: () => void;
}

function addressGradient(addr: string): string {
  const hash = addr.slice(2, 8);
  const h1 = parseInt(hash.slice(0, 2), 16) % 360;
  const h2 = (h1 + 60) % 360;
  return `linear-gradient(135deg, hsl(${h1},60%,50%), hsl(${h2},60%,50%))`;
}

export default function WalletHeader({
  address,
  balance,
  onDisconnect,
}: WalletHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex-shrink-0"
          style={{ background: addressGradient(address) }}
        />
        <div>
          <p className="text-sm font-medium text-white">{truncateAddress(address)}</p>
          {balance && (
            <p className="text-xs text-white/40">{formatTon(balance)}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-arena-yellow/10 text-arena-yellow font-medium border border-arena-yellow/20">
          Testnet
        </span>
        {onDisconnect && (
          <button
            onClick={onDisconnect}
            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
