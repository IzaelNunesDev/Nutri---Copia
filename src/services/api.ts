import axios from 'axios';

// Helper to ensure URL has protocol
const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    if (!url.startsWith('http')) {
        url = `https://${url}`;
    }
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Global response interceptor for error standardization
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized globally
        if (error.response?.status === 401) {
            // Clear all auth data
            localStorage.removeItem('token');
            localStorage.removeItem('authenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');

            // Redirect to login if not already there
            if (!window.location.pathname.includes('/login')) {
                // Determine base URL to handle subdirectories if needed, though window.location.href='/login' usually works for root router
                window.location.href = '/login';
                return Promise.reject(error); // Reject to stop further processing
            }
        }

        const message = error.response?.data?.detail || error.message || 'Erro desconhecido';
        // You can use a global event bus or just normalize the error object
        error.friendlyMessage = message;
        return Promise.reject(error);
    }
);

// Auth services
export const authService = {
    login: async (credentials: any) => {
        const response = await api.post('/api/auth/login', credentials, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    },
    register: async (userData: any) => {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    },
    me: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },
    forgotPassword: async (email: string) => {
        const response = await api.post('/api/auth/forgot-password', { email });
        return response.data;
    },
    resetPassword: async (token: string, newPassword: string) => {
        const response = await api.post('/api/auth/reset-password', {
            token,
            new_password: newPassword
        });
        return response.data;
    }
};

// Patient services
export const patientService = {
    getAll: async () => {
        const response = await api.get('/api/pacientes');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/api/pacientes/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/api/pacientes', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/api/pacientes/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/api/pacientes/${id}`);
        return response.data;
    },
    getEvaluations: async (id: string) => {
        const response = await api.get(`/api/pacientes/${id}/avaliacoes`);
        return response.data;
    },
    createEvaluation: async (data: any) => {
        const response = await api.post('/api/avaliacoes', data);
        return response.data;
    }
};

export const calculosService = {
    calculateIMC: async (weight: number, height: number) => {
        const response = await api.post('/api/calculos/imc', { weight, height });
        return response.data;
    },
    calculateGestationalAge: async (date: string, method: string) => {
        const response = await api.post('/api/calculos/gestational-age', { date, method });
        return response.data;
    },
    analyzeWeightGain: async (data: any) => {
        const response = await api.post('/api/calculos/weight-gain-analysis', data);
        return response.data;
    }
};

export const pdfService = {
    generate: async (data: any) => {
        const response = await api.post('/api/pdf/generate', data, {
            responseType: 'blob'
        });
        return response.data;
    },
    sendEmail: async (data: any) => {
        const response = await api.post('/api/pdf/send-email', data);
        return response.data;
    }
};

export default api;
