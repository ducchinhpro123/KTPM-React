import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store/store';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { fetchCart } from './store/cartSlice';

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const CartPage = lazy(() => import('./pages/CartPage'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageProducts = lazy(() => import('./pages/admin/ManageProduct'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));

// Loading fallback component
const LoadingFallback = () => <LoadingSpinner fullScreen={true} />;

// CartInitializer component to fetch cart data on app initialization
const CartInitializer = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.user);
  const { initialized } = useSelector(state => state.cart);
  
  useEffect(() => {
    // Fetch cart data if user is authenticated and cart not yet initialized
    if (token && !initialized) {
      dispatch(fetchCart());
    }
  }, [dispatch, token, initialized]);
  
  return null; // This component doesn't render anything
};

const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <CartInitializer />
      <main className="flex-grow">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin Routes - Protected by AdminRoute */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ManageProducts />} />
              <Route path="/admin/users" element={<ManageUsers />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <AppContent />
        </Router>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
