import { useState } from 'react'
import { analyzeBatch } from '../api'
import styles from './BatchTab.module.css'

export default function BatchTab({ onResults }) {
  const [queue, setQueue] = useState([])
  const [singleInput, setSingleInput] = useState('')
  const [pasteInput, setPasteInput] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addOne = () => {
    const text = singleInput.trim()
    if (!text || queue.length >= 100) return
    setQueue(prev => [...prev, text])
    setSingleInput('')
  }

  const importPaste = () => {
    const lines = pasteInput.split('\n').map(l => l.trim()).filter(Boolean)
    const remaining = 100 - queue.length
    setQueue(prev => [...prev, ...lines.slice(0, remaining)])
    setPasteInput('')
  }

  const removeItem = (i) => setQueue(prev => prev.filter((_, idx) => idx !== i))

  const analyze = async () => {
    if (queue.length === 0) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const data = await analyzeBatch([...queue])
      setResults(data.results)
      onResults(data.results)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h1>Batch Analysis</h1>
        <p>Analyze up to 100 texts at once. Add them one by one or paste newline-separated.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.addRow}>
            <textarea
              className={styles.textarea}
              value={singleInput}
              onChange={e => setSingleInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addOne() } }}
              placeholder="Add a text… (Enter to add)"
            />
            <button className={styles.btnSecondary} onClick={addOne}>Add</button>
          </div>

          <div className={styles.separator}><span>or paste multiple (one per line)</span></div>

          <div className={styles.pasteRow}>
            <textarea
              className={styles.textarea}
              value={pasteInput}
              onChange={e => setPasteInput(e.target.value)}
              placeholder="Paste multiple texts here, one per line…"
            />
            <button className={styles.btnSecondary} onClick={importPaste}>Import</button>
          </div>

          <div className={styles.queue}>
            {queue.length === 0
              ? <div className={styles.queueEmpty}>No texts added yet.</div>
              : queue.map((text, i) => (
                <div key={i} className={styles.queueItem}>
                  <span className={styles.queueNum}>{i + 1}</span>
                  <span className={styles.queueText} title={text}>{text}</span>
                  <button className={styles.removeBtn} onClick={() => removeItem(i)}>×</button>
                </div>
              ))
            }
          </div>

          <div className={styles.actions}>
            <span className={styles.queueCount}>{queue.length} texts</span>
            <button className={styles.btnGhost} onClick={() => setQueue([])}>Clear all</button>
            <button className={styles.btnPrimary} onClick={analyze} disabled={loading || queue.length === 0}>
              {loading ? <span className={styles.spinner} /> : 'Analyze All'}
            </button>
          </div>
        </div>

        <div className={`${styles.card} ${styles.resultsCard}`}>
          {!results && !error && !loading && (
            <div className={styles.empty}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="24" stroke="#334155" strokeWidth="1.5" strokeDasharray="5 4"/>
                <path d="M16 28h24M22 22l6 6-6 6" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Add texts and click <strong>Analyze All</strong></p>
            </div>
          )}
          {loading && (
            <div className={styles.empty}>
              <div className={styles.loadingRing} />
              <p>Analyzing {queue.length} texts…</p>
            </div>
          )}
          {error && <div className={styles.empty} style={{color:'var(--negative)'}}><p>{error}</p></div>}
          {results && (
            <div className={styles.resultsList}>
              {results.map((r, i) => (
                <div key={i} className={styles.resultItem}>
                  <span className={styles.resultNum}>{i + 1}</span>
                  <div className={styles.resultBody}>
                    <div className={styles.resultText} title={r.text}>{r.text}</div>
                    <div className={styles.resultMeta}>
                      <span className={`${styles.badge} ${styles[r.sentiment]}`}>{capitalize(r.sentiment)}</span>
                      <span className={styles.confText}>{Math.round(r.confidence * 100)}% confidence</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : s }
