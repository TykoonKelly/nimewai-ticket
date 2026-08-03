// src/components/common/Button.jsx
const Button = ({ children, onClick, variant = 'primary', size = 'medium' }) => {
  const styles = {
    primary: {
      backgroundColor: '#7c3aed',
      color: 'white',
      border: 'none'
    },
    secondary: {
      backgroundColor: 'white',
      color: '#7c3aed',
      border: '2px solid #7c3aed'
    }
  };

  const sizes = {
    small: { padding: '8px 16px', fontSize: '14px' },
    medium: { padding: '12px 24px', fontSize: '16px' },
    large: { padding: '16px 32px', fontSize: '18px' }
  };

  return (
    <button
      onClick={onClick}
      style={{
        ...styles[variant],
        ...sizes[size],
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      {children}
    </button>
  );
};

export default Button;