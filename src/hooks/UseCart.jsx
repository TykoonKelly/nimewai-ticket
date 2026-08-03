// src/hooks/useCart.js
import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = "nimewahi.cart.v1";
const listeners = new Set();
let cache = null;

// Read fresh data from localStorage
function readFresh() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    return [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
}

// Read with cache
function read() {
  if (cache === null) cache = readFresh();
  return cache;
}

// Write to localStorage
function write(items) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    cache = items;
    listeners.forEach((l) => l());
  } catch (error) {
    console.error('Error writing cart to localStorage:', error);
  }
}

// Subscribe to changes
function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Get snapshot for useSyncExternalStore
function getSnapshot() {
  return read();
}

// Server-side snapshot
function getServerSnapshot() {
  return [];
}

// Generate unique ID for cart items
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Custom hook for cart management
export function useCart() {
  // Use useSyncExternalStore for reactive updates
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Add item to cart
  const addItem = useCallback((eventId, levelName, tierName, price, quantity = 1) => {
    const currentItems = read();
    
    // Check if item already exists
    const existingIndex = currentItems.findIndex(
      item => item.eventId === eventId && 
              item.levelName === levelName && 
              item.tierName === tierName
    );

    let updatedItems;
    if (existingIndex >= 0) {
      // Update existing item
      updatedItems = [...currentItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + quantity
      };
    } else {
      // Add new item
      const newItem = {
        id: generateId(),
        eventId,
        levelName,
        tierName,
        price,
        quantity,
        addedAt: new Date().toISOString()
      };
      updatedItems = [...currentItems, newItem];
    }
    
    write(updatedItems);
    return updatedItems;
  }, []);

  // Remove item from cart
  const removeItem = useCallback((itemId) => {
    const currentItems = read();
    const updatedItems = currentItems.filter(item => item.id !== itemId);
    write(updatedItems);
    return updatedItems;
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeItem(itemId);
    }
    
    const currentItems = read();
    const updatedItems = currentItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    write(updatedItems);
    return updatedItems;
  }, [removeItem]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    write([]);
  }, []);

  // Get total number of items (sum of all quantities)
  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  // Get total price
  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  // Get item count (unique items)
  const getItemCount = useCallback(() => {
    return items.length;
  }, [items]);

  // Check if item is in cart
  const isInCart = useCallback((eventId, levelName, tierName) => {
    return items.some(
      item => item.eventId === eventId && 
              item.levelName === levelName && 
              item.tierName === tierName
    );
  }, [items]);

  // Get quantity of specific item
  const getItemQuantity = useCallback((eventId, levelName, tierName) => {
    const item = items.find(
      item => item.eventId === eventId && 
              item.levelName === levelName && 
              item.tierName === tierName
    );
    return item ? item.quantity : 0;
  }, [items]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getItemCount,
    isInCart,
    getItemQuantity
  };
}