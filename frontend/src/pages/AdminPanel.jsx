import React, { useState } from "react";
import "./AdminPanel.css";

function AdminPanel() {
  const STORAGE_KEY = "products";
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = localStorage.getItem(STORAGE_KEY);
    const products = raw ? JSON.parse(raw) : [];
    const newProduct = {
      id: Date.now(),
      image: image ? image : null,
      name: name.trim() || "Sin nombre",
      price: price.trim() || "0",
      description: description.trim() || "",
      status: 'published'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newProduct, ...products]));
    alert("Producto publicado (simulado)");
    window.location.href = "/admin";
  };

  const handleDraft = (e) => {
    e.preventDefault();
    const raw = localStorage.getItem(STORAGE_KEY);
    const products = raw ? JSON.parse(raw) : [];
    const newProduct = {
      id: Date.now(),
      image: image ? image : null,
      name: name.trim() || "Sin nombre",
      price: price.trim() || "0",
      description: description.trim() || "",
      status: 'draft'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newProduct, ...products]));
    alert("Borrador guardado (simulado)");
    window.location.href = "/admin";
  };

  return (
    <div className="admin-container">
      <form className="admin-form" onSubmit={handleSubmit}>
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
              required
            />
            <input
              type="text"
              placeholder="Precio (ej. 9.99)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            Guardar borrador
          </button>
          <button type="submit" className="publish-btn">
            Publicar
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminPanel;