import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import { useFolders } from '../hooks/useFolders';
import { useLists, useCreateList } from '../hooks/useLists';
import { useUIStore } from '../store/ui.store';
import { useRecordRecent } from '../hooks/useRecordRecent';
import { useRecentsStore } from '../store/recents.store';
import { Plus, List as ListIcon, Loader2, X } from 'lucide-react';

const glassCardStyle: React.CSSProperties = {
  background: '#32363C',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
};

const popupOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 200,
};

const popupStyle: React.CSSProperties = {
  ...glassCardStyle,
  padding: '24px',
  minWidth: '320px',
  maxWidth: '90vw',
};

const newListButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  background: '#32363C',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '10px',
  color: '#EDEFF3',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
};

export default function FolderPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const setActiveContext = useUIStore((s) => s.setActiveContext);

  const { data: folders = [] } = useFolders();
  const folder = folders.find((f) => f.id === folderId);

  const { data: lists = [], isLoading, error, refetch } = useLists(folderId || null);
  const createList = useCreateList();

  const [showNewListPopup, setShowNewListPopup] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const recordOpen = useRecentsStore((s) => s.recordOpen);

  useRecordRecent('folder', folderId, folder?.name);

  useEffect(() => {
    if (folder) {
      setActiveContext({ folderId: folder.id, folderName: folder.name });
    }
  }, [folder, setActiveContext]);

  function openList(list: { id: string; name: string }) {
    recordOpen({ id: list.id, name: list.name, type: 'list' });
    navigate(`/list/${list.id}`, {
      state: { listName: list.name, folderId: folder?.id, folderName: folder?.name },
    });
  }

  function openNewListPopup() {
    setCreateError(null);
    setShowNewListPopup(true);
  }

  function closeNewListPopup() {
    setShowNewListPopup(false);
    setNewListName('');
    setCreateError(null);
  }

  async function handleCreateList() {
    if (!newListName.trim() || !folderId) return;
    setCreateError(null);
    try {
      await createList.mutateAsync({ name: newListName.trim(), folderId });
      closeNewListPopup();
    } catch {
      setCreateError('Could not create list. Please try again.');
    }
  }

  function handleNewListKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCreateList();
    if (e.key === 'Escape') closeNewListPopup();
  }

  return (
    <div style={{ background: '#1B1D21', minHeight: '100vh' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <Topbar title={folder ? folder.name : 'Folder'} />
      <SidePanel />

      <div
        style={{
          paddingTop: '80px',
          paddingLeft: '48px',
          paddingRight: '48px',
          paddingBottom: '48px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <h1
            style={{
              color: '#EDEFF3',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '26px',
              fontWeight: 600,
              margin: 0,
            }}
          >
            {folder ? folder.name : 'Loading folder…'}
          </h1>

          <button
            type="button"
            onClick={openNewListPopup}
            disabled={!folderId}
            style={{
              ...newListButtonStyle,
              opacity: folderId ? 1 : 0.5,
              cursor: folderId ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e) => {
              if (folderId) e.currentTarget.style.background = '#3A3F45';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#32363C';
            }}
          >
            <Plus size={18} />
            New List
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <Loader2 size={32} style={{ color: '#00bfff', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : error ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '64px 24px',
              ...glassCardStyle,
              borderStyle: 'dashed',
            }}
          >
            <p style={{ color: '#FF6B35', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>
              Failed to load lists.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" onClick={() => refetch()} style={newListButtonStyle}>
                Retry
              </button>
              <button
                type="button"
                onClick={openNewListPopup}
                style={{
                  ...newListButtonStyle,
                  background: '#00bfff',
                  color: '#1B1D21',
                  border: 'none',
                }}
              >
                <Plus size={18} />
                New List
              </button>
            </div>
          </div>
        ) : lists.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 24px',
              minHeight: '320px',
              ...glassCardStyle,
              borderStyle: 'dashed',
            }}
          >
            <ListIcon size={48} style={{ color: '#8A8F98', marginBottom: '16px' }} />
            <h3
              style={{
                color: '#EDEFF3',
                fontSize: '18px',
                fontWeight: 500,
                marginBottom: '8px',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              This folder is empty
            </h3>
            <p
              style={{
                color: '#8A8F98',
                fontSize: '14px',
                marginBottom: '24px',
                fontFamily: 'Poppins, sans-serif',
                textAlign: 'center',
              }}
            >
              Create a list to start adding tasks.
            </p>
            <button
              type="button"
              onClick={openNewListPopup}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: '#00bfff',
                border: 'none',
                borderRadius: '10px',
                color: '#1B1D21',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Plus size={18} />
              New List
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {lists.map((list) => (
              <div
                key={list.id}
                role="button"
                tabIndex={0}
                onClick={() => openList(list)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openList(list);
                  }
                }}
                style={{
                  padding: '24px',
                  ...glassCardStyle,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 191, 255, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ padding: '8px', background: 'rgba(0, 191, 255, 0.1)', borderRadius: '10px' }}>
                    <ListIcon size={20} style={{ color: '#00bfff' }} />
                  </div>
                  <h3
                    style={{
                      color: '#EDEFF3',
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: 500,
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {list.name}
                  </h3>
                </div>
                <div style={{ color: '#8A8F98', fontSize: '13px', fontFamily: 'Poppins, sans-serif' }}>
                  {list._count?.nodes ?? 0} tasks
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={openNewListPopup}
              style={{
                padding: '24px',
                minHeight: '120px',
                background: 'transparent',
                border: '2px dashed rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                color: '#8A8F98',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 191, 255, 0.4)';
                e.currentTarget.style.color = '#00bfff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#8A8F98';
              }}
            >
              <Plus size={28} />
              New List
            </button>
          </div>
        )}
      </div>

      {showNewListPopup && (
        <div style={popupOverlayStyle} onClick={closeNewListPopup}>
          <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  color: '#EDEFF3',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Create New List
              </h2>
              <button
                type="button"
                onClick={closeNewListPopup}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8A8F98',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <label
              style={{
                display: 'block',
                color: '#8A8F98',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                marginBottom: '8px',
              }}
            >
              List name
            </label>
            <input
              autoFocus
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={handleNewListKeyDown}
              placeholder="Enter list name..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#1B1D21',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#EDEFF3',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: createError ? '8px' : '20px',
              }}
            />
            {createError && (
              <p style={{ color: '#FF6B35', fontSize: '13px', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>
                {createError}
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={closeNewListPopup} style={newListButtonStyle}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateList}
                disabled={!newListName.trim() || createList.isPending}
                style={{
                  padding: '10px 20px',
                  background: newListName.trim() ? '#00bfff' : 'rgba(0, 191, 255, 0.3)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#1B1D21',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: newListName.trim() && !createList.isPending ? 'pointer' : 'not-allowed',
                }}
              >
                {createList.isPending ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

