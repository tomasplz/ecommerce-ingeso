import React, { useState } from "react";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Bienvenido, ${username}`);
  };

  return (
    <div className="login-wrapper">
      <div className="login-box" style={{ margin: "2rem 0" }}>
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            style={{ fontSize: "1.1rem" }}
          >
            Ingresar
          </button>
        </form>

        <div className="divider">
          <span>o ingresa con</span>
        </div>

        <div className="social-login">
          <button className="google-btn">Google</button>
          <button className="facebook-btn">Facebook</button>
        </div>

        <div className="login-links">
          <a href="#">¿Olvidaste tu contraseña?</a>
          <a href="#">Crear cuenta</a>
        </div>
      </div>
    </div>
  );
}