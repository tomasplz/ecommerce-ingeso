import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./UserDetails.css";

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    setError("");

    try {
      // Decodificar el email de la URL
      const userIdentifier = decodeURIComponent(userId);
      const response = await fetch(`http://localhost:3000/usuarios/email/${encodeURIComponent(userIdentifier)}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar detalles del usuario");
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "badge badge-admin";
      case "vendedor":
        return "badge badge-vendedor";
      case "comprador":
        return "badge badge-comprador";
      default:
        return "badge";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "vendedor":
        return "Vendedor";
      case "comprador":
        return "Comprador";
      default:
        return role;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pendiente":
        return "status-badge status-pendiente";
      case "completado":
        return "status-badge status-completado";
      case "cancelado":
        return "status-badge status-cancelado";
      default:
        return "status-badge";
    }
  };

  if (loading) {
    return (
      <div className="user-details-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-details-container">
        <div className="error-message">{error}</div>
        <button className="btn-back" onClick={() => navigate("/admin/users")}>
          Volver
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-details-container">
        <p>Usuario no encontrado</p>
        <button className="btn-back" onClick={() => navigate("/admin/users")}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="user-details-container">
      <div className="details-header">
        <button className="btn-back" onClick={() => navigate("/admin/users")}>
          ← Volver
        </button>
        <h1>Detalles del Usuario</h1>
      </div>

      <div className="user-profile-card">
        <div className="profile-avatar">
          {user.nombre ? user.nombre.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{user.nombre || "Sin nombre"}</h2>
          <p className="profile-email">{user.email}</p>
          <span className={getRoleBadgeClass(user.role)}>{getRoleLabel(user.role)}</span>
          <div className="profile-meta">
            <p>
              <strong>Registrado:</strong>{" "}
              {new Date(user.createdAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p>
              <strong>Última actualización:</strong>{" "}
              {new Date(user.updatedAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {user.role === "vendedor" && (
        <div className="section-card">
          <h3>📦 Productos del Vendedor</h3>
          
          {user.stats && (
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-label">Total Productos</span>
                <span className="stat-value">{user.stats.totalProductos || 0}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Productos Únicos</span>
                <span className="stat-value">{user.stats.productosUnicos || 0}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Inventario Total</span>
                <span className="stat-value">{user.stats.totalInventario || 0}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Valor Inventario</span>
                <span className="stat-value">${user.stats.valorInventario?.toFixed(2) || 0}</span>
              </div>
            </div>
          )}

          {user.productosVendidos && user.productosVendidos.length > 0 ? (
            <div className="products-table-container">
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Categoría</th>
                    <th>Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {user.productosVendidos.map((producto) => (
                    <tr key={producto.id}>
                      <td>{producto.nombre}</td>
                      <td>${producto.precio}</td>
                      <td>{producto.stock}</td>
                      <td>{producto.categoria || "-"}</td>
                      <td>{new Date(producto.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-message">Este vendedor no tiene productos registrados.</p>
          )}
        </div>
      )}

      {user.role === "comprador" && (
        <div className="section-card">
          <h3>🛒 Pedidos del Comprador</h3>
          
          {user.stats && (
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-label">Total Pedidos</span>
                <span className="stat-value">{user.stats.totalPedidos || 0}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Total Gastado</span>
                <span className="stat-value">${user.stats.totalGastado?.toFixed(2) || 0}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Pendientes</span>
                <span className="stat-value">{user.stats.pedidosPendientes || 0}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Completados</span>
                <span className="stat-value">{user.stats.pedidosCompletados || 0}</span>
              </div>
            </div>
          )}

          {user.pedidos && user.pedidos.length > 0 ? (
            <div className="orders-list">
              {user.pedidos.map((pedido) => (
                <div key={pedido.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h4>Pedido #{pedido.id}</h4>
                      <p className="order-date">
                        {new Date(pedido.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="order-summary">
                      <span className={getStatusBadgeClass(pedido.status)}>
                        {pedido.status}
                      </span>
                      <p className="order-total">Total: ${pedido.total}</p>
                    </div>
                  </div>
                  
                  {pedido.items && pedido.items.length > 0 && (
                    <div className="order-items">
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pedido.items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.producto?.nombre || `Producto ${item.productoId}`}</td>
                              <td>${item.precioUnitario}</td>
                              <td>{item.cantidad}</td>
                              <td>${(item.precioUnitario * item.cantidad).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">Este comprador no tiene pedidos registrados.</p>
          )}
        </div>
      )}
    </div>
  );
}
