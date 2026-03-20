import { useState, useEffect } from 'react'
import './App.css'

// ============================================================================
// BACKEND URL (Only this - no API keys in app!)
// ============================================================================

const BACKEND_URL = 'https://sauc-e-backend-production.up.railway.app'

const FREE_WISDOM_LIMIT = 9

type Context = 'Life' | 'Career' | 'Relationships' | 'Health' | 'Money'

const CONTEXTS: Context[] = ['Life', 'Career', 'Relationships', 'Health', 'Money']

function App() {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isSubscribed] = useState(false)
  const [wisdomCount, setWisdomCount] = useState(0)
  const [situation, setSituation] = useState('')
  const [context, setContext] = useState<Context>('Life')
  const [wisdom, setWisdom] = useState('')
  const [loading, setLoading] = useState(false)
  const [customerId] = useState<string | null>(null)

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    syncUsageCount('web-user')
  }, [])

  async function syncUsageCount(cid: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/relish/usage-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: cid || 'anonymous' }),
      })
      if (response.ok) {
        const data = await response.json()
        setWisdomCount(data.usageCount || 0)
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'unknown'
      console.log('Usage sync skipped:', msg)
    }
  }

  // ============================================================================
  // GET WISDOM (Calls backend, NOT Claude directly)
  // ============================================================================

  async function handleGetWisdom() {
    if (!situation.trim()) {
      alert('Please describe your situation')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/relish/get-wisdom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId || 'anonymous',
          situation: situation,
          context: context,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 403) {
          alert('Limit Reached — Upgrade to Premium for unlimited wisdom')
          return
        }

        throw new Error(errorData.error || 'Failed to get wisdom')
      }

      const data = await response.json()
      setWisdom(data.wisdom)
      setWisdomCount((prev) => prev + 1)
      setSituation('')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to process request'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="relish-container">
      <header className="relish-header">
        <h1 className="relish-title">RELISH</h1>
        <p className="relish-subtitle">Wisdom &amp; Clarity</p>
        <p className="relish-philosophy">Understanding = Quality / Quantity</p>
      </header>

      {!isSubscribed && wisdomCount > 0 && (
        <div className="relish-usage">
          <span className="relish-usage-text">
            {Math.max(0, FREE_WISDOM_LIMIT - wisdomCount)} free remaining
          </span>
        </div>
      )}

      <main className="relish-content">
        <h2 className="relish-section-title">Pick a Context</h2>
        <div className="relish-contexts">
          {CONTEXTS.map((c) => (
            <button
              key={c}
              className={`relish-context-btn${context === c ? ' active' : ''}`}
              onClick={() => setContext(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <h2 className="relish-section-title">Your Situation</h2>
        <textarea
          className="relish-input"
          placeholder="Describe what's on your mind..."
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          rows={4}
        />

        <button
          className={`relish-wisdom-btn${loading ? ' disabled' : ''}`}
          onClick={handleGetWisdom}
          disabled={loading}
        >
          {loading ? 'Seeking wisdom...' : 'Get Wisdom'}
        </button>

        {wisdom && (
          <div className="relish-wisdom-box">
            <h3 className="relish-wisdom-title">Wisdom</h3>
            <p className="relish-wisdom-text">{wisdom}</p>
          </div>
        )}

        <footer className="relish-footer">
          <p className="relish-footer-main">Runs on RELISH Sauce 🔥 🥗</p>
          <p className="relish-footer-small">RELISH is for Feelings</p>
          <p className="relish-footer-small">
            Sample: CATSUP (Learning) · BBQE (Safety)
          </p>
        </footer>
      </main>
    </div>
  )
}

export default App
