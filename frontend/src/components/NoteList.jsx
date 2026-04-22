import clsx from 'clsx'
import { useNoteStore } from '../store'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NoteList({ notes, onSelect, selectedId }) {
  return (
    <div className="flex flex-col divide-y divide-gray-800">
      {notes.length === 0 && (
        <div className="p-8 text-center text-gray-500 text-sm">No notes yet. Create one!</div>
      )}
      {notes.map((note) => (
        <button
          key={note.id}
          onClick={() => onSelect(note)}
          className={clsx(
            'text-left px-4 py-3 hover:bg-gray-800/60 transition-colors group',
            selectedId === note.id && 'bg-gray-800'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {note.is_pinned === 1 && <span className="text-yellow-400 text-xs">⊙</span>}
                <span className="text-sm font-medium text-gray-100 truncate">{note.title}</span>
              </div>
              {note.summary ? (
                <p className="text-xs text-gray-400 line-clamp-2">{note.summary}</p>
              ) : (
                <p className="text-xs text-gray-500 line-clamp-2">{note.content}</p>
              )}
              {note.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-1.5 py-0.5 bg-synapse-500/10 text-synapse-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600 shrink-0 mt-0.5">
              {timeAgo(note.updated_at)}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
