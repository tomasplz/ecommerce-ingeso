import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyProducts } from '../../services/api';
import './Dashboard.css';

const VendedorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const products = await getMyProducts();
      setStats({
        totalProducts: products.length,
        inStockProducts: products.filter(p => p.stock > 0).length,
        outOfStockProducts: products.filter(p => p.stock === 0).length,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Vendedor</h1>
        <p>Bienvenido, {user?.nombre || user?.email}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Productos</h3>
            <p className="stat-number">{loading ? '...' : stats.totalProducts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>En Stock</h3>
            <p className="stat-number">{loading ? '...' : stats.inStockProducts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Sin Stock</h3>
            <p className="stat-number">{loading ? '...' : stats.outOfStockProducts}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/admin-panel" className="action-card">
            <span className="action-icon">🛍️</span>
            <h3>Gestionar Productos</h3>
            <p>Crear, editar y eliminar productos</p>
          </Link>

          <Link to="/mis-ventas" className="action-card">
            <span className="action-icon">💰</span>
            <h3>Mis Ventas</h3>
            <p>Ver historial de ventas</p>
          </Link>

          <Link to="/profile" className="action-card">
            <span className="action-icon">⚙️</span>
            <h3>Mi Perfil</h3>
            <p>Editar información personal</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VendedorDashboard;
