import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { notesApi, aiApi } from '../api/client'
import { useAuthStore } from '../store'

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: '#252118', border: '1px solid #2d2620' }}>
      <div className="p-2.5 rounded-xl" style={{ background: '#d9704118' }}>
        <span style={{ color: '#d97041', fontSize: '1.1rem' }}>{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: '#e8ddd6' }}>{value}</div>
        <div className="text-xs mt-0.5" style={{ color: '#8a7a70' }}>{label}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const [notes, setNotes] = useState([])
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([notesApi.list({ limit: 50 }), aiApi.insights()])
      .then(([n, i]) => { setNotes(n.data); setInsight(i.data.insight) })
      .finally(() => setLoading(false))
  }, [])

  const tags = notes.flatMap((n) => n.tags ?? [])
  const tagCounts = tags.reduce((a, t) => ({ ...a, [t]: (a[t] ?? 0) + 1 }), {})
  const topTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a).slice(0, 10)
  const pinned = notes.filter((n) => n.is_pinned === 1)
  const recent = notes.slice(0, 5)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 max-w-4xl mx-auto" style={{ color: '#e8ddd6' }}>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-semibold">{greeting}, {user?.username}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8a7a70' }}>Here's your knowledge base.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Total Notes" value={loading ? '—' : notes.length} icon="◧" />
        <StatCard label="Pinned" value={loading ? '—' : pinned.length} icon="⊙" />
        <StatCard label="Topics" value={loading ? '—' : Object.keys(tagCounts).length} icon="⊛" />
      </div>

      {/* AI Insight */}
      {insight && (
        <div
          className="rounded-xl p-4 mb-6 flex items-start gap-3"
          style={{ background: '#252118', border: '1px solid #d9704130' }}
        >
          <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: '#d9704120' }}>
            <svg width="14" height="14" viewBox="0 0 40 40" fill="none">
              <path d="M20 8 C14 8 10 12 10 18 C10 22 12 25.5 16 27.5 L14 32 L20 29 L26 32 L24 27.5 C28 25.5 30 22 30 18 C30 12 26 8 20 8Z" fill="#d97041" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: '#d97041' }}>Claude Insight</p>
            <p className="text-sm leading-relaxed" style={{ color: '#c8b8b0' }}>{insight}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        {/* Recent notes — 3/5 */}
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: '#e8ddd6' }}>Recent Notes</h2>
            <Link to="/notes" className="text-xs transition-colors" style={{ color: '#d97041' }}>
              View all →
            </Link>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: '#252118', border: '1px solid #2d2620' }}>
            {loading ? (
              <div className="p-6 text-center text-sm" style={{ color: '#4a3f38' }}>Loading…</div>
            ) : recent.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm mb-2" style={{ color: '#4a3f38' }}>No notes yet</p>
                <Link to="/notes" className="text-sm font-medium" style={{ color: '#d97041' }}>
                  Create your first note →
                </Link>
              </div>
            ) : (
              recent.map((note, i) => (
                <Link
                  key={note.id}
                  to="/notes"
                  state={{ noteId: note.id }}
                  className="flex items-start gap-3 px-4 py-3 transition-colors block"
                  style={{ borderTop: i > 0 ? '1px solid #2d2620' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#2e2820' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#e8ddd6' }}>{note.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#8a7a70' }}>
                      {note.summary || note.content || 'Empty note'}
                    </p>
                  </div>
                  {note.is_pinned === 1 && <span className="text-xs shrink-0" style={{ color: '#d97041' }}>⊙</span>}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Tags — 2/5 */}
        <div className="col-span-2">
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#e8ddd6' }}>Top Tags</h2>
          <div className="rounded-xl p-4" style={{ background: '#252118', border: '1px solid #2d2620' }}>
            {topTags.length === 0 ? (
              <p className="text-xs" style={{ color: '#4a3f38' }}>
                No tags yet. Use "Auto-tag" on your notes.
              </p>
            ) : (
              <div className="space-y-2">
                {topTags.map(([tag, count]) => (
                  <div key={tag} className="flex items-center justify-between gap-2">
                    <span className="text-xs truncate" style={{ color: '#d97041' }}>#{tag}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: '#1a1713', color: '#8a7a70' }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="mt-3 space-y-2">
            {[
              { to: '/chat', label: 'Ask Claude', sub: 'Chat with your notes', icon: '◈' },
              { to: '/notes', label: 'New Note', sub: 'Add to your knowledge base', icon: '+' },
            ].map(({ to, label, sub, icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                style={{ background: '#252118', border: '1px solid #2d2620' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d9704140' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2d2620' }}
              >
                <span className="text-base" style={{ color: '#d97041' }}>{icon}</span>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#e8ddd6' }}>{label}</p>
                  <p className="text-xs" style={{ color: '#8a7a70' }}>{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
