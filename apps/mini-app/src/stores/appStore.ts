import { create } from "zustand";

export type Screen =
  | "onboarding"
  | "dashboard"
  | "send-payment"
  | "score-breakdown"
  | "security"
  | "history"
  | "receive";

export interface Notification {
  id: string;
  type: "score_update" | "threat_alert" | "payment_success" | "payment_error";
  message: string;
  timestamp: number;
}

interface AppState {
  activeScreen: Screen;
  walletAddress: string | null;
  currentScore: number | null;
  currentTier: string | null;
  notifications: Notification[];
  setScreen: (screen: Screen) => void;
  setWallet: (address: string | null) => void;
  setScore: (score: number, tier: string) => void;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeScreen: "onboarding",
  walletAddress: null,
  currentScore: null,
  currentTier: null,
  notifications: [],
  setScreen: (screen) => set({ activeScreen: screen }),
  setWallet: (address) => set({ walletAddress: address }),
  setScore: (score, tier) => set({ currentScore: score, currentTier: tier }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
