import styles from './AboutTab.module.css'

const STACK = [
  { layer: 'Model', tech: 'cardiffnlp/twitter-roberta-base-sentiment-latest', why: 'State-of-the-art transformer fine-tuned on 124M tweets' },
  { layer: 'Inference API', tech: 'FastAPI 0.115 + PyTorch 2.7', why: 'Async Python API with Prometheus instrumentation' },
  { layer: 'Frontend', tech: 'React 18 + Vite + CSS Modules', why: 'Dark UI with single/batch/history/about tabs' },
  { layer: 'Orchestration', tech: 'Apache Airflow 2.6', why: 'DAGs for data drift monitoring (12h) and model evaluation (1h)' },
  { layer: 'Experiment Tracking', tech: 'MLflow 2.14', why: 'Logs prediction metrics, confidence scores, and evaluation runs' },
  { layer: 'Monitoring', tech: 'Prometheus + Grafana', why: 'Real-time request rate, latency, and sentiment distribution' },
  { layer: 'Containerisation', tech: 'Docker Compose', why: 'Full stack including Airflow + Postgres spins up with one command' },
  { layer: 'CI/CD', tech: 'GitHub Actions', why: 'Lint, type-check, unit tests, Docker build on every push' },
]

const ENDPOINTS = [
  { method: 'GET',  path: '/health',             desc: 'Model health, GPU status, memory' },
  { method: 'POST', path: '/api/v1/sentiment',   desc: 'Analyze single text → sentiment + confidence + probabilities' },
  { method: 'POST', path: '/api/v1/sentiment/batch', desc: 'Analyze up to 32 texts in one request' },
  { method: 'GET',  path: '/admin/metrics',      desc: 'Prometheus exposition format (scraped every 15s)' },
  { method: 'GET',  path: '/admin/dashboard',    desc: 'JSON summary of model and system stats' },
  { method: 'GET',  path: '/docs',               desc: 'Interactive Swagger UI' },
]

export default function AboutTab() {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h1>About SentimentFlow</h1>
        <p>Production MLOps pipeline for real-time sentiment analysis — RoBERTa transformer served via FastAPI with full observability.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>What it does</div>
          <p className={styles.desc}>
            SentimentFlow classifies any text as <strong>Positive</strong>, <strong>Neutral</strong>, or <strong>Negative</strong>
            using a fine-tuned RoBERTa model trained on 124 million tweets.
            It returns a confidence score and full probability distribution in under 100ms.
          </p>
          <p className={styles.desc}>
            European enterprises use it to monitor customer support tickets, social media mentions,
            and product reviews at scale — without sending data to a third-party LLM API.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>Monitoring</div>
          <div className={styles.linkList}>
            <a href="http://localhost:9090" target="_blank" rel="noreferrer" className={styles.link}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              Prometheus — localhost:9090
            </a>
            <a href="http://localhost:3000" target="_blank" rel="noreferrer" className={styles.link}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              Grafana — localhost:3000 (admin / admin)
            </a>
            <a href="http://localhost:8088" target="_blank" rel="noreferrer" className={styles.link}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              Airflow — localhost:8088 (data drift + model evaluation DAGs)
            </a>
            <a href="http://localhost:5000" target="_blank" rel="noreferrer" className={styles.link}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              MLflow — localhost:5000 (experiment tracking, model runs)
            </a>
            <a href="http://localhost:8080/docs" target="_blank" rel="noreferrer" className={styles.link}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              API Docs — localhost:8080/docs
            </a>
          </div>
        </div>

        <div className={`${styles.card} ${styles.wide}`}>
          <div className={styles.cardLabel}>Tech Stack</div>
          <table className={styles.table}>
            <thead>
              <tr><th>Layer</th><th>Technology</th><th>Why</th></tr>
            </thead>
            <tbody>
              {STACK.map(r => (
                <tr key={r.layer}>
                  <td className={styles.layerCell}>{r.layer}</td>
                  <td className={styles.techCell}>{r.tech}</td>
                  <td className={styles.whyCell}>{r.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`${styles.card} ${styles.wide}`}>
          <div className={styles.cardLabel}>API Endpoints</div>
          <div className={styles.endpointList}>
            {ENDPOINTS.map(e => (
              <div key={e.path} className={styles.endpoint}>
                <span className={`${styles.badge} ${styles[e.method.toLowerCase()]}`}>{e.method}</span>
                <code className={styles.path}>{e.path}</code>
                <span className={styles.edesc}>{e.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.card} ${styles.wide}`}>
          <div className={styles.cardLabel}>Author</div>
          <div className={styles.author}>
            <div className={styles.authorName}>Rayen Lassoued</div>
            <div className={styles.authorLinks}>
              <a href="https://github.com/rayenx2" target="_blank" rel="noreferrer" className={styles.link}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                github.com/rayenx2
              </a>
              <a href="https://linkedin.com/in/Rayen-Lassoued" target="_blank" rel="noreferrer" className={styles.link}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                linkedin.com/in/Rayen-Lassoued
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
