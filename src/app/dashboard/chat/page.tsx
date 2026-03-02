'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

const SUGGESTIONS = [
  'Can I deduct my home office?',
  'Is my phone bill deductible?',
  "What's the mileage rate this year?",
  'Can I deduct client meals?',
  'What can a rideshare driver deduct?',
  'How does the self-employment tax deduction work?',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/chat')
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .finally(() => setInitialLoading(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  async function send(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || sending) return

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      role: 'user',
      content: msg,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setInput('')
    setSending(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      const reply: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Sorry, something went wrong.',
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, reply])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-950 border border-green-800 flex items-center justify-center">
            <Bot className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-white font-semibold">Write-Off AI</h1>
            <p className="text-slate-500 text-xs">IRS Publication 535 · Always available</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {initialLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-green-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="max-w-lg mx-auto text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-green-950 border border-green-800 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-white font-semibold text-xl mb-2">Ask me anything about 1099 taxes</h2>
            <p className="text-slate-400 text-sm mb-8">
              I know IRS Publication 535 inside and out. Ask about deductions, rules, or specific expenses.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left bg-slate-900 border border-slate-800 hover:border-green-700 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-3 rounded-xl text-sm transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-green-950 border border-green-800 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-green-400" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green-500 text-slate-900 font-medium rounded-br-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>
          ))
        )}

        {sending && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-green-950 border border-green-800 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-green-400" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-slate-800 flex-shrink-0">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about deductions, IRS rules, or specific expenses…"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || sending}
            className="bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 p-3 rounded-xl transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-600 text-xs mt-2 text-center">
          AI answers are informational only. Consult a CPA for complex situations.
        </p>
      </div>
    </div>
  )
}
