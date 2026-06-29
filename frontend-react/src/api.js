const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function getHealth() {
  const res = await fetch(`${BASE}/health`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function analyzeSingle(text) {
  const res = await fetch(`${BASE}/api/v1/sentiment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function analyzeBatch(texts) {
  const res = await fetch(`${BASE}/api/v1/sentiment/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts })
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
