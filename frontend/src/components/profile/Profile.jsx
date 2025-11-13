import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { token, user, login } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    email: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    password: "",
    confirmPassword: "",
  });

  // Verificar autenticación
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Cargar datos del perfil
  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [token]);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:3000/usuario/perfil", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar el perfil");
      }

      const data = await response.json();
      setProfileData(data);
      setFormData({
        email: data.email || "",
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        telefono: data.telefono || "",
        direccion: data.direccion || "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validar contraseñas si se están cambiando
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
      if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    setSaving(true);

    try {
      const updateData = {
        email: formData.email,
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        direccion: formData.direccion,
      };

      // Solo incluir password si se está actualizando
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch("http://localhost:3000/usuario/perfil", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar el perfil");
      }

      const updatedData = await response.json();
      
      // Actualizar el contexto de autenticación si el email cambió
      if (updatedData.email !== user.email) {
        const updatedUser = { ...user, email: updatedData.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setProfileData(updatedData);
      setFormData({
        ...formData,
        password: "",
        confirmPassword: "",
      });
      setSuccess("Perfil actualizado correctamente");
      setIsEditing(false);

      // Recargar perfil después de 1 segundo
      setTimeout(() => {
        loadProfile();
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: profileData.email || "",
      nombre: profileData.nombre || "",
      apellido: profileData.apellido || "",
      telefono: profileData.telefono || "",
      direccion: profileData.direccion || "",
      password: "",
      confirmPassword: "",
    });
    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { text: "Administrador", className: "badge-admin" },
      vendedor: { text: "Vendedor", className: "badge-vendedor" },
      comprador: { text: "Comprador", className: "badge-comprador" },
    };
    return badges[role] || badges.comprador;
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const badge = getRoleBadge(user?.role);

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <h1 className="profile-title">Mi Perfil</h1>
          <span className={`role-badge ${badge.className}`}>
            {badge.text}
          </span>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2 className="section-title">Información Personal</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+56 9 1234 5678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección</label>
              <textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows="3"
                placeholder="Tu dirección completa"
              />
            </div>
          </div>

          {isEditing && (
            <div className="form-section">
              <h2 className="section-title">Cambiar Contraseña (Opcional)</h2>
              
              <div className="form-group">
                <label htmlFor="password">Nueva Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Dejar en blanco para no cambiar"
                  minLength="6"
                />
                <small className="form-hint">
                  Mínimo 6 caracteres. Dejar en blanco para mantener la actual.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmar nueva contraseña"
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                ✏️ Editar Perfil
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "💾 Guardar Cambios"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
