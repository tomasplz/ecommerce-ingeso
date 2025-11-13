import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCarrito } from "../../context/CarritoContext";
import "./ProductoDetalle.css";

function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { agregarAlCarrito } = useCarrito();
  const [producto, setProducto] = useState(null);
  const [vendedor, setVendedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    loadProducto();
  }, [id]);

  const loadProducto = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/productos/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setProducto(data);
        
        // Cargar información del vendedor
        if (data.vendedorId) {
          loadVendedor(data.vendedorId);
        }
      } else {
        navigate("/catalogo");
      }
    } catch (error) {
      console.error("Error cargando producto:", error);
      navigate("/catalogo");
    } finally {
      setLoading(false);
    }
  };

  const loadVendedor = async (vendedorId) => {
    try {
      console.log("🔍 Cargando vendedor con ID:", vendedorId);
      // Usar endpoint público en lugar del privado
      const response = await fetch(`http://localhost:3000/usuarios/${vendedorId}/public`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Vendedor cargado:", data);
        setVendedor(data);
      } else {
        console.error("❌ Error en respuesta del vendedor:", response.status);
      }
    } catch (error) {
      console.error("❌ Error cargando vendedor:", error);
    }
  };

  const handleAgregarAlCarrito = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "comprador") {
      alert("Solo los compradores pueden agregar al carrito");
      return;
    }

    agregarAlCarrito(producto, cantidad);
    alert(`✅ ${cantidad} ${cantidad === 1 ? 'unidad agregada' : 'unidades agregadas'} al carrito`);
    setCantidad(1);
  };

  const handleComprarAhora = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "comprador") {
      alert("Solo los compradores pueden realizar compras");
      return;
    }

    // Agregar al carrito y redirigir
    agregarAlCarrito(producto, cantidad);
    navigate("/carrito");
  };

  if (loading) {
    return (
      <div className="producto-detalle-loading">
        <div className="spinner-large"></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (!producto) {
    return null;
  }

  const total = producto.precio * cantidad;

  return (
    <div className="producto-detalle-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => navigate("/catalogo")} className="breadcrumb-link">
          ← Catálogo
        </button>
        {producto.categoria && (
          <>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{producto.categoria}</span>
          </>
        )}
      </div>

      <div className="producto-detalle-content">
        {/* Imagen del producto */}
        <div className="producto-image-section">
          <div className="producto-image-main">
            <div className="image-placeholder">📦</div>
          </div>
        </div>

        {/* Información del producto */}
        <div className="producto-info-section">
            <h1 className="producto-name">{producto.nombre}</h1>
            
            <div className="producto-price-section">
              <div className="price-main">${producto.precio}</div>
              <div className="stock-info">
                <span className={`stock-badge ${producto.stock < 10 ? 'low' : ''}`}>
                  {producto.stock > 0 ? `Stock disponible: ${producto.stock}` : 'Sin stock'}
                </span>
              </div>
            </div>

            {producto.descripcion && (
              <div className="producto-descripcion">
                <h3>Descripción</h3>
                <p>{producto.descripcion}</p>
              </div>
            )}

            {producto.categoria && (
              <div className="producto-categoria-info">
                <strong>Categoría:</strong> {producto.categoria}
              </div>
            )}

            {/* Cantidad y compra */}
            {producto.stock > 0 && user?.role === "comprador" && (
              <div className="compra-section">
                <div className="cantidad-selector">
                  <label>Cantidad:</label>
                  <div className="cantidad-controls">
                    <button 
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      className="btn-cantidad"
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      value={cantidad} 
                      onChange={(e) => setCantidad(Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1)))}
                      min="1"
                      max={producto.stock}
                      className="cantidad-input"
                    />
                    <button 
                      onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                      className="btn-cantidad"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="total-preview">
                  Total: <strong>${total.toFixed(2)}</strong>
                </div>

                <div className="botones-compra">
                  <button className="btn-agregar-carrito" onClick={handleAgregarAlCarrito}>
                    🛒 Agregar al Carrito
                  </button>
                  <button className="btn-comprar-ahora" onClick={handleComprarAhora}>
                    ⚡ Comprar Ahora
                  </button>
                </div>
              </div>
            )}

            {!user && producto.stock > 0 && (
              <div className="login-prompt">
                <p>Inicia sesión para comprar este producto</p>
                <button className="btn-login" onClick={() => navigate("/login")}>
                  Iniciar Sesión
                </button>
              </div>
            )}
        </div>

        {/* Vendedor Info */}
        {vendedor && (
          <div className="vendedor-section">
            <div className="vendedor-section-title">
              <span className="section-icon">🏪</span>
              <h2>Vendedor</h2>
            </div>
            <div 
              className="vendedor-card clickable"
              onClick={() => navigate(`/vendedor/${encodeURIComponent(vendedor.email)}/tienda`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/vendedor/${encodeURIComponent(vendedor.email)}/tienda`);
                }
              }}
            >
              <div className="vendedor-header">
                <div className="vendedor-avatar">
                  {(vendedor.nombre || vendedor.email).charAt(0).toUpperCase()}
                </div>
                <div className="vendedor-info">
                  <h3>{vendedor.nombre || vendedor.email.split('@')[0]}</h3>
                  <p className="vendedor-email">{vendedor.email}</p>
                </div>
              </div>

              <div className="vendedor-action-hint">
                <span className="hint-icon">🏪</span>
                <span className="hint-text">Click para ver la tienda</span>
                <span className="hint-arrow">→</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default ProductoDetalle;
