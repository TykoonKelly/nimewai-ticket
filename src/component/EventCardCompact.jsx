// src/components/EventCardCompact.jsx
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket } from 'lucide-react';

const EventCardCompact = ({ event }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-purple-300">
      {/* Date */}
      <div className="flex-shrink-0 w-14 h-14 flex flex-col items-center justify-center bg-purple-50 rounded-xl">
        <span className="text-[10px] font-bold uppercase text-purple-600">
          {event.date.split(' ')[0].slice(0, 3)}
        </span>
        <span className="text-lg font-extrabold text-gray-900">
          {event.date.split(' ')[1].replace(',', '')}
        </span>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.location.split(',')[0]}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {event.time}
          </span>
        </div>
      </div>
      
      {/* Price & Action */}
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-bold text-gray-900">
          {event.priceDisplay || `KES ${event.price}`}
        </p>
        <Link
          to={`/events/${event.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
        >
          <Ticket className="h-3 w-3" />
          Book
        </Link>
      </div>
    </div>
  );
};

export default EventCardCompact;