import { useEffect, useState } from 'react'
import { settingsApi } from '../api/client'

export default function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    settingsApi.getStatus().then((res) => setStatus(res.data))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!apiKey.trim()) return
    setSaving(true)
    setError('')
    try {
      await settingsApi.update({ anthropic_api_key: apiKey })
      setStatus((s) => ({ ...s, anthropic_api_key_set: true }))
      setApiKey('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-100 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">Configure your Synapse instance.</p>

      {/* API Key */}
      <section className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-200">Anthropic API Key</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Required for AI features (summarize, auto-tag, chat).
              Get one at{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              status?.anthropic_api_key_set
                ? 'bg-green-500/10 text-green-400'
                : 'bg-yellow-500/10 text-yellow-400'
            }`}
          >
            {status?.anthropic_api_key_set ? 'Configured' : 'Not set'}
          </span>
        </div>

        <form onSubmit={handleSave} className="flex gap-2">
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={status?.anthropic_api_key_set ? 'Enter new key to replace…' : 'sk-ant-…'}
            className="input flex-1 font-mono text-sm"
            type="password"
          />
          <button type="submit" disabled={saving || !apiKey.trim()} className="btn-primary px-4 shrink-0">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>

        {saved && (
          <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
            <span>✓</span> API key saved successfully
          </p>
        )}
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </section>

      {/* GitHub OAuth info */}
      <section className="card">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-200">GitHub OAuth</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Allow users to sign in with their GitHub account.
            </p>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              status?.github_oauth_enabled
                ? 'bg-green-500/10 text-green-400'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {status?.github_oauth_enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {!status?.github_oauth_enabled && (
          <div className="bg-gray-800/50 rounded-lg p-4 text-xs text-gray-400 space-y-2 font-mono">
            <p className="text-gray-300 font-sans font-medium not-italic mb-2">Setup:</p>
            <p>1. Go to <span className="text-indigo-400">github.com/settings/developers</span></p>
            <p>2. New OAuth App → set callback URL to:</p>
            <p className="bg-gray-900 px-2 py-1 rounded text-gray-300">
              http://localhost:5173/auth/callback
            </p>
            <p>3. Add to your <span className="text-gray-300">.env</span>:</p>
            <p className="bg-gray-900 px-2 py-1 rounded text-gray-300">
              GITHUB_CLIENT_ID=your_client_id<br />
              GITHUB_CLIENT_SECRET=your_secret
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
