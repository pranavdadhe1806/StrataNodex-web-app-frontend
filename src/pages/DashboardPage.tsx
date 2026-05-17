import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import MainGraph from '../components/dashboard/MainGraph';
import Recents from '../components/dashboard/Recents';
import { useAuthStore } from '../store/auth.store';
import { useStreak } from '../hooks/useScores';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: streakData } = useStreak();
  const streak = streakData?.streak ?? 0;

  return (
    <div style={{ background: '#1B1D21', minHeight: '100vh' }}>
      <Topbar title="Dashboard" />
      <SidePanel />

      {/* Page content */}
      <div
        style={{
          paddingTop: '24px',
          paddingLeft: '48px',
          paddingRight: '48px',
          paddingBottom: '48px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <WelcomeHeader userName={user?.name ?? 'User'} streak={streak} />
        <MainGraph />
        <Recents />
      </div>
    </div>
  );
}
