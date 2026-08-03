// src/components/admin/RequestList.jsx
const RequestList = ({ requests }) => {
  // ✅ Add defensive check: ensure requests is an array
  if (!requests || !Array.isArray(requests) || requests.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '32px',
        color: '#6b7280',
        fontFamily: "'Inter', sans-serif"
      }}>
        No pending requests
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {requests.map((request) => (
        <div key={request.id || request._id || Math.random()} style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                fontWeight: 500,
                color: '#1f2937',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif"
              }}>
                {request.organizerName || request.name || 'Unknown Organizer'}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                fontFamily: "'Inter', sans-serif"
              }}>
                {request.eventName || request.event || 'Unknown Event'}
              </div>
            </div>
            <span style={{
              padding: '2px 10px',
              borderRadius: '50px',
              fontSize: '11px',
              fontWeight: 600,
              background: '#fef3c7',
              color: '#92400e'
            }}>
              {request.status || 'pending'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequestList;