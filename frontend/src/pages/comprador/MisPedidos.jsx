import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./MisPedidos.css";

export default function MisPedidos() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("todos"); // todos, pendiente, completado, cancelado

  useEffect(() => {
    loadPedidos();
  }, [token]);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Cargando pedidos del comprador...");
      
      const response = await fetch("http://localhost:3000/pedidos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Pedidos cargados:", data);
      setPedidos(data);
    } catch (error) {
      console.error("❌ Error al cargar pedidos:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case "pendiente":
        return "badge-pendiente";
      case "completado":
        return "badge-completado";
      case "cancelado":
        return "badge-cancelado";
      default:
        return "badge-default";
    }
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (filtro === "todos") return true;
    return pedido.estado === filtro;
  });

  const stats = {
    total: pedidos.length,
    pendientes: pedidos.filter((p) => p.estado === "pendiente").length,
    completados: pedidos.filter((p) => p.estado === "completado").length,
    cancelados: pedidos.filter((p) => p.estado === "cancelado").length,
    totalGastado: pedidos
      .filter((p) => p.estado !== "cancelado")
      .reduce((sum, p) => sum + p.total, 0),
  };

  if (loading) {
    return (
      <div className="mis-pedidos-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-pedidos-container">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <h3>Error al cargar pedidos</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={loadPedidos}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-pedidos-container">
      <div className="pedidos-header">
        <div className="header-top">
          <h1>🛍️ Mis Pedidos</h1>
          <button className="btn-volver" onClick={() => navigate("/")}>
            ← Volver al Inicio
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div className="stat-info">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Pedidos</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <div className="stat-info">
              <span className="stat-number">{stats.pendientes}</span>
              <span className="stat-label">Pendientes</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <span className="stat-number">{stats.completados}</span>
              <span className="stat-label">Completados</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <span className="stat-number">${stats.totalGastado.toLocaleString()}</span>
              <span className="stat-label">Total Gastado</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="filtros-container">
          <button
            className={`filtro-btn ${filtro === "todos" ? "active" : ""}`}
            onClick={() => setFiltro("todos")}
          >
            Todos ({stats.total})
          </button>
          <button
            className={`filtro-btn ${filtro === "pendiente" ? "active" : ""}`}
            onClick={() => setFiltro("pendiente")}
          >
            Pendientes ({stats.pendientes})
          </button>
          <button
            className={`filtro-btn ${filtro === "completado" ? "active" : ""}`}
            onClick={() => setFiltro("completado")}
          >
            Completados ({stats.completados})
          </button>
          <button
            className={`filtro-btn ${filtro === "cancelado" ? "active" : ""}`}
            onClick={() => setFiltro("cancelado")}
          >
            Cancelados ({stats.cancelados})
          </button>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="pedidos-list">
        {pedidosFiltrados.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No hay pedidos {filtro !== "todos" ? `en estado "${filtro}"` : ""}</h3>
            <p>Explora nuestro catálogo y realiza tu primera compra</p>
            <button className="btn-catalogo" onClick={() => navigate("/catalogo")}>
              Ver Catálogo
            </button>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <div key={pedido.id} className="pedido-card">
              <div className="pedido-header-card">
                <div className="pedido-info-header">
                  <span className="pedido-id">Pedido #{pedido.id}</span>
                  <span className="pedido-fecha">
                    {new Date(pedido.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <span className={`estado-badge ${getEstadoBadgeClass(pedido.estado)}`}>
                  {pedido.estado === "pendiente" && "⏳ "}
                  {pedido.estado === "completado" && "✅ "}
                  {pedido.estado === "cancelado" && "❌ "}
                  {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                </span>
              </div>

              <div className="pedido-items">
                {pedido.items.map((item) => (
                  <div key={item.id} className="pedido-item">
                    <div className="item-info">
                      <span className="item-nombre">{item.producto.nombre}</span>
                      <span className="item-cantidad">Cantidad: {item.cantidad}</span>
                    </div>
                    <div className="item-precios">
                      <span className="item-precio-unitario">
                        ${item.precioUnitario.toLocaleString()} c/u
                      </span>
                      <span className="item-subtotal">
                        ${item.subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pedido-footer">
                <div className="pedido-total">
                  <span className="total-label">Total:</span>
                  <span className="total-amount">${pedido.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
