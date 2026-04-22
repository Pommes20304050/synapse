import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { notesApi, searchApi } from '../api/client'
import { useNoteStore } from '../store'
import NoteList from '../components/NoteList'
import NoteEditor from '../components/NoteEditor'

export default function Notes() {
  const location = useLocation()
  const { notes, selectedNote, setNotes, setSelectedNote, upsertNote, removeNote } = useNoteStore()
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [semantic, setSemantic] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notesApi.list().then((res) => {
      setNotes(res.data)
      // Auto-select from navigation state
      if (location.state?.noteId) {
        const target = res.data.find((n) => n.id === location.state.noteId)
        if (target) setSelectedNote(target)
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleSearch = async (q) => {
    setSearch(q)
    if (!q.trim()) {
      setSearchResults(null)
      return
    }
    const res = await searchApi.search(q, semantic)
    setSearchResults(res.data.notes)
  }

  const handleCreate = async () => {
    const res = await notesApi.create({ title: 'Untitled Note', content: '' })
    upsertNote(res.data)
    setSelectedNote(res.data)
    setSearchResults(null)
    setSearch('')
  }

  const handleDelete = (id) => {
    removeNote(id)
    setSelectedNote(null)
  }

  const displayedNotes = searchResults ?? notes

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-72 shrink-0 flex flex-col border-r border-gray-800 h-full">
        {/* Search + New */}
        <div className="p-3 border-b border-gray-800 space-y-2">
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search notes…"
              className="input text-sm py-1.5"
            />
            <button onClick={handleCreate} className="btn-primary px-3 py-1.5 text-sm shrink-0">
              +
            </button>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={semantic}
              onChange={(e) => {
                setSemantic(e.target.checked)
                if (search) handleSearch(search)
              }}
              className="accent-synapse-500"
            />
            AI semantic search
          </label>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-600 text-sm">Loading…</div>
          ) : (
            <NoteList
              notes={displayedNotes}
              onSelect={setSelectedNote}
              selectedId={selectedNote?.id}
            />
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onDelete={handleDelete}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <div className="text-5xl mb-4">◧</div>
            <p className="text-sm">Select a note or create a new one</p>
            <button onClick={handleCreate} className="btn-primary mt-4 text-sm">
              New Note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
