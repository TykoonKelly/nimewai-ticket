// src/utils/ticketUtils.js

// Get the status of a tier
export const getTierStatus = (tier) => {
  const now = new Date();
  const start = new Date(tier.salesStart);
  const end = new Date(tier.salesEnd);
  
  if (tier.sold >= tier.quantity) return 'sold_out';
  if (now < start) return 'upcoming';
  if (now > end) return 'expired';
  return 'on_sale';
};

// Get the active tier for a ticket level
export const getActiveTier = (tiers) => {
  return tiers.find(tier => getTierStatus(tier) === 'on_sale') || null;
};

// Get all active tiers across all levels
export const getAllActiveTiers = (ticketLevels) => {
  const active = [];
  ticketLevels.forEach(level => {
    const activeTier = getActiveTier(level.tiers);
    if (activeTier) {
      active.push({
        level: level.name,
        tier: activeTier
      });
    }
  });
  return active;
};

// Get the cheapest active tier across all levels
export const getCheapestActiveTier = (ticketLevels) => {
  const active = getAllActiveTiers(ticketLevels);
  if (active.length === 0) return null;
  return active.reduce((min, current) => 
    current.tier.price < min.tier.price ? current : min
  );
};

// Get the most expensive active tier (useful for showing range)
export const getMostExpensiveActiveTier = (ticketLevels) => {
  const active = getAllActiveTiers(ticketLevels);
  if (active.length === 0) return null;
  return active.reduce((max, current) => 
    current.tier.price > max.tier.price ? current : max
  );
};

// Check if any tier is on sale for a level
export const hasActiveTier = (tiers) => {
  return tiers.some(tier => getTierStatus(tier) === 'on_sale');
};

// Calculate percentage sold for a tier
export const getTierPercentSold = (tier) => {
  return Math.round((tier.sold / tier.quantity) * 100);
};

// Get price range display string
export const getPriceRangeDisplay = (ticketLevels) => {
  const cheapest = getCheapestActiveTier(ticketLevels);
  const mostExpensive = getMostExpensiveActiveTier(ticketLevels);
  
  if (!cheapest) return 'Sold Out';
  if (cheapest.tier.price === mostExpensive?.tier.price) {
    return `KES ${cheapest.tier.price.toLocaleString()}`;
  }
  return `KES ${cheapest.tier.price.toLocaleString()} - ${mostExpensive.tier.price.toLocaleString()}`;
};

// Get the earliest active tier start date
export const getEarliestStartDate = (ticketLevels) => {
  const active = getAllActiveTiers(ticketLevels);
  if (active.length === 0) return null;
  return active.reduce((earliest, current) => {
    const currentDate = new Date(current.tier.salesStart);
    const earliestDate = new Date(earliest.tier.salesStart);
    return currentDate < earliestDate ? current : earliest;
  });
};

// Check if event has any upcoming tiers
export const hasUpcomingTiers = (ticketLevels) => {
  return ticketLevels.some(level => 
    level.tiers.some(tier => getTierStatus(tier) === 'upcoming')
  );
};

// Get total remaining tickets across all levels
export const getTotalRemainingTickets = (ticketLevels) => {
  let total = 0;
  ticketLevels.forEach(level => {
    level.tiers.forEach(tier => {
      if (getTierStatus(tier) === 'on_sale') {
        total += tier.quantity - tier.sold;
      }
    });
  });
  return total;
};