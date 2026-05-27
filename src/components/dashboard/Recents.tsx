import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RecentCard from './RecentCard';
import { MAX_RECENTS, useRecentsStore, type RecentEntry } from '../../store/recents.store';

interface CtxMenu {
  x: number;
  y: number;
  item: RecentEntry;
}

export default function Recents() {
  const navigate = useNavigate();
  const items = useRecentsStore((s) => s.items).slice(0, MAX_RECENTS);
  const removeItem = useRecentsStore((s) => s.removeItem);

  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);

  const closeMenu = useCallback(() => setCtxMenu(null), []);

  useEffect(() => {
    if (!ctxMenu) return;
    const handler = () => closeMenu();
    window.addEventListener('click', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [ctxMenu, closeMenu]);

  function handleCardClick(item: RecentEntry) {
    if (item.type === 'folder') {
      navigate(`/folders/${item.id}`);
    } else {
      navigate(`/list/${item.id}`, { state: { listName: item.name } });
    }
  }

  function handleContextMenu(e: React.MouseEvent, item: RecentEntry) {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, item });
  }

  const columnCount = Math.min(items.length, MAX_RECENTS);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <h2
        style={{
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-main)',
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
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-main)',
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
              id={item.id}
              name={item.name}
              type={item.type}
              onClick={() => handleCardClick(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
            />
          ))}
        </div>
      )}

      {/* Context menu */}
      {ctxMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: ctxMenu.y,
            left: ctxMenu.x,
            zIndex: 1000,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            minWidth: 168,
            overflow: 'hidden',
            fontFamily: 'var(--font-main)',
          }}
        >
          <button
            onClick={() => { removeItem(ctxMenu.item.type, ctxMenu.item.id); closeMenu(); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '9px 14px', background: 'none', border: 'none',
              color: '#f85149', fontSize: 13, cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,81,73,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            Remove from recents
          </button>
        </div>
      )}
    </div>
  );
}
