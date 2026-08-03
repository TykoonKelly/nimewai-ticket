// src/components/admin/EventTable.jsx
const EventTable = ({ events }) => {
  // ✅ Add defensive check: ensure events is an array
  if (!events || !Array.isArray(events) || events.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '32px',
        color: '#6b7280',
        fontFamily: "'Inter', sans-serif"
      }}>
        No events to display
      </div>
    );
  }

  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: "'Inter', sans-serif"
      }}>
        <thead>
          <tr>
            <th style={{
              textAlign: 'left',
              padding: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb'
            }}>
              Event
            </th>
            <th style={{
              textAlign: 'center',
              padding: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb'
            }}>
              Tickets
            </th>
            <th style={{
              textAlign: 'center',
              padding: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb'
            }}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id || event._id || Math.random()}>
              <td style={{
                padding: '8px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <div style={{
                  fontWeight: 500,
                  color: '#1f2937',
                  fontSize: '14px'
                }}>
                  {event.title || 'Untitled Event'}
                </div>
              </td>
              <td style={{
                padding: '8px',
                textAlign: 'center',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <span style={{
                  fontWeight: 600,
                  color: '#1f2937'
                }}>
                  {event.ticketsSold || event.tickets || 0}
                </span>
              </td>
              <td style={{
                padding: '8px',
                textAlign: 'center',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <span style={{
                  padding: '2px 10px',
                  borderRadius: '50px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: event.status === 'pending' ? '#fef3c7' : '#d1fae5',
                  color: event.status === 'pending' ? '#92400e' : '#065f46'
                }}>
                  {event.status || 'active'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventTable;