const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('wash_and_wow_token') || localStorage.getItem('vk_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong. Please try again.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Auth API
export const authAPI = {
  signup: (userData) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  googleAuth: (googleData) =>
    request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    }),

  getMe: () => request('/auth/me'),

  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  forgotPassword: (email) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

// Services API
export const servicesAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params.search) searchParams.append('search', params.search);
    if (params.includeInactive) searchParams.append('includeInactive', 'true');
    const queryString = searchParams.toString();
    return request(`/services${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => request(`/services/${id}`),

  adminCreate: (serviceData) =>
    request('/services/admin/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    }),

  adminUpdate: (id, serviceData) =>
    request(`/services/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    }),

  adminDelete: (id) =>
    request(`/services/admin/services/${id}`, {
      method: 'DELETE',
    }),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderPayload) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    }),

  getMyOrders: (status = 'All') => {
    const query = status && status !== 'All' ? `?status=${status}` : '';
    return request(`/orders/my-orders${query}`);
  },

  getOrderById: (id) => request(`/orders/${id}`),

  adminGetAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status && params.status !== 'All') searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    const queryString = searchParams.toString();
    return request(`/orders/admin/orders/all${queryString ? `?${queryString}` : ''}`);
  },

  adminGetById: (id) => request(`/orders/admin/orders/${id}`),

  adminUpdateStatus: (id, statusData) =>
    request(`/orders/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    }),

  adminSendInvoice: (id) =>
    request(`/orders/admin/orders/${id}/send-invoice`, {
      method: 'POST',
    }),

  sendCustomerInvoice: (id) =>
    request(`/orders/${id}/email-invoice`, {
      method: 'POST',
    }),
};

// Admin Metrics & Customer API
export const adminAPI = {
  getStats: () => request('/admin/stats'),

  getCustomers: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/admin/customers${query}`);
  },

  getCustomerById: (id) => request(`/admin/customers/${id}`),
};

// Settings API (Delivery fee, Free threshold, GST rate, Store info, Serviceable Cities)
export const settingsAPI = {
  getSettings: () => request('/settings'),
  getPublicSettings: () => request('/settings'),
  getServiceableCities: () => request('/settings/cities'),
  adminGetSettings: () => request('/admin/settings'),
  adminUpdateSettings: (settingsData) =>
    request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    }),
  adminAddCity: (cityData) =>
    request('/admin/settings/cities', {
      method: 'POST',
      body: JSON.stringify(cityData),
    }),
  adminToggleCity: (cityName) =>
    request(`/admin/settings/cities/${encodeURIComponent(cityName)}/toggle`, {
      method: 'PUT',
    }),
  adminDeleteCity: (cityName) =>
    request(`/admin/settings/cities/${encodeURIComponent(cityName)}`, {
      method: 'DELETE',
    }),
};

// Contact API
export const contactAPI = {
  submitMessage: (messageData) =>
    request('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),

  adminGetMessages: () => request('/contact/admin/messages'),

  adminMarkRead: (id, isRead) =>
    request(`/contact/admin/messages/${id}/read`, {
      method: 'PUT',
      body: JSON.stringify({ isRead }),
    }),

  adminDeleteMessage: (id) =>
    request(`/contact/admin/messages/${id}`, {
      method: 'DELETE',
    }),
};

