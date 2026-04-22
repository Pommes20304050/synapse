import { useState, useRef, useEffect } from 'react'
import { aiApi } from '../api/client'
import ReactMarkdown from 'react-markdown'

function ClaudeAvatar() {
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: '#d9704120' }}>
      <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
        <path d="M20 8 C14 8 10 12 10 18 C10 22 12 25.5 16 27.5 L14 32 L20 29 L26 32 L24 27.5 C28 25.5 30 22 30 18 C30 12 26 8 20 8Z" fill="#d97041" />
        <circle cx="16" cy="18" r="2" fill="#1a1713" />
        <circle cx="24" cy="18" r="2" fill="#1a1713" />
      </svg>
    </div>
  )
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: '#d97041',
            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes pulse { 0%,80%,100%{opacity:.3;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  )
}

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Synapse. Ask me anything about your notes — I'll use your entire knowledge base to answer." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const question = input.trim()
    if (!question || loading) return
    setInput('')

    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }))
      const res = await aiApi.chat({ question, history })
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.answer }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#1a1713' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'assistant' ? (
              <ClaudeAvatar />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: '#d97041', color: '#1a1713' }}
              >
                U
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-tr-sm'
                  : 'rounded-tl-sm'
              }`}
              style={
                msg.role === 'user'
                  ? { background: '#d97041', color: '#fff' }
                  : { background: '#252118', border: '1px solid #2d2620', color: '#e8ddd6' }
              }
            >
              {msg.role === 'assistant' ? (
                <div className="prose-claude">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <ClaudeAvatar />
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{ background: '#252118', border: '1px solid #2d2620' }}
            >
              <ThinkingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 shrink-0">
        <div
          className="flex items-end gap-2 rounded-xl p-3"
          style={{ background: '#252118', border: '1px solid #2d2620' }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your notes… (Enter to send, Shift+Enter for newline)"
            disabled={loading}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder-[#4a3f38]"
            style={{ color: '#e8ddd6', maxHeight: '120px', lineHeight: '1.5' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="shrink-0 p-1.5 rounded-lg transition-colors disabled:opacity-30"
            style={{ background: '#d97041', color: '#fff' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: '#4a3f38' }}>
          Synapse uses your notes as context · Powered by Claude
        </p>
      </div>
    </div>
  )
}
