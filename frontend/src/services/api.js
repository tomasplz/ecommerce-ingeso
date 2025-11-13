const API_BASE_URL = 'http://localhost:3000';

// Helper para hacer peticiones con autenticación
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// ============ AUTH ============
export const login = async (email, password) => {
  return fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (userData) => {
  return fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// ============ USUARIO ============
export const getUserProfile = async () => {
  return fetchWithAuth('/usuarios/me');
};

export const updateUserProfile = async (userData) => {
  return fetchWithAuth('/usuarios/me', {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
};

// ============ PRODUCTOS ============
export const getProducts = async () => {
  return fetchWithAuth('/productos');
};

export const getMyProducts = async () => {
  return fetchWithAuth('/productos/mis-productos');
};

export const createProduct = async (productData) => {
  return fetchWithAuth('/productos', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

export const updateProduct = async (id, productData) => {
  return fetchWithAuth(`/productos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (id) => {
  return fetchWithAuth(`/productos/${id}`, {
    method: 'DELETE',
  });
};

// ============ PEDIDOS ============
export const getMyOrders = async () => {
  return fetchWithAuth('/pedidos/mis-pedidos');
};

export const getAllOrders = async () => {
  return fetchWithAuth('/pedidos');
};

export const createOrder = async (orderData) => {
  return fetchWithAuth('/pedidos', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

export const updateOrderStatus = async (id, estado) => {
  return fetchWithAuth(`/pedidos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
};
