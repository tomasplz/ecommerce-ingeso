import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

function AdminPanel() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [stock, setStock] = useState("");
  const [categoria, setCategoria] = useState("");
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
        alert(editingId ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
        clearForm();
        loadProducts();
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
        alert('Producto eliminado exitosamente');
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
    
    // Scroll al formulario
    const formEl = document.querySelector(".form-section");
    if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const clearForm = () => {
    setEditingId(null);
    setNombre("");
    setPrecio("");
    setDescripcion("");
    setStock("");
    setCategoria("");
  };

  if (!user || user.role !== 'vendedor') {
    return null;
  }

  return (
    <div className="admin-container">
      <div className="admin-form">
        <h2 className="panel-title">Panel de Vendedor</h2>
        
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <div className="admin-grid">
          {/* Lista de productos */}
          <div className="list-section">
            <div className="list-header">
              <h3>Mis Productos ({products.length})</h3>
              {loading && <span className="loading-indicator">Cargando...</span>}
            </div>

            {products.length === 0 ? (
              <div className="empty-list">
                {loading ? 'Cargando productos...' : 'No tienes productos todavía. ¡Crea tu primer producto!'}
              </div>
            ) : (
              <div className="products-list">
                {products.map((p) => (
                  <div className="product-item" key={p.id}>
                    <div className="thumb">
                      <div className="no-thumb">📦</div>
                    </div>
                    <div className="meta">
                      <div className="product-name">{p.nombre}</div>
                      <div className="product-quantity">Stock: {p.stock}</div>
                      <div className="product-price">${p.precio}</div>
                      {p.categoria && <div className="product-category">{p.categoria}</div>}
                    </div>
                    <div className="actions-col">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEdit(p)}
                        disabled={loading}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDelete(p.id)}
                        disabled={loading}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario */}
          <form className="form-section" onSubmit={handleSubmit}>
            <h3 className="form-title">
              {editingId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            </h3>

            <div className="form-content">
              <div className="form-group">
                <label>Nombre del producto *</label>
                <input
                  type="text"
                  placeholder="Ej: Laptop HP Pavilion"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio *</label>
                  <input
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
                  <label>Stock *</label>
                  <input
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
                <label>Categoría</label>
                <input
                  type="text"
                  placeholder="Ej: Electrónica, Ropa, etc."
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  placeholder="Describe tu producto..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  disabled={loading}
                  rows="4"
                />
              </div>
            </div>

            <div className="button-group">
              {editingId && (
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={clearForm}
                  disabled={loading}
                >
                  Cancelar
                </button>
              )}
              <button 
                type="submit" 
                className="publish-btn"
                disabled={loading}
              >
                {loading ? 'Guardando...' : editingId ? '💾 Guardar Cambios' : '✨ Crear Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;