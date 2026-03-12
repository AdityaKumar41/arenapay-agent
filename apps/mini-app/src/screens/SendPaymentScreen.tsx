import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useAppStore } from "../stores/appStore";
import { usePaymentPreview } from "../hooks/usePaymentPreview";
import { usePaymentExecute } from "../hooks/usePaymentExecute";
import { useWalletBalance } from "../hooks/useWalletBalance";
import ScreenHeader from "../components/ScreenHeader";
import PaymentPreviewCard from "../components/PaymentPreview";
import ThreatAlert from "../components/ThreatAlert";
import { PreviewSkeleton } from "../components/SkeletonLoader";
import { useHapticFeedback } from "../hooks/useTelegramWebApp";

const confettiParticles = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.cos((i / 24) * Math.PI * 2) * (80 + Math.random() * 60),
  y: Math.sin((i / 24) * Math.PI * 2) * (80 + Math.random() * 60),
  color: ["#6C5CE7", "#00D2A0", "#0088CC", "#FFD93D", "#FF6B6B"][i % 5],
  size: 4 + Math.random() * 4,
  delay: Math.random() * 0.3,
}));

function Confetti() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {confettiParticles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
          transition={{ duration: 1, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: p.size > 6 ? "50%" : "1px",
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}

export default function SendPaymentScreen() {
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const { setScreen, addNotification } = useAppStore();
  const { notification: haptic } = useHapticFeedback();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);

  const preview = usePaymentPreview();
  const execute = usePaymentExecute();
  const { data: balance } = useWalletBalance(address || null);

  const amountNanoton = useMemo(
    () => parseFloat(amount || "0") * 1e9,
    [amount],
  );

  const debouncedPreview = useCallback(() => {
    if (address && recipient.length > 10 && amountNanoton > 0) {
      preview.mutate({
        senderAddress: address,
        recipientAddress: recipient,
        amountNanoton,
      });
    }
  }, [address, recipient, amountNanoton]);

  useEffect(() => {
    const timer = setTimeout(debouncedPreview, 500);
    return () => clearTimeout(timer);
  }, [recipient, amount]);

  const handleMax = () => {
    if (!balance) return;
    const maxTon = Number(balance) / 1e9;
    const safe = Math.max(maxTon - 0.05, 0); // reserve 0.05 TON for gas
    setAmount(safe > 0 ? safe.toFixed(4) : "0");
  };

  const handleConfirm = async () => {
    if (!address || !preview.data) return;

    try {
      const result = await execute.mutateAsync({
        senderAddress: address,
        recipientAddress: recipient,
        amountNanoton,
      });

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: result.escrowContractAddress,
            amount: result.collateralRequired,
            payload: result.messagePayload,
          },
        ],
      });

      addNotification({
        id: `pay-${Date.now()}`,
        type: "payment_success",
        message: `Sent ${amount} TON successfully`,
        timestamp: Date.now(),
      });
      haptic("success");
      setSuccess(true);
      setTimeout(() => setScreen("dashboard"), 3000);
    } catch (err) {
      addNotification({
        id: `pay-err-${Date.now()}`,
        type: "payment_error",
        message: err instanceof Error ? err.message : "Payment failed",
        timestamp: Date.now(),
      });
      haptic("error");
    }
  };

  const isBlocked = preview.data?.riskAssessment.level === "critical";

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <Confetti />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-20 h-20 bg-arena-green/20 rounded-full flex items-center justify-center mb-4"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00D2A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-bold text-arena-green"
        >
          Payment Sent!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-white/50 mt-2"
        >
          Your ARES score will update shortly
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ScreenHeader title="Send Payment" onBack={() => setScreen("dashboard")} />

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Recipient */}
        <div>
          <label className="block text-sm text-white/60 mb-1.5 font-medium">Recipient</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="EQ... wallet address"
            className="input-field"
          />
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm text-white/60 font-medium">Amount (TON)</label>
            {balance && (
              <button
                onClick={handleMax}
                className="text-[11px] text-arena-purple font-medium hover:text-arena-purple/80 transition-colors"
              >
                MAX
              </button>
            )}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.1"
            min="0"
            className="input-field"
          />
        </div>

        {preview.isPending && <PreviewSkeleton />}

        {preview.isError && (
          <div className="text-center py-4">
            <p className="text-xs text-arena-red mb-2">Failed to load payment preview</p>
            <button onClick={debouncedPreview} className="text-xs text-arena-purple hover:text-arena-purple/80 transition-colors">
              Try again
            </button>
          </div>
        )}

        {preview.data && (
          <>
            {isBlocked && (
              <ThreatAlert
                flags={preview.data.riskAssessment.flags}
                riskScore={{ low: 0.2, medium: 0.5, high: 0.75, critical: 1.0 }[preview.data.riskAssessment.level] ?? 0.5}
              />
            )}
            <PaymentPreviewCard preview={preview.data} />
          </>
        )}

        <button
          onClick={handleConfirm}
          disabled={!preview.data || isBlocked || execute.isPending || !recipient || !amount}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {execute.isPending ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Processing...
            </>
          ) : isBlocked ? (
            "Transaction Blocked"
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              Confirm & Pay
            </>
          )}
        </button>

        {execute.isError && (
          <p className="text-xs text-arena-red text-center">
            {execute.error instanceof Error ? execute.error.message : "Payment failed. Please try again."}
          </p>
        )}
      </div>
    </div>
  );
}
