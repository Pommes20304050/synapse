import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { authApi } from '../api/client'

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function SynapseHexIcon({ size = 'md' }) {
  const dim = size === 'sm' ? 32 : 64
  const s = size === 'sm' ? 'w-6 h-6' : 'w-12 h-12'
  const v = size === 'sm' ? '0 0 32 32' : '0 0 64 64'
  const pts = size === 'sm'
    ? { outer: '16,2 29,9 29,23 16,30 3,23 3,9', inner: '16,7 24,11.5 24,20.5 16,25 8,20.5 8,11.5', cx: 16, cy: 16, r: 4 }
    : { outer: '32,4 58,18 58,46 32,60 6,46 6,18', inner: '32,12 50,22 50,42 32,52 14,42 14,22', cx: 32, cy: 32, r: 6 }
  return (
    <svg viewBox={v} className={s} fill="none">
      <polygon points={pts.outer} stroke="#6366f1" strokeWidth="1.5" fill="none" opacity="0.25" />
      <polygon points={pts.inner} stroke="#6366f1" strokeWidth="1" fill="none" opacity="0.45" />
      <circle cx={pts.cx} cy={pts.cy} r={pts.r} fill="#6366f1" />
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
  const [gConfig, setGConfig] = useState({ enabled: false, client_id: '' })
  const { login } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    authApi.githubConfig().then((r) => setGhConfig(r.data)).catch(() => {})
    authApi.googleConfig().then((r) => setGConfig(r.data)).catch(() => {})
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
    const p = new URLSearchParams({
      client_id: ghConfig.client_id,
      redirect_uri: `${window.location.origin}/auth/callback`,
      scope: 'user:email',
    })
    window.location.href = `https://github.com/login/oauth/authorize?${p}`
  }

  const handleGoogle = () => {
    const p = new URLSearchParams({
      client_id: gConfig.client_id,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      state: 'google',  // callback uses this to route to /api/auth/google
      access_type: 'online',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${p}`
  }

  const hasOAuth = ghConfig.enabled || gConfig.enabled

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-900 border-r border-gray-800 p-12">
        <div className="flex items-center gap-3">
          <SynapseHexIcon size="md" />
          <span className="text-xl font-bold text-gray-100 tracking-tight">Synapse</span>
        </div>

        <div>
          <h2 className="text-3xl font-light text-gray-200 leading-relaxed mb-3">
            Your second brain,<br />
            <span className="text-indigo-400 font-normal">powered by Claude AI.</span>
          </h2>
          <p className="text-sm text-gray-500 mb-8 max-w-xs">
            Write notes, chat with your knowledge base, and let AI automatically organize everything for you.
          </p>
          <div className="space-y-4">
            {[
              { icon: '◧', label: 'Markdown notes with live preview', sub: 'Auto-summarized by Claude on save' },
              { icon: '◈', label: 'Chat with your knowledge base', sub: 'Ask anything, Claude answers from your notes' },
              { icon: '✦', label: 'Semantic search & auto-tagging', sub: 'Find notes by meaning, not just keywords' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-indigo-400 text-lg mt-0.5 w-5 shrink-0">{icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-300">{label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Open source · Self-hosted · Powered by Anthropic Claude
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <SynapseHexIcon size="sm" />
            <span className="text-lg font-bold text-gray-100">Synapse</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-100 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Get started'}
          </h1>
          <p className="text-sm text-gray-500 mb-7">
            {mode === 'login' ? 'Sign in to your knowledge base' : 'Create your personal AI knowledge base'}
          </p>

          {/* OAuth buttons */}
          {hasOAuth && (
            <div className="space-y-2.5 mb-5">
              {gConfig.enabled && (
                <button
                  onClick={handleGoogle}
                  className="w-full flex items-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              )}
              {ghConfig.enabled && (
                <button
                  onClick={handleGitHub}
                  className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
                >
                  <GithubIcon />
                  Continue with GitHub
                </button>
              )}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-xs text-gray-600">or continue with email</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>
            </div>
          )}

          {/* Mode tabs */}
          <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-lg p-1">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-gray-800 text-gray-100 shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
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
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <span>⚠</span> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <span>✓</span> {success}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 !mt-5">
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
