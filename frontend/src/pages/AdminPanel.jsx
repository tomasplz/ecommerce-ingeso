import React, { useState, useEffect } from "react";
import "./AdminPanel.css";

function AdminPanel() {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("products");
    const parsed = stored ? JSON.parse(stored) : [];
    setProducts(parsed);

    // Si AdminList dejó un producto para editar, precargarlo aquí
    const editId = localStorage.getItem("editProductId");
    if (editId) {
      // editId puede venir como string; comparar flexible
      const p = parsed.find((x) => x.id === Number(editId) || String(x.id) === editId);
      if (p) {
        setEditingId(p.id);
        setImage(p.image || null);
        setName(p.name || "");
        setPrice(p.price || "");
        setDescription(p.description || "");
        setQuantity(p.quantity || "");
      }
      localStorage.removeItem("editProductId");
    }
  }, []);

  const saveProducts = (next) => {
    setProducts(next);
    localStorage.setItem("products", JSON.stringify(next));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Para demo guardamos objectURL; en producción subirías el archivo al servidor
      setImage(URL.createObjectURL(file));
    }
  };

  // Al enviar: crear nuevo o actualizar si estamos editando
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const updated = {
        id: editingId,
        image,
        name,
        price,
        description,
        quantity, // añadido
        status: "published",
      };
      const next = products.map((p) => (p.id === editingId ? updated : p));
      saveProducts(next);
      setEditingId(null);
      alert("Producto actualizado (simulado)");
    } else {
      const newProduct = {
        id: Date.now(),
        image,
        name,
        price,
        description,
        quantity, // añadido
        status: "published",
      };
      const next = [newProduct, ...products];
      saveProducts(next);
      alert("Producto publicado y añadido a la lista (simulado)");
    }

    // limpiar formulario
    setImage(null);
    setName("");
    setPrice("");
    setDescription("");
    setQuantity("");
  };

  // Guardar borrador (crear o actualizar)
  const handleDraft = (e) => {
    e.preventDefault();
    if (editingId) {
      const updated = {
        id: editingId,
        image,
        name,
        price,
        description,
        quantity, // añadido
        status: "draft",
      };
      const next = products.map((p) => (p.id === editingId ? updated : p));
      saveProducts(next);
      setEditingId(null);
      alert("Borrador actualizado (simulado)");
    } else {
      const draft = {
        id: Date.now(),
        image,
        name,
        price,
        description,
        quantity, // añadido
        status: "draft",
      };
      const next = [draft, ...products];
      saveProducts(next);
      alert("Borrador guardado y añadido a la lista (simulado)");
    }

    setImage(null);
    setName("");
    setPrice("");
    setDescription("");
    setQuantity("");
  };

  // Nuevo: eliminar producto de la lista
  const handleDelete = (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    const next = products.filter((p) => p.id !== id);
    saveProducts(next);
  };

  // Nuevo: cargar producto en el formulario para editar
  const handleEdit = (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setEditingId(id);
    setImage(p.image || null);
    setName(p.name || "");
    setPrice(p.price || "");
    setDescription(p.description || "");
    setQuantity(p.quantity || "");
    // opcional: llevar la vista al formulario
    const formEl = document.querySelector(".form-section");
    if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="admin-container">
      <div className="admin-form">
        {/* Nueva estructura: lista + formulario */}
        <div className="admin-grid">
          <div className="list-section">
            <div className="list-header">
              <h3>Productos ({products.length})</h3>
            </div>

            {products.length === 0 ? (
              <div className="empty-list">No hay productos todavía.</div>
            ) : (
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
            )}
          </div>

          {/* Formulario: adaptado desde el existente */}
          <form className="form-section" onSubmit={handleSubmit}>
            <div className="top-section">
              <div className="image-section">
                <label className="image-label">
                  {image ? (
                    <img src={image} alt="Preview" className="preview-image" />
                  ) : (
                    <span>Subir imagen</span>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>

              <div className="info-section">
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Precio"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="bottom-section">
              <textarea
                placeholder="Descripción del producto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="button-group">
              <button type="button" className="draft-btn" onClick={handleDraft}>
                {editingId ? "Guardar borrador" : "Guardar borrador"}
              </button>
              <button type="submit" className="publish-btn">
                {editingId ? "Guardar cambios" : "Publicar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;