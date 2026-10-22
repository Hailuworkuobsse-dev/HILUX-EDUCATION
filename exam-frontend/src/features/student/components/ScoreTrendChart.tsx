import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { ProgressPoint } from '@/types/analytics';
import { formatDate } from '@/lib/date';

export function ScoreTrendChart({ data }: { data: ProgressPoint[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-fg-muted">No data yet.</p>;
  }
  const formatted = data.map((d) => ({ ...d, label: formatDate(d.date, 'MMM d') }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              background: '#1a2238',
              border: '1px solid #2d3750',
              borderRadius: 8,
              fontSize: 12
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={{ fill: '#a78bfa', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
