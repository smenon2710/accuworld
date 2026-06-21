import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  seedPatients,
  seedInsuranceProfiles,
  seedAppointments,
  seedVisits,
  seedTreatmentPlans,
  seedInvoices,
} from '@/data/seed'

const AppContext = createContext(null)

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage write failed:', e)
  }
}

export function AppProvider({ children }) {
  const [patients, setPatients] = useState(() => loadFromStorage('aw_patients', seedPatients))
  const [insuranceProfiles, setInsuranceProfiles] = useState(() =>
    loadFromStorage('aw_insurance', seedInsuranceProfiles)
  )
  const [appointments, setAppointments] = useState(() =>
    loadFromStorage('aw_appointments', seedAppointments)
  )
  const [visits, setVisits] = useState(() => loadFromStorage('aw_visits', seedVisits))
  const [treatmentPlans, setTreatmentPlans] = useState(() =>
    loadFromStorage('aw_plans', seedTreatmentPlans)
  )
  const [invoices, setInvoices] = useState(() => loadFromStorage('aw_invoices', seedInvoices))

  // ── Patients ──────────────────────────────────────────────────────────────
  const addPatient = useCallback((patient) => {
    setPatients((prev) => {
      const next = [...prev, patient]
      saveToStorage('aw_patients', next)
      console.log('[AppContext] addPatient:', patient)
      return next
    })
  }, [])

  const updatePatient = useCallback((id, changes) => {
    setPatients((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
      saveToStorage('aw_patients', next)
      console.log('[AppContext] updatePatient:', id, changes)
      return next
    })
  }, [])

  // ── Insurance ─────────────────────────────────────────────────────────────
  const updateInsurance = useCallback((patientId, changes) => {
    setInsuranceProfiles((prev) => {
      const next = prev.map((ins) =>
        ins.patientId === patientId ? { ...ins, ...changes } : ins
      )
      saveToStorage('aw_insurance', next)
      console.log('[AppContext] updateInsurance:', patientId, changes)
      return next
    })
  }, [])

  const addInsurance = useCallback((profile) => {
    setInsuranceProfiles((prev) => {
      const next = [...prev, profile]
      saveToStorage('aw_insurance', next)
      return next
    })
  }, [])

  // ── Appointments ──────────────────────────────────────────────────────────
  const addAppointment = useCallback((appointment) => {
    setAppointments((prev) => {
      const next = [...prev, appointment]
      saveToStorage('aw_appointments', next)
      console.log('[AppContext] addAppointment:', appointment)
      return next
    })
  }, [])

  const updateAppointment = useCallback((id, changes) => {
    setAppointments((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...changes } : a))
      saveToStorage('aw_appointments', next)
      console.log('[AppContext] updateAppointment:', id, changes)
      return next
    })
  }, [])

  // ── Visits ────────────────────────────────────────────────────────────────
  const addVisit = useCallback((visit) => {
    setVisits((prev) => {
      const next = [...prev, visit]
      saveToStorage('aw_visits', next)
      console.log('[AppContext] addVisit:', visit)
      return next
    })
  }, [])

  const updateVisit = useCallback((id, changes) => {
    setVisits((prev) => {
      const next = prev.map((v) => (v.id === id ? { ...v, ...changes } : v))
      saveToStorage('aw_visits', next)
      return next
    })
  }, [])

  // ── Treatment Plans ───────────────────────────────────────────────────────
  const saveTreatmentPlan = useCallback((plan) => {
    setTreatmentPlans((prev) => {
      const exists = prev.find((p) => p.patientId === plan.patientId)
      const next = exists
        ? prev.map((p) => (p.patientId === plan.patientId ? { ...p, ...plan } : p))
        : [...prev, plan]
      saveToStorage('aw_plans', next)
      console.log('[AppContext] saveTreatmentPlan:', plan)
      return next
    })
  }, [])

  // ── Invoices ──────────────────────────────────────────────────────────────
  const addInvoice = useCallback((invoice) => {
    setInvoices((prev) => {
      const next = [...prev, invoice]
      saveToStorage('aw_invoices', next)
      console.log('[AppContext] addInvoice:', invoice)
      return next
    })
  }, [])

  const updateInvoice = useCallback((id, changes) => {
    setInvoices((prev) => {
      const next = prev.map((inv) => (inv.id === id ? { ...inv, ...changes } : inv))
      saveToStorage('aw_invoices', next)
      console.log('[AppContext] updateInvoice:', id, changes)
      return next
    })
  }, [])

  const resetToSeedData = useCallback(() => {
    setPatients(seedPatients)
    setInsuranceProfiles(seedInsuranceProfiles)
    setAppointments(seedAppointments)
    setVisits(seedVisits)
    setTreatmentPlans(seedTreatmentPlans)
    setInvoices(seedInvoices)
    localStorage.clear()
    console.log('[AppContext] reset to seed data')
  }, [])

  const value = {
    patients,
    insuranceProfiles,
    appointments,
    visits,
    treatmentPlans,
    invoices,
    addPatient,
    updatePatient,
    updateInsurance,
    addInsurance,
    addAppointment,
    updateAppointment,
    addVisit,
    updateVisit,
    saveTreatmentPlan,
    addInvoice,
    updateInvoice,
    resetToSeedData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
