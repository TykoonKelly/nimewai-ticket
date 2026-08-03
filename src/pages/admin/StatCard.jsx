// src/components/admin/StatCard.jsx
const StatCard = ({ title, value, icon, color }) => {
  // ✅ Ensure value is properly displayed
  const displayValue = value !== undefined && value !== null ? value : 0;

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      fontFamily: "'Inter', sans-serif"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          fontWeight: 500
        }}>
          {title || 'Stat'}
        </div>
        <div style={{
          background: color ? `${color}15` : '#7c3aed15',
          color: color || '#7c3aed',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px'
        }}>
          {icon || '📊'}
        </div>
      </div>
      
      <div style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1f2937',
        marginBottom: '4px'
      }}>
        {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
      </div>
    </div>
  );
};

export default StatCard;