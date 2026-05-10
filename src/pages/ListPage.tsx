import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';

export default function ListPage() {
  return (
    <div className="flex flex-col h-screen w-full bg-[#1B1D21] overflow-hidden font-['Poppins'] font-normal">
      <Topbar title="Untitled List" />
      <SidePanel />
      
      {/* Canvas Area */}
      <main className="flex-1 relative pt-[28px] pl-[65px]">
        {/* Placeholder Text */}
        <div className="text-[15px] text-[#7D828B]">
          You can start typing here....
        </div>
      </main>
    </div>
  );
}
