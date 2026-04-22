import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { notesApi, aiApi } from '../api/client'
import { useAuthStore } from '../store'

function StatCard({ label, value, sub }) {
  return (
    <div className="card">
      <div className="text-2xl font-bold text-gray-100">{value}</div>
      <div className="text-sm font-medium text-gray-300 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
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
      .then(([notesRes, insightRes]) => {
        setNotes(notesRes.data)
        setInsight(insightRes.data.insight)
      })
      .finally(() => setLoading(false))
  }, [])

  const tags = notes.flatMap((n) => n.tags ?? [])
  const tagCounts = tags.reduce((acc, t) => ({ ...acc, [t]: (acc[t] ?? 0) + 1 }), {})
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  const pinned = notes.filter((n) => n.is_pinned === 1)
  const recent = notes.slice(0, 5)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-100">
          Good to see you, {user?.username} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Here's your knowledge base at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Notes" value={notes.length} sub="in your knowledge base" />
        <StatCard label="Pinned" value={pinned.length} sub="quick access" />
        <StatCard label="Tags" value={Object.keys(tagCounts).length} sub="topics covered" />
      </div>

      {/* AI Insight */}
      {insight && (
        <div className="card mb-6 border-synapse-500/20 bg-synapse-500/5">
          <div className="flex items-start gap-3">
            <span className="text-synapse-400 text-lg mt-0.5">✦</span>
            <div>
              <p className="text-xs font-medium text-synapse-400 mb-1">AI Insight</p>
              <p className="text-sm text-gray-300">{insight}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Notes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-300">Recent Notes</h2>
            <Link to="/notes" className="text-xs text-synapse-400 hover:text-synapse-300">
              View all →
            </Link>
          </div>
          <div className="card divide-y divide-gray-800 p-0 overflow-hidden">
            {loading ? (
              <div className="p-4 text-center text-gray-600 text-sm">Loading…</div>
            ) : recent.length === 0 ? (
              <div className="p-4 text-center text-gray-600 text-sm">
                <Link to="/notes" className="text-synapse-400 hover:underline">
                  Create your first note
                </Link>
              </div>
            ) : (
              recent.map((note) => (
                <Link
                  key={note.id}
                  to="/notes"
                  state={{ noteId: note.id }}
                  className="block px-4 py-3 hover:bg-gray-800/50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-200 truncate">{note.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {note.summary || note.content || 'Empty note'}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Top Tags */}
        <div>
          <h2 className="text-sm font-medium text-gray-300 mb-3">Top Tags</h2>
          <div className="card">
            {topTags.length === 0 ? (
              <p className="text-sm text-gray-600">No tags yet. Use AI auto-tag on your notes.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded-full text-xs"
                  >
                    <span className="text-synapse-400">#{tag}</span>
                    <span className="text-gray-500">{count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
