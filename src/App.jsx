import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Patients from '@/pages/Patients'
import PatientDetail from '@/pages/PatientDetail'
import Insurance from '@/pages/Insurance'
import Schedule from '@/pages/Schedule'
import Visits from '@/pages/Visits'
import TreatmentPlans from '@/pages/TreatmentPlans'
import Billing from '@/pages/Billing'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/visits" element={<Visits />} />
            <Route path="/visits/:id" element={<Visits />} />
            <Route path="/treatment-plans" element={<TreatmentPlans />} />
            <Route path="/billing" element={<Billing />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
