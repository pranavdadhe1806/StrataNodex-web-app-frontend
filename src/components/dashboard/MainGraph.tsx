import { useState, useMemo } from 'react';
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
import { useScores } from '../../hooks/useScores';
import type { DailyScore } from '../../types/score.types';

interface DayScore {
  date: string;
  points: number | null;
}

type TimeRange = '14D' | '30D' | '90D';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatLabel(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

function buildChartData(scores: DailyScore[], days: number): DayScore[] {
  const scoreMap = new Map(scores.map(s => [s.date, s.points]));
  const result: DayScore[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    result.push({ date: formatLabel(iso), points: scoreMap.get(iso) ?? null });
  }
  return result;
}

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
  const { data: rawScores = [], isLoading } = useScores(90);

  const days = range === '14D' ? 14 : range === '30D' ? 30 : 90;
  const data = useMemo(() => buildChartData(rawScores, days), [rawScores, days]);

  const hasAnyData = rawScores.length > 0;
  const tickInterval = range === '14D' ? 1 : range === '30D' ? 4 : 13;

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
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#7D828B', fontFamily: 'Poppins', fontSize: '12px' }}>
            Loading…
          </div>
        ) : !hasAnyData ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#7D828B', fontFamily: 'Poppins', fontSize: '12px' }}>
            No score data yet
          </div>
        ) : (
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
              interval={tickInterval}
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
        )}
      </ResponsiveContainer>
    </div>
  );
}
