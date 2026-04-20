import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const http = axios.create({ baseURL: API_BASE })

// Inject JWT token on every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('docflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global 401 handler — clear storage and reload
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('docflow_token')
      localStorage.removeItem('docflow_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default http
