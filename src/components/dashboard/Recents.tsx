import { useNavigate } from 'react-router-dom';
import RecentCard from './RecentCard';
import { MAX_RECENTS, useRecentsStore } from '../../store/recents.store';

export default function Recents() {
  const navigate = useNavigate();
  const items = useRecentsStore((s) => s.items).slice(0, MAX_RECENTS);

  function handleCardClick(item: (typeof items)[number]) {
    if (item.type === 'folder') {
      navigate(`/folders/${item.id}`);
    } else {
      navigate(`/list/${item.id}`, { state: { listName: item.name } });
    }
  }

  const columnCount = Math.min(items.length, MAX_RECENTS);

  return (
    <div style={{ width: '100%' }}>
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

      {items.length === 0 ? (
        <p
          style={{
            color: '#8A8F98',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            margin: 0,
            padding: '24px 0',
          }}
        >
          Open a folder or list to see it here.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columnCount}, minmax(80px, 1fr))`,
            gap: '8px',
            width: '100%',
          }}
        >
          {items.map((item) => (
            <RecentCard
              key={`${item.type}-${item.id}`}
              name={item.name}
              type={item.type}
              onClick={() => handleCardClick(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
