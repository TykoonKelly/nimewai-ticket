// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './component/common/Navbar';
import Footer from './component/common/Footer';
import ProtectedRoute from './component/common/ProtectedRoute';
import AdminAccessTrigger from './component/common/AdminAccessTrigger';

// Public Pages
import Home from './pages/Home';
import Events from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Organizers from './pages/Organizers';
import EventDetails from './component/events/EventDetails';
import PaymentSuccess from './pages/PaymentSuccess';

// Admin Pages
import AdminLogin from './pages/admin/Adminlogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import EventTable from './pages/admin/EventTable';
import RequestList from './pages/admin/RequestList';

// Organizer Pages
import OrganizerLogin from './pages/organizer/OrganizerLogin';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import LiveSales from './pages/organizer/LiveSales';

function App() {
  return (
    <AuthProvider>
        <Navbar />
        <AdminAccessTrigger />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/organizers" element={<Organizers />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* Admin Portal - Hidden Routes */}
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/admin-console" element={<AdminLogin />} />

          {/* Organizer Portal */}
          <Route path="/login/organizer" element={<OrganizerLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="events" element={<EventTable />} />
            <Route path="requests" element={<RequestList />} />
          </Route>

          {/* Protected Organizer Routes */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute requiredRole="organizer">
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
    </AuthProvider>
  );
}

export default App;