import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../stores/appStore";

export default function Toast() {
  const notifications = useAppStore((s) => s.notifications);
  const [visible, setVisible] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "info">("info");

  useEffect(() => {
    if (notifications.length === 0) return;
    const latest = notifications[0];
    if (latest.id === visible) return;

    setVisible(latest.id);
    setMessage(latest.message);
    setType(
      latest.type === "threat_alert" || latest.type === "payment_error"
        ? "error"
        : latest.type === "payment_success"
          ? "success"
          : "info",
    );

    const timer = setTimeout(() => setVisible(null), 4000);
    return () => clearTimeout(timer);
  }, [notifications, visible]);

  const colors = {
    success: "bg-arena-green/90 border-arena-green",
    error: "bg-arena-red/90 border-arena-red",
    info: "bg-arena-purple/90 border-arena-purple",
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-2 left-4 right-4 z-50"
        >
          <div
            className={`${colors[type]} border rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm`}
          >
            <p className="text-sm text-white font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
