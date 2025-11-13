import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CarritoProvider, useCarrito } from "./context/CarritoContext";

// Common pages
import Home from "./pages/common/Home";
import About from "./pages/common/About";
import Login from "./pages/common/Login";
import Register from "./pages/Register";
import Profile from "./pages/common/Profile";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminList from "./pages/admin/AdminList";
import UserDetails from "./pages/admin/UserDetails";

// Vendedor pages
import VendedorDashboard from "./pages/vendedor/Dashboard";
import ProductosVendedor from "./pages/vendedor/ProductosVendedor";

// Comprador pages
import CompradorDashboard from "./pages/comprador/Dashboard";
import Catalogo from "./pages/comprador/Catalogo";
import ProductoDetalle from "./pages/comprador/ProductoDetalle";
import VendedorTienda from "./pages/comprador/VendedorTienda";
import MisPedidos from "./pages/comprador/MisPedidos";
import Carrito from "./pages/comprador/Carrito";

// Components
import UserMenu from "./components/common/UserMenu";
import ThemeToggle from "./components/ThemeToggle";

import "./App.css";

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Dashboard Router - redirects to role-specific dashboard
function DashboardRouter() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === 'vendedor') {
    return <Navigate to="/vendedor/dashboard" replace />;
  } else if (user?.role === 'comprador') {
    return <Navigate to="/comprador/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
}

function CarritoIcon() {
  const { calcularCantidadTotal } = useCarrito();
  const cantidadItems = calcularCantidadTotal();

  return (
    <Link to="/carrito" className="nav-link carrito-nav-link">
      🛒 Carrito
      {cantidadItems > 0 && (
        <span className="carrito-badge">{cantidadItems}</span>
      )}
    </Link>
  );
}

function Navigation() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-link">Inicio</Link>
        <Link to="/about" className="nav-link">Sobre Nosotros</Link>
        
        {isAuthenticated && (
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        )}
        
        {isAuthenticated && user?.role === 'admin' && (
          <Link to="/admin-list" className="nav-link">Usuarios</Link>
        )}
        
        {isAuthenticated && user?.role === 'vendedor' && (
          <Link to="/vendedor/productos" className="nav-link">Mis Productos</Link>
        )}
        
        {isAuthenticated && user?.role === 'comprador' && (
          <>
            <Link to="/catalogo" className="nav-link">Catálogo</Link>
            <CarritoIcon />
          </>
        )}
      </div>
      
      <div className="nav-right">
        <ThemeToggle />
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <>
            <Link to="/register" className="nav-link">Registrarse</Link>
            <Link to="/login" className="nav-link login-btn">Iniciar Sesión</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CarritoProvider>
          <Router>
            <Navigation />
          
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard router */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } 
          />
          
          {/* Profile route - available to all authenticated users */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-list" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/user/:userId" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserDetails />
              </ProtectedRoute>
            } 
          />
          
          {/* Vendedor routes */}
          <Route 
            path="/vendedor/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['vendedor']}>
                <VendedorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendedor/productos" 
            element={
              <ProtectedRoute allowedRoles={['vendedor']}>
                <ProductosVendedor />
              </ProtectedRoute>
            } 
          />
          {/* Ruta legacy para compatibilidad */}
          <Route 
            path="/admin-panel" 
            element={<Navigate to="/vendedor/productos" replace />}
          />
          
          {/* Comprador routes */}
          <Route 
            path="/comprador/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['comprador']}>
                <CompradorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/catalogo" 
            element={
              <ProtectedRoute allowedRoles={['comprador']}>
                <Catalogo />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/producto/:id" 
            element={
              <ProtectedRoute allowedRoles={['comprador']}>
                <ProductoDetalle />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendedor/:email/tienda" 
            element={
              <ProtectedRoute allowedRoles={['comprador']}>
                <VendedorTienda />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pedidos" 
            element={
              <ProtectedRoute allowedRoles={['comprador']}>
                <MisPedidos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mis-pedidos" 
            element={
              <ProtectedRoute allowedRoles={['comprador']}>
                <MisPedidos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/carrito" 
            element={
              <ProtectedRoute allowedRoles={['comprador']}>
                <Carrito />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all - redirect to dashboard or home */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        </CarritoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
