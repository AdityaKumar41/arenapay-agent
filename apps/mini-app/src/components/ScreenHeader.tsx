interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  rightAction?: JSX.Element;
}

export default function ScreenHeader({ title, onBack, rightAction }: ScreenHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/70"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  );
}
