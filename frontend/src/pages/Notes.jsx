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
      if (location.state?.noteId) {
        const target = res.data.find((n) => n.id === location.state.noteId)
        if (target) setSelectedNote(target)
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleSearch = async (q) => {
    setSearch(q)
    if (!q.trim()) { setSearchResults(null); return }
    const res = await searchApi.search(q, semantic)
    setSearchResults(res.data.notes)
  }

  const handleCreate = async () => {
    const res = await notesApi.create({ title: 'Untitled', content: '' })
    upsertNote(res.data)
    setSelectedNote(res.data)
    setSearchResults(null)
    setSearch('')
  }

  const displayed = searchResults ?? notes

  return (
    <div className="flex h-full" style={{ background: '#1a1713' }}>
      {/* Sidebar panel */}
      <div
        className="w-64 shrink-0 flex flex-col border-r h-full"
        style={{ background: '#1f1b17', borderColor: '#2d2620' }}
      >
        {/* Search + New */}
        <div className="p-3 space-y-2 border-b" style={{ borderColor: '#2d2620' }}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="#4a3f38" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search…"
                className="input text-sm py-1.5 pl-8"
              />
            </div>
            <button
              onClick={handleCreate}
              className="btn-primary px-3 py-1.5 text-sm font-bold shrink-0"
              title="New note"
            >
              +
            </button>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#8a7a70' }}>
            <input
              type="checkbox"
              checked={semantic}
              onChange={(e) => { setSemantic(e.target.checked); if (search) handleSearch(search) }}
              className="rounded accent-[#d97041]"
            />
            AI semantic search
          </label>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-[#d97041] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <NoteList notes={displayed} onSelect={setSelectedNote} selectedId={selectedNote?.id} />
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {selectedNote ? (
          <NoteEditor key={selectedNote.id} note={selectedNote} onDelete={(id) => { removeNote(id); setSelectedNote(null) }} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: '#4a3f38' }}>
            <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center" style={{ background: '#252118' }}>
              <svg className="w-7 h-7" fill="none" stroke="#4a3f38" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: '#8a7a70' }}>Select a note</p>
            <p className="text-xs mb-4">or create a new one</p>
            <button onClick={handleCreate} className="btn-primary text-sm px-5">
              New Note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
