import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface DayScore {
  date: string;
  points: number;
}

type TimeRange = '14D' | '30D' | '90D';

const mockData14D: DayScore[] = [
  { date: 'Apr 28', points: 1 },
  { date: 'Apr 29', points: 0 },
  { date: 'Apr 30', points: -1 },
  { date: 'May 1', points: 2 },
  { date: 'May 2', points: 1 },
  { date: 'May 3', points: 3 },
  { date: 'May 4', points: 2 },
  { date: 'May 5', points: -1 },
  { date: 'May 6', points: 0 },
  { date: 'May 7', points: 1 },
  { date: 'May 8', points: 2 },
  { date: 'May 9', points: 3 },
  { date: 'May 10', points: 3 },
  { date: 'May 11', points: 2 },
];

const mockData30D: DayScore[] = [
  ...Array.from({ length: 16 }, (_, i) => ({
    date: `Apr ${i + 12}`,
    points: Math.floor(Math.random() * 5) - 1,
  })),
  ...mockData14D,
];

const mockData90D: DayScore[] = [
  ...Array.from({ length: 76 }, (_, i) => ({
    date: i < 60 ? `Feb ${i + 1}` : `Mar ${i - 59}`,
    points: Math.floor(Math.random() * 5) - 1,
  })),
  ...mockData14D,
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#32363C',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      }}
    >
      <p
        style={{
          color: '#8A8F98',
          fontSize: 11,
          margin: '0 0 4px',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: '#00bfff',
          fontSize: 14,
          fontWeight: 600,
          margin: 0,
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        {payload[0].value > 0 ? '+' : ''}
        {payload[0].value} pts
      </p>
    </div>
  );
};

export default function MainGraph() {
  const [range, setRange] = useState<TimeRange>('14D');

  const data = range === '14D' ? mockData14D : range === '30D' ? mockData30D : mockData90D;

  const toggleStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    border: isActive ? '1px solid rgba(0,191,255,0.3)' : '1px solid transparent',
    background: isActive ? 'rgba(0,191,255,0.12)' : 'rgba(255,255,255,0.05)',
    color: isActive ? '#00bfff' : '#8A8F98',
    transition: 'all 0.2s ease',
  });

  return (
    <div
      style={{
        background: '#32363C',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxShadow:
          '0 2px 8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
        padding: '24px 28px',
        marginBottom: '36px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            color: '#8A8F98',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          Account Performance
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['14D', '30D', '90D'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={toggleStyle(range === r)}
              onMouseEnter={(e) => {
                if (range !== r) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (range !== r) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Graph */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00bfff" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00bfff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: '#7D828B', fontSize: 11, fontFamily: 'Poppins' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[-1, 3]}
            ticks={[-1, 0, 1, 2, 3]}
            tick={{ fill: '#7D828B', fontSize: 11, fontFamily: 'Poppins' }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="points"
            stroke="#00bfff"
            strokeWidth={2}
            fill="url(#cyanGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#00bfff', stroke: '#1B1D21', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
