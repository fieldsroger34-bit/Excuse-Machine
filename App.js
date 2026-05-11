import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// ─── LIVE STRIPE PAYMENT LINKS ────────────────────────────────────────────────
const STRIPE_LINKS = {
  starter: "https://buy.stripe.com/14A4gB8VScjXcjQf9UfrW05",
  pro:     "https://buy.stripe.com/3cI7sNegc0Bf5Vs7HsfrW06",
  mega:    "https://buy.stripe.com/4gMaEZ2xu4RvgA67HsfrW07",
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'work',         label: 'Work',         emoji: '💼', free: true  },
  { id: 'school',       label: 'School',       emoji: '📚', free: true  },
  { id: 'relationship', label: 'Relationship', emoji: '💔', free: false },
  { id: 'social',       label: 'Social',       emoji: '🎉', free: false },
  { id: 'family',       label: 'Family',       emoji: '🏠', free: false },
  { id: 'health',       label: 'Health',       emoji: '🏥', free: false },
  { id: 'money',        label: 'Money',        emoji: '💸', free: false },
  { id: 'legal',        label: 'Legal',        emoji: '⚖️', free: false },
];

// ─── FREE EXCUSE POOL (no API needed) ─────────────────────────────────────────
const FREE_EXCUSES = {
  work: [
    "My internet went down right as I was sending the file — I have the screenshots to prove it.",
    "I had an unexpected medical appointment that couldn't be rescheduled.",
    "There was a family emergency I had to attend to immediately.",
    "My laptop did a forced Windows update and wiped my unsaved work.",
    "I was stuck in traffic for 2 hours due to an accident on the highway.",
    "I had a severe migraine that made it impossible to look at screens.",
    "My childcare fell through last minute and I had no backup.",
    "I got food poisoning — it came on suddenly and was brutal.",
  ],
  school: [
    "My printer ran out of ink at midnight and no stores were open.",
    "I was at the hospital with a family member until 3am.",
    "I submitted it to the wrong folder on the portal — here's the corrected version.",
    "I had a severe allergic reaction and was in the ER.",
    "My dog got into my bag and destroyed my printed work.",
    "There was a power outage in my neighborhood for 6 hours.",
    "I mixed up the due date — it showed differently on my calendar app.",
    "I had to work an emergency shift at my job to avoid losing it.",
  ],
};

// ─── CLAUDE API CALL ──────────────────────────────────────────────────────────
async function generatePremiumExcuse(category, context) {
  const categoryLabel = CATEGORIES.find(c => c.id === category)?.label || category;
  const prompt = context
    ? `Generate a single, highly convincing and detailed excuse for the ${categoryLabel} category. Context: "${context}". Make it specific, believable, emotionally resonant, and hard to question. Include a plausible detail or two. Do NOT use quotation marks. Just the excuse text, nothing else.`
    : `Generate a single, highly convincing and detailed excuse for the ${categoryLabel} category. Make it specific, believable with a realistic detail, emotionally resonant, and hard to question. Do NOT use quotation marks. Just the excuse text, nothing else.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  const text = data.content?.find(b => b.type === 'text')?.text || '';
  return text.trim();
}

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
const STORAGE_KEY = 'excusemachine_state';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ─── PACKAGES ─────────────────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 5,
    price: '$0.99',
    perCredit: '$0.20',
    tag: '',
    desc: 'Perfect for trying premium',
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 20,
    price: '$2.99',
    perCredit: '$0.15',
    tag: 'MOST POPULAR',
    desc: 'Best for regular use',
  },
  {
    id: 'mega',
    name: 'Mega',
    credits: 60,
    price: '$6.99',
    perCredit: '$0.12',
    tag: 'BEST VALUE',
    desc: 'Power user pack',
  },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [credits, setCredits] = useState(0);
  const [freeUsed, setFreeUsed] = useState(0);
  const [category, setCategory] = useState('work');
  const [context, setContext] = useState('');
  const [excuse, setExcuse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('generate'); // 'generate' | 'history'
  const [showCreditsAdded, setShowCreditsAdded] = useState(false);

  const FREE_LIMIT = 3;

  // ── Load persisted state ──
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setCredits(saved.credits || 0);
      setFreeUsed(saved.freeUsed || 0);
      setHistory(saved.history || []);
    }
  }, []);

  // ── Handle return from Stripe ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pkg = params.get('pkg');
    if (pkg) {
      const creditMap = { starter: 5, pro: 20, mega: 60 };
      const added = creditMap[pkg] || 0;
      if (added > 0) {
        setCredits(prev => {
          const next = prev + added;
          saveState({ credits: next, freeUsed, history });
          return next;
        });
        setShowCreditsAdded(added);
        setTimeout(() => setShowCreditsAdded(false), 4000);
      }
      window.history.replaceState({}, '', '/');
    }
  // eslint-disable-next-line
  }, []);

  // ── Persist on change ──
  useEffect(() => {
    saveState({ credits, freeUsed, history });
  }, [credits, freeUsed, history]);

  const selectedCat = CATEGORIES.find(c => c.id === category);
  const isPremiumCat = !selectedCat?.free;
  const hasCredits = credits > 0;
  const canUseFree = freeUsed < FREE_LIMIT && !isPremiumCat;

  const handleGenerate = useCallback(async () => {
    setError('');
    setExcuse('');
    setCopied(false);

    // Premium category gate
    if (isPremiumCat && !hasCredits) {
      setShowPaywall(true);
      return;
    }
    // Free category but trial used up
    if (!isPremiumCat && freeUsed >= FREE_LIMIT && !hasCredits) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);

    try {
      let result;
      if (!isPremiumCat && freeUsed < FREE_LIMIT) {
        // Free path — use local pool
        const pool = FREE_EXCUSES[category] || FREE_EXCUSES.work;
        const usedSet = new Set(history.filter(h => h.category === category).map(h => h.text));
        const unused = pool.filter(e => !usedSet.has(e));
        result = unused.length > 0
          ? unused[Math.floor(Math.random() * unused.length)]
          : pool[Math.floor(Math.random() * pool.length)];
        setFreeUsed(prev => prev + 1);
      } else {
        // Premium path — Claude API
        result = await generatePremiumExcuse(category, context);
        setCredits(prev => prev - 1);
      }

      setExcuse(result);
      const entry = { text: result, category, timestamp: Date.now(), premium: isPremiumCat || freeUsed >= FREE_LIMIT };
      setHistory(prev => [entry, ...prev].slice(0, 50));
    } catch (e) {
      setError('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [category, context, credits, freeUsed, hasCredits, history, isPremiumCat]);

  const handleCopy = () => {
    const text = `${excuse}\n\n— Generated by ExcuseMachine™ at aivaultco.com`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const freeLeft = Math.max(0, FREE_LIMIT - freeUsed);

  return (
    <div className="app">
      {/* ── Credits-added toast ── */}
      {showCreditsAdded && (
        <div className="toast toast--success">
          ✅ {showCreditsAdded} credits added to your account!
        </div>
      )}

      {/* ── Header ── */}
      <header className="header">
        <div className="header__logo">
          <span className="header__icon">💬</span>
          <span className="header__wordmark">ExcuseMachine™</span>
        </div>
        <div className="header__meta">
          {credits > 0 && (
            <span className="credits-badge">{credits} credit{credits !== 1 ? 's' : ''}</span>
          )}
          {credits === 0 && freeLeft > 0 && (
            <span className="free-badge">{freeLeft} free left</span>
          )}
          <a href={STRIPE_LINKS.pro} className="btn btn--sm btn--outline" target="_blank" rel="noreferrer">
            Get Credits
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__eyebrow">AI-POWERED · INSTANT · UNDETECTABLE</div>
        <h1 className="hero__title">THE PERFECT EXCUSE<br /><span>EVERY TIME.</span></h1>
        <p className="hero__sub">Professional-grade excuses generated by AI. Work, school, relationships, and more.</p>
      </section>

      {/* ── Tabs ── */}
      <div className="tabs">
        <button className={`tab ${tab === 'generate' ? 'tab--active' : ''}`} onClick={() => setTab('generate')}>Generate</button>
        <button className={`tab ${tab === 'history' ? 'tab--active' : ''}`} onClick={() => setTab('history')}>
          History {history.length > 0 && <span className="tab-count">{history.length}</span>}
        </button>
      </div>

      {/* ── Main Content ── */}
      <main className="main">

        {tab === 'generate' && (
          <>
            {/* Category grid */}
            <div className="section-label">SELECT SITUATION</div>
            <div className="cat-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`cat-btn ${category === cat.id ? 'cat-btn--active' : ''} ${!cat.free ? 'cat-btn--premium' : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <span className="cat-emoji">{cat.emoji}</span>
                  <span className="cat-label">{cat.label}</span>
                  {!cat.free && <span className="cat-lock">⚡</span>}
                </button>
              ))}
            </div>

            {/* Context input */}
            <div className="section-label" style={{marginTop: '24px'}}>ADD CONTEXT <span className="optional">(OPTIONAL)</span></div>
            <textarea
              className="context-input"
              placeholder={`E.g. "I need to skip the meeting at 2pm" or "I'm 3 hours late to work"`}
              value={context}
              onChange={e => setContext(e.target.value)}
              rows={2}
              maxLength={200}
            />

            {/* Generate button */}
            <button
              className={`btn btn--generate ${loading ? 'btn--loading' : ''}`}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-row"><span className="spinner" /> Generating...</span>
              ) : (
                <>⚡ Generate Excuse</>
              )}
            </button>

            {/* Free trial indicator */}
            {!isPremiumCat && credits === 0 && (
              <div className="trial-bar">
                <div className="trial-dots">
                  {[0,1,2].map(i => (
                    <span key={i} className={`trial-dot ${i < freeUsed ? 'trial-dot--used' : ''}`} />
                  ))}
                </div>
                <span className="trial-text">
                  {freeLeft > 0 ? `${freeLeft} free trial${freeLeft > 1 ? 's' : ''} remaining` : 'Free trials used — get credits to continue'}
                </span>
              </div>
            )}

            {/* Error */}
            {error && <div className="error-msg">{error}</div>}

            {/* Result card */}
            {excuse && (
              <div className="result-card">
                <div className="result-card__header">
                  <span className="result-label">YOUR EXCUSE</span>
                  <span className="result-cat">{CATEGORIES.find(c => c.id === category)?.emoji} {CATEGORIES.find(c => c.id === category)?.label}</span>
                </div>
                <p className="result-text">{excuse}</p>
                <div className="result-actions">
                  <button className="btn btn--copy" onClick={handleCopy}>
                    {copied ? '✅ Copied!' : '📋 Copy'}
                  </button>
                  <button className="btn btn--regen btn--outline" onClick={handleGenerate} disabled={loading}>
                    🔄 Regenerate
                  </button>
                </div>
                <div className="result-watermark">Generated by ExcuseMachine™ · aivaultco.com</div>
              </div>
            )}
          </>
        )}

        {tab === 'history' && (
          <div className="history">
            {history.length === 0 ? (
              <div className="history-empty">
                <span>💬</span>
                <p>No excuses generated yet.<br />Go generate your first one!</p>
                <button className="btn btn--outline" onClick={() => setTab('generate')}>Generate Now</button>
              </div>
            ) : (
              history.map((item, i) => (
                <div key={i} className="history-card">
                  <div className="history-card__meta">
                    <span>{CATEGORIES.find(c => c.id === item.category)?.emoji} {CATEGORIES.find(c => c.id === item.category)?.label}</span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p>{item.text}</p>
                  <button className="btn btn--sm btn--outline" onClick={() => {
                    navigator.clipboard.writeText(`${item.text}\n\n— Generated by ExcuseMachine™ at aivaultco.com`);
                  }}>Copy</button>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ── Paywall Modal ── */}
      {showPaywall && (
        <div className="modal-overlay" onClick={() => setShowPaywall(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setShowPaywall(false)}>✕</button>
            <div className="modal__icon">⚡</div>
            <h2 className="modal__title">Unlock Premium Excuses</h2>
            <p className="modal__sub">AI-crafted, hyper-specific, undetectable excuses for any situation.</p>

            <div className="packages">
              {PACKAGES.map(pkg => (
                <a
                  key={pkg.id}
                  href={`${STRIPE_LINKS[pkg.id]}?client_reference_id=pkg_${pkg.id}&success_url=https://aivaultco.com?pkg=${pkg.id}`}
                  className={`package ${pkg.tag ? 'package--featured' : ''}`}
                  target="_self"
                  rel="noreferrer"
                >
                  {pkg.tag && <div className="package__tag">{pkg.tag}</div>}
                  <div className="package__name">{pkg.name}</div>
                  <div className="package__credits">{pkg.credits} Credits</div>
                  <div className="package__price">{pkg.price}</div>
                  <div className="package__per">{pkg.perCredit} per excuse</div>
                  <div className="package__cta">Get {pkg.name} →</div>
                </a>
              ))}
            </div>

            <p className="modal__guarantee">🔒 Secure payment via Stripe · Instant delivery · No subscription</p>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer__links">
          <button className="footer__link" onClick={() => setShowPaywall(true)}>Get Credits</button>
          <span>·</span>
          <a href="mailto:support@aivaultco.com" className="footer__link">Support</a>
        </div>
        <div className="footer__copy">© 2025 AIVaultCo · ExcuseMachine™ · All Rights Reserved</div>
      </footer>
    </div>
  );
}
