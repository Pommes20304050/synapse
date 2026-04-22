import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { authApi } from '../api/client'

function ClaudeLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#d97041" opacity="0.15" />
      <path
        d="M20 8 C14 8 10 12 10 18 C10 22 12 25.5 16 27.5 L14 32 L20 29 L26 32 L24 27.5 C28 25.5 30 22 30 18 C30 12 26 8 20 8Z"
        fill="#d97041"
        opacity="0.9"
      />
      <circle cx="16" cy="18" r="2" fill="#1a1713" />
      <circle cx="24" cy="18" r="2" fill="#1a1713" />
      <path d="M16 23 Q20 26 24 23" stroke="#1a1713" strokeWidth="1.5" fill="none" strokeLinecap="round" />
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

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
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
    setError(''); setSuccess('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await authApi.register({ email: form.email, username: form.username, password: form.password })
        setSuccess('Account created! Sign in below.')
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

  const handleGoogle = () => {
    const p = new URLSearchParams({
      client_id: gConfig.client_id,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      state: 'google',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${p}`
  }

  const handleGitHub = () => {
    const p = new URLSearchParams({
      client_id: ghConfig.client_id,
      redirect_uri: `${window.location.origin}/auth/callback`,
      scope: 'user:email',
    })
    window.location.href = `https://github.com/login/oauth/authorize?${p}`
  }

  const hasOAuth = ghConfig.enabled || gConfig.enabled

  return (
    <div className="min-h-screen flex" style={{ background: '#1a1713' }}>
      {/* Left — Claude branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10 border-r"
        style={{ background: '#1f1b17', borderColor: '#2d2620' }}
      >
        <div className="flex items-center gap-3">
          <ClaudeLogo size={36} />
          <div>
            <div className="font-semibold text-lg" style={{ color: '#e8ddd6' }}>Synapse</div>
            <div className="text-xs" style={{ color: '#8a7a70' }}>powered by Claude AI</div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-medium leading-relaxed mb-2" style={{ color: '#e8ddd6' }}>
            Your personal<br />
            <span style={{ color: '#d97041' }}>AI knowledge base.</span>
          </h2>
          <p className="text-sm mb-10" style={{ color: '#8a7a70', lineHeight: 1.7 }}>
            Write notes, chat with Claude about your knowledge base,
            and let AI automatically organize everything for you.
          </p>

          <div className="space-y-5">
            {[
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                label: 'Markdown notes',
                sub: 'Auto-summarized by Claude on save',
              },
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                label: 'Chat with your knowledge',
                sub: 'Ask anything, Claude answers from your notes',
              },
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                ),
                label: 'Smart auto-tagging',
                sub: 'Semantic search across all your notes',
              },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-md" style={{ background: '#d9704120', color: '#d97041' }}>
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#e8ddd6' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8a7a70' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#4a3f38' }}>
          Open source · Self-hosted · Claude API
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[360px] animate-fade-in">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <ClaudeLogo size={32} />
            <span className="font-semibold text-lg" style={{ color: '#e8ddd6' }}>Synapse</span>
          </div>

          <h1 className="text-2xl font-semibold mb-1" style={{ color: '#e8ddd6' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm mb-7" style={{ color: '#8a7a70' }}>
            {mode === 'login' ? 'Sign in to your knowledge base' : 'Start building your second brain'}
          </p>

          {/* OAuth buttons */}
          {hasOAuth && (
            <div className="space-y-2.5 mb-6">
              {gConfig.enabled && (
                <button
                  onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-800 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              )}
              {ghConfig.enabled && (
                <button
                  onClick={handleGitHub}
                  className="w-full flex items-center justify-center gap-2.5 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm border"
                  style={{ background: '#252118', borderColor: '#2d2620', color: '#e8ddd6' }}
                >
                  <GithubIcon />
                  Continue with GitHub
                </button>
              )}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px" style={{ background: '#2d2620' }} />
                <span className="text-xs" style={{ color: '#4a3f38' }}>or</span>
                <div className="flex-1 h-px" style={{ background: '#2d2620' }} />
              </div>
            </div>
          )}

          {/* Tabs */}
          <div
            className="flex gap-1 mb-5 p-1 rounded-lg"
            style={{ background: '#252118', border: '1px solid #2d2620' }}
          >
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className="flex-1 py-1.5 rounded-md text-sm font-medium transition-all capitalize"
                style={
                  mode === m
                    ? { background: '#2e2820', color: '#e8ddd6' }
                    : { color: '#8a7a70' }
                }
              >
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#8a7a70' }}>Email</label>
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
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8a7a70' }}>Username</label>
              <input
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
                className="input"
                placeholder="your_username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8a7a70' }}>Password</label>
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
              <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                style={{ background: '#3d1a1a', border: '1px solid #5a2020', color: '#f08080' }}>
                <span>⚠</span> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                style={{ background: '#1a3d2a', border: '1px solid #205a35', color: '#6fcf97' }}>
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
