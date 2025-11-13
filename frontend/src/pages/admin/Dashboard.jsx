import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders } from '../../services/api';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const orders = await getAllOrders();
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.estado === 'pendiente').length,
        completedOrders: orders.filter(o => o.estado === 'entregado').length,
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
        <h1>Panel de Administración</h1>
        <p>Bienvenido, {user?.nombre || user?.email}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Pedidos</h3>
            <p className="stat-number">{loading ? '...' : stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pedidos Pendientes</h3>
            <p className="stat-number">{loading ? '...' : stats.pendingOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Pedidos Completados</h3>
            <p className="stat-number">{loading ? '...' : stats.completedOrders}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/admin-list" className="action-card">
            <span className="action-icon">👥</span>
            <h3>Gestionar Usuarios</h3>
            <p>Ver y administrar todos los usuarios</p>
          </Link>

          <Link to="/productos" className="action-card">
            <span className="action-icon">🛍️</span>
            <h3>Ver Productos</h3>
            <p>Administrar el catálogo de productos</p>
          </Link>

          <Link to="/profile" className="action-card">
            <span className="action-icon">⚙️</span>
            <h3>Configuración</h3>
            <p>Editar perfil y preferencias</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
