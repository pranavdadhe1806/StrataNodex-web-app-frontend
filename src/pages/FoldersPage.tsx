import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import { Folder, Plus, LayoutGrid, List as ListIcon, X, Trash2, Edit2, Check, Square, CheckSquare } from 'lucide-react';

interface FolderItem {
  id: string;
  name: string;
  listCount: number;
  isSystem?: boolean;
}

const defaultFolders: FolderItem[] = [
  { id: 'daily-task', name: 'Daily Task', listCount: 1, isSystem: true },
];

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

const LONG_PRESS_DURATION = 600; // ms

export default function FoldersPage() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<FolderItem[]>(defaultFolders);
  const [viewMode, setViewMode] = useState<'icons' | 'list'>('icons');
  const [showNewFolderPopup, setShowNewFolderPopup] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Selection state
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Rename state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: string } | null>(null);

  // Long press refs
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  // Close context menu on click outside
  useEffect(() => {
    function handleClick() {
      setContextMenu(null);
    }
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  function handleFolderClick(folderId: string) {
    if (selectionMode) {
      toggleSelection(folderId);
      return;
    }
    if (editingFolderId === folderId) return;
    navigate(`/folders/${folderId}`);
  }

  function handleCreateFolder() {
    if (newFolderName.trim()) {
      const newFolder: FolderItem = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        listCount: 0,
      };
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setShowNewFolderPopup(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleCreateFolder();
    }
    if (e.key === 'Escape') {
      setShowNewFolderPopup(false);
      setNewFolderName('');
    }
  }

  // Selection logic
  function toggleSelection(folderId: string) {
    const newSelected = new Set(selectedFolders);
    if (newSelected.has(folderId)) {
      newSelected.delete(folderId);
    } else {
      newSelected.add(folderId);
    }
    setSelectedFolders(newSelected);
    if (newSelected.size === 0) {
      setSelectionMode(false);
    }
  }

  function clearSelection() {
    setSelectedFolders(new Set());
    setSelectionMode(false);
  }

  function deleteSelected() {
    const newFolders = folders.filter(
      (f) => !selectedFolders.has(f.id) || f.isSystem
    );
    setFolders(newFolders);
    clearSelection();
  }

  function deleteFolder(folderId: string) {
    const folder = folders.find((f) => f.id === folderId);
    if (folder?.isSystem) return;
    setFolders(folders.filter((f) => f.id !== folderId));
    setContextMenu(null);
    if (selectedFolders.has(folderId)) {
      const newSelected = new Set(selectedFolders);
      newSelected.delete(folderId);
      setSelectedFolders(newSelected);
    }
  }

  // Long press handlers
  const startLongPress = useCallback((folderId: string) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setSelectionMode(true);
      setSelectedFolders(new Set([folderId]));
    }, LONG_PRESS_DURATION);
  }, []);

  const endLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Rename logic
  function startRename(folder: FolderItem) {
    if (folder.isSystem) return;
    setEditingFolderId(folder.id);
    setEditName(folder.name);
    setContextMenu(null);
  }

  function saveRename() {
    if (editName.trim() && editingFolderId) {
      setFolders(
        folders.map((f) =>
          f.id === editingFolderId ? { ...f, name: editName.trim() } : f
        )
      );
    }
    setEditingFolderId(null);
    setEditName('');
  }

  function cancelRename() {
    setEditingFolderId(null);
    setEditName('');
  }

  // Context menu
  function handleRightClick(e: React.MouseEvent, folder: FolderItem) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, folderId: folder.id });
  }

  function handleDoubleClick(folder: FolderItem) {
    if (selectionMode) return;
    if (!folder.isSystem) {
      startRename(folder);
    }
  }

  const selectedFolder = contextMenu ? folders.find((f) => f.id === contextMenu.folderId) : null;
  const isSystemFolder = selectedFolder?.isSystem ?? false;

  return (
    <div style={{ background: '#1B1D21', minHeight: '100vh' }}>
      <Topbar title="Your Folders" />
      <SidePanel />

      {/* Main Content */}
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
        {/* Header Row: Title + View Toggle + New Folder Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
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
            Your Folders
            {selectionMode && (
              <span
                style={{
                  color: '#8A8F98',
                  fontSize: '14px',
                  fontWeight: 400,
                  marginLeft: '12px',
                }}
              >
                ({selectedFolders.size} selected)
              </span>
            )}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Delete Selected Button */}
            {selectionMode && selectedFolders.size > 0 && (
              <button
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 53, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 53, 0.15)';
                }}
              >
                <Trash2 size={18} />
                Delete ({selectedFolders.size})
              </button>
            )}

            {/* Cancel Selection */}
            {selectionMode && (
              <button
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#D5D8DE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#8A8F98';
                }}
              >
                Cancel
              </button>
            )}

            {/* View Toggle */}
            <div
              style={{
                display: 'flex',
                background: '#32363C',
                borderRadius: '10px',
                padding: '4px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <button
                onClick={() => setViewMode('icons')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'icons' ? 'rgba(0, 191, 255, 0.15)' : 'transparent',
                  color: viewMode === 'icons' ? '#00bfff' : '#8A8F98',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title="Icon View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'list' ? 'rgba(0, 191, 255, 0.15)' : 'transparent',
                  color: viewMode === 'list' ? '#00bfff' : '#8A8F98',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title="List View"
              >
                <ListIcon size={18} />
              </button>
            </div>

            {/* New Folder Button */}
            <button
              onClick={() => setShowNewFolderPopup(true)}
              style={{
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3A3F45';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#32363C';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <Plus size={18} />
              New Folder
            </button>
          </div>
        </div>

        {/* Folders Grid/List */}
        {viewMode === 'icons' ? (
          /* Icon View */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '24px',
            }}
          >
            {folders.map((folder) => {
              const isSelected = selectedFolders.has(folder.id);
              const isEditing = editingFolderId === folder.id;

              return (
                <div
                  key={folder.id}
                  onClick={() => handleFolderClick(folder.id)}
                  onContextMenu={(e) => handleRightClick(e, folder)}
                  onDoubleClick={() => handleDoubleClick(folder)}
                  onMouseDown={() => startLongPress(folder.id)}
                  onMouseUp={endLongPress}
                  onMouseLeave={endLongPress}
                  onTouchStart={() => startLongPress(folder.id)}
                  onTouchEnd={endLongPress}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: selectionMode || isEditing ? 'default' : 'pointer',
                    padding: '16px',
                    borderRadius: '16px',
                    transition: 'all 0.2s ease',
                    background: isSelected ? 'rgba(0, 191, 255, 0.1)' : 'transparent',
                    border: isSelected ? '1px solid rgba(0, 191, 255, 0.3)' : '1px solid transparent',
                    position: 'relative',
                  }}
                >
                  {/* Selection Checkbox (Icon View) */}
                  {selectionMode && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(folder.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        color: isSelected ? '#00bfff' : '#8A8F98',
                        cursor: 'pointer',
                      }}
                    >
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                  )}

                  {/* Folder Icon */}
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '20px',
                      background: '#32363C',
                      border: folder.isSystem
                        ? '1px solid rgba(255, 107, 53, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Folder
                      size={40}
                      style={{ color: folder.isSystem ? '#FF6B35' : '#00bfff' }}
                    />
                  </div>

                  {/* Folder Name / Edit Input */}
                  {isEditing ? (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename();
                          if (e.key === 'Escape') cancelRename();
                        }}
                        onBlur={saveRename}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '90px',
                          padding: '4px 8px',
                          background: '#1B1D21',
                          border: '1px solid rgba(0, 191, 255, 0.5)',
                          borderRadius: '6px',
                          color: '#EDEFF3',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '12px',
                          outline: 'none',
                          textAlign: 'center',
                        }}
                      />
                    </div>
                  ) : (
                    <span
                      style={{
                        color: folder.isSystem ? '#FF6B35' : '#D5D8DE',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        textAlign: 'center',
                        marginTop: '12px',
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={folder.isSystem ? 'System folder (cannot rename or delete)' : folder.name}
                    >
                      {folder.name}
                    </span>
                  )}

                  <span
                    style={{
                      color: '#8A8F98',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '11px',
                      textAlign: 'center',
                      marginTop: '4px',
                    }}
                  >
                    {folder.listCount} {folder.listCount === 1 ? 'list' : 'lists'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {folders.map((folder) => {
              const isSelected = selectedFolders.has(folder.id);
              const isEditing = editingFolderId === folder.id;

              return (
                <div
                  key={folder.id}
                  onClick={() => handleFolderClick(folder.id)}
                  onContextMenu={(e) => handleRightClick(e, folder)}
                  onDoubleClick={() => handleDoubleClick(folder)}
                  onMouseDown={() => startLongPress(folder.id)}
                  onMouseUp={endLongPress}
                  onMouseLeave={endLongPress}
                  onTouchStart={() => startLongPress(folder.id)}
                  onTouchEnd={endLongPress}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    background: isSelected ? 'rgba(0, 191, 255, 0.1)' : '#32363C',
                    border: isSelected
                      ? '1px solid rgba(0, 191, 255, 0.3)'
                      : folder.isSystem
                      ? '1px solid rgba(255, 107, 53, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    cursor: selectionMode || isEditing ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {/* Selection Checkbox (List View) */}
                  {selectionMode && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(folder.id);
                      }}
                      style={{
                        color: isSelected ? '#00bfff' : '#8A8F98',
                        cursor: 'pointer',
                      }}
                    >
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                  )}

                  <Folder
                    size={24}
                    style={{ color: folder.isSystem ? '#FF6B35' : '#00bfff', flexShrink: 0 }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename();
                          if (e.key === 'Escape') cancelRename();
                        }}
                        onBlur={saveRename}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          maxWidth: '300px',
                          padding: '6px 12px',
                          background: '#1B1D21',
                          border: '1px solid rgba(0, 191, 255, 0.5)',
                          borderRadius: '8px',
                          color: '#EDEFF3',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          color: folder.isSystem ? '#FF6B35' : '#EDEFF3',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '15px',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={folder.isSystem ? 'System folder (cannot rename or delete)' : folder.name}
                      >
                        {folder.name}
                      </div>
                    )}
                  </div>

                  <span
                    style={{
                      color: '#8A8F98',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    {folder.listCount} {folder.listCount === 1 ? 'list' : 'lists'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && selectedFolder && (
        <div style={{ ...contextMenuStyle, left: contextMenu.x, top: contextMenu.y }}>
          {!isSystemFolder && (
            <div
              onClick={() => startRename(selectedFolder)}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Edit2 size={16} style={{ color: '#00bfff' }} />
              Rename
            </div>
          )}

          {!isSystemFolder && (
            <div
              onClick={() => deleteFolder(selectedFolder.id)}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 53, 0.15)';
                e.currentTarget.style.color = '#FF6B35';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#D5D8DE';
              }}
            >
              <Trash2 size={16} style={{ color: '#FF6B35' }} />
              Delete
            </div>
          )}

          {isSystemFolder && (
            <div
              style={{
                padding: '10px 12px',
                color: '#8A8F98',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
                fontStyle: 'italic',
              }}
            >
              System folder — cannot modify
            </div>
          )}
        </div>
      )}

      {/* New Folder Popup */}
      {showNewFolderPopup && (
        <div style={popupOverlayStyle} onClick={() => setShowNewFolderPopup(false)}>
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
                Create New Folder
              </h2>
              <button
                onClick={() => {
                  setShowNewFolderPopup(false);
                  setNewFolderName('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8A8F98',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  color: '#8A8F98',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '13px',
                  marginBottom: '8px',
                }}
              >
                Folder Name
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter folder name..."
                autoFocus
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
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 191, 255, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowNewFolderPopup(false);
                  setNewFolderName('');
                }}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#D5D8DE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#8A8F98';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                style={{
                  padding: '10px 20px',
                  background: newFolderName.trim() ? '#00bfff' : 'rgba(0, 191, 255, 0.3)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#1B1D21',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: newFolderName.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (newFolderName.trim()) {
                    e.currentTarget.style.background = '#33ccff';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = newFolderName.trim() ? '#00bfff' : 'rgba(0, 191, 255, 0.3)';
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
