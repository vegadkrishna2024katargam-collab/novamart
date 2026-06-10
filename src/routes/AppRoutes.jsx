import { Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboard from '../admin/AdminDashboard.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import CartPage from '../pages/CartPage.jsx';
import CheckoutPage from '../pages/CheckoutPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import OrderSuccessPage from '../pages/OrderSuccessPage.jsx';
import ProductDetailsPage from '../pages/ProductDetailsPage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import WishlistPage from '../pages/WishlistPage.jsx';
import UserDashboard from '../user/UserDashboard.jsx';
import useAuth from '../hooks/useAuth.js';
import { dashboardPathFor, isAdminUser } from '../utils/authRole.js';

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={dashboardPathFor(user)} replace />;
}

function AdminRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminUser(user)) return <Navigate to="/dashboard" replace />;
  return <AdminDashboard />;
}

function UserRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (isAdminUser(user)) return <Navigate to="/admin" replace />;
  return <UserDashboard />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/panel" element={<DashboardRedirect />} />
        <Route path="/dashboard" element={<UserRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
