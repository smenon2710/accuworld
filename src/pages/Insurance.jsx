import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Clock, ShieldCheck, Filter, Loader2, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { format, parseISO, isPast } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import InsuranceBadge from '@/components/patients/InsuranceBadge'
import MarkVerifiedDialog from '@/components/insurance/MarkVerifiedDialog'
import { COVERAGE_STATUS, SELF_PAY_RATE } from '@/data/seed'

function formatDate(d) {
  if (!d) return '—'
  try { return format(parseISO(d), 'MMM d, yyyy') } catch { return d }
}

function getFlags(ins) {
  const flags = []
  if (ins.coverageStatus === COVERAGE_STATUS.UNVERIFIED) flags.push('needs_verification')
  if (ins.reverifyByDate && isPast(parseISO(ins.reverifyByDate)) && ins.coverageStatus !== COVERAGE_STATUS.UNVERIFIED) {
    flags.push('stale')
  }
  const remaining = ins.visitsAuthorized - ins.visitsUsed
  if (ins.coverageStatus === COVERAGE_STATUS.COVERED && remaining <= 2) flags.push('low_visits')
  return flags
}

const FLAG_FILTERS = [
  { value: 'all', label: 'All Patients' },
  { value: 'needs_verification', label: 'Needs Verification' },
  { value: 'stale', label: 'Stale' },
  { value: 'low_visits', label: 'Low Visits' },
]

const STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: COVERAGE_STATUS.COVERED, label: 'Covered' },
  { value: COVERAGE_STATUS.UNVERIFIED, label: 'Unverified' },
  { value: COVERAGE_STATUS.NOT_COVERED, label: 'Not Covered' },
  { value: COVERAGE_STATUS.SELF_PAY, label: 'Self-Pay' },
]

function mockEligibilityResult(ins) {
  const remaining = ins.visitsAuthorized - ins.visitsUsed
  if (ins.coverageStatus === COVERAGE_STATUS.COVERED) {
    return {
      ok: true,
      message: `Active · ${remaining} visit${remaining === 1 ? '' : 's'} remaining · $${ins.copay} copay`,
    }
  }
  if (ins.coverageStatus === COVERAGE_STATUS.NOT_COVERED) {
    return { ok: false, message: 'Policy active — acupuncture not covered under this plan' }
  }
  if (ins.coverageStatus === COVERAGE_STATUS.SELF_PAY) {
    return { ok: null, message: `Self-pay patient — $${SELF_PAY_RATE}/visit` }
  }
  // UNVERIFIED — simulate a real payer response: policy found but benefit unconfirmed
  return { ok: null, message: `Policy found with ${ins.payer} — call to confirm acupuncture benefit` }
}

export default function Insurance() {
  const { patients, insuranceProfiles } = useApp()
  const [flagFilter, setFlagFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [verifyTarget, setVerifyTarget] = useState(null)
  const [checkingId, setCheckingId] = useState(null)
  const [eligibilityResults, setEligibilityResults] = useState({})

  function checkEligibility(ins) {
    setCheckingId(ins.id)
    setTimeout(() => {
      setEligibilityResults((prev) => ({ ...prev, [ins.id]: mockEligibilityResult(ins) }))
      setCheckingId(null)
    }, 1200)
  }

  const rows = insuranceProfiles.map((ins) => {
    const patient = patients.find((p) => p.id === ins.patientId)
    const flags = getFlags(ins)
    const remaining = ins.visitsAuthorized - ins.visitsUsed
    return { ins, patient, flags, remaining }
  }).filter(Boolean)

  const filtered = rows.filter(({ ins, flags }) => {
    if (statusFilter !== 'all' && ins.coverageStatus !== statusFilter) return false
    if (flagFilter !== 'all' && !flags.includes(flagFilter)) return false
    return true
  })

  const needsVerification = rows.filter(({ flags }) => flags.includes('needs_verification'))
  const stale = rows.filter(({ flags }) => flags.includes('stale'))
  const lowVisits = rows.filter(({ flags }) => flags.includes('low_visits'))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Insurance Benefits Tracker</h1>
        <p className="text-sm text-muted-foreground">Every patient's coverage status at a glance</p>
      </div>

      {/* Summary flags */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFlagFilter(flagFilter === 'needs_verification' ? 'all' : 'needs_verification')}
          className={`rounded-lg border p-4 text-left transition-colors ${
            flagFilter === 'needs_verification' ? 'border-amber-400 bg-amber-50' : 'bg-white hover:bg-amber-50/60'
          }`}
        >
          <div className="flex items-center gap-2 text-amber-700">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-medium">Unverified</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-amber-700">{needsVerification.length}</p>
          <p className="text-xs text-muted-foreground">patients need verification</p>
        </button>
        <button
          onClick={() => setFlagFilter(flagFilter === 'stale' ? 'all' : 'stale')}
          className={`rounded-lg border p-4 text-left transition-colors ${
            flagFilter === 'stale' ? 'border-red-400 bg-red-50' : 'bg-white hover:bg-red-50/60'
          }`}
        >
          <div className="flex items-center gap-2 text-red-700">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Stale</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-red-700">{stale.length}</p>
          <p className="text-xs text-muted-foreground">verifications expired</p>
        </button>
        <button
          onClick={() => setFlagFilter(flagFilter === 'low_visits' ? 'all' : 'low_visits')}
          className={`rounded-lg border p-4 text-left transition-colors ${
            flagFilter === 'low_visits' ? 'border-orange-400 bg-orange-50' : 'bg-white hover:bg-orange-50/60'
          }`}
        >
          <div className="flex items-center gap-2 text-orange-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Low Visits</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-orange-700">{lowVisits.length}</p>
          <p className="text-xs text-muted-foreground">≤2 visits remaining</p>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No patients match the current filter.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50/60">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Payer / Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Visits</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Copay</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Re-verify By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Flags</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ ins, patient, flags, remaining }) => (
                <tr key={ins.id} className="border-b last:border-0 hover:bg-zinc-50/40">
                  <td className="px-4 py-3">
                    <Link
                      to={`/patients/${ins.patientId}`}
                      className="font-medium text-zinc-900 hover:text-teal-700 hover:underline"
                    >
                      {patient ? `${patient.firstName} ${patient.lastName}` : ins.patientId}
                    </Link>
                    <p className="text-xs text-muted-foreground">{patient?.primaryCondition}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{ins.payer}</p>
                    {ins.planName && <p className="text-xs text-muted-foreground">{ins.planName}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <InsuranceBadge status={ins.coverageStatus} />
                  </td>
                  <td className="px-4 py-3">
                    {ins.coverageStatus === COVERAGE_STATUS.COVERED ? (
                      <span className={flags.includes('low_visits') ? 'font-semibold text-orange-600' : ''}>
                        {remaining} / {ins.visitsAuthorized}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {ins.copay > 0 ? `$${ins.copay}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {ins.reverifyByDate ? (
                      <span className={isPast(parseISO(ins.reverifyByDate)) ? 'text-red-600' : ''}>
                        {formatDate(ins.reverifyByDate)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {flags.includes('needs_verification') && (
                        <Badge variant="warning">Unverified</Badge>
                      )}
                      {flags.includes('stale') && (
                        <Badge variant="danger">Stale</Badge>
                      )}
                      {flags.includes('low_visits') && (
                        <Badge variant="warning">Low Visits</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          variant={flags.length > 0 ? 'default' : 'outline'}
                          onClick={() => setVerifyTarget({ patientId: ins.patientId, ins, patient })}
                        >
                          {ins.coverageStatus === COVERAGE_STATUS.UNVERIFIED ? 'Verify' : 'Update'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={checkingId === ins.id}
                          onClick={() => checkEligibility(ins)}
                        >
                          {checkingId === ins.id ? (
                            <><Loader2 className="h-3 w-3 animate-spin mr-1" />Checking…</>
                          ) : 'Check Eligibility'}
                        </Button>
                      </div>
                      {eligibilityResults[ins.id] && (
                        <div className={`flex items-center gap-1 text-xs ${
                          eligibilityResults[ins.id].ok === true
                            ? 'text-teal-700'
                            : eligibilityResults[ins.id].ok === false
                            ? 'text-red-600'
                            : 'text-zinc-500'
                        }`}>
                          {eligibilityResults[ins.id].ok === true && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                          {eligibilityResults[ins.id].ok === false && <XCircle className="h-3 w-3 shrink-0" />}
                          {eligibilityResults[ins.id].ok === null && <HelpCircle className="h-3 w-3 shrink-0" />}
                          {eligibilityResults[ins.id].message}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
    </div>
  )
}
