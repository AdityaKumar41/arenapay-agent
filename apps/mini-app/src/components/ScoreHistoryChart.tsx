import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ScoreHistoryEntry } from "../types";

interface ScoreHistoryChartProps {
  data: ScoreHistoryEntry[];
}

export default function ScoreHistoryChart({ data }: ScoreHistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-white/30 text-sm">
        No history data yet
      </div>
    );
  }

  const chartData = data.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    }),
    score: entry.score,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#16162A",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#fff",
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#6C5CE7"
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#6C5CE7", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
