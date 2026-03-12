import { useEffect, useCallback } from "react";

interface WebApp {
  ready: () => void;
  expand: () => void;
  colorScheme: "light" | "dark";
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  HapticFeedback: {
    impactOccurred: (
      style: "light" | "medium" | "heavy" | "rigid" | "soft",
    ) => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
  onEvent: (event: string, callback: () => void) => void;
  offEvent: (event: string, callback: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: WebApp;
    };
  }
}

function getWebApp(): WebApp | null {
  return window.Telegram?.WebApp ?? null;
}

export function useTelegramWebApp() {
  useEffect(() => {
    const webapp = getWebApp();
    if (!webapp) return;

    webapp.ready();
    webapp.expand();

    // Apply TG theme params as CSS variables
    const params = webapp.themeParams;
    const root = document.documentElement;
    if (params.bg_color)
      root.style.setProperty("--tg-theme-bg-color", params.bg_color);
    if (params.text_color)
      root.style.setProperty("--tg-theme-text-color", params.text_color);
    if (params.hint_color)
      root.style.setProperty("--tg-theme-hint-color", params.hint_color);
    if (params.link_color)
      root.style.setProperty("--tg-theme-link-color", params.link_color);
    if (params.button_color)
      root.style.setProperty("--tg-theme-button-color", params.button_color);
    if (params.button_text_color)
      root.style.setProperty(
        "--tg-theme-button-text-color",
        params.button_text_color,
      );
  }, []);
}

export function useHapticFeedback() {
  const impact = useCallback(
    (style: "light" | "medium" | "heavy" = "medium") => {
      getWebApp()?.HapticFeedback.impactOccurred(style);
    },
    [],
  );

  const notification = useCallback((type: "success" | "error" | "warning") => {
    getWebApp()?.HapticFeedback.notificationOccurred(type);
  }, []);

  const selection = useCallback(() => {
    getWebApp()?.HapticFeedback.selectionChanged();
  }, []);

  return { impact, notification, selection };
}
