import React, { useEffect, useState } from "react";

export default function AdminList({ onEdit }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem("products");
      setProducts(stored ? JSON.parse(stored) : []);
    };
    load();

    // escuchar cambios en localStorage desde otras pestañas
    const handler = (e) => {
      if (e.key === "products") load();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const saveProducts = (next) => {
    setProducts(next);
    localStorage.setItem("products", JSON.stringify(next));
  };

  const handleDelete = (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    const next = products.filter((p) => p.id !== id);
    saveProducts(next);
  };

  const handleEdit = (id) => {
    if (typeof onEdit === "function") {
      onEdit(id);
      return;
    }
    // comportamiento por defecto: marcar y navegar al panel de admin
    localStorage.setItem("editProductId", id);
    window.location.href = "/admin-panel";
  };

  if (!products.length) {
    return <div className="empty-list">No hay productos todavía.</div>;
  }

  return (
    <div className="products-list">
      {products.map((p) => (
        <div className="product-item" key={p.id}>
          <div className="thumb">
            {p.image ? (
              <img src={p.image} alt={p.name} />
            ) : (
              <div className="no-thumb">Sin imagen</div>
            )}
          </div>

          <div className="meta">
            <div className="product-name">{p.name || "Sin nombre"}</div>
            <div className="product-quantity">Cantidad: {p.quantity ?? "-"}</div>
            <div className="product-price">{p.price ? `$ ${p.price}` : "-"}</div>
            <div className="product-status">{p.status}</div>
          </div>

          <div className="actions-col">
            <button className="edit-btn" onClick={() => handleEdit(p.id)}>
              Editar
            </button>
            <button className="delete-btn" onClick={() => handleDelete(p.id)}>
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
