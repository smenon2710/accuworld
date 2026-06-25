import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle, Clock, ShieldCheck, UserPlus, CalendarPlus, CheckCircle2,
  MessageSquare, UserX, TrendingUp,
} from 'lucide-react'
import { format, parseISO, isPast, differenceInDays, startOfDay } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import InsuranceBadge from '@/components/patients/InsuranceBadge'
import MarkVerifiedDialog from '@/components/insurance/MarkVerifiedDialog'
import AddPatientDialog from '@/components/patients/AddPatientDialog'
import { COVERAGE_STATUS, APPOINTMENT_STATUS, APPOINTMENT_TYPE, SELF_PAY_RATE } from '@/data/seed'

const TODAY = format(new Date(), 'yyyy-MM-dd')

function formatTime(dt) {
  return format(new Date(dt), 'h:mm a')
}
function formatDate(d) {
  if (!d) return '—'
  try { return format(parseISO(d), 'MMM d, yyyy') } catch { return d }
}

function getInsuranceFlags(ins) {
  const flags = []
  if (ins.coverageStatus === COVERAGE_STATUS.UNVERIFIED) flags.push('unverified')
  if (ins.reverifyByDate && isPast(parseISO(ins.reverifyByDate)) && ins.coverageStatus !== COVERAGE_STATUS.UNVERIFIED) {
    flags.push('stale')
  }
  const remaining = ins.visitsAuthorized - ins.visitsUsed
  if (ins.coverageStatus === COVERAGE_STATUS.COVERED && remaining <= 2) flags.push('low_visits')
  return flags
}

function appointmentTypeLabel(type) {
  return {
    [APPOINTMENT_TYPE.INITIAL]: 'Initial Consult',
    [APPOINTMENT_TYPE.FOLLOWUP]: 'Follow-up',
    [APPOINTMENT_TYPE.WELLNESS]: 'Wellness',
  }[type] ?? type
}

export default function Dashboard() {
  const { patients, insuranceProfiles, appointments, invoices, updateAppointment, loggedInRole } = useApp()
  const canChart = loggedInRole !== 'frontdesk'
  const navigate = useNavigate()
  const [verifyTarget, setVerifyTarget] = useState(null)
  const [showAddPatient, setShowAddPatient] = useState(false)

  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]))
  const insMap = Object.fromEntries(insuranceProfiles.map((i) => [i.patientId, i]))

  // Today's confirmed appointments
  const todayConfirmed = appointments
    .filter((a) => a.datetime.startsWith(TODAY) && a.status === APPOINTMENT_STATUS.CONFIRMED)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))

  // Text booking inbox
  const inboxRequested = appointments
    .filter((a) => a.status === APPOINTMENT_STATUS.REQUESTED)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))

  // Insurance flags
  const insFlags = insuranceProfiles
    .map((ins) => {
      const flags = getInsuranceFlags(ins)
      const patient = patientMap[ins.patientId]
      if (!flags.length || !patient) return null
      return { ins, flags, patient }
    })
    .filter(Boolean)

  // Follow-up queue: last completed appointment per patient
  const lastVisitByPatient = {}
  appointments
    .filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED)
    .forEach((a) => {
      const prev = lastVisitByPatient[a.patientId]
      if (!prev || new Date(a.datetime) > new Date(prev.datetime)) {
        lastVisitByPatient[a.patientId] = a
      }
    })

  const followUpQueue = Object.entries(lastVisitByPatient)
    .map(([patientId, appt]) => {
      const daysSince = differenceInDays(startOfDay(new Date()), startOfDay(new Date(appt.datetime)))
      const patient = patientMap[patientId]
      if (!patient || daysSince < 30) return null
      return { patient, appt, daysSince }
    })
    .filter(Boolean)
    .sort((a, b) => b.daysSince - a.daysSince)

  // No-shows
  const noShows = appointments
    .filter((a) => a.status === APPOINTMENT_STATUS.NO_SHOW)
    .map((a) => ({ appt: a, patient: patientMap[a.patientId] }))
    .filter(({ patient }) => !!patient)

  // Monthly revenue (current month based on TODAY)
  const currentMonth = TODAY.slice(0, 7)
  const monthInvoices = invoices.filter((inv) => inv.date?.startsWith(currentMonth))
  const totalBilled = monthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
  const totalPaid = monthInvoices.filter((inv) => inv.paid).reduce((sum, inv) => sum + (inv.total || 0), 0)
  const totalUnpaid = totalBilled - totalPaid

  function handleConfirm(apptId) {
    updateAppointment(apptId, { status: APPOINTMENT_STATUS.CONFIRMED })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {format(new Date(), 'EEEE, MMMM d')}
          </h1>
          <p className="text-sm text-muted-foreground">Practice overview for today</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddPatient(true)}>
            <UserPlus className="h-4 w-4" />
            New Patient
          </Button>
          <Button size="sm" onClick={() => navigate('/schedule')}>
            <CalendarPlus className="h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Link to="/schedule" className="rounded-lg border bg-white p-4 transition-colors hover:border-teal-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Scheduled Today</span>
            <CalendarPlus className="h-4 w-4 text-teal-500" />
          </div>
          <p className="text-3xl font-bold text-zinc-900">{todayConfirmed.length}</p>
          <p className="text-xs text-muted-foreground mt-1">confirmed appointments</p>
        </Link>
        <Link
          to="/insurance"
          className={`rounded-lg border p-4 transition-colors hover:border-amber-300 ${insFlags.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Insurance Attention</span>
            <AlertCircle className={`h-4 w-4 ${insFlags.length > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </div>
          <p className={`text-3xl font-bold ${insFlags.length > 0 ? 'text-amber-700' : 'text-zinc-900'}`}>{insFlags.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{insFlags.length > 0 ? 'need action before visit' : 'all clear'}</p>
        </Link>
        <Link
          to="/schedule"
          className={`rounded-lg border p-4 transition-colors hover:border-blue-300 ${inboxRequested.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pending Confirmations</span>
            <MessageSquare className={`h-4 w-4 ${inboxRequested.length > 0 ? 'text-blue-500' : 'text-muted-foreground'}`} />
          </div>
          <p className={`text-3xl font-bold ${inboxRequested.length > 0 ? 'text-blue-700' : 'text-zinc-900'}`}>{inboxRequested.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{inboxRequested.length > 0 ? 'booking requests waiting' : 'inbox clear'}</p>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left + center (2/3) */}
        <div className="col-span-2 space-y-5">
          {/* Insurance Needs Attention — hero panel */}
          {insFlags.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 border-b border-amber-200 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">Insurance Needs Attention</span>
                <Badge variant="warning" className="ml-auto">{insFlags.length}</Badge>
              </div>
              <div className="divide-y divide-amber-100">
                {insFlags.map(({ ins, flags, patient }) => {
                  const remaining = ins.visitsAuthorized - ins.visitsUsed
                  return (
                    <div key={ins.id} className="flex items-center justify-between px-4 py-3">
                      <div className="space-y-0.5">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="text-sm font-medium text-zinc-900 hover:text-teal-700 hover:underline"
                        >
                          {patient.firstName} {patient.lastName}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{ins.payer}{ins.planName ? ` — ${ins.planName}` : ''}</span>
                          {flags.includes('low_visits') && (
                            <span className="text-orange-600 font-medium">{remaining} visits left</span>
                          )}
                          {flags.includes('stale') && (
                            <span className="text-red-600">Expired {formatDate(ins.reverifyByDate)}</span>
                          )}
                          {flags.includes('unverified') && (
                            <span className="text-amber-600">Never verified</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {flags.includes('unverified') && <Badge variant="warning">Unverified</Badge>}
                          {flags.includes('stale') && <Badge variant="danger">Stale</Badge>}
                          {flags.includes('low_visits') && <Badge variant="warning">Low Visits</Badge>}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white"
                          onClick={() => setVerifyTarget({ patientId: patient.id, ins, patient })}
                        >
                          {ins.coverageStatus === COVERAGE_STATUS.UNVERIFIED ? 'Verify' : 'Update'}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Today's Appointments */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-zinc-700">Today's Schedule</h2>
            {todayConfirmed.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">No appointments confirmed for today.</p>
                <Button variant="link" size="sm" className="mt-1" onClick={() => navigate('/schedule')}>
                  View schedule →
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayConfirmed.map((a) => {
                  const patient = patientMap[a.patientId]
                  const ins = insMap[a.patientId]
                  if (!patient) return null
                  return (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-center">
                          <p className="text-sm font-semibold text-teal-700">{formatTime(a.datetime)}</p>
                          <p className="text-xs text-muted-foreground">{a.durationMin}min</p>
                        </div>
                        <div>
                          <Link
                            to={`/patients/${patient.id}`}
                            className="text-sm font-medium text-zinc-900 hover:text-teal-700 hover:underline"
                          >
                            {patient.firstName} {patient.lastName}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {patient.primaryCondition} · {appointmentTypeLabel(a.type)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ins && <InsuranceBadge status={ins.coverageStatus} />}
                        {canChart && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/visits?appt=${a.id}`)}
                          >
                            Chart
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Text Booking Inbox */}
          {inboxRequested.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-zinc-700">Booking Requests</h2>
                <Badge variant="warning">{inboxRequested.length}</Badge>
              </div>
              <div className="space-y-2">
                {inboxRequested.map((a) => {
                  const patient = patientMap[a.patientId]
                  if (!patient) return null
                  return (
                    <div key={a.id} className="rounded-lg border bg-white px-4 py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            to={`/patients/${patient.id}`}
                            className="text-sm font-medium text-zinc-900 hover:text-teal-700 hover:underline"
                          >
                            {patient.firstName} {patient.lastName}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(a.datetime), 'EEE MMM d · h:mm a')} · {appointmentTypeLabel(a.type)} · via {a.source}
                          </p>
                          {a.note && (
                            <p className="mt-1.5 text-xs text-zinc-600 italic">"{a.note}"</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(a.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate('/schedule')}
                          >
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-5">
          {/* Revenue summary */}
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-zinc-700">{format(new Date(), 'MMMM')} Revenue</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total billed</span>
                <span className="font-semibold">${totalBilled}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Collected</span>
                <span className="font-semibold text-teal-700">${totalPaid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outstanding</span>
                <span className={`font-semibold ${totalUnpaid > 0 ? 'text-amber-600' : 'text-zinc-400'}`}>
                  ${totalUnpaid}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <Link to="/billing" className="text-xs text-teal-700 hover:underline">View billing →</Link>
            </div>
          </div>

          {/* Follow-up queue */}
          {(followUpQueue.length > 0 || noShows.length > 0) && (
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-zinc-700">Needs Follow-up</h2>
              </div>
              <div className="space-y-2">
                {noShows.map(({ appt, patient }) => (
                  <div key={appt.id} className="flex items-center justify-between text-sm">
                    <div>
                      <Link
                        to={`/patients/${patient.id}`}
                        className="font-medium text-zinc-900 hover:text-teal-700 hover:underline"
                      >
                        {patient.firstName} {patient.lastName}
                      </Link>
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <UserX className="h-3 w-3" /> No-show {format(new Date(appt.datetime), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))}
                {followUpQueue.map(({ patient, daysSince }) => (
                  <div key={patient.id} className="flex items-center justify-between text-sm">
                    <div>
                      <Link
                        to={`/patients/${patient.id}`}
                        className="font-medium text-zinc-900 hover:text-teal-700 hover:underline"
                      >
                        {patient.firstName} {patient.lastName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Last seen {daysSince} days ago
                      </p>
                    </div>
                    <Badge variant={daysSince >= 90 ? 'danger' : daysSince >= 60 ? 'warning' : 'neutral'}>
                      {daysSince}d
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {verifyTarget && (
        <MarkVerifiedDialog
          open={!!verifyTarget}
          onOpenChange={(o) => !o && setVerifyTarget(null)}
          patientId={verifyTarget.patientId}
          patientName={verifyTarget.patient ? `${verifyTarget.patient.firstName} ${verifyTarget.patient.lastName}` : ''}
          currentIns={verifyTarget.ins}
        />
      )}

      <AddPatientDialog
        open={showAddPatient}
        onOpenChange={setShowAddPatient}
        onCreated={(id) => navigate(`/patients/${id}`)}
      />
    </div>
  )
}
