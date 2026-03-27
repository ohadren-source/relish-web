import { useState, useEffect } from 'react'
import './App.css'

// ============================================================================
// BACKEND URL (Only this - no API keys in app!)
// ============================================================================

const BACKEND_URL = 'https://sauc-e-backend-production.up.railway.app'

const FREE_LESSON_LIMIT = 9

// Payment & external links
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/28E00l3HOg638gA6hxa3u00'
const SAUCE_HOME = 'https://sauc-e.com'
const CHECKOUT_URL = 'https://sauc-e.com/checkitout'
const PRIVACY_POLICY_URL = 'https://docs.google.com/document/d/1AxzEmZn2AjEY7ry6HSM1S6mlB3ggs0SN'

type Context = 'Life' | 'Career' | 'Relationships' | 'Health' | 'Money'

const CONTEXTS: Context[] = ['Life', 'Career', 'Relationships', 'Health', 'Money']

function App() {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isSubscribed] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('subscribed') === 'true') {
      localStorage.setItem('sauce_premium', 'true')
    }
    return localStorage.getItem('sauce_premium') === 'true'
  })
  const [lessonCount, setLessonCount] = useState(0)
  const [question, setQuestion] = useState('')
  const [context, setContext] = useState<Context>('Life')
  const [lesson, setLesson] = useState('')
  const [askedQuestion, setAskedQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [customerId] = useState<string | null>(null)

  const freeLeft = Math.max(0, FREE_LESSON_LIMIT - lessonCount)

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
        setLessonCount(data.usageCount || 0)
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'unknown'
      console.log('Usage sync skipped:', msg)
    }
  }

  // ============================================================================
  // GET WISDOM — QUESTION STREAMS FIRST
  // ============================================================================

  async function handleAsk() {
    if (!question.trim()) {
      alert('Please tell me the situation')
      return
    }

    if (!isSubscribed && lessonCount >= FREE_LESSON_LIMIT) {
      window.open(STRIPE_PAYMENT_LINK, '_blank')
      return
    }

    setLoading(true)
    const submittedQuestion = question.trim()

    // QUESTION APPEARS IMMEDIATELY — BEFORE WISDOM LOADS
    setAskedQuestion(submittedQuestion)
    setLesson('')

    try {
      const response = await fetch(`${BACKEND_URL}/api/relish/get-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId || 'anonymous',
          situation: submittedQuestion,
          context: context,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 403) {
          window.open(STRIPE_PAYMENT_LINK, '_blank')
          return
        }
        throw new Error(errorData.error || 'Failed to get wisdom')
      }

      const data = await response.json()
      setLesson(data.wisdom || data.lesson)
      setLessonCount((prev) => prev + 1)
      setQuestion('')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to process request'
      alert(msg)
      setAskedQuestion('')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAsk()
    }
  }

  // ============================================================================
  // RENDER — Straight to main app (no Landing for now)
  // ============================================================================

  return (
    <div className="relish-page">

      {/* sauc-e HEADER */}
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

      <div className="relish-container">

        <header className="relish-header">
          <h1 className="relish-title">RELISH</h1>
          <p className="relish-subtitle">Feel Through Questions</p>
          <p className="relish-philosophy">Understanding = Questions / Ego</p>
        </header>

        {!isSubscribed && (
          <div className="premium-section">
            <a
              href={STRIPE_PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={`premium-pill${freeLeft === 0 ? ' premium-pill-urgent' : ''}`}
            >
              {freeLeft > 0 ? `Premium · ${freeLeft} free left` : 'Upgrade to Premium · $9.99/mo'}
            </a>
          </div>
        )}

        <main className="relish-content">

          <h2 className="relish-section-title">Pick a Feeling Area</h2>
          <div className="relish-contexts">
            {CONTEXTS.map((c) => (
              <button
                key={c}
                className={`relish-context-pill${context === c ? ' active' : ''}`}
                onClick={() => setContext(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <h2 className="relish-section-title">Your Situation</h2>
          <textarea
            className="relish-input"
            placeholder="Tell me the situation..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
          />

          <button
            className={`relish-ask-btn${loading ? ' disabled' : ''}`}
            onClick={handleAsk}
            disabled={loading}
          >
            {loading ? 'Getting Wisdom...' : 'Get Wisdom'}
          </button>

          {/* QUESTION STREAMS FIRST */}
          {askedQuestion && (
            <div className="relish-lesson-box">
              <p className="relish-you-asked">You asked:</p>
              <p className="relish-asked-question">"{askedQuestion}"</p>
              <hr className="relish-divider" />

              {lesson ? (
                <p className="relish-lesson-text">{lesson}</p>
              ) : (
                <p className="relish-lesson-text loading-text">
                  The chef is cooking your relish… stay with the feeling.
                </p>
              )}

              <div className="relish-card-footer">
                <p className="relish-card-footer-line">
                  Feelings = Questions / ego.&nbsp;&nbsp;ego = salt.&nbsp;&nbsp;Necessary for flavor.
                </p>
                <p className="relish-card-footer-line">
                  Too much ego?&nbsp;&nbsp;Too salty! :p&nbsp;&nbsp;Stay Curious. Don't worry, the cat is safe :)
                </p>
                <div className="relish-card-footer-links">
                  <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="relish-card-footer-link">
                    Privacy Policy
                  </a>
                  <span className="relish-card-footer-sep">·</span>
                  <a href={`${SAUCE_HOME}/terms`} target="_blank" rel="noopener noreferrer" className="relish-card-footer-link">
                    Terms of Use
                  </a>
                </div>
                <p className="relish-card-footer-line relish-card-footer-brought">Brought to you by sauc-e</p>
                <p className="relish-card-footer-line relish-card-footer-prepared">Prepared by Rilie Ravena Rivers</p>
              </div>
            </div>
          )}

        </main>

        {/* Marketing + CTA + Legal + Footer */}
        <section className="relish-marketing">
          <img src="/catsup_uvt.png" alt="RELISH" className="relish-marketing-img" />
          <img src="/catsup_peak.png" alt="RELISH" className="relish-marketing-img" />
        </section>

        {!isSubscribed && (
          <section className="relish-cta-section">
            <h2 className="relish-cta-title">Feelings That Actually Get Heard</h2>
            <p className="relish-cta-subtitle">Unlimited situations. $9.99/month.</p>
            <p className="relish-cta-tagline">They give answers. We help you feel and grow.</p>
            <a href={STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer" className="relish-cta-btn">
              Subscribe at sauc-e.com
            </a>
          </section>
        )}

        <div className="relish-legal">
          <a href={`${SAUCE_HOME}/terms`} target="_blank" rel="noopener noreferrer" className="relish-legal-link">Terms of Service</a>
          <span className="relish-legal-sep"> · </span>
          <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="relish-legal-link">Privacy Policy</a>
          <span className="relish-legal-sep"> · </span>
          <a href={`${SAUCE_HOME}/support`} target="_blank" rel="noopener noreferrer" className="relish-legal-link">Support</a>
        </div>

        <footer className="relish-footer">
          <a href={SAUCE_HOME} target="_blank" rel="noopener noreferrer" className="relish-footer-brand">sauc-e.com</a>
          <p className="relish-footer-tagline">HOME of all of our delicious APPS</p>
          <p className="relish-footer-small">RELISH is for Feelings</p>
          <p className="relish-footer-small">CATSUP (Learning) · BBQE (Safety)</p>
          <p className="relish-footer-tiny">© 2026 3_6_NIFE.pi · 36Nife@gmail.com</p>
        </footer>

      </div>
    </div>
  )
}

export default App