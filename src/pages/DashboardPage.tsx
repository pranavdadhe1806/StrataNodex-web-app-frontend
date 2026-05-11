import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import { Folder, ListTodo, Flame, CheckCircle2, TrendingUp, Clock, Plus } from 'lucide-react';

// Mock data - replace with API calls
const MOCK_RECENT_ITEMS = [
  { id: 'folder-1', type: 'folder', name: 'Work Projects', updatedAt: '2024-01-15T10:30:00Z', taskCount: 12 },
  { id: 'list-1', type: 'list', name: 'Grocery List', updatedAt: '2024-01-14T18:45:00Z', taskCount: 8 },
  { id: 'list-2', type: 'list', name: 'Ideas & Notes', updatedAt: '2024-01-13T09:20:00Z', taskCount: 15 },
  { id: 'folder-2', type: 'folder', name: 'Personal', updatedAt: '2024-01-12T14:00:00Z', taskCount: 5 },
];

const MOCK_STATS = {
  currentStreak: 5,
  longestStreak: 12,
  tasksCompletedToday: 3,
  tasksCompletedThisWeek: 18,
  totalTasksCompleted: 247,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [recentItems] = useState(MOCK_RECENT_ITEMS);
  const [stats] = useState(MOCK_STATS);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  function handleItemClick(item: typeof MOCK_RECENT_ITEMS[0]) {
    if (item.type === 'folder') {
      navigate(`/folders/${item.id}`);
    } else {
      navigate(`/list/${item.id}`);
    }
  }

  function handleCreateNew() {
    // Navigate to folders page where user can create new folder/list
    navigate('/folders');
  }

  return (
    <div style={{ background: '#1B1D21', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      <Topbar title="Dashboard" />
      <SidePanel />

      <div style={{ paddingTop: '56px' }}>
        {/* Welcome & Stats Section */}
        <div style={{ padding: '32px 40px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{
                color: '#EDEFF3',
                fontSize: '28px',
                fontWeight: 600,
                margin: '0 0 4px 0',
              }}>
                Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}
              </h1>
              <p style={{ color: '#7D828B', fontSize: '14px', margin: 0 }}>
                Here's your productivity at a glance
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: '#32363C',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: '#EDEFF3',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3A3F45';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#32363C';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <Plus size={18} />
              New
            </button>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {/* Streak Card */}
            <div style={{
              background: '#32363C',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Flame size={20} style={{ color: '#FF6B35' }} />
                <span style={{ color: '#7D828B', fontSize: '13px', fontWeight: 500 }}>Current Streak</span>
              </div>
              <div style={{ color: '#EDEFF3', fontSize: '32px', fontWeight: 700 }}>
                {stats.currentStreak}
                <span style={{ fontSize: '14px', fontWeight: 400, color: '#7D828B', marginLeft: '4px' }}>days</span>
              </div>
              <div style={{ color: '#7D828B', fontSize: '12px', marginTop: '4px' }}>
                Best: {stats.longestStreak} days
              </div>
            </div>

            {/* Today Card */}
            <div style={{
              background: '#32363C',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <CheckCircle2 size={20} style={{ color: '#00c896' }} />
                <span style={{ color: '#7D828B', fontSize: '13px', fontWeight: 500 }}>Completed Today</span>
              </div>
              <div style={{ color: '#EDEFF3', fontSize: '32px', fontWeight: 700 }}>
                {stats.tasksCompletedToday}
              </div>
              <div style={{ color: '#7D828B', fontSize: '12px', marginTop: '4px' }}>
                tasks done
              </div>
            </div>

            {/* Weekly Card */}
            <div style={{
              background: '#32363C',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <TrendingUp size={20} style={{ color: '#00bfff' }} />
                <span style={{ color: '#7D828B', fontSize: '13px', fontWeight: 500 }}>This Week</span>
              </div>
              <div style={{ color: '#EDEFF3', fontSize: '32px', fontWeight: 700 }}>
                {stats.tasksCompletedThisWeek}
              </div>
              <div style={{ color: '#7D828B', fontSize: '12px', marginTop: '4px' }}>
                tasks completed
              </div>
            </div>

            {/* All Time Card */}
            <div style={{
              background: '#32363C',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Clock size={20} style={{ color: '#8B92A1' }} />
                <span style={{ color: '#7D828B', fontSize: '13px', fontWeight: 500 }}>All Time</span>
              </div>
              <div style={{ color: '#EDEFF3', fontSize: '32px', fontWeight: 700 }}>
                {stats.totalTasksCompleted}
              </div>
              <div style={{ color: '#7D828B', fontSize: '12px', marginTop: '4px' }}>
                total tasks
              </div>
            </div>
          </div>
        </div>

        {/* Recently Opened Section */}
        <div style={{ padding: '0 40px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#EDEFF3', fontSize: '18px', fontWeight: 600, margin: 0 }}>
              Recently Opened
            </h2>
            <button
              onClick={() => navigate('/folders')}
              style={{
                color: '#00bfff',
                fontSize: '13px',
                fontWeight: 500,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              View All →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {recentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  background: '#32363C',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#3A3F45';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.09)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#32363C';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: item.type === 'folder' ? 'rgba(255,107,53,0.15)' : 'rgba(0,191,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {item.type === 'folder' ? (
                      <Folder size={22} style={{ color: '#FF6B35' }} />
                    ) : (
                      <ListTodo size={22} style={{ color: '#00bfff' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      color: '#EDEFF3',
                      fontSize: '15px',
                      fontWeight: 500,
                      margin: '0 0 4px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#7D828B', fontSize: '12px' }}>
                        {formatTimeAgo(item.updatedAt)}
                      </span>
                      <span style={{ color: '#7D828B', fontSize: '12px' }}>
                        {item.taskCount} tasks
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
