import { useState } from 'react'
import styles from './HistoryTab.module.css'

const FILTERS = ['all', 'positive', 'neutral', 'negative']

export default function HistoryTab({ history, onClear }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? history : history.filter(h => h.sentiment === filter)

  const counts = history.reduce((acc, h) => {
    acc[h.sentiment] = (acc[h.sentiment] || 0) + 1
    return acc
  }, {})

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h1>Analysis History</h1>
        <p>Session history of all analyzed texts — {history.length} total.</p>
      </div>

      {history.length > 0 && (
        <div className={styles.stats}>
          <StatCard label="Total" value={history.length} color="accent" />
          <StatCard label="Positive" value={counts.positive || 0} color="positive" />
          <StatCard label="Neutral"  value={counts.neutral  || 0} color="neutral"  />
          <StatCard label="Negative" value={counts.negative || 0} color="negative" />
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                onClick={() => setFilter(f)}
              >
                {capitalize(f)}
              </button>
            ))}
          </div>
          <button className={styles.btnGhost} onClick={onClear}>Clear history</button>
        </div>

        <div className={styles.list}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="24" stroke="#334155" strokeWidth="1.5" strokeDasharray="5 4"/>
                <circle cx="28" cy="28" r="8" stroke="#475569" strokeWidth="1.5"/>
              </svg>
              <p>{history.length === 0 ? 'No analyses yet. Start analyzing to see history here.' : `No ${filter} results.`}</p>
            </div>
          ) : filtered.map((entry, i) => (
            <div key={i} className={styles.item}>
              <div className={`${styles.dot} ${styles[entry.sentiment]}`} />
              <div className={styles.body}>
                <div className={styles.text}>{entry.text}</div>
                <div className={styles.meta}>
                  <span>{Math.round(entry.confidence * 100)}% confidence</span>
                  <span>{formatTime(entry.time)}</span>
                </div>
              </div>
              <span className={`${styles.badge} ${styles[entry.sentiment]}`}>{capitalize(entry.sentiment)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className={`${styles.statCard} ${styles['stat_' + color]}`}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : s }
function formatTime(d) { return d instanceof Date ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' }
