import { useState } from "react";
import { motion } from "framer-motion";
import { useTonAddress } from "@tonconnect/ui-react";
import { useAppStore } from "../stores/appStore";
import ScreenHeader from "../components/ScreenHeader";
import QRCode from "../components/QRCode";
import { useHapticFeedback } from "../hooks/useTelegramWebApp";
import { truncateAddress } from "../utils/formatters";

export default function ReceiveScreen() {
  const address = useTonAddress();
  const { setScreen } = useAppStore();
  const { notification: haptic } = useHapticFeedback();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const el = document.createElement("textarea");
      el.value = address;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    haptic("success");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!address) return;
    try {
      await navigator.share({
        title: "My TON Address",
        text: address,
      });
    } catch {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ScreenHeader title="Receive TON" onBack={() => setScreen("dashboard")} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        {/* QR code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="p-5 bg-white rounded-3xl shadow-glow-purple"
        >
          {address ? (
            <QRCode value={address} size={200} />
          ) : (
            <div className="w-[200px] h-[200px] animate-pulse bg-gray-200 rounded-xl" />
          )}
        </motion.div>

        {/* Address */}
        <div className="w-full card text-center">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2 font-medium">Your TON Address</p>
          <p className="text-xs text-white/60 font-mono break-all leading-relaxed px-2">
            {address}
          </p>
        </div>

        {/* Actions */}
        <div className="w-full grid grid-cols-2 gap-3">
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.97 }}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D2A0" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-arena-green">Copied!</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </motion.button>

          <motion.button
            onClick={handleShare}
            whileTap={{ scale: 0.97 }}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </motion.button>
        </div>

        <p className="text-xs text-white/30 text-center">
          Share this address to receive TON from anyone
        </p>
      </div>
    </div>
  );
}
