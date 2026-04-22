import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { notesApi } from '../api/client'
import { useNoteStore } from '../store'

const AUTOSAVE_DELAY = 1500

export default function NoteEditor({ note, onDelete }) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState('')
  const { upsertNote } = useNoteStore()

  useEffect(() => { setTitle(note.title); setContent(note.content) }, [note.id])

  const save = useCallback(async (t, c) => {
    setSaving(true)
    try {
      const res = await notesApi.update(note.id, { title: t, content: c })
      upsertNote(res.data)
    } finally { setSaving(false) }
  }, [note.id, upsertNote])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) save(title, content)
    }, AUTOSAVE_DELAY)
    return () => clearTimeout(timer)
  }, [title, content, save, note.title, note.content])

  const handleSummarize = async () => {
    setAiLoading('summarize')
    try { const res = await notesApi.summarize(note.id); upsertNote(res.data) }
    finally { setAiLoading('') }
  }

  const handleAutoTag = async () => {
    setAiLoading('tag')
    try { const res = await notesApi.autoTag(note.id); upsertNote(res.data) }
    finally { setAiLoading('') }
  }

  const togglePin = async () => {
    const res = await notesApi.update(note.id, { is_pinned: note.is_pinned === 1 ? 0 : 1 })
    upsertNote(res.data)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this note?')) return
    await notesApi.delete(note.id)
    onDelete(note.id)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#1a1713' }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-4 py-2 border-b shrink-0"
        style={{ borderColor: '#2d2620' }}
      >
        <button
          onClick={togglePin}
          className="p-1.5 rounded-lg transition-colors text-sm"
          style={note.is_pinned === 1 ? { color: '#d97041' } : { color: '#4a3f38' }}
          title="Pin note"
        >
          ⊙
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setPreview((p) => !p)}
          className="btn-ghost text-xs"
        >
          {preview ? 'Edit' : 'Preview'}
        </button>

        <div className="w-px h-4 mx-1" style={{ background: '#2d2620' }} />

        <button
          onClick={handleAutoTag}
          disabled={!!aiLoading}
          className="btn-ghost text-xs flex items-center gap-1.5 disabled:opacity-40"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {aiLoading === 'tag' ? 'Tagging…' : 'Auto-tag'}
        </button>

        <button
          onClick={handleSummarize}
          disabled={!!aiLoading}
          className="btn-ghost text-xs flex items-center gap-1.5 disabled:opacity-40"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" />
          </svg>
          {aiLoading === 'summarize' ? 'Summarizing…' : 'Summarize'}
        </button>

        <div className="w-px h-4 mx-1" style={{ background: '#2d2620' }} />

        <button
          onClick={handleDelete}
          className="btn-ghost text-xs"
          style={{ color: '#8a4040' }}
        >
          Delete
        </button>

        {saving && (
          <span className="text-xs ml-1" style={{ color: '#4a3f38' }}>Saving…</span>
        )}
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="px-6 pt-6 pb-2 text-xl font-semibold bg-transparent border-none outline-none"
        style={{ color: '#e8ddd6' }}
      />

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-6 pb-3">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: '#d9704118', color: '#d97041' }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* AI Summary */}
      {note.summary && (
        <div
          className="mx-6 mb-4 px-4 py-3 rounded-xl text-xs leading-relaxed"
          style={{ background: '#252118', border: '1px solid #2d2620' }}
        >
          <span className="font-medium mr-1.5" style={{ color: '#d97041' }}>AI Summary</span>
          <span style={{ color: '#8a7a70' }}>{note.summary}</span>
        </div>
      )}

      {/* Divider */}
      <div className="mx-6 mb-4 h-px" style={{ background: '#2d2620' }} />

      {/* Editor / Preview */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {preview ? (
          <div className="prose-claude">
            <ReactMarkdown>{content || '*Nothing to preview*'}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note in Markdown…"
            className="w-full h-full min-h-[300px] bg-transparent border-none outline-none resize-none text-sm font-mono leading-relaxed"
            style={{ color: '#c8b8b0', caretColor: '#d97041' }}
          />
        )}
      </div>
    </div>
  )
}
