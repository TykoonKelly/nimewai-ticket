// src/services/firebaseService.js
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ==================== ADMIN FUNCTIONS ====================

export const getUsers = async (role = null) => {
  try {
    let q = collection(db, 'users');
    if (role) {
      q = query(q, where('role', '==', role));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const getEvents = async (status = null) => {
  try {
    let q = collection(db, 'events');
    if (status) {
      q = query(q, where('status', '==', status));
    }
    q = query(q, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const updateEventStatus = async (eventId, status) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating event status:', error);
    throw error;
  }
};

export const getOrganizerRequests = async (status = 'pending') => {
  try {
    const q = query(
      collection(db, 'organizerRequests'),
      where('status', '==', status),
      orderBy('requestedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching organizer requests:', error);
    throw error;
  }
};

export const processOrganizerRequest = async (requestId, status) => {
  try {
    const requestRef = doc(db, 'organizerRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    const requestData = requestDoc.data();
    
    await updateDoc(requestRef, {
      status: status,
      reviewedAt: serverTimestamp()
    });
    
    if (status === 'approved' && requestData.organizerId) {
      await updateUserRole(requestData.organizerId, 'organizer');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error processing request:', error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnapshot.size;
    
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    const totalEvents = eventsSnapshot.size;
    
    const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
    const totalTickets = ticketsSnapshot.size;
    
    let totalRevenue = 0;
    ticketsSnapshot.forEach(doc => {
      const data = doc.data();
      totalRevenue += data.price || 0;
    });
    
    const pendingQuery = query(
      collection(db, 'organizerRequests'),
      where('status', '==', 'pending')
    );
    const pendingSnapshot = await getDocs(pendingQuery);
    const pendingRequests = pendingSnapshot.size;
    
    return {
      totalUsers,
      totalEvents,
      totalTicketsSold: totalTickets,
      totalRevenue,
      pendingRequests
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ==================== ORGANIZER FUNCTIONS ====================

export const getOrganizerEvents = async (organizerId) => {
  try {
    const q = query(
      collection(db, 'events'),
      where('organizerId', '==', organizerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    throw error;
  }
};

export const listenToOrganizerSales = (organizerId, callback) => {
  try {
    const eventsQuery = query(
      collection(db, 'events'),
      where('organizerId', '==', organizerId)
    );
    
    return onSnapshot(eventsQuery, async (eventsSnapshot) => {
      const eventIds = eventsSnapshot.docs.map(doc => doc.id);
      
      if (eventIds.length === 0) {
        callback([]);
        return;
      }
      
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('eventId', 'in', eventIds),
        orderBy('purchaseDate', 'desc')
      );
      
      onSnapshot(ticketsQuery, (ticketsSnapshot) => {
        const sales = ticketsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        callback(sales);
      });
    });
  } catch (error) {
    console.error('Error listening to sales:', error);
    throw error;
  }
};