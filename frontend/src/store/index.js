import { create } from 'zustand'
import { authApi } from '../api/client'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('synapse_token'),
  isLoading: true,

  login: async (username, password) => {
    const { authApi } = await import('../api/client')
    const res = await authApi.login(username, password)
    const token = res.data.access_token
    localStorage.setItem('synapse_token', token)
    const meRes = await authApi.me()
    set({ token, user: meRes.data, isLoading: false })
    return meRes.data
  },

  logout: () => {
    localStorage.removeItem('synapse_token')
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    const token = localStorage.getItem('synapse_token')
    if (!token) {
      set({ isLoading: false })
      return
    }
    try {
      const res = await authApi.me()
      set({ user: res.data, isLoading: false })
    } catch {
      localStorage.removeItem('synapse_token')
      set({ user: null, token: null, isLoading: false })
    }
  },
}))

export const useNoteStore = create((set, get) => ({
  notes: [],
  selectedNote: null,
  isLoading: false,

  setNotes: (notes) => set({ notes }),
  setSelectedNote: (note) => set({ selectedNote: note }),

  upsertNote: (updated) =>
    set((state) => ({
      notes: state.notes.some((n) => n.id === updated.id)
        ? state.notes.map((n) => (n.id === updated.id ? updated : n))
        : [updated, ...state.notes],
      selectedNote: state.selectedNote?.id === updated.id ? updated : state.selectedNote,
    })),

  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
    })),
}))
