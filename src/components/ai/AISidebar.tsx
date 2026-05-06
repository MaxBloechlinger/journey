import { useEffect, useRef, useState } from 'react'
import { X, Send, Loader } from 'lucide-react'
import type { Trip } from '../../types/trip'
import { useUIStore } from '../../store/uiStore'
import { sendMessage, type ChatMessage } from '../../utils/claude'

const SUGGESTED_PROMPTS = [
  'Is this trip realistic for my budget?',
  'Where am I overspending?',
  'What should I cut to stay on budget?',
  'How does the cost breakdown compare across cities?',
]

interface Props {
  trip: Trip
}

export default function AISidebar({ trip }: Props) {
  const aiSidebarOpen = useUIStore((s) => s.aiSidebarOpen)
  const toggleAISidebar = useUIStore((s) => s.toggleAISidebar)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (aiSidebarOpen) textareaRef.current?.focus()
  }, [aiSidebarOpen])

  const submit = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
      if (!import.meta.env.DEV && !apiKey) {
      // prod — no key needed, /api/chat handles it
    } else if (import.meta.env.DEV && !apiKey) {
      setError('No API key found. Add VITE_ANTHROPIC_API_KEY to .env.local')
      return
    }
    setError(null)
    setInput('')

    const userMessage: ChatMessage = { role: 'user', content: trimmed }
    const next = [...messages, userMessage]
    setMessages(next)
    setLoading(true)

    let assistantText = ''
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      await sendMessage(next, trip, apiKey, (chunk) => {
        assistantText += chunk
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: assistantText },
        ])
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: `Error: ${msg}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(input)
    }
  }

  if (!aiSidebarOpen) return null

  return (
    <div
      className="flex flex-col shrink-0"
      style={{
        width: 360,
        borderLeft: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        height: '100%',
      }}
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}
        >
          ✦ AI Assistant
        </span>
        <button
          onClick={toggleAISidebar}
          className="p-1 hover:opacity-60 transition-opacity"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <p
              className="text-xs"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
            >
              Ask anything about your trip.
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => submit(p)}
                  className="px-3 py-2 text-left text-xs hover:opacity-80 transition-opacity"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    background: 'var(--bg-base)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span
              className="text-xs uppercase tracking-widest"
              style={{
                fontFamily: 'var(--font-display)',
                color: msg.role === 'user' ? 'var(--text-muted)' : 'var(--accent)',
              }}
            >
              {msg.role === 'user' ? 'You' : '✦ AI'}
            </span>
            <div
              className="max-w-full px-3 py-2.5 text-sm"
              style={{
                background: msg.role === 'user' ? 'var(--bg-elevated)' : 'var(--bg-base)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {msg.content || (loading && i === messages.length - 1 ? (
                <Loader size={12} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
              ) : null)}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex items-center gap-2">
            <Loader size={12} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        )}

        {error && (
          <p className="text-xs" style={{ color: 'var(--danger)', fontFamily: 'var(--font-body)' }}>
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-4 py-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your trip…"
            rows={2}
            className="flex-1 resize-none px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              colorScheme: 'dark',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            onClick={() => submit(input)}
            disabled={!input.trim() || loading}
            className="px-3 py-2 hover:opacity-80 transition-opacity disabled:opacity-30"
            style={{ background: 'var(--accent)', color: '#0a0a0a' }}
          >
            <Send size={14} />
          </button>
        </div>
        <p
          className="mt-1.5 text-xs"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
        >
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  )
}
