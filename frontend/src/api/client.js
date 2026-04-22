import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('synapse_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('synapse_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (username, password) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)
    return api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  me: () => api.get('/auth/me'),
}

export const notesApi = {
  list: (params) => api.get('/notes/', { params }),
  get: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes/', data),
  update: (id, data) => api.patch(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  summarize: (id) => api.post(`/notes/${id}/summarize`),
  autoTag: (id) => api.post(`/notes/${id}/tag`),
}

export const aiApi = {
  chat: (data) => api.post('/ai/chat', data),
  insights: () => api.get('/ai/insights'),
}

export const searchApi = {
  search: (q, semantic = false) => api.get('/search/', { params: { q, semantic } }),
}

export default api
