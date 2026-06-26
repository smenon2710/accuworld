import { useState } from 'react'
import { X, Square, CheckSquare, ShieldCheck, Clock, AlertCircle } from 'lucide-react'

const DEMO_STEPS = [
  { id: 1, label: 'Add a new patient', detail: 'Patients → + New Patient' },
  { id: 2, label: 'Schedule an appointment', detail: 'Schedule → New Appointment' },
  { id: 3, label: 'Confirm & complete the visit', detail: "Schedule → Today's Actions → Complete + Chart" },
  { id: 4, label: 'Save the TCM chart', detail: 'Visit / Chart — fill SOAP note, save' },
  { id: 5, label: 'Generate a superbill', detail: 'Billing → New Invoice → Print Superbill' },
]

const SCHEDULE_COLOR_GUIDE = [
  { color: 'bg-teal-500', label: 'Confirmed', desc: 'Booked and confirmed — patient is expected.' },
  { color: 'bg-amber-400', label: 'Requested', desc: 'Booking request not yet confirmed by the clinic.' },
  { color: 'bg-zinc-400', label: 'Completed', desc: 'Visit is done and checked out.' },
  { color: 'bg-red-400', label: 'No-show', desc: 'Patient did not attend.' },
]

const FLAG_GUIDE = [
  {
    colorClass: 'text-amber-700 bg-amber-50',
    Icon: ShieldCheck,
    label: 'Unverified',
    desc: 'Benefits have never been confirmed — verify before treating.',
  },
  {
    colorClass: 'text-red-700 bg-red-50',
    Icon: Clock,
    label: 'Stale',
    desc: 'Verification expired — re-confirm with the payer.',
  },
  {
    colorClass: 'text-orange-700 bg-orange-50',
    Icon: AlertCircle,
    label: 'Low Visits',
    desc: '2 or fewer authorized visits remain — request re-authorization.',
  },
]

const PAGE_GUIDE = [
  { label: 'Dashboard', desc: 'Morning overview — insurance flags, schedule, revenue' },
  { label: 'Insurance', desc: 'Verify benefits, check eligibility, track authorized visits' },
  { label: 'Patients', desc: 'Patient roster, profiles, pain trend charts' },
  { label: 'Schedule', desc: 'Month/week/day calendar, booking inbox, complete visits' },
  { label: 'Visit / Chart', desc: 'TCM SOAP notes, acupuncture points, modalities' },
  { label: 'Treatment Plans', desc: 'Goals, frequency recommendation, session progress' },
  { label: 'Billing', desc: 'Invoices, CPT codes, mark paid, superbill printing' },
]

export default function HelpDrawer({ open, onClose }) {
  const [checked, setChecked] = useState({})

  function toggle(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 flex w-80 flex-col border-l bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <span className="text-sm font-semibold text-zinc-900">Help &amp; Demo Guide</span>
          <button
            onClick={onClose}
            className="rounded p-0.5 text-muted-foreground hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">

          {/* Demo Walkthrough */}
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Demo Walkthrough
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Full patient journey in under 5 minutes. Check off each step as you go.
            </p>
            <ol className="space-y-1">
              {DEMO_STEPS.map((step) => (
                <li key={step.id}>
                  <button
                    className="flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors hover:bg-zinc-50"
                    onClick={() => toggle(step.id)}
                  >
                    <div className={`mt-0.5 shrink-0 ${checked[step.id] ? 'text-teal-600' : 'text-zinc-300'}`}>
                      {checked[step.id]
                        ? <CheckSquare className="h-4 w-4" />
                        : <Square className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium leading-tight ${
                        checked[step.id] ? 'text-muted-foreground line-through' : 'text-zinc-900'
                      }`}>
                        {step.id}. {step.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          {/* Schedule color guide */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Schedule Appointment Colors
            </h3>
            <div className="space-y-2">
              {SCHEDULE_COLOR_GUIDE.map(({ color, label, desc }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-sm ${color}`} />
                  <div>
                    <span className="text-xs font-semibold text-zinc-700">{label}</span>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Insurance flag guide */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Insurance Flag Colors
            </h3>
            <div className="space-y-2">
              {FLAG_GUIDE.map(({ colorClass, Icon, label, desc }) => (
                <div key={label} className={`rounded-md px-3 py-2 ${colorClass}`}>
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">{label}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pages at a glance */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pages at a Glance
            </h3>
            <div className="space-y-0">
              {PAGE_GUIDE.map(({ label, desc }) => (
                <div key={label} className="flex gap-2 border-b py-2 text-xs last:border-0">
                  <span className="w-28 shrink-0 font-medium text-zinc-700">{label}</span>
                  <span className="text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-3 text-center">
          <p className="text-xs text-muted-foreground">AccuWorld · Demo prototype</p>
        </div>
      </div>
    </>
  )
}
