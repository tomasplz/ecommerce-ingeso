import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AdminList.css";

export default function AdminList() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId !== null) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      if (activeTab === "users") {
        await loadUsers();
      } else {
        await loadProducts();
      }
    } catch (err) {
      setError("Error al cargar datos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const response = await fetch("http://localhost:3000/usuarios/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al cargar usuarios");
    }

    const data = await response.json();
    setUsers(data);
  };

  const loadProducts = async () => {
    const response = await fetch("http://localhost:3000/productos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al cargar productos");
    }

    const data = await response.json();
    setProducts(data);
  };

  const handleDeleteUser = async (id, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    
    if (!window.confirm("¿Está seguro de eliminar este usuario? Se hará un borrado lógico.")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar usuario");
      }

      await loadUsers();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este producto?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/productos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar producto");
      }

      await loadProducts();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleViewUserDetails = (userEmail) => {
    navigate(`/admin/user/${encodeURIComponent(userEmail)}`);
  };

  const toggleMenu = (userId, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

  const handleEditUser = (userId, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    // TODO: Abrir modal de edición
    alert(`Editar usuario ${userId} - Por implementar`);
  };

  const handleEditProducts = (userEmail, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    navigate(`/admin/user/${encodeURIComponent(userEmail)}`);
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

  // Filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.nombre && user.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    return product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="admin-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-list-container">
      <div className="admin-header">
        <h1>Gestión de {activeTab === "users" ? "Usuarios" : "Productos"}</h1>
        <p className="admin-subtitle">
          Panel de administración para gestionar usuarios y productos
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("users");
            setSearchTerm("");
            setRoleFilter("all");
          }}
        >
          👥 Usuarios ({users.length})
        </button>
        <button
          className={`tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("products");
            setSearchTerm("");
          }}
        >
          📦 Productos ({products.length})
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={`Buscar ${activeTab === "users" ? "usuarios" : "productos"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === "users" && (
          <div className="role-filters">
            <button
              className={`filter-btn ${roleFilter === "all" ? "active" : ""}`}
              onClick={() => setRoleFilter("all")}
            >
              Todos
            </button>
            <button
              className={`filter-btn ${roleFilter === "vendedor" ? "active" : ""}`}
              onClick={() => setRoleFilter("vendedor")}
            >
              Vendedores
            </button>
            <button
              className={`filter-btn ${roleFilter === "comprador" ? "active" : ""}`}
              onClick={() => setRoleFilter("comprador")}
            >
              Compradores
            </button>
            <button
              className={`filter-btn ${roleFilter === "admin" ? "active" : ""}`}
              onClick={() => setRoleFilter("admin")}
            >
              Admins
            </button>
          </div>
        )}
      </div>

      {activeTab === "users" ? (
        <div className="users-grid">
          {filteredUsers.length === 0 ? (
            <p className="empty-message">No se encontraron usuarios.</p>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="user-card" onClick={() => handleViewUserDetails(user.email)}>
                <button
                  className="user-menu-btn"
                  onClick={(e) => toggleMenu(user.id, e)}
                  title="Opciones"
                >
                  ⋮
                </button>

                {openMenuId === user.id && (
                  <div className="user-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button onClick={(e) => handleEditUser(user.id, e)}>
                      ✏️ Editar Usuario
                    </button>
                    {user.role === "vendedor" && (
                      <button onClick={(e) => handleEditProducts(user.email, e)}>
                        📦 Ver Productos
                      </button>
                    )}
                    <button className="delete-option" onClick={(e) => handleDeleteUser(user.id, e)}>
                      🗑️ Eliminar Usuario
                    </button>
                  </div>
                )}

                <div className="user-card-header">
                  <div className="user-avatar">
                    {user.nombre ? user.nombre.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h3>{user.nombre || "Sin nombre"}</h3>
                    <p className="user-email">{user.email}</p>
                    <span className={getRoleBadgeClass(user.role)}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>

                {user.stats && (
                  <div className="user-stats">
                    {user.role === "vendedor" && (
                      <>
                        <div className="stat-item">
                          <span className="stat-label">Productos</span>
                          <span className="stat-value">{user.stats.totalProductos || 0}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Stock</span>
                          <span className="stat-value">{user.stats.totalInventario || 0}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Valor</span>
                          <span className="stat-value">${(user.stats.valorInventario || 0).toFixed(0)}</span>
                        </div>
                      </>
                    )}
                    {user.role === "comprador" && (
                      <>
                        <div className="stat-item">
                          <span className="stat-label">Pedidos</span>
                          <span className="stat-value">{user.stats.totalPedidos || 0}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Gastado</span>
                          <span className="stat-value">${(user.stats.totalGastado || 0).toFixed(0)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Pendientes</span>
                          <span className="stat-value">{user.stats.pedidosPendientes || 0}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="user-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn-view"
                    onClick={() => handleViewUserDetails(user.email)}
                  >
                    Ver Detalles
                  </button>
                </div>

                <div className="user-meta">
                  <small>Registrado: {new Date(user.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="products-list">
          {filteredProducts.length === 0 ? (
            <p className="empty-message">No se encontraron productos.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Categoría</th>
                  <th>Vendedor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.nombre}</td>
                    <td>${product.precio}</td>
                    <td>{product.stock}</td>
                    <td>{product.categoria || "-"}</td>
                    <td>
                      {product.vendedor ? (
                        <span
                          className="vendor-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/user/${product.vendedorId}`);
                          }}
                          title={`Ver perfil de ${product.vendedor.nombre || product.vendedor.email}`}
                        >
                          {product.vendedor.nombre || product.vendedor.email}
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
