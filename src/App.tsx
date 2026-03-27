import { useState, useEffect } from 'react'
import './App.css'

// ============================================================================
// BACKEND URL (Only this - no API keys in app!)
// ============================================================================

const BACKEND_URL = 'https://sauc-e-backend-production.up.railway.app'

const FREE_WISDOM_LIMIT = 9

// Payment & external links
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/28E00l3HOg638gA6hxa3u00'
const SAUCE_HOME = 'https://sauc-e.com'
const CHECKOUT_URL = 'https://sauc-e.com/checkitout'

type Context = 'Life' | 'Career' | 'Relationships' | 'Health' | 'Money'

const CONTEXTS: Context[] = ['Life', 'Career', 'Relationships', 'Health', 'Money']

function App() {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isSubscribed] = useState(false)
  const [wisdomCount, setWisdomCount] = useState(0)
  const [situation, setSituation] = useState('')
  const [askedSituation, setAskedSituation] = useState('') // THE MIRROR STATE
  const [context, setContext] = useState<Context>('Life')
  const [wisdom, setWisdom] = useState('')
  const [loading, setLoading] = useState(false)
  const [customerId] = useState<string | null>(null)

  const freeLeft = Math.max(0, FREE_WISDOM_LIMIT - wisdomCount)

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    // Basic hit count logic
    const saved = localStorage.getItem('sauc_e_relish_hits')
    if (saved) {
      setWisdomCount(parseInt(saved, 10))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sauc_e_relish_hits', wisdomCount.toString())
  }, [wisdomCount])

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleGetWisdom = async () => {
    if (!situation.trim()) return
    if (!isSubscribed && wisdomCount >= FREE_WISDOM_LIMIT) {
      alert('You have used all your free wisdom for now. Please subscribe to continue.')
      return
    }

    setLoading(true)
    setWisdom('')

    try {
      const response = await fetch(`${BACKEND_URL}/relish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation,
          context,
          customerId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch from backend')
      }

      const data = await response.json()
      setWisdom(data.wisdom)
      setAskedSituation(situation) // CAPTURE THE MIRROR
      setWisdomCount((prev) => prev + 1)
      setSituation('') // CLEAR THE INPUT
    } catch (err) {
      console.error(err)
      setWisdom("The chef is having a bit of trouble... please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGetWisdom()
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="relish-app-container">
      {/* ===== HEADER ===== */}
      <header className="relish-header">
        <div className="relish-logo-container">
          <img src="/logo.png" alt="Relish Logo" className="relish-logo" />
        </div>
        <h1 className="relish-title">RELISH</h1>
        <p className="relish-subtitle">For your feelings... what's the sitch?</p>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="relish-main">
        <div className="relish-input-card">
          <label className="relish-label">SELECT CONTEXT:</label>
          <div className="relish-context-buttons">
            {CONTEXTS.map((c) => (
              <button
                key={c}
                onClick={() => setContext(c)}
                className={`relish-context-btn ${context === c ? 'active' : ''}`}
              >
                {c}
              </button>
            ))}
          </div>

          <label className="relish-label">TELL ME EVERYTHING:</label>
          <textarea
            className="relish-textarea"
            placeholder="Type your situation here..."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            onKeyDown={handleKeyPress}
          />

          <button
            className="relish-submit-btn"
            onClick={handleGetWisdom}
            disabled={loading}
          >
            {loading ? 'GETTING SAUCY...' : 'GET WISDOM'}
          </button>

          {!isSubscribed && (
            <p className="relish-counter">
              Free wisdom remaining: <strong>{freeLeft}</strong>
            </p>
          )}
        </div>

        {/* ===== THE MIRROR WISDOM BOX ===== */}
        {wisdom && (
          <div className="relish-wisdom-box animate-pop-in">
            <p className="relish-you-asked">YOU ASKED:</p>
            <p className="relish-asked-question">"{askedSituation}"</p>
            <hr className="relish-divider" />
            <div className="relish-wisdom-content">
              <p className="relish-wisdom-text">{wisdom}</p>
            </div>
            <p className="relish-footer-note">Too much ego? Too salty! :p Stay Curious.</p>
          </div>
        )}
      </main>

      {/* ===== UPSELL (only if not subscribed and limit reached) ===== */}
      {!isSubscribed && wisdomCount >= FREE_WISDOM_LIMIT && (
        <div className="relish-upsell-card">
          <h2 className="cta-title">Hungry for more?</h2>
          <p className="cta-subtitle">Unlimited wisdom. $9.99/month.</p>
          <p className="cta-hotdog">$9.99 &lt; 3 hot dogs + tax</p>
          <a
            href={STRIPE_PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button"
          >
            Subscribe at sauc-e.com
          </a>
        </div>
      )}

      {/* ===== LEGAL ===== */}
      <div className="legal-section">
        <a href={`${SAUCE_HOME}/terms`} target="_blank" rel="noopener noreferrer" className="legal-link">Terms of Service</a>
        <span className="legal-separator">  ·  </span>
        <a href="https://docs.google.com/document/d/1AxzEmZn2AjEY7ry6HSM1S6mlB3ggs0SN" target="_blank" rel="noopener noreferrer" className="legal-link">Privacy Policy</a>
        <span className="legal-separator">  ·  </span>
        <a href={`${SAUCE_HOME}/support`} target="_blank" rel="noopener noreferrer" className="legal-link">Support</a>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="relish-footer">
        <a href={SAUCE_HOME} target="_blank" rel="noopener noreferrer" className="footer-brand">sauc-e.com</a>
        <p className="footer-tagline">HOME of all of our delicious APPS</p>
        <p className="footer-small">RELISH is for Feelings</p>
        <p className="footer-small">CATSUP (Learning) · BBQE (Safety)</p>
        <p className="footer-tiny">© 2026 3_6_NIFE.pi · 36Nife@gmail.com</p>
      </footer>
    </div>
  )
}

export default App