import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Catalogo.css";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/productos", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        // Solo productos con stock disponible
        setProductos(data.filter(p => p.stock > 0));
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener categorías únicas
  const categorias = ["all", ...new Set(productos.map(p => p.categoria).filter(Boolean))];

  // Filtrar productos
  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || producto.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Productos populares (simulado - los que tienen más stock o precio más alto)
  const productosPopulares = [...productos]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 6);

  return (
    <div className="catalogo-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>🛍️ Descubre Productos Increíbles</h1>
        <p>Miles de productos de vendedores verificados</p>
        
        <div className="hero-search">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="hero-search-input"
          />
          <button className="hero-search-btn">🔍 Buscar</button>
        </div>
      </div>

      {/* Popular Products */}
      {!searchTerm && productosPopulares.length > 0 && (
        <div className="popular-section">
          <h2>⭐ Productos Populares</h2>
          <div className="popular-grid">
            {productosPopulares.map(producto => (
              <div 
                key={producto.id} 
                className="popular-card"
                onClick={() => navigate(`/producto/${producto.id}`)}
              >
                <div className="popular-image">
                  <div className="product-icon-large">📦</div>
                  {producto.stock < 20 && (
                    <span className="badge-hot">🔥 Últimas unidades</span>
                  )}
                </div>
                <div className="popular-info">
                  <h3>{producto.nombre}</h3>
                  <p className="popular-price">${producto.precio}</p>
                  <div className="popular-meta">
                    <span className="popular-stock">Stock: {producto.stock}</span>
                    {producto.categoria && (
                      <span className="popular-category">{producto.categoria}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {categorias.length > 1 && (
        <div className="categories-section">
          <h3>Categorías</h3>
          <div className="categories-chips">
            {categorias.map(cat => (
              <button
                key={cat}
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "Todas" : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-section">
        <div className="products-header">
          <h2>Todos los Productos</h2>
          <span className="products-count">
            {filteredProductos.length} producto{filteredProductos.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="loading-products">
            <div className="spinner-large"></div>
            <p>Cargando productos...</p>
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="empty-products">
            <div className="empty-icon">🔍</div>
            <h3>No se encontraron productos</h3>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <div className="products-grid-catalogo">
            {filteredProductos.map(producto => (
              <div 
                key={producto.id} 
                className="producto-card-catalogo"
                onClick={() => navigate(`/producto/${producto.id}`)}
              >
                <div className="producto-image-catalogo">
                  <div className="producto-icon-wrapper">📦</div>
                  {producto.stock < 10 && (
                    <span className="badge-stock-low">Stock bajo</span>
                  )}
                </div>

                <div className="producto-info-catalogo">
                  <h3 className="producto-title-catalogo">{producto.nombre}</h3>
                  
                  {producto.descripcion && (
                    <p className="producto-description-catalogo">
                      {producto.descripcion.length > 60
                        ? producto.descripcion.substring(0, 60) + '...'
                        : producto.descripcion}
                    </p>
                  )}

                  <div className="producto-footer-catalogo">
                    <div className="producto-price-catalogo">
                      <span className="price-label">Precio</span>
                      <span className="price-value">${producto.precio}</span>
                    </div>
                    
                    <div className="producto-meta-catalogo">
                      {producto.categoria && (
                        <span className="meta-badge">{producto.categoria}</span>
                      )}
                      <span className="meta-stock">Stock: {producto.stock}</span>
                    </div>
                  </div>

                  <button className="btn-view-product">
                    Ver Detalles →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Catalogo;
