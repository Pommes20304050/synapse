import AIChat from '../components/AIChat'

export default function Chat() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-800 shrink-0">
        <h1 className="text-lg font-semibold text-gray-100">AI Chat</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Ask questions about your notes. Synapse uses your entire knowledge base as context.
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <AIChat />
      </div>
    </div>
  )
}
