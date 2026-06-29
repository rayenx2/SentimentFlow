import { useState, useRef } from 'react'
import { analyzeSingle } from '../api'
import SentimentResult from './SentimentResult'
import styles from './SingleTab.module.css'

const EXAMPLES = [
  { label: 'Positive', cls: 'positive', text: "Just got promoted! Best day ever, can't stop smiling 😊" },
  { label: 'Negative', cls: 'negative', text: "Worst customer service I've ever experienced. Total disappointment." },
  { label: 'Neutral',  cls: 'neutral',  text: "The package arrived on Tuesday as scheduled." }
]

export default function SingleTab({ onResult }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await analyzeSingle(trimmed)
      setResult(data)
      onResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) analyze()
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h1>Sentiment Analysis</h1>
        <p>Analyze any text with SentimentFlow — RoBERTa fine-tuned on Twitter data. Press <kbd>Ctrl+Enter</kbd> to analyze.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Text Input</div>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Enter text to analyze… e.g. "This product is absolutely amazing!"'
            maxLength={1024}
          />
          <div className={styles.inputFooter}>
            <span className={styles.charCount}>{text.length} / 1024</span>
            <button className={styles.btnPrimary} onClick={analyze} disabled={loading || !text.trim()}>
              {loading ? <span className={styles.spinner} /> : 'Analyze'}
            </button>
          </div>

          <div className={styles.examples}>
            <span className={styles.examplesLabel}>Try an example:</span>
            {EXAMPLES.map(ex => (
              <button
                key={ex.cls}
                className={`${styles.chip} ${styles[ex.cls]}`}
                onClick={() => setText(ex.text)}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`${styles.card} ${styles.resultCard}`}>
          {!result && !error && !loading && (
            <div className={styles.empty}>
              <EmptyIcon />
              <p>Enter text and click <strong>Analyze</strong></p>
            </div>
          )}
          {loading && (
            <div className={styles.empty}>
              <div className={styles.loadingRing} />
              <p>Analyzing…</p>
            </div>
          )}
          {error && (
            <div className={styles.errorState}>
              <ErrorIcon />
              <p>{error}</p>
            </div>
          )}
          {result && !loading && <SentimentResult data={result} />}
        </div>
      </div>
    </div>
  )
}

function EmptyIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="24" stroke="#334155" strokeWidth="1.5" strokeDasharray="5 4"/>
      <path d="M20 28 L24 24 L28 28 L32 22 L36 28" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="17" stroke="#ef4444" strokeWidth="1.5"/>
      <path d="M13 13 L27 27 M27 13 L13 27" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
