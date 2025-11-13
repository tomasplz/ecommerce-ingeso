import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./VendedorTienda.css";

function VendedorTienda() {
  const { email } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [vendedor, setVendedor] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadVendedorYProductos();
  }, [email]);

  const loadVendedorYProductos = async () => {
    try {
      setLoading(true);
      console.log("🔍 Cargando tienda del vendedor:", email);
      
      // Usar el nuevo endpoint público para buscar vendedor por email
      const vendedorResponse = await fetch(
        `http://localhost:3000/usuarios/email/${encodeURIComponent(email)}/public`
      );

      if (!vendedorResponse.ok) {
        console.error("❌ Vendedor no encontrado");
        alert("Vendedor no encontrado");
        navigate("/catalogo");
        return;
      }

      const vendedorData = await vendedorResponse.json();
      setVendedor(vendedorData);
      console.log("✅ Vendedor cargado:", vendedorData);

      // Cargar productos del vendedor
      const productosResponse = await fetch(
        `http://localhost:3000/productos/vendedor/${vendedorData.id}`
      );

      if (productosResponse.ok) {
        const productosData = await productosResponse.json();
        setProductos(productosData);
        console.log("✅ Productos cargados:", productosData.length);
      }
    } catch (error) {
      console.error("❌ Error cargando tienda:", error);
      alert("Error al cargar la tienda del vendedor");
      navigate("/catalogo");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos
  const filteredProductos = productos.filter((producto) => {
    const matchesSearch =
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || producto.categoria === selectedCategory;

    return matchesSearch && matchesCategory && producto.stock > 0;
  });

  // Obtener categorías únicas
  const categories = ["all", ...new Set(productos.map((p) => p.categoria).filter(Boolean))];

  if (loading) {
    return (
      <div className="tienda-loading">
        <div className="spinner-large"></div>
        <p>Cargando tienda...</p>
      </div>
    );
  }

  if (!vendedor) {
    return null;
  }

  const productosDisponibles = productos.filter((p) => p.stock > 0).length;
  const totalCategorias = new Set(productos.map(p => p.categoria).filter(Boolean)).size;

  return (
    <div className="vendedor-tienda-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => navigate("/catalogo")} className="breadcrumb-link">
          ← Catálogo
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Tienda</span>
      </div>

      {/* Header de la tienda */}
      <div className="tienda-header">
        <div className="tienda-banner">
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <div className="vendedor-avatar-large">
              {vendedor.nombre ? vendedor.nombre.charAt(0).toUpperCase() : 'V'}
            </div>
            <div className="vendedor-info-header">
              <h1>{vendedor.nombre || "Tienda del Vendedor"}</h1>
              <p className="vendedor-email-header">{vendedor.email}</p>
            </div>
          </div>
        </div>

        {/* Stats de la tienda - solo información pública para compradores */}
        <div className="tienda-stats">
          <div className="stat-card-tienda">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <div className="stat-value">{productosDisponibles}</div>
              <div className="stat-label">Productos Disponibles</div>
            </div>
          </div>
          <div className="stat-card-tienda">
            <div className="stat-icon">🏷️</div>
            <div className="stat-content">
              <div className="stat-value">{totalCategorias}</div>
              <div className="stat-label">Categorías</div>
            </div>
          </div>
          <div className="stat-card-tienda">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-value">{vendedor.nombre || 'Vendedor'}</div>
              <div className="stat-label">Tienda Verificada</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="tienda-controls">
        <div className="search-bar-tienda">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar productos en esta tienda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-tienda"
          />
        </div>

        {categories.length > 1 && (
          <div className="categories-filter-tienda">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-chip-tienda ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "Todas" : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="tienda-loading-products">
          <div className="spinner-large"></div>
        </div>
      ) : filteredProductos.length > 0 ? (
        <div className="productos-grid-tienda">
          {filteredProductos.map((producto) => (
            <div
              key={producto.id}
              className="producto-card-tienda"
              onClick={() => navigate(`/producto/${producto.id}`)}
            >
              <div className="producto-image-tienda">
                <div className="image-placeholder">📦</div>
                {producto.stock < 20 && (
                  <span className="badge-stock-tienda hot">🔥 Últimas unidades</span>
                )}
              </div>
              
              <div className="producto-info-tienda">
                <h3 className="producto-name-tienda">{producto.nombre}</h3>
                
                {producto.descripcion && (
                  <p className="producto-desc-tienda">
                    {producto.descripcion.length > 80
                      ? `${producto.descripcion.substring(0, 80)}...`
                      : producto.descripcion}
                  </p>
                )}

                <div className="producto-footer-tienda">
                  <div className="producto-price-tienda">${producto.precio}</div>
                  <div className="producto-stock-tienda">
                    {producto.stock < 10 ? (
                      <span className="stock-low">Stock bajo: {producto.stock}</span>
                    ) : (
                      <span className="stock-ok">Stock: {producto.stock}</span>
                    )}
                  </div>
                </div>

                {producto.categoria && (
                  <div className="producto-category-tienda">{producto.categoria}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-products-tienda">
          <div className="empty-icon">🔍</div>
          <h3>No se encontraron productos</h3>
          <p>Prueba ajustando los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
}

export default VendedorTienda;
