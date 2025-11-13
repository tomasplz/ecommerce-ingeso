import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./ProductosVendedor.css";

function ProductosVendedor() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [stock, setStock] = useState("");
  const [categoria, setCategoria] = useState("");
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Verificar que el usuario sea vendedor
  useEffect(() => {
    if (!user || user.role !== 'vendedor') {
      navigate('/');
    }
  }, [user, navigate]);

  // Cargar productos del vendedor
  useEffect(() => {
    if (token && user?.role === 'vendedor') {
      loadProducts();
    }
  }, [token, user]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/productos/mis-productos', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Error al cargar productos');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const productData = {
      nombre,
      precio: parseFloat(precio),
      descripcion,
      stock: parseInt(stock),
      categoria: categoria || undefined,
    };

    try {
      let response;
      if (editingId) {
        // Actualizar producto existente
        response = await fetch(`http://localhost:3000/productos/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });
      } else {
        // Crear nuevo producto
        response = await fetch('http://localhost:3000/productos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });
      }

      if (response.ok) {
        clearForm();
        loadProducts();
        setShowForm(false);
      } else {
        const error = await response.json();
        setError(error.message || 'Error al guardar el producto');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const response = await fetch(`http://localhost:3000/productos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadProducts();
      } else {
        alert('Error al eliminar el producto');
      }
    } catch (err) {
      alert('Error de conexión');
      console.error(err);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setNombre(product.nombre);
    setPrecio(product.precio.toString());
    setDescripcion(product.descripcion || "");
    setStock(product.stock.toString());
    setCategoria(product.categoria || "");
    setShowForm(true);
    
    // Scroll al formulario
    setTimeout(() => {
      const formEl = document.querySelector(".modal-overlay");
      if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const clearForm = () => {
    setEditingId(null);
    setNombre("");
    setPrecio("");
    setDescripcion("");
    setStock("");
    setCategoria("");
    setError("");
  };

  const handleCloseForm = () => {
    setShowForm(false);
    clearForm();
  };

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.categoria && product.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular estadísticas
  const totalProductos = products.length;
  const totalInventario = products.reduce((sum, p) => sum + p.stock, 0);
  const valorInventario = products.reduce((sum, p) => sum + (p.precio * p.stock), 0);
  const productosAgotados = products.filter(p => p.stock === 0).length;

  if (!user || user.role !== 'vendedor') {
    return null;
  }

  return (
    <div className="productos-vendedor-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>📦 Gestión de Productos</h1>
          <p className="header-subtitle">Administra tu inventario y catálogo de productos</p>
        </div>
        <button 
          className="btn-nuevo-producto" 
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          ➕ Nuevo Producto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card-vendedor">
          <div className="stat-icon-vendedor">📦</div>
          <div className="stat-info">
            <p className="stat-label">Total Productos</p>
            <h3 className="stat-value">{totalProductos}</h3>
          </div>
        </div>
        <div className="stat-card-vendedor">
          <div className="stat-icon-vendedor">📊</div>
          <div className="stat-info">
            <p className="stat-label">Inventario</p>
            <h3 className="stat-value">{totalInventario}</h3>
          </div>
        </div>
        <div className="stat-card-vendedor">
          <div className="stat-icon-vendedor">💰</div>
          <div className="stat-info">
            <p className="stat-label">Valor Total</p>
            <h3 className="stat-value">${valorInventario.toFixed(2)}</h3>
          </div>
        </div>
        <div className="stat-card-vendedor warning">
          <div className="stat-icon-vendedor">⚠️</div>
          <div className="stat-info">
            <p className="stat-label">Agotados</p>
            <h3 className="stat-value">{productosAgotados}</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="search-results">
          Mostrando {filteredProducts.length} de {totalProductos} productos
        </div>
      </div>

      {/* Products Grid */}
      {loading && products.length === 0 ? (
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No hay productos</h3>
          <p>
            {searchTerm 
              ? 'No se encontraron productos con ese término de búsqueda'
              : 'Comienza agregando tu primer producto al catálogo'
            }
          </p>
          {!searchTerm && (
            <button className="btn-empty-action" onClick={() => setShowForm(true)}>
              ➕ Crear Primer Producto
            </button>
          )}
        </div>
      ) : (
        <div className="products-grid-vendedor">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card-vendedor">
              <div className="product-card-header">
                <div className="product-icon">📦</div>
                <div className="product-actions-dropdown">
                  <button className="btn-more">⋮</button>
                  <div className="dropdown-menu">
                    <button onClick={() => handleEdit(product)}>
                      ✏️ Editar
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="danger">
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>

              <div className="product-card-body">
                <h3 className="product-title">{product.nombre}</h3>
                {product.descripcion && (
                  <p className="product-description">
                    {product.descripcion.length > 80
                      ? product.descripcion.substring(0, 80) + '...'
                      : product.descripcion}
                  </p>
                )}
                {product.categoria && (
                  <span className="product-badge">{product.categoria}</span>
                )}
              </div>

              <div className="product-card-footer">
                <div className="product-info-row">
                  <div className="info-item">
                    <span className="info-label">Precio</span>
                    <span className="info-value price">${product.precio}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Stock</span>
                    <span className={`info-value stock ${product.stock < 10 ? 'low' : ''} ${product.stock === 0 ? 'out' : ''}`}>
                      {product.stock}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
              <button className="btn-close-modal" onClick={handleCloseForm}>✕</button>
            </div>

            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre del producto *</label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Ej: Laptop HP Pavilion"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label htmlFor="precio">Precio *</label>
                  <input
                    id="precio"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                    disabled={loading}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock">Stock *</label>
                  <input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    disabled={loading}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoría</label>
                <input
                  id="categoria"
                  type="text"
                  placeholder="Ej: Electrónica, Ropa, etc."
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  placeholder="Describe tu producto..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  disabled={loading}
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel-modal" 
                  onClick={handleCloseForm}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-submit-modal"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : editingId ? '💾 Guardar Cambios' : '✨ Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductosVendedor;
