import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import SingleTab from './components/SingleTab'
import BatchTab from './components/BatchTab'
import HistoryTab from './components/HistoryTab'
import AboutTab from './components/AboutTab'
import styles from './App.module.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('single')
  const [history, setHistory] = useState([])

  const addToHistory = useCallback((entry) => {
    setHistory(prev => [{ ...entry, time: new Date() }, ...prev])
  }, [])

  return (
    <div className={styles.layout}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className={styles.main}>
        {activeTab === 'single'  && <SingleTab onResult={addToHistory} />}
        {activeTab === 'batch'   && <BatchTab  onResults={(results) => results.forEach(addToHistory)} />}
        {activeTab === 'history' && <HistoryTab history={history} onClear={() => setHistory([])} />}
        {activeTab === 'about'   && <AboutTab />}
      </main>
    </div>
  )
}
