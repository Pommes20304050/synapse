function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export default function NoteList({ notes, onSelect, selectedId }) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: '#252118' }}>
          <svg className="w-5 h-5" fill="none" stroke="#4a3f38" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: '#4a3f38' }}>No notes yet</p>
        <p className="text-xs mt-1" style={{ color: '#4a3f38' }}>Create one to get started</p>
      </div>
    )
  }

  return (
    <div className="divide-y" style={{ borderColor: '#2d2620' }}>
      {notes.map((note) => (
        <button
          key={note.id}
          onClick={() => onSelect(note)}
          className="w-full text-left px-4 py-3.5 transition-colors group"
          style={
            selectedId === note.id
              ? { background: '#2e2820' }
              : { background: 'transparent' }
          }
          onMouseEnter={(e) => { if (selectedId !== note.id) e.currentTarget.style.background = '#252118' }}
          onMouseLeave={(e) => { if (selectedId !== note.id) e.currentTarget.style.background = 'transparent' }}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              {note.is_pinned === 1 && (
                <span className="text-xs shrink-0" style={{ color: '#d97041' }}>⊙</span>
              )}
              <span className="text-sm font-medium truncate" style={{ color: '#e8ddd6' }}>
                {note.title}
              </span>
            </div>
            <span className="text-xs shrink-0 mt-0.5" style={{ color: '#4a3f38' }}>
              {timeAgo(note.updated_at)}
            </span>
          </div>

          <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: '#8a7a70' }}>
            {note.summary || note.content || 'Empty note'}
          </p>

          {note.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {note.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ background: '#d9704118', color: '#d97041' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
