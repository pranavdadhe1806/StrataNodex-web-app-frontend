import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import { useFolders } from '../hooks/useFolders';
import { useLists, useCreateList, useUpdateList, useDeleteList } from '../hooks/useLists';
import { useUIStore } from '../store/ui.store';
import { useRecordRecent } from '../hooks/useRecordRecent';
import { useRecentsStore } from '../store/recents.store';
import type { List } from '../types/list.types';
import { Plus, Loader2, X, Trash2, Edit2, Square, CheckSquare } from 'lucide-react';
import ListPreviewCard from '../components/ui/ListPreviewCard';

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

const contextMenuStyle: React.CSSProperties = {
  position: 'fixed',
  background: '#32363C',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
  padding: '6px',
  minWidth: '160px',
  zIndex: 150,
};

const LONG_PRESS_DURATION = 600;

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
  const updateList = useUpdateList();
  const deleteList = useDeleteList();

  const [showNewListPopup, setShowNewListPopup] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Selection state
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Rename state
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; listId: string } | null>(null);

  // Long press refs
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const recordOpen = useRecentsStore((s) => s.recordOpen);

  useRecordRecent('folder', folderId, folder?.name);

  useEffect(() => {
    if (folder) {
      setActiveContext({ folderId: folder.id, folderName: folder.name });
    }
  }, [folder, setActiveContext]);

  // Close context menu on outside click
  useEffect(() => {
    function handleOutsideClick() {
      setContextMenu(null);
    }
    if (contextMenu) {
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [contextMenu]);

  // Long press handlers
  const startLongPress = useCallback((listId: string) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setSelectionMode(true);
      setSelectedLists(new Set([listId]));
    }, LONG_PRESS_DURATION);
  }, []);

  const endLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Selection logic
  function toggleSelection(listId: string) {
    const next = new Set(selectedLists);
    if (next.has(listId)) {
      next.delete(listId);
    } else {
      next.add(listId);
    }
    setSelectedLists(next);
    if (next.size === 0) setSelectionMode(false);
  }

  function clearSelection() {
    setSelectedLists(new Set());
    setSelectionMode(false);
  }

  async function deleteSelected() {
    await Promise.all(Array.from(selectedLists).map((id) => deleteList.mutateAsync(id)));
    clearSelection();
  }

  async function handleDeleteList(listId: string) {
    await deleteList.mutateAsync(listId);
    setContextMenu(null);
  }

  // Rename logic
  function startRename(list: List) {
    setEditingListId(list.id);
    setEditName(list.name);
    setContextMenu(null);
  }

  async function saveRename() {
    if (editName.trim() && editingListId) {
      await updateList.mutateAsync({ id: editingListId, data: { name: editName.trim() } });
    }
    setEditingListId(null);
    setEditName('');
  }

  function cancelRename() {
    setEditingListId(null);
    setEditName('');
  }

  // Context menu
  function handleRightClick(e: React.MouseEvent, list: List) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, listId: list.id });
  }

  function handleDoubleClick(list: List) {
    if (selectionMode) return;
    startRename(list);
  }

  function openList(list: List) {
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    if (selectionMode) {
      toggleSelection(list.id);
      return;
    }
    if (editingListId === list.id) return;
    recordOpen({ id: list.id, name: list.name, type: 'list' });
    navigate(`/list/${list.id}`, {
      state: { listName: list.name, folderId: folder?.id, folderName: folder?.name },
    });
  }

  const contextMenuList = contextMenu ? lists.find((l) => l.id === contextMenu.listId) : null;

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
            {selectionMode && (
              <span style={{ color: '#8A8F98', fontSize: '14px', fontWeight: 400, marginLeft: '12px' }}>
                ({selectedLists.size} selected)
              </span>
            )}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {selectionMode && selectedLists.size > 0 && (
              <button
                type="button"
                onClick={deleteSelected}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(255, 107, 53, 0.15)',
                  border: '1px solid rgba(255, 107, 53, 0.3)',
                  borderRadius: '10px',
                  color: '#FF6B35',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 107, 53, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 107, 53, 0.15)'; }}
              >
                <Trash2 size={18} />
                Delete ({selectedLists.size})
              </button>
            )}
            {selectionMode && (
              <button
                type="button"
                onClick={clearSelection}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#8A8F98',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#D5D8DE'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#8A8F98'; e.currentTarget.style.background = 'transparent'; }}
              >
                Cancel
              </button>
            )}
            {!selectionMode && (
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
            )}
          </div>
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
            <Plus size={48} style={{ color: '#8A8F98', marginBottom: '16px' }} />
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '20px',
            }}
          >
            {lists.map((list) => {
              const isSelected = selectedLists.has(list.id);
              const isEditing = editingListId === list.id;
              return (
                <div
                  key={list.id}
                  onClick={() => openList(list)}
                  onContextMenu={(e) => handleRightClick(e, list)}
                  onDoubleClick={() => handleDoubleClick(list)}
                  onMouseDown={() => startLongPress(list.id)}
                  onMouseUp={endLongPress}
                  onTouchStart={() => startLongPress(list.id)}
                  onTouchEnd={endLongPress}
                  style={{
                    cursor: selectionMode || isEditing ? 'default' : 'pointer',
                    userSelect: 'none',
                    position: 'relative',
                    borderRadius: '16px',
                    padding: '4px',
                    background: isSelected ? 'rgba(0, 191, 255, 0.06)' : 'transparent',
                    transition: 'background 0.15s ease, transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !selectionMode) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    endLongPress();
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Checkbox in selection mode */}
                  {selectionMode && (
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleSelection(list.id); }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        color: isSelected ? '#00bfff' : '#8A8F98',
                        cursor: 'pointer',
                        zIndex: 2,
                      }}
                    >
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </div>
                  )}

                  <ListPreviewCard
                    name={list.name}
                    nodeCount={list._count?.nodes ?? 0}
                    isSelected={isSelected}
                    isEditing={isEditing}
                    editNameValue={editName}
                    onEditChange={(v) => setEditName(v)}
                    onEditKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename();
                      if (e.key === 'Escape') cancelRename();
                    }}
                    onEditBlur={saveRename}
                    onEditClick={(e) => e.stopPropagation()}
                  />
                </div>
              );
            })}

            {!selectionMode && (
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
            )}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && contextMenuList && (
        <div style={{ ...contextMenuStyle, left: contextMenu.x, top: contextMenu.y }}>
          <div
            onClick={() => startRename(contextMenuList)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#D5D8DE',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '13px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Edit2 size={16} style={{ color: '#00bfff' }} />
            Rename
          </div>
          <div
            onClick={() => handleDeleteList(contextMenuList.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#D5D8DE',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '13px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 107, 53, 0.15)'; e.currentTarget.style.color = '#FF6B35'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#D5D8DE'; }}
          >
            <Trash2 size={16} style={{ color: '#FF6B35' }} />
            Delete
          </div>
        </div>
      )}

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

