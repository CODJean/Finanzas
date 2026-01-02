import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// AUTH
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getProfile = () => api.get('/auth/profile');

// GASTOS
export const getGastos = () => api.get('/gastos');
export const createGasto = (gastoData) => api.post('/gastos', gastoData);
export const updateGasto = (id, gastoData) => api.put(`/gastos/${id}`, gastoData);
export const deleteGasto = (id) => api.delete(`/gastos/${id}`);

// INGRESOS
export const getIngresos = () => api.get('/ingresos');
export const createIngreso = (ingresoData) => api.post('/ingresos', ingresoData);
export const updateIngreso = (id, ingresoData) => api.put(`/ingresos/${id}`, ingresoData);
export const deleteIngreso = (id) => api.delete(`/ingresos/${id}`);

// PRESUPUESTOS
export const getPresupuestos = () => api.get('/presupuestos');
export const createPresupuesto = (presupuestoData) => api.post('/presupuestos', presupuestoData);
export const updatePresupuesto = (id, presupuestoData) => api.put(`/presupuestos/${id}`, presupuestoData);
export const deletePresupuesto = (id) => api.delete(`/presupuestos/${id}`);

// ESTADÍSTICAS
export const getResumen = () => api.get('/estadisticas/resumen');
export const getGastosPorCategoria = () => api.get('/estadisticas/gastos-por-categoria');
export const getEvolucionMensual = () => api.get('/estadisticas/evolucion-mensual');

export default api;
