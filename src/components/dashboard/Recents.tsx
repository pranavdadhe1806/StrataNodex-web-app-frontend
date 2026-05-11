import { useNavigate } from 'react-router-dom';
import RecentCard from './RecentCard';

interface RecentItem {
  id: string;
  name: string;
  type: 'folder' | 'list';
}

const mockRecents: RecentItem[] = [
  { id: '1', name: 'GATE Prep', type: 'folder' },
  { id: '2', name: 'Daily Tasks', type: 'list' },
  { id: '3', name: 'Personal', type: 'folder' },
  { id: '4', name: 'Maths', type: 'list' },
  { id: '5', name: 'Work', type: 'folder' },
  { id: '6', name: 'Science', type: 'list' },
  { id: '7', name: 'College', type: 'folder' },
  { id: '8', name: 'Physics', type: 'list' },
  { id: '9', name: 'Side Projects', type: 'folder' },
  { id: '10', name: 'Gym', type: 'list' },
];

export default function Recents() {
  const navigate = useNavigate();

  function handleCardClick(item: RecentItem) {
    if (item.type === 'folder') {
      navigate(`/folders/${item.id}`);
    } else {
      navigate(`/list/${item.id}`);
    }
  }

  return (
    <div>
      {/* Section Header */}
      <h2
        style={{
          color: '#EDEFF3',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '18px',
          fontWeight: 600,
          margin: '0 0 16px 0',
        }}
      >
        Recents
      </h2>

      {/* Horizontal Scroll Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {mockRecents.map((item) => (
          <RecentCard
            key={item.id}
            id={item.id}
            name={item.name}
            type={item.type}
            onClick={() => handleCardClick(item)}
          />
        ))}
      </div>
    </div>
  );
}
