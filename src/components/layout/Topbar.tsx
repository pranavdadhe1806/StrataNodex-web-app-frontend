import { Menu, User } from 'lucide-react';
import { useUIStore } from '../../store/ui.store';

interface TopbarProps {
  title: string;
  onTitleDoubleClick?: () => void;
  titleSlot?: React.ReactNode;
}

export default function Topbar({ title, onTitleDoubleClick, titleSlot }: TopbarProps) {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="relative flex items-center justify-between h-[56px] w-full px-5 bg-[#1B1D21] shrink-0 z-50">
      {/* Left — Hamburger */}
      <button 
        onClick={toggleSidebar}
        className="text-[#EDEFF3] hover:opacity-80 transition-opacity flex items-center justify-center p-1.5"
        aria-label="Menu"
      >
        <Menu size={20} strokeWidth={2} />
      </button>

      {/* Center — List Name */}
      <div 
        onDoubleClick={onTitleDoubleClick}
        className={`absolute left-1/2 -translate-x-1/2 text-[#EDEFF3] text-[17px] font-normal font-['Poppins'] ${onTitleDoubleClick ? 'cursor-text select-none' : ''}`}
        title={onTitleDoubleClick ? "Double-click to rename" : undefined}
      >
        {titleSlot ?? title}
      </div>

      {/* Right — Profile Icon */}
      <button 
        className="text-[#EDEFF3] hover:opacity-80 transition-opacity flex items-center justify-center p-1.5"
        aria-label="Profile"
      >
        <User size={20} strokeWidth={2} />
      </button>
    </header>
  );
}
