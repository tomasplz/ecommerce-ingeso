import React, { useEffect, useState } from "react";
import "./Login.css";

export default function AdminList() {
  const STORAGE_KEY = "products";
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    setProducts(raw ? JSON.parse(raw) : []);
  }, []);

  const save = (next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProducts(next);
  };

  const handleDelete = (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    const next = products.filter((p) => p.id !== id);
    save(next);
  };

  return (
    <div className="login-wrapper">
      <div className="login-box" style={{ maxWidth: 900 }}>
        <h2>Panel Admin — Productos</h2>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.8)" }}>
            Total: {products.length}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="login-btn"
              style={{ padding: "0.6rem 1rem", fontSize: "0.95rem", backgroundColor: "#4fc0e0" }}
              onClick={() => (window.location.href = "/admin/panel")}
            >
              Añadir producto
            </button>
            <button
              className="cancel-btn"
              onClick={() => (window.location.href = "/")}
              style={{ padding: "0.6rem 1rem" }}
            >
              Salir
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.75)", padding: "1rem 0" }}>
            No hay productos. Usa "Añadir producto" para crear uno.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <th style={{ padding: "0.75rem" }}>Nombre</th>
                  <th style={{ padding: "0.75rem" }}>Precio</th>
                  <th style={{ padding: "0.75rem" }}>Descripción</th>
                  <th style={{ padding: "0.75rem" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem", verticalAlign: "top" }}>{p.name}</td>
                    <td style={{ padding: "0.75rem", verticalAlign: "top" }}>{p.price}</td>
                    <td style={{ padding: "0.75rem", verticalAlign: "top" }}>{p.description}</td>
                    <td style={{ padding: "0.75rem", verticalAlign: "top" }}>
                      <button
                        className="cancel-btn"
                        onClick={() => handleDelete(p.id)}
                        style={{ padding: "0.4rem 0.6rem", fontSize: "0.9rem" }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
