// src/utils/eventImages.js
/**
 * Centralized event image mapping
 * Add new event images here as needed
 */

// Import all images
import wheezfitPoster from '../images/EventPosters/WheezfitPoster.JPG.jpeg';

// Add more imports as you add images
// import parkChillPoster from '../images/EventPosters/ParkChillPoster.jpg';
// import sideQuestPoster from '../images/EventPosters/SideQuestPoster.jpg';

/**
 * Map event IDs to their image paths
 */
const imageMap = {
  2: wheezfitPoster,
  // Add more mappings as needed
  // 1: parkChillPoster,
  // 2: sideQuestPoster,
};

/**
 * Get event image by event ID
 * @param {number} eventId - The ID of the event
 * @returns {string|null} - Image path or null if not found
 */
export const getEventImage = (eventId) => {
  return imageMap[eventId] || null;
};

/**
 * Check if an event has an image
 * @param {number} eventId - The ID of the event
 * @returns {boolean} - True if image exists
 */
export const hasEventImage = (eventId) => {
  return !!imageMap[eventId];
};