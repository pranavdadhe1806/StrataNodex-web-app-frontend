import { useState, useRef } from 'react';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';

export default function ListPage() {
  const [listTitle, setListTitle] = useState('Untitled List');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(listTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);

  function handleTitleDoubleClick() {
    setTempTitle(listTitle);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  }

  function handleTitleBlur() {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      setListTitle(tempTitle.trim());
    }
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      titleInputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setTempTitle(listTitle);
      setIsEditingTitle(false);
    }
  }

  return (
    <div style={{ background: '#1B1D21', height: '100vh', overflow: 'hidden' }}>
      <Topbar
        title={isEditingTitle ? '' : listTitle}
        onTitleDoubleClick={handleTitleDoubleClick}
        titleSlot={
          isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={tempTitle}
              onChange={e => setTempTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(0,191,255,0.5)',
                color: '#EDEFF3',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                textAlign: 'center',
                outline: 'none',
                width: '200px',
              }}
            />
          ) : null
        }
      />

      <SidePanel />

      {/* Canvas */}
      <div
        style={{
          position: 'fixed',
          top: '56px',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#1B1D21',
          overflow: 'hidden',
          cursor: 'default',
        }}
      >
        {/* Empty state placeholder */}
        <p
          style={{
            position: 'absolute',
            top: '28px',
            left: '60px',
            color: '#7D828B',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '15px',
            fontWeight: 400,
            margin: 0,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          You can start typing here....
        </p>
      </div>
    </div>
  );
}
