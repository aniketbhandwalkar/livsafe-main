// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // API call initiated
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, defaultOptions);
    // Response received
    
    // Clone response to read it twice
    const responseClone = response.clone();
    const responseText = await responseClone.text();
    // Response text retrieved
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // JSON parsing failed
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    // Response data parsed
    
    if (!response.ok) {
      // API error occurred
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    // API call failed
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please make sure the backend is running on http://localhost:5000');
    }
    throw error;
  }
};

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiCall('/auth/me');
    return response.data;
  },

  logout: async () => {
    await apiCall('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    return { message: "Logged out successfully" };
  },

  signupDoctor: async (data: any) => {
    const response = await apiCall('/auth/signup/doctor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  },

  signupOrganization: async (data: any) => {
    const response = await apiCall('/auth/signup/organization', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store token in localStorage (same as doctor signup)
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  },
};

export const doctorAPI = {
  getDashboard: async () => {
    const response = await apiCall('/doctor/dashboard');
    return response.data;
  },

  getRecords: async (page = 1, limit = 10) => {
    const response = await apiCall(`/doctor/records?page=${page}&limit=${limit}`);
    return response.data;
  },

  getRecord: async (id: string) => {
    const response = await apiCall(`/doctor/records/${id}`);
    return response.data;
  },

  createRecord: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/medical-images/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    
    return data.data;
  },

  getAllDoctors: async () => {
    const response = await apiCall('/doctor/all');
    return response.data;
  },

  assignPatientToDoctor: async (doctorId: string, patientId: string) => {
    const response = await apiCall('/doctor/assign-patient', {
      method: 'PUT',
      body: JSON.stringify({ doctorId, patientId }),
    });
    return response;
  },

  deleteRecord: async (id: string) => {
    const response = await apiCall(`/doctor/records/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};

// Medical Images API
export const medicalImagesAPI = {
  getImage: async (id: string) => {
    const response = await apiCall(`/medical-images/${id}`);
    return response.data;
  },

  getAllImages: async (page = 1, limit = 10) => {
    const response = await apiCall(`/medical-images?page=${page}&limit=${limit}`);
    return response.data;
  },

  uploadImage: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/medical-images/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    
    return data.data;
  },

  deleteImage: async (id: string) => {
    const response = await apiCall(`/medical-images/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};

export const organizationAPI = {
  getDashboard: async () => {
    const response = await apiCall('/organization/dashboard');
    return response.data;
  },

  getDoctors: async () => {
    const response = await apiCall('/doctor/all');
    return response.data;
  },

  addDoctor: async (doctorData: any) => {
    const response = await apiCall('/auth/signup/doctor', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
    return response;
  },

  removeDoctor: async (doctorId: string) => {
    const response = await apiCall(`/doctor/${doctorId}`, {
      method: 'DELETE',
    });
    return response;
  },

  getAllOrganizations: async () => {
    const response = await apiCall('/organization/all');
    return response.data;
  },
};

// Patient API
export const patientAPI = {
  getPatients: async (page = 1, limit = 10, search = '') => {
    const response = await apiCall(`/patients?page=${page}&limit=${limit}&search=${search}`);
    return response;
  },

  getPatient: async (id: string) => {
    const response = await apiCall(`/patients/${id}`);
    return response.data;
  },

  createPatient: async (patientData: any) => {
    const response = await apiCall('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
    return response;
  },

  updatePatient: async (id: string, patientData: any) => {
    const response = await apiCall(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
    return response;
  },

  deletePatient: async (id: string) => {
    const response = await apiCall(`/patients/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  searchPatients: async (query: string, filters?: any) => {
    const searchParams = new URLSearchParams({ q: query, ...filters });
    const response = await apiCall(`/patients/search?${searchParams}`);
    return response.data;
  },
};
