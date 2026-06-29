import { useEffect, useState } from 'react'
import { getHealth } from '../api'
import styles from './Sidebar.module.css'

const TABS = [
  {
    id: 'single', label: 'Single',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  },
  {
    id: 'batch', label: 'Batch',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
  },
  {
    id: 'history', label: 'History',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  },
  {
    id: 'about', label: 'About',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  }
]

export default function Sidebar({ activeTab, onTabChange }) {
  const [modelStatus, setModelStatus] = useState('checking')

  useEffect(() => {
    const check = async () => {
      try {
        const data = await getHealth()
        setModelStatus(data.status === 'healthy' && data.model.status === 'available' ? 'healthy' : 'unhealthy')
      } catch {
        setModelStatus('unhealthy')
      }
    }
    check()
    const id = setInterval(check, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="url(#lg)"/>
          <path d="M8 20 L12 12 L16 18 L20 10 L24 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stopColor="#6366f1"/>
              <stop offset="100%" stopColor="#06b6d4"/>
            </linearGradient>
          </defs>
        </svg>
        <span className={styles.logoText}>SentimentFlow</span>
      </div>

      <nav className={styles.nav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.navItem} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.modelCard}>
          <div className={`${styles.dot} ${styles[modelStatus]}`} />
          <div className={styles.modelInfo}>
            <span className={styles.modelName}>cardiffnlp/twitter-roberta</span>
            <span className={styles.modelStatusText}>
              {modelStatus === 'healthy' ? 'Available' : modelStatus === 'checking' ? 'Checking...' : 'Unavailable'}
            </span>
          </div>
        </div>
        <div className={styles.version}>MLOps v0.1.0</div>
      </div>
    </aside>
  )
}
