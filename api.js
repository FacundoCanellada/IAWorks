// Configuración de la API
const API_URL = 'http://localhost:5000/api';

// Almacenamiento del token
const TokenService = {
  getToken() {
    return localStorage.getItem('token');
  },
  
  setToken(token) {
    localStorage.setItem('token', token);
  },
  
  removeToken() {
    localStorage.removeItem('token');
  },
  
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  removeUser() {
    localStorage.removeItem('user');
  }
};

// Cliente HTTP para hacer peticiones a la API
const apiClient = {
  async request(endpoint, options = {}) {
    const token = TokenService.getToken();
    
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    if (token && !options.skipAuth) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (options.body) {
      config.body = JSON.stringify(options.body);
    }
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Response error:', data);
        
        // Si hay errores de validación, mostrarlos
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        
        throw new Error(data.message || data.error || 'Error en la petición');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },
  
  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  },
  
  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  },
  
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};

// API de Autenticación
const AuthAPI = {
  // Verificar si existe admin
  async checkAdminExists() {
    return apiClient.get('/auth/admin/exists', { skipAuth: true });
  },
  
  // Crear primer admin
  async createFirstAdmin(data) {
    return apiClient.post('/auth/admin/create-first', data, { skipAuth: true });
  },
  
  // Registro de usuario
  async register(data) {
    const response = await apiClient.post('/auth/register', data, { skipAuth: true });
    if (response.success && response.data.token) {
      TokenService.setToken(response.data.token);
      TokenService.setUser(response.data);
    }
    return response;
  },
  
  // Login
  async login(data) {
    const response = await apiClient.post('/auth/login', data, { skipAuth: true });
    if (response.success && response.data.token) {
      TokenService.setToken(response.data.token);
      TokenService.setUser(response.data);
    }
    return response;
  },
  
  // Obtener perfil
  async getProfile() {
    return apiClient.get('/auth/me');
  },
  
  // Actualizar perfil
  async updateProfile(data) {
    return apiClient.put('/auth/profile', data);
  },
  
  // Actualizar contraseña
  async updatePassword(data) {
    return apiClient.put('/auth/password', data);
  },
  
  // Recuperar contraseña
  async forgotPassword(email) {
    return apiClient.post('/auth/forgot-password', { email }, { skipAuth: true });
  },
  
  // Resetear contraseña
  async resetPassword(token, password) {
    return apiClient.put(`/auth/reset-password/${token}`, { password }, { skipAuth: true });
  },
  
  // Configurar SMTP
  async updateSMTP(data) {
    return apiClient.put('/auth/smtp', data);
  },
  
  // Configurar Instagram
  async updateInstagram(data) {
    return apiClient.put('/auth/instagram', data);
  },
  
  // Logout
  logout() {
    TokenService.removeToken();
    TokenService.removeUser();
  }
};

// Utilidades de UI
const UIHelpers = {
  showLoading(button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<span class="inline-block animate-spin">⚙</span> Cargando...';
  },
  
  hideLoading(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  },
  
  showError(message) {
    // Crear toast de error
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-pulse';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  },
  
  showSuccess(message) {
    // Crear toast de éxito
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
};
