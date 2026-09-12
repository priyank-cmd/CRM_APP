import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom'
import { LeadsPage } from './pages/LeadsPage'
import { PipelinePage } from './pages/PipelinePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { FormsPage } from './pages/FormsPage'
import { FormFillPage } from './pages/FormFillPage'
import { ThemeProvider } from './theme/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/leads" replace />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/forms/:formId/fill" element={<FormFillPage />} />
          <Route path="*" element={<Navigate to="/leads" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
