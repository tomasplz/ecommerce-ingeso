import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      
      setLoading(false);

      if (result.success) {
        // Redirigir según el rol
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.user.role === 'vendedor') {
          navigate('/vendedor/dashboard');
        } else {
          navigate('/comprador/dashboard');
        }
      } else {
        setError(result.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setLoading(false);
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box" style={{ margin: "2rem 0" }}>
        <h2>Iniciar Sesión</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            style={{ fontSize: "1.1rem" }}
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="divider">
          <span>o ingresa con</span>
        </div>

        <div className="social-login">
          <button className="google-btn" type="button" disabled>Google</button>
          <button className="facebook-btn" type="button" disabled>Facebook</button>
        </div>

        <div className="login-links">
          <a href="#">¿Olvidaste tu contraseña?</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Crear cuenta</a>
        </div>

        <div className="demo-credentials">
          <p><strong>Credenciales de prueba:</strong></p>
          <p>Admin: admin@example.com / admin123</p>
          <p>Vendedor: vendedor@example.com / vendedor123</p>
          <p>Comprador: comprador@example.com / comprador123</p>
        </div>
      </div>
    </div>
  );
}