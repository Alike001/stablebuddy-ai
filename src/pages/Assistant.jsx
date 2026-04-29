import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../utils/useStore.js'
import { addChatMessage, clearChat } from '../utils/storage.js'
import {
  answerQuestion,
  estimateStreamMs,
  resolveSource,
  SUGGESTED_PROMPTS,
} from '../utils/mockAI.js'
import { shortId } from '../utils/format.js'

function SourcesRow({ sources }) {
  if (!sources || sources.length === 0) return null
  return (
    <div className="chat-sources">
      <span className="muted small">Grounded in:</span>
      {sources.map((s, idx) => {
        const r = resolveSource(s)
        if (!r) return null
        if (r.href) {
          return (
            <Link key={idx} to={r.href} className="chat-source-pill">
              {r.label}
              {r.hint && <span className="muted small"> · {r.hint}</span>}
            </Link>
          )
        }
        return (
          <span key={idx} className="chat-source-pill">
            {r.label}
            {r.hint && <span className="muted small"> · {r.hint}</span>}
          </span>
        )
      })}
    </div>
  )
}

export default function Assistant() {
  const chat = useStore((s) => s.chat)
  const [input, setInput] = useState('')
  const [draft, setDraft] = useState(null) // { text, fullText, sources, suggestions }
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chat, draft])

  useEffect(() => () => {
    if (streamRef.current) clearInterval(streamRef.current)
  }, [])

  const sendQuestion = (raw) => {
    const text = (raw ?? input).trim()
    if (!text || streaming) return

    addChatMessage({
      id: shortId('msg'),
      role: 'user',
      text,
      ts: Date.now(),
    })
    setInput('')

    const reply = answerQuestion(text)
    const totalMs = estimateStreamMs(reply.text)
    const startedAt = performance.now()
    setDraft({ text: '', ...reply })
    setStreaming(true)

    if (streamRef.current) clearInterval(streamRef.current)
    streamRef.current = setInterval(() => {
      const elapsed = performance.now() - startedAt
      const progress = Math.min(1, elapsed / totalMs)
      const cutoff = Math.floor(reply.text.length * progress)
      setDraft((d) => (d ? { ...d, text: reply.text.slice(0, cutoff) } : d))
      if (progress >= 1) {
        clearInterval(streamRef.current)
        streamRef.current = null
        addChatMessage({
          id: shortId('msg'),
          role: 'ai',
          text: reply.text,
          sources: reply.sources || [],
          suggestions: reply.suggestions || [],
          ts: Date.now(),
        })
        setDraft(null)
        setStreaming(false)
      }
    }, 28)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    sendQuestion()
  }

  const onClear = () => {
    if (streamRef.current) clearInterval(streamRef.current)
    streamRef.current = null
    setDraft(null)
    setStreaming(false)
    clearChat()
  }

  const showWelcome = chat.length === 0 && !draft

  return (
    <div className="container page assistant-page">
      <header className="assistant-head">
        <div>
          <span className="badge">AI buddy</span>
          <h1 className="page-title">Ask StableBuddy</h1>
          <p className="muted">
            A grounded assistant that explains stablecoins, risks, and how
            payments work. No real API — answers come from the curated
            knowledge base in this repo.
          </p>
        </div>
        {chat.length > 0 && (
          <button className="btn btn-ghost" onClick={onClear}>
            Clear chat
          </button>
        )}
      </header>

      <div className="card chat-card">
        <div className="chat-scroll" ref={scrollRef}>
          {showWelcome && (
            <div className="chat-welcome">
              <div className="chat-welcome-icon" aria-hidden>🤖</div>
              <h2 className="chat-welcome-title">Hi, I'm StableBuddy.</h2>
              <p className="muted">
                Ask me about a stablecoin, a DeFi term, or how to use the app.
                I'll show you where my answer comes from.
              </p>
              <div className="chat-suggestions">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="chat-suggestion"
                    onClick={() => sendQuestion(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chat.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.role === 'user' ? 'is-user' : 'is-ai'}`}
            >
              <div className="chat-bubble-role">
                {msg.role === 'user' ? 'You' : 'StableBuddy'}
              </div>
              <div className="chat-bubble-text">{msg.text}</div>
              {msg.role === 'ai' && <SourcesRow sources={msg.sources} />}
              {msg.role === 'ai' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="chat-suggestions chat-suggestions-inline">
                  {msg.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="chat-suggestion"
                      onClick={() => sendQuestion(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {draft && (
            <div className="chat-bubble is-ai is-streaming">
              <div className="chat-bubble-role">StableBuddy</div>
              <div className="chat-bubble-text">
                {draft.text}
                <span className="chat-cursor" aria-hidden>▍</span>
              </div>
            </div>
          )}
        </div>

        <form className="chat-form" onSubmit={onSubmit}>
          <input
            type="text"
            className="send-input chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a coin, a term, or how to use StableBuddy…"
            disabled={streaming}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={streaming || !input.trim()}
          >
            {streaming ? 'Thinking…' : 'Send'}
          </button>
        </form>
      </div>

      <p className="muted small assistant-foot">
        StableBuddy doesn't call any external LLM. The matcher reads{' '}
        <span className="mono">src/data/faqs.js</span>,{' '}
        <span className="mono">src/data/glossary.js</span>, and the risk engine
        — answers always come back to a source you can audit.
      </p>
    </div>
  )
}
