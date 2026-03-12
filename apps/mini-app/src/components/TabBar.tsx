import { useAppStore, type Screen } from "../stores/appStore";

interface TabItem {
  id: Screen;
  label: string;
  icon: JSX.Element;
}

const tabs: TabItem[] = [
  {
    id: "dashboard",
    label: "Home",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "send-payment",
    label: "Send",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "History",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const { activeScreen, setScreen } = useAppStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-ton-dark/90 backdrop-blur-xl border-t border-white/[0.06]">
      <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,8px)] pt-1">
        {tabs.map((tab) => {
          const active = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setScreen(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-all duration-200 ${
                active
                  ? "text-arena-purple"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              <div
                className={`transition-transform duration-200 ${active ? "scale-110" : ""}`}
              >
                {tab.icon}
              </div>
              <span
                className={`text-[10px] font-medium ${active ? "text-arena-purple" : ""}`}
              >
                {tab.label}
              </span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-arena-purple mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
