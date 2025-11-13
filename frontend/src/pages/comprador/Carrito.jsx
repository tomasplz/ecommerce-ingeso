import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";
import { useAuth } from "../../context/AuthContext";
import "./Carrito.css";

export default function Carrito() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { items, actualizarCantidad, eliminarDelCarrito, vaciarCarrito, calcularTotal } = useCarrito();
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  const handleFinalizarCompra = async () => {
    if (items.length === 0) return;

    try {
      setProcesando(true);
      setError(null);

      console.log("🛒 Finalizando compra...");

      const pedidoData = {
        items: items.map(item => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
        })),
      };

      const response = await fetch("http://localhost:3000/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pedidoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el pedido");
      }

      const pedido = await response.json();
      console.log("✅ Pedido creado:", pedido);

      // Vaciar carrito
      vaciarCarrito();

      // Mostrar mensaje de éxito y redirigir
      alert("¡Pedido realizado con éxito! 🎉");
      navigate("/mis-pedidos");
    } catch (error) {
      console.error("❌ Error al finalizar compra:", error);
      setError(error.message);
    } finally {
      setProcesando(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="carrito-container">
        <div className="carrito-header">
          <h1>🛒 Mi Carrito</h1>
          <button className="btn-volver" onClick={() => navigate("/catalogo")}>
            ← Volver al Catálogo
          </button>
        </div>

        <div className="carrito-vacio">
          <span className="empty-icon">🛒</span>
          <h2>Tu carrito está vacío</h2>
          <p>Explora nuestro catálogo y agrega productos</p>
          <button className="btn-catalogo" onClick={() => navigate("/catalogo")}>
            Ver Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <div className="carrito-header">
        <h1>🛒 Mi Carrito ({items.length} {items.length === 1 ? 'producto' : 'productos'})</h1>
        <div className="header-actions">
          <button className="btn-vaciar" onClick={vaciarCarrito}>
            🗑️ Vaciar Carrito
          </button>
          <button className="btn-volver" onClick={() => navigate("/catalogo")}>
            ← Volver al Catálogo
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <div className="carrito-content">
        <div className="carrito-items">
          {items.map(item => (
            <div key={item.producto.id} className="carrito-item">
              <div className="item-imagen">
                <div className="producto-placeholder">
                  {item.producto.nombre.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="item-detalles">
                <h3 className="item-nombre">{item.producto.nombre}</h3>
                <p className="item-descripcion">{item.producto.descripcion}</p>
                <p className="item-precio-unitario">
                  ${item.producto.precio.toLocaleString()} c/u
                </p>
                <p className="item-stock">
                  Stock disponible: {item.producto.stock}
                </p>
              </div>

              <div className="item-acciones">
                <div className="cantidad-control">
                  <button
                    className="btn-cantidad"
                    onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="cantidad-input"
                    value={item.cantidad}
                    onChange={(e) => {
                      const valor = parseInt(e.target.value) || 1;
                      actualizarCantidad(item.producto.id, valor);
                    }}
                    min="1"
                    max={item.producto.stock}
                  />
                  <button
                    className="btn-cantidad"
                    onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                    disabled={item.cantidad >= item.producto.stock}
                  >
                    +
                  </button>
                </div>

                <p className="item-subtotal">
                  ${(item.producto.precio * item.cantidad).toLocaleString()}
                </p>

                <button
                  className="btn-eliminar"
                  onClick={() => eliminarDelCarrito(item.producto.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="carrito-resumen">
          <div className="resumen-card">
            <h2>Resumen del Pedido</h2>

            <div className="resumen-detalle">
              <div className="resumen-linea">
                <span>Productos ({items.length})</span>
                <span>${calcularTotal().toLocaleString()}</span>
              </div>
              <div className="resumen-linea">
                <span>Envío</span>
                <span className="gratis">Gratis</span>
              </div>
              <div className="resumen-divider"></div>
              <div className="resumen-total">
                <span>Total</span>
                <span className="total-precio">${calcularTotal().toLocaleString()}</span>
              </div>
            </div>

            <button
              className="btn-finalizar"
              onClick={handleFinalizarCompra}
              disabled={procesando}
            >
              {procesando ? "Procesando..." : "Finalizar Compra 🎉"}
            </button>

            <p className="nota-seguridad">
              🔒 Compra segura. Tus datos están protegidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
