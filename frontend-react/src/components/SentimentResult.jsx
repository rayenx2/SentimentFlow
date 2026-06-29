import { useEffect, useRef } from 'react'
import styles from './SentimentResult.module.css'

const ICONS = { positive: '😊', neutral: '😐', negative: '😞' }
const COLORS = { positive: '#22c55e', neutral: '#f59e0b', negative: '#ef4444' }

export default function SentimentResult({ data }) {
  const { sentiment, confidence, probabilities, text } = data
  const pct = Math.round(confidence * 100)
  const circumference = 314.16
  const ringRef = useRef(null)

  useEffect(() => {
    if (!ringRef.current) return
    const offset = circumference - circumference * confidence
    // trigger animation after mount
    requestAnimationFrame(() => {
      ringRef.current.style.strokeDashoffset = offset
    })
  }, [confidence])

  return (
    <div className={styles.wrap}>
      <div className={`${styles.badge} ${styles[sentiment]}`}>
        <span>{ICONS[sentiment]}</span>
        <span>{capitalize(sentiment)}</span>
      </div>

      <div className={styles.ringWrap}>
        <svg className={styles.ring} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" className={styles.ringBg} />
          <circle
            ref={ringRef}
            cx="60" cy="60" r="50"
            className={styles.ringFill}
            style={{
              stroke: COLORS[sentiment],
              strokeDasharray: circumference,
              strokeDashoffset: circumference
            }}
          />
        </svg>
        <div className={styles.ringLabel}>
          <span className={styles.ringPct}>{pct}%</span>
          <span className={styles.ringSub}>confidence</span>
        </div>
      </div>

      <div className={styles.bars}>
        {['positive', 'neutral', 'negative'].map(key => (
          <ProbBar key={key} label={key} value={probabilities[key] || 0} />
        ))}
      </div>

      <div className={styles.analyzedText}>"{text}"</div>
    </div>
  )
}

function ProbBar({ label, value }) {
  const pct = Math.round(value * 100)
  const barRef = useRef(null)

  useEffect(() => {
    if (!barRef.current) return
    requestAnimationFrame(() => {
      barRef.current.style.width = pct + '%'
    })
  }, [pct])

  return (
    <div className={styles.probRow}>
      <span className={`${styles.probLabel} ${styles[label]}`}>{capitalize(label)}</span>
      <div className={styles.track}>
        <div ref={barRef} className={`${styles.fill} ${styles[label + 'Fill']}`} style={{ width: 0 }} />
      </div>
      <span className={styles.probVal}>{pct}%</span>
    </div>
  )
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}
