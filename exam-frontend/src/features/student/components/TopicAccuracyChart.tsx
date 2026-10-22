import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TopicAccuracy } from '@/types/analytics';

export function TopicAccuracyChart({ data }: { data: TopicAccuracy[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-fg-muted">Practice more to see topic insights.</p>;
  }
  const sorted = [...data].sort((a, b) => a.accuracy - b.accuracy).slice(0, 8);
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="topicName"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={{
              background: '#1a2238',
              border: '1px solid #2d3750',
              borderRadius: 8,
              fontSize: 12
            }}
            formatter={(v: number) => [`${v}%`, 'Accuracy']}
          />
          <Bar dataKey="accuracy" fill="#67e8f9" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
