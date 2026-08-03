// src/components/EventImage.jsx
import { useState } from 'react';

/**
 * EventImage Component
 * Displays event image with gradient fallback and overlay effects
 */
const EventImage = ({ 
  src, 
  alt, 
  gradient, 
  children, 
  className = '',
  style = {}
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // If no image or image failed to load, show gradient background
  if (!src || imageError) {
    return (
      <div
        style={{
          position: 'relative',
          height: '176px',
          overflow: 'hidden',
          background: `linear-gradient(to bottom right, ${gradient || 'from-purple-600 via-purple-500 to-pink-500'})`,
          ...style
        }}
        className={className}
      >
        {/* Decorative overlays for gradient background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 55%)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 80% 80%, rgba(0,0,0,0.35), transparent 55%)'
          }}
        />
        {children}
      </div>
    );
  }

  // Show image with gradient overlay for text readability
  return (
    <div
      style={{
        position: 'relative',
        height: '176px',
        overflow: 'hidden',
        ...style
      }}
      className={className}
    >
      {/* Image */}
      <img
        src={src}
        alt={alt || 'Event poster'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      
      {/* Gradient overlay for better text visibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)'
        }}
      />
      
      {children}
    </div>
  );
};

export default EventImage;