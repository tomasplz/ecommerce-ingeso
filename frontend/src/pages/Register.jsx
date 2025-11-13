import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css"; // Reutilizamos los mismos estilos

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "comprador"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (formData.nombre.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
        navigate("/login");
      } else {
        setError(data.message || "Error al registrar usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box" style={{ margin: "2rem 0", maxWidth: "450px" }}>
        <h2>Crear Cuenta</h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Regístrate para comenzar a comprar o vender
        </p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={loading}
            />
            
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            
            <input
              type="password"
              name="password"
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
            />
            
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <div style={{ margin: "1rem 0" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem", 
                color: "var(--text-primary)",
                fontWeight: "500"
              }}>
                ¿Cómo deseas usar la plataforma?
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "var(--card-bg)",
                  color: "var(--text-primary)",
                  cursor: "pointer"
                }}
              >
                <option value="comprador">👤 Comprador - Buscar y comprar productos</option>
                <option value="vendedor">🏪 Vendedor - Vender mis productos</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            style={{ fontSize: "1.1rem" }}
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="login-links" style={{ marginTop: "1.5rem" }}>
          <span style={{ color: "var(--text-secondary)" }}>¿Ya tienes cuenta?</span>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
            Iniciar sesión
          </a>
        </div>

        <div style={{ 
          marginTop: "1.5rem", 
          padding: "1rem", 
          backgroundColor: "var(--hover-bg)", 
          borderRadius: "8px",
          fontSize: "0.9rem",
          color: "var(--text-secondary)"
        }}>
          <p style={{ margin: "0 0 0.5rem 0" }}>
            <strong>💡 Nota:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
            <li>Los <strong>compradores</strong> pueden buscar productos y realizar pedidos</li>
            <li>Los <strong>vendedores</strong> pueden gestionar su inventario y ventas</li>
            <li>Puedes cambiar tu rol más adelante si lo necesitas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
