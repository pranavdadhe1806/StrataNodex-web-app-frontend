import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';

export default function ListPage() {
  return (
    <div style={{ background: '#1B1D21', minHeight: '100vh' }}>
      <Topbar title="List" />
      <SidePanel />
      <div style={{ paddingTop: '56px', padding: '72px 24px 24px', color: '#7D828B' }}>
        List — Phase 3
      </div>
    </div>
  );
}
