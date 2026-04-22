import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { authApi } from '../api/client'

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function SynapseHexIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
      <polygon
        points="32,4 58,18 58,46 32,60 6,46 6,18"
        stroke="#6366f1"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      <polygon
        points="32,12 50,22 50,42 32,52 14,42 14,22"
        stroke="#6366f1"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />
      <circle cx="32" cy="32" r="6" fill="#6366f1" />
      <line x1="32" y1="4" x2="32" y2="22" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
      <line x1="32" y1="42" x2="32" y2="60" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
      <line x1="6" y1="18" x2="22" y2="26" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
      <line x1="42" y1="38" x2="58" y2="46" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
      <line x1="58" y1="18" x2="42" y2="26" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
      <line x1="22" y1="38" x2="6" y2="46" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [ghConfig, setGhConfig] = useState({ enabled: false, client_id: '' })
  const { login } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    authApi.githubConfig().then((res) => setGhConfig(res.data)).catch(() => {})
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await authApi.register({ email: form.email, username: form.username, password: form.password })
        setSuccess('Account created! You can now sign in.')
        setMode('login')
        return
      }
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGitHub = () => {
    const params = new URLSearchParams({
      client_id: ghConfig.client_id,
      redirect_uri: `${window.location.origin}/auth/callback`,
      scope: 'user:email',
    })
    window.location.href = `https://github.com/login/oauth/authorize?${params}`
  }

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-900 border-r border-gray-800 p-12">
        <div className="flex items-center gap-3">
          <SynapseHexIcon />
          <span className="text-xl font-bold text-gray-100 tracking-tight">Synapse</span>
        </div>

        <div>
          <blockquote className="text-2xl font-light text-gray-300 leading-relaxed mb-8">
            "Your second brain,<br />powered by Claude AI."
          </blockquote>
          <div className="space-y-4">
            {[
              { icon: '◧', label: 'Markdown notes with AI summaries' },
              { icon: '◈', label: 'Chat with your entire knowledge base' },
              { icon: '✦', label: 'Auto-tagging & semantic search' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-indigo-400 text-base w-5">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600">Powered by Anthropic Claude · Self-hosted · Open source</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <SynapseHexIcon />
            <span className="text-xl font-bold text-gray-100">Synapse</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-100 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {mode === 'login'
              ? 'Sign in to your knowledge base'
              : 'Start building your second brain'}
          </p>

          {/* GitHub OAuth */}
          {ghConfig.enabled && (
            <>
              <button
                onClick={handleGitHub}
                className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-medium px-4 py-2.5 rounded-lg transition-colors mb-4"
              >
                <GithubIcon />
                Continue with GitHub
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-xs text-gray-600">or</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>
            </>
          )}

          {/* Tab switcher */}
          <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-lg p-1">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  mode === m
                    ? 'bg-gray-800 text-gray-100 shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
              <input
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
                className="input"
                placeholder="your_username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                <span>⚠</span> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-400 text-xs bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
                <span>✓</span> {success}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading
                ? 'Please wait…'
                : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
