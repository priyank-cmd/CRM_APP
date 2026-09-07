import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom'
import { LeadsPage } from './pages/LeadsPage'
import { PipelinePage } from './pages/PipelinePage'
import { AnalyticsPage } from './pages/AnalyticsPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/leads" replace />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/leads" replace />} />
      </Routes>
    </Router>
  )
}

export default App
