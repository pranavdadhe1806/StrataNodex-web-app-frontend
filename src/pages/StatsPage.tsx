import { useState } from 'react';
import { ChevronDown, ChevronRight, Flame, Trophy, RefreshCw, Calendar } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import MainGraph from '../components/dashboard/MainGraph';
import { useStreak, useScoreSummary } from '../hooks/useScores';
import { useDailyScore, useComputeScore } from '../hooks/useDaily';
import type { FolderStat, ListStat } from '../types/score.types';

function todayISO() {
  return new Date().toISOString().split('T')[0]!;
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--divider)',
      borderRadius: '14px', padding: '20px 24px', flex: '1 1 180px', minWidth: '0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ color, display: 'flex' }}>{icon}</div>
        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-main)', fontSize: '12px', fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', fontSize: '24px', fontWeight: 700 }}>
        {value}
      </div>
      {sub && <div style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '12px', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

// ─── Progress bar ────────────────────────────────────────────────────────────
function ProgressBar({ pct, height = 6 }: { pct: number; height?: number }) {
  const color = pct >= 90 ? 'var(--accent-teal)' : pct >= 60 ? 'var(--accent)' : pct >= 30 ? 'rgba(36,119,198,0.55)' : 'rgba(255,255,255,0.18)';
  return (
    <div style={{ flex: 1, height, background: 'var(--divider)', borderRadius: 3, overflow: 'hidden', minWidth: 0 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
    </div>
  );
}

function pctColor(pct: number) {
  return pct >= 90 ? 'var(--accent-teal)' : pct >= 60 ? 'var(--accent)' : pct >= 30 ? 'rgba(36,119,198,0.7)' : 'var(--text-muted)';
}

// ─── List row ────────────────────────────────────────────────────────────────
function ListRow({ list }: { list: ListStat }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '9px 18px 9px 40px',
      borderTop: '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ color: '#9CA3AF', fontFamily: 'var(--font-main)', fontSize: '11px', flexShrink: 0 }}>
        📋
      </span>
      <span style={{
        color: '#9CA3AF', fontFamily: 'var(--font-main)', fontSize: '13px',
        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {list.name}
      </span>
      <div style={{ width: '120px', flexShrink: 0 }}>
        <ProgressBar pct={list.completionPct} height={5} />
      </div>
      <span style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '12px', minWidth: '72px', textAlign: 'right' }}>
        {list.doneTasks}/{list.totalTasks}
      </span>
      <span style={{ color: pctColor(list.completionPct), fontFamily: 'var(--font-main)', fontSize: '12px', fontWeight: 600, minWidth: '38px', textAlign: 'right' }}>
        {list.completionPct}%
      </span>
    </div>
  );
}

// ─── Folder card ─────────────────────────────────────────────────────────────
function FolderCard({ folder }: { folder: FolderStat }) {
  const [open, setOpen] = useState(false);
  const empty = folder.totalTasks === 0;

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--divider)',
      borderRadius: '12px', overflow: 'hidden', marginBottom: '10px',
    }}>
      <div
        onClick={() => !empty && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 18px', cursor: empty ? 'default' : 'pointer',
        }}
      >
        <span style={{ color: 'var(--text-placeholder)', display: 'flex', flexShrink: 0 }}>
          {empty || !open ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
        </span>
        <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', fontSize: '14px', fontWeight: 500 }}>
          📁
        </span>
        <span style={{
          color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', fontSize: '14px',
          fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {folder.name}
        </span>
        {empty ? (
          <span style={{ color: '#4A4F57', fontFamily: 'var(--font-main)', fontSize: '12px' }}>No tasks</span>
        ) : (
          <>
            <div style={{ width: '160px', flexShrink: 0 }}>
              <ProgressBar pct={folder.completionPct} height={6} />
            </div>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-main)', fontSize: '12px', minWidth: '72px', textAlign: 'right' }}>
              {folder.doneTasks}/{folder.totalTasks}
            </span>
            <span style={{ color: pctColor(folder.completionPct), fontFamily: 'var(--font-main)', fontSize: '13px', fontWeight: 700, minWidth: '42px', textAlign: 'right' }}>
              {folder.completionPct}%
            </span>
          </>
        )}
      </div>
      {open && folder.lists.map(l => <ListRow key={l.id} list={l} />)}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StatsPage() {
  const today = todayISO();
  const { data: streakData } = useStreak();
  const { data: todayScore } = useDailyScore(today);
  const { data: summary = [], isLoading: summaryLoading } = useScoreSummary();
  const computeScore = useComputeScore();
  const [toast, setToast] = useState<string | null>(null);

  const streak = streakData?.streak ?? 0;
  const totalTasks = summary.reduce((s, f) => s + f.totalTasks, 0);
  const doneTasks  = summary.reduce((s, f) => s + f.doneTasks, 0);
  const overallPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleCompute = async () => {
    try {
      await computeScore.mutateAsync({ date: today });
      setToast('✅ Score locked in for today!');
    } catch (e: any) {
      setToast(e?.response?.status === 409 ? "Today's score is already recorded" : '❌ Could not compute score');
    }
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Topbar title="Stats" />
      <SidePanel />

      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000,
          padding: '12px 20px', borderRadius: '10px',
          background: 'rgba(36,119,198,0.12)', border: '1px solid rgba(36,119,198,0.25)',
          color: 'var(--accent)', fontFamily: 'var(--font-main)', fontSize: '13px', fontWeight: 500,
        }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '80px 24px 60px' }}>

        {/* ── Header stat cards ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <StatCard
            icon={<Flame size={18} />}
            label="Current Streak"
            value={`${streak} day${streak !== 1 ? 's' : ''}`}
            sub={streak > 0 ? 'Keep it going!' : 'Complete tasks to start a streak'}
            color="#f9a825"
          />
          <StatCard
            icon={<Trophy size={18} />}
            label="Today's Score"
            value={todayScore ? `${todayScore.points > 0 ? '+' : ''}${todayScore.points} pts` : '—'}
            sub={todayScore ? `Computed for ${today}` : 'Not yet computed today'}
            color="var(--accent-teal)"
          />
          <StatCard
            icon={<Calendar size={18} />}
            label="Overall Completion"
            value={`${overallPct}%`}
            sub={`${doneTasks} of ${totalTasks} tasks done`}
            color="var(--accent)"
          />
        </div>

        {/* ── Account performance chart ──────────────────────────────────── */}
        <MainGraph />

        {/* ── Compute score button + explanation ────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px', marginBottom: '32px',
          padding: '16px 20px',
          background: 'rgba(36,119,198,0.05)', border: '1px solid rgba(36,119,198,0.12)',
          borderRadius: '12px',
        }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', fontSize: '13px', fontWeight: 500 }}>
              Lock in today's score
            </div>
            <div style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '12px', marginTop: '3px' }}>
              Scores are snapshots — compute once per day to record your progress on the chart
            </div>
          </div>
          <button
            onClick={handleCompute}
            disabled={computeScore.isPending}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'rgba(36,119,198,0.14)', border: '1px solid rgba(36,119,198,0.3)',
              borderRadius: '9px', padding: '9px 18px',
              color: 'var(--accent)', fontFamily: 'var(--font-main)', fontSize: '13px', fontWeight: 500,
              cursor: computeScore.isPending ? 'not-allowed' : 'pointer',
              opacity: computeScore.isPending ? 0.6 : 1, transition: 'opacity 0.15s',
            }}
          >
            <RefreshCw size={14} style={{ animation: computeScore.isPending ? 'spin 1s linear infinite' : 'none' }} />
            {computeScore.isPending ? 'Computing…' : 'Compute Today\'s Score'}
          </button>
        </div>

        {/* ── Live breakdown ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', fontSize: '16px', fontWeight: 600, margin: '0 0 6px' }}>
            Current Completion
          </h2>
          <p style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '13px', margin: 0 }}>
            Live task completion across all folders and lists — click a folder to expand
          </p>
        </div>

        {summaryLoading ? (
          <div style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '13px', padding: '32px 0', textAlign: 'center' }}>
            Loading…
          </div>
        ) : summary.length === 0 ? (
          <div style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '13px', padding: '32px 0', textAlign: 'center' }}>
            No folders yet — create some tasks to see stats here
          </div>
        ) : (
          summary.map(folder => <FolderCard key={folder.id} folder={folder} />)
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
