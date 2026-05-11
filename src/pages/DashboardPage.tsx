import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';

export default function DashboardPage() {
  return (
    <div style={{ background: '#1B1D21', minHeight: '100vh' }}>
      <Topbar title="Dashboard" />
      <SidePanel />
      <div style={{ paddingTop: '56px', padding: '28px 60px', color: '#7D828B', fontSize: '15px', fontWeight: 400 }}>
        You can start typing here....
      </div>
    </div>
  );
}
