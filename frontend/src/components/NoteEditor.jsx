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
  const [aiLoading, setAiLoading] = useState(false)
  const { upsertNote } = useNoteStore()

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
  }, [note.id])

  const save = useCallback(
    async (t, c) => {
      setSaving(true)
      try {
        const res = await notesApi.update(note.id, { title: t, content: c })
        upsertNote(res.data)
      } finally {
        setSaving(false)
      }
    },
    [note.id, upsertNote]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) save(title, content)
    }, AUTOSAVE_DELAY)
    return () => clearTimeout(timer)
  }, [title, content, save, note.title, note.content])

  const handleSummarize = async () => {
    setAiLoading(true)
    try {
      const res = await notesApi.summarize(note.id)
      upsertNote(res.data)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAutoTag = async () => {
    setAiLoading(true)
    try {
      const res = await notesApi.autoTag(note.id)
      upsertNote(res.data)
    } finally {
      setAiLoading(false)
    }
  }

  const togglePin = async () => {
    const res = await notesApi.update(note.id, {
      is_pinned: note.is_pinned === 1 ? 0 : 1,
    })
    upsertNote(res.data)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this note?')) return
    await notesApi.delete(note.id)
    onDelete(note.id)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 shrink-0">
        <button
          onClick={togglePin}
          className={`text-sm px-2 py-1 rounded transition-colors ${
            note.is_pinned === 1
              ? 'text-yellow-400 bg-yellow-400/10'
              : 'text-gray-500 hover:text-gray-300'
          }`}
          title="Toggle pin"
        >
          ⊙
        </button>
        <button
          onClick={() => setPreview((p) => !p)}
          className="btn-ghost text-xs"
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
        <div className="flex-1" />
        <button
          onClick={handleAutoTag}
          disabled={aiLoading}
          className="btn-ghost text-xs disabled:opacity-40"
          title="Auto-generate tags with AI"
        >
          ✦ Tag
        </button>
        <button
          onClick={handleSummarize}
          disabled={aiLoading}
          className="btn-ghost text-xs disabled:opacity-40"
          title="Summarize with AI"
        >
          ✦ Summarize
        </button>
        <button
          onClick={handleDelete}
          className="btn-ghost text-xs text-red-400 hover:text-red-300"
        >
          Delete
        </button>
        {saving && <span className="text-xs text-gray-500">Saving…</span>}
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="px-6 pt-5 pb-2 text-xl font-semibold bg-transparent text-gray-100 placeholder-gray-600 focus:outline-none border-none"
      />

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 px-6 pb-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-synapse-500/10 text-synapse-400 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Summary */}
      {note.summary && (
        <div className="mx-6 mb-3 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400">
            <span className="text-synapse-400 font-medium">AI Summary: </span>
            {note.summary}
          </p>
        </div>
      )}

      {/* Editor / Preview */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {preview ? (
          <div className="prose-dark mt-2">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note in Markdown…"
            className="w-full h-full min-h-[400px] bg-transparent text-gray-300 text-sm font-mono resize-none focus:outline-none placeholder-gray-700 leading-relaxed"
          />
        )}
      </div>
    </div>
  )
}
