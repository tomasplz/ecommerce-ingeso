import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    nombre: '',
    email: '',
    role: '',
  });
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfileData(data);
      setFormData({
        nombre: data.nombre || '',
        email: data.email,
        password: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError('Error al cargar el perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar mensajes al escribir
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validación de contraseñas
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setSaving(true);
      
      // Preparar datos para actualizar (solo los que cambiaron)
      const updateData = {};
      
      if (formData.nombre !== profileData.nombre) {
        updateData.nombre = formData.nombre;
      }
      
      if (formData.email !== profileData.email) {
        updateData.email = formData.email;
      }
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Si no hay cambios
      if (Object.keys(updateData).length === 0) {
        setError('No hay cambios para guardar');
        return;
      }

      const updatedUser = await updateUserProfile(updateData);
      
      // Actualizar el contexto de autenticación con los datos nuevos
      updateUser(updatedUser);

      setSuccess('Perfil actualizado exitosamente');
      setProfileData(updatedUser);
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al actualizar perfil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge admin';
      case 'vendedor':
        return 'role-badge vendor';
      case 'comprador':
        return 'role-badge buyer';
      default:
        return 'role-badge';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'vendedor':
        return 'Vendedor';
      case 'comprador':
        return 'Comprador';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {formData.nombre ? formData.nombre.charAt(0).toUpperCase() : formData.email.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{formData.nombre || 'Sin nombre'}</h1>
            <p className="profile-email">{profileData.email}</p>
            <span className={getRoleBadgeClass(profileData.role)}>
              {getRoleLabel(profileData.role)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <h2>Editar Perfil</h2>

          {error && <div className="message error-message">{error}</div>}
          {success && <div className="message success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-divider">
            <span>Cambiar Contraseña (opcional)</span>
          </div>

          <div className="form-group">
            <label htmlFor="password">Nueva Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Dejar en blanco para mantener la actual"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmar nueva contraseña"
            />
          </div>

          <div className="profile-actions">
            <button 
              type="submit" 
              className="btn-save"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
