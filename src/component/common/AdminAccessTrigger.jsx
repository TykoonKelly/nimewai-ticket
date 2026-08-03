// src/component/common/AdminAccessTrigger.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAccessTrigger = () => {
  const navigate = useNavigate();
  const [doubleClickCount, setDoubleClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleDoubleClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 500) {
      setDoubleClickCount(prev => {
        const newCount = prev + 1;
        if (newCount === 3) {
          navigate('/admin-console');
          return 0;
        }
        return newCount;
      });
    }
    setLastClickTime(now);
    setTimeout(() => setDoubleClickCount(0), 10000);
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'transparent',
          cursor: 'default',
          zIndex: 9999,
          border: '1px solid transparent'
        }}
        onMouseEnter={() => setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
        onDoubleClick={handleDoubleClick}
      >
        {showHint && (
          <div style={{
            position: 'absolute',
            bottom: '30px',
            right: '0',
            background: '#1f2937',
            color: 'rgba(255,255,255,0.6)',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            fontFamily: "'Inter', sans-serif"
          }}>
            🛡️ Admin access available
          </div>
        )}
      </div>

      {doubleClickCount > 0 && doubleClickCount < 3 && (
        <div style={{
          position: 'fixed',
          bottom: '110px',
          right: '30px',
          background: '#7c3aed',
          color: 'white',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontFamily: "'Inter', sans-serif",
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          {3 - doubleClickCount} more double-clicks...
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default AdminAccessTrigger;