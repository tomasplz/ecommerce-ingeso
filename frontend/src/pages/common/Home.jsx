import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      loadUserStats();
    }
  }, [user, token]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      
      if (user.role === "vendedor") {
        // Cargar productos del vendedor
        const response = await fetch(`http://localhost:3000/productos/vendedor/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const productos = await response.json();
          const totalProductos = productos.length;
          const totalInventario = productos.reduce((sum, p) => sum + p.stock, 0);
          const valorInventario = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
          
          setStats({
            totalProductos,
            totalInventario,
            valorInventario,
            productos: productos.slice(0, 5), // Últimos 5 productos
          });
        }
      } else if (user.role === "comprador") {
        // Cargar pedidos del comprador
        const response = await fetch(`http://localhost:3000/pedidos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const pedidos = await response.json();
          const totalPedidos = pedidos.length;
          const totalGastado = pedidos
            .filter(p => p.estado !== "cancelado")
            .reduce((sum, p) => sum + p.total, 0);
          const pendientes = pedidos.filter(p => p.estado === "pendiente").length;
          
          setStats({
            totalPedidos,
            totalGastado,
            pendientes,
            pedidos: pedidos.slice(0, 5), // Últimos 5 pedidos
          });
        }
      } else if (user.role === "admin") {
        // Cargar resumen general para admin
        const [usersRes, productsRes] = await Promise.all([
          fetch("http://localhost:3000/usuarios/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/productos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        if (usersRes.ok && productsRes.ok) {
          const users = await usersRes.json();
          const products = await productsRes.json();
          
          setStats({
            totalUsuarios: users.length,
            totalVendedores: users.filter(u => u.role === "vendedor").length,
            totalCompradores: users.filter(u => u.role === "comprador").length,
            totalProductos: products.length,
          });
        }
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderAdminHome = () => (
    <div className="home-container">
      <div className="welcome-section">
        <h1>👋 Bienvenido, Administrador</h1>
        <p className="welcome-text">
          Panel de control del sistema. Gestiona usuarios, productos y supervisa la actividad.
        </p>
      </div>

      {loading ? (
        <div className="loading-section">Cargando estadísticas...</div>
      ) : stats ? (
        <div className="stats-overview">
          <div className="stat-card-home admin">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.totalUsuarios}</h3>
              <p>Usuarios Totales</p>
            </div>
          </div>
          <div className="stat-card-home admin">
            <div className="stat-icon">�</div>
            <div className="stat-content">
              <h3>{stats.totalVendedores}</h3>
              <p>Vendedores</p>
            </div>
          </div>
          <div className="stat-card-home admin">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <h3>{stats.totalCompradores}</h3>
              <p>Compradores</p>
            </div>
          </div>
          <div className="stat-card-home admin">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{stats.totalProductos}</h3>
              <p>Productos</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="quick-actions">
        <h2>⚡ Acciones Rápidas</h2>
        <div className="actions-grid">
          <button className="action-card" onClick={() => navigate("/admin/users")}>
            <span className="action-icon">👥</span>
            <h3>Gestionar Usuarios</h3>
            <p>Ver, editar y administrar usuarios</p>
          </button>
          <button className="action-card" onClick={() => navigate("/dashboard")}>
            <span className="action-icon">📊</span>
            <h3>Dashboard</h3>
            <p>Ver estadísticas detalladas</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderVendedorHome = () => (
    <div className="home-container">
      <div className="welcome-section">
        <h1>👋 Bienvenido, {user.nombre || "Vendedor"}</h1>
        <p className="welcome-text">
          Gestiona tus productos, inventario y ventas desde aquí.
        </p>
      </div>

      {loading ? (
        <div className="loading-section">Cargando estadísticas...</div>
      ) : stats ? (
        <>
          <div className="stats-overview">
            <div className="stat-card-home vendedor">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{stats.totalProductos}</h3>
                <p>Productos</p>
              </div>
            </div>
            <div className="stat-card-home vendedor">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{stats.totalInventario}</h3>
                <p>Inventario Total</p>
              </div>
            </div>
            <div className="stat-card-home vendedor">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>${stats.valorInventario?.toFixed(2)}</h3>
                <p>Valor Inventario</p>
              </div>
            </div>
          </div>

          {stats.productos && stats.productos.length > 0 && (
            <div className="recent-section">
              <h2>📦 Productos Recientes</h2>
              <div className="products-list-home">
                {stats.productos.map((producto) => (
                  <div key={producto.id} className="product-item-home">
                    <div className="product-info-home">
                      <h4>{producto.nombre}</h4>
                      <p className="product-price">${producto.precio}</p>
                    </div>
                    <div className="product-stock">
                      <span className={producto.stock < 10 ? "low-stock" : ""}>
                        Stock: {producto.stock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      <div className="quick-actions">
        <h2>⚡ Acciones Rápidas</h2>
        <div className="actions-grid">
          <button className="action-card" onClick={() => navigate("/vendedor/productos")}>
            <span className="action-icon">📦</span>
            <h3>Gestionar Productos</h3>
            <p>Ver, agregar y editar productos</p>
          </button>
          <button className="action-card" onClick={() => navigate("/dashboard")}>
            <span className="action-icon">📊</span>
            <h3>Dashboard</h3>
            <p>Ver estadísticas de ventas</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCompradorHome = () => (
    <div className="home-container">
      <div className="welcome-section">
        <h1>👋 Bienvenido, {user.nombre || "Comprador"}</h1>
        <p className="welcome-text">
          Explora productos, realiza compras y gestiona tus pedidos.
        </p>
      </div>

      {loading ? (
        <div className="loading-section">Cargando estadísticas...</div>
      ) : stats ? (
        <>
          <div className="stats-overview">
            <div className="stat-card-home comprador">
              <div className="stat-icon">🛍️</div>
              <div className="stat-content">
                <h3>{stats.totalPedidos}</h3>
                <p>Pedidos Realizados</p>
              </div>
            </div>
            <div className="stat-card-home comprador">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>${stats.totalGastado?.toFixed(2)}</h3>
                <p>Total Gastado</p>
              </div>
            </div>
            <div className="stat-card-home comprador">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{stats.pendientes}</h3>
                <p>Pedidos Pendientes</p>
              </div>
            </div>
          </div>

          {stats.pedidos && stats.pedidos.length > 0 && (
            <div className="recent-section">
              <h2>🛍️ Pedidos Recientes</h2>
              <div className="orders-list-home">
                {stats.pedidos.map((pedido) => (
                  <div key={pedido.id} className="order-item-home">
                    <div className="order-info-home">
                      <h4>Pedido #{pedido.id}</h4>
                      <p className="order-date">
                        {new Date(pedido.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="order-details-home">
                      <span className={`status-badge-home ${pedido.estado}`}>
                        {pedido.estado}
                      </span>
                      <p className="order-total-home">${pedido.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      <div className="quick-actions">
        <h2>⚡ Acciones Rápidas</h2>
        <div className="actions-grid">
          <button className="action-card" onClick={() => navigate("/catalogo")}>
            <span className="action-icon">🛒</span>
            <h3>Ver Catálogo</h3>
            <p>Explora productos disponibles</p>
          </button>
          <button className="action-card" onClick={() => navigate("/mis-pedidos")}>
            <span className="action-icon">📋</span>
            <h3>Mis Pedidos</h3>
            <p>Revisa tus compras</p>
          </button>
          <button className="action-card" onClick={() => navigate("/carrito")}>
            <span className="action-icon">🛒</span>
            <h3>Mi Carrito</h3>
            <p>Ver productos en carrito</p>
          </button>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="home-container">
        <div className="welcome-section">
          <h1>🏪 Bienvenido al E-Commerce</h1>
          <p className="welcome-text">
            Inicia sesión para acceder a todas las funcionalidades.
          </p>
          <button className="cta-button" onClick={() => navigate("/login")}>
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  switch (user.role) {
    case "admin":
      return renderAdminHome();
    case "vendedor":
      return renderVendedorHome();
    case "comprador":
      return renderCompradorHome();
    default:
      return <h1>�🏠 Página de Inicio</h1>;
  }
}
