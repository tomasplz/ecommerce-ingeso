import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserMenu.css';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : 'US';
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { text: 'Admin', color: '#e74c3c' },
      vendedor: { text: 'Vendedor', color: '#3498db' },
      comprador: { text: 'Comprador', color: '#2ecc71' },
    };
    return badges[role] || badges.comprador;
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <div className="user-menu" ref={menuRef}>
      <button 
        className="user-menu-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="user-avatar">
          {getInitials(user?.email)}
        </div>
        <div className="user-info">
          <span className="user-name">{user?.email?.split('@')[0]}</span>
          <span 
            className="user-role" 
            style={{ color: roleBadge.color }}
          >
            {roleBadge.text}
          </span>
        </div>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`} 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="currentColor"
        >
          <path d="M6 9L1 4h10L6 9z" />
        </svg>
      </button>

      {isOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="user-avatar-large">
              {getInitials(user?.email)}
            </div>
            <div className="user-details">
              <div className="user-email">{user?.email}</div>
              <div 
                className="user-role-badge"
                style={{ backgroundColor: roleBadge.color }}
              >
                {roleBadge.text}
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={handleProfile}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM8 10c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5z"/>
              </svg>
              Mi Perfil
            </button>

            {user?.role === 'vendedor' && (
              <button className="dropdown-item" onClick={() => { setIsOpen(false); navigate('/admin-panel'); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zm1 2v8h8V4H4z"/>
                </svg>
                Mis Productos
              </button>
            )}

            {user?.role === 'admin' && (
              <button className="dropdown-item" onClick={() => { setIsOpen(false); navigate('/admin-list'); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 4h12v1H2V4zm0 3h12v1H2V7zm0 3h12v1H2v-1z"/>
                </svg>
                Panel Admin
              </button>
            )}

            <button className="dropdown-item" onClick={() => { setIsOpen(false); navigate('/pedidos'); }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5 1v2H3v11h10V3h-2V1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1h2zm1 0h4v3H6V1z"/>
              </svg>
              Mis Pedidos
            </button>
          </div>

          <div className="dropdown-divider"></div>

          <button className="dropdown-item logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 2v2H3v8h3v2H2V2h4zm4 0l5 6-5 6v-4H6V6h4V2z"/>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
