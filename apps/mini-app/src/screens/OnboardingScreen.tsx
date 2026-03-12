import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import { useAppStore } from "../stores/appStore";
import { useIdentityVerify } from "../hooks/useIdentityVerify";

const features = [
  { label: "ARES Protocol", desc: "AI reputation scoring" },
  { label: "5 Trust Tiers", desc: "Dynamic collateral" },
  { label: "Live AI Scoring", desc: "Real-time protection" },
];

export default function OnboardingScreen() {
  const address = useTonAddress();
  const { setScreen, setWallet } = useAppStore();
  const identityVerify = useIdentityVerify();
  const initialCheckDone = useRef(false);

  useEffect(() => {
    if (!address) {
      initialCheckDone.current = true;
      return;
    }
    setWallet(address);
    if (!initialCheckDone.current) {
      initialCheckDone.current = true;
      setScreen("dashboard");
    }
  }, [address, setWallet, setScreen]);

  const handleVerify = async () => {
    if (!address) return;
    try {
      const result = await identityVerify.mutateAsync(address);
      if (result.verificationUrl) {
        window.open(result.verificationUrl, "_blank");
      }
    } catch {
      // Continue even if verification fails
    }
    setScreen("dashboard");
  };

  const handleSkip = () => {
    if (address) setScreen("dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-arena-purple/[0.07] rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative z-10"
      >
        {/* Logo */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
          className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-arena-purple to-ton-blue flex items-center justify-center shadow-glow-purple"
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" strokeWidth="2" />
          </svg>
        </motion.div>
        <h1 className="text-4xl font-bold mb-3">
          <span className="text-arena-purple">arena</span>
          <span className="text-white">pay</span>
        </h1>
        <p className="text-white/60 text-sm max-w-[260px] mx-auto leading-relaxed">
          AI-powered payments on TON. Your reputation is your collateral.
        </p>
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-8 flex-wrap justify-center relative z-10"
      >
        {features.map((f) => (
          <div
            key={f.label}
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center"
          >
            <p className="text-xs font-semibold text-white/80">{f.label}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{f.desc}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-xs space-y-4 relative z-10"
      >
        <div className="flex justify-center">
          <TonConnectButton />
        </div>

        {address && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="bg-arena-green/[0.08] border border-arena-green/20 rounded-2xl p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-arena-green/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D2A0" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-arena-green mb-1">Boost your ARES score</p>
              <p className="text-xs text-white/40">
                Verify your identity for up to +30 score points
              </p>
            </div>
            <button
              onClick={handleVerify}
              disabled={identityVerify.isPending}
              className="btn-primary !bg-arena-green hover:!bg-arena-green/80"
            >
              {identityVerify.isPending ? "Verifying..." : "Verify with IdentityHub"}
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-2.5 text-white/50 text-sm hover:text-white/70 transition-colors"
            >
              Continue without verification
            </button>
          </motion.div>
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 text-xs text-white/30"
      >
        Powered by ARES Protocol on TON
      </motion.p>
    </div>
  );
}
