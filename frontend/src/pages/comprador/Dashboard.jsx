import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyOrders } from '../../services/api';
import './Dashboard.css';

const CompradorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const orders = await getMyOrders();
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => ['pendiente', 'pagado', 'enviado'].includes(o.estado)).length,
        deliveredOrders: orders.filter(o => o.estado === 'entregado').length,
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
        <h1>Mi Panel</h1>
        <p>Bienvenido, {user?.nombre || user?.email}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>Total Pedidos</h3>
            <p className="stat-number">{loading ? '...' : stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>En Proceso</h3>
            <p className="stat-number">{loading ? '...' : stats.pendingOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Entregados</h3>
            <p className="stat-number">{loading ? '...' : stats.deliveredOrders}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/productos" className="action-card">
            <span className="action-icon">🛍️</span>
            <h3>Ver Productos</h3>
            <p>Explorar catálogo de productos</p>
          </Link>

          <Link to="/mis-pedidos" className="action-card">
            <span className="action-icon">📦</span>
            <h3>Mis Pedidos</h3>
            <p>Ver historial de compras</p>
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

export default CompradorDashboard;
