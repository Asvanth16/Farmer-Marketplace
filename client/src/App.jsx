import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProductCatalog from './pages/ProductCatalog';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import ProductPage from './pages/ProductPage';
import FarmerProfile from './pages/FarmerProfile';
import AdminDashboard from './pages/AdminDashboard';
import Home from "./pages/Home";


function App() {
  return (
    <Router>
      <Routes>
        {/* 🌟 1. Default Root Redirect to Marketplace Home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Public Routes */}
        <Route path='/home' element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🌟 2. Product Catalog is now Public! Guests can view everything here */}
        <Route path="/customer/marketplace" element={<ProductCatalog />} />

        {/* Protected Farmer Area */}
        <Route
          path="/farmer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Customer Cart / Checkout Session Route */}
        <Route
          path="/customer/cart"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* Protected Order Tracking History Route */}
        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/product/:id"
          element={<ProductPage />}
        />

        <Route
          path="/customer/farmer/:id"
          element={<FarmerProfile />}
        />
      </Routes>
    </Router>
  );
}

export default App;