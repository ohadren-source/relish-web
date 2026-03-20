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
  const [context, setContext] = useState<Context>('Life')
  const [wisdom, setWisdom] = useState('')
  const [loading, setLoading] = useState(false)
  const [customerId] = useState<string | null>(null)

  const freeLeft = Math.max(0, FREE_WISDOM_LIMIT - wisdomCount)

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

    // If free limit reached, redirect to payment
    if (!isSubscribed && wisdomCount >= FREE_WISDOM_LIMIT) {
      window.open(STRIPE_PAYMENT_LINK, '_blank')
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
          window.open(STRIPE_PAYMENT_LINK, '_blank')
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

      {/* ===== HEADER - sauc-e.com branding ===== */}
      <header className="sauce-header">
        <a href={SAUCE_HOME} target="_blank" rel="noopener noreferrer" className="sauce-logo-link">
          <span className="sauce-name">sauc-e</span>
          <span className="sauce-tagline"> where HOME is the </span>
          <span className="sauce-heart">❤️</span>
        </a>
        <nav className="sauce-nav">
          <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="sauce-nav-link">Check It Out Y'all</a>
          <a href={`${SAUCE_HOME}/about`} target="_blank" rel="noopener noreferrer" className="sauce-nav-link">About</a>
          <a href={`${SAUCE_HOME}/contact`} target="_blank" rel="noopener noreferrer" className="sauce-nav-link">Contact</a>
        </nav>
      </header>

      {/* ===== RELISH LOGO + TITLE ===== */}
      <div className="relish-header">
        <img src="/icon.png" alt="RELISH" className="relish-logo-image" />
        <h1 className="relish-title">RELISH</h1>
        <p className="relish-subtitle">Wisdom &amp; Clarity</p>
        <p className="relish-philosophy">Understanding = Quality / Quantity</p>
      </div>

      {/* ===== PREMIUM COUNTER ===== */}
      {!isSubscribed && (
        <div className="premium-section">
          <a
            href={STRIPE_PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`premium-pill${freeLeft === 0 ? ' urgent' : ''}`}
          >
            {freeLeft > 0
              ? `Premium · ${freeLeft} free left`
              : 'Upgrade to Premium · $9.99/mo'}
          </a>
        </div>
      )}

      {/* ===== APP FUNCTIONALITY ===== */}
      <main className="relish-content">
        <h2 className="relish-section-title">Pick a Context</h2>

        {CONTEXTS.map((c) => (
          <button
            key={c}
            className={`relish-context-btn${context === c ? ' active' : ''}`}
            onClick={() => setContext(c)}
          >
            {c}
          </button>
        ))}

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
      </main>

      {/* ===== US vs THEM ===== */}
      <div className="marketing-section">
        <img src="/relish_uvt.png" alt="RELISH Us vs Them" className="uvt-image" />
      </div>

      {/* ===== PEAK FLAVOUR ===== */}
      <div className="marketing-section">
        <img src="/relish_peak_pacakage.png" alt="Peak Flavour Premium 3,6,9" className="peak-image" />
      </div>

      {/* ===== SUBSCRIBE CTA ===== */}
      {!isSubscribed && (
        <div className="cta-section">
          <h2 className="cta-title">Peak Flavour Premium</h2>
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
