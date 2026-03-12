interface ScoreComponentBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  icon?: JSX.Element;
}

export default function ScoreComponentBar({
  label,
  value,
  max,
  color,
  icon,
}: ScoreComponentBarProps) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between text-sm mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="opacity-80">{icon}</span>}
          <span className="text-white/70 text-xs font-medium">{label}</span>
        </div>
        <span className="font-semibold text-xs" style={{ color }}>
          {Math.round(value)}<span className="text-white/30 font-normal">/{max}</span>
        </span>
      </div>
      <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          }}
        />
      </div>
    </div>
  );
}
