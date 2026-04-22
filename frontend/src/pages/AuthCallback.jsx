import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { useAuthStore } from '../store'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { fetchMe } = useAuthStore()
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const provider = params.get('state') // "google" or absent (github)

    if (!code) {
      setError('No code returned from provider.')
      return
    }

    const redirectUri = `${window.location.origin}/auth/callback`

    const promise =
      provider === 'google'
        ? authApi.googleCallback(code, redirectUri)
        : authApi.githubCallback(code)

    promise
      .then(async (res) => {
        localStorage.setItem('synapse_token', res.data.access_token)
        await fetchMe()
        navigate('/')
      })
      .catch(() => {
        setError(`${provider === 'google' ? 'Google' : 'GitHub'} login failed. Please try again.`)
      })
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
