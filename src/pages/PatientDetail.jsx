import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Phone, Mail, CalendarDays, ChevronDown, ChevronUp,
  Edit2, AlertCircle, Clock, Archive, RotateCcw, Plus, ClipboardList, Pencil,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import InsuranceBadge from '@/components/patients/InsuranceBadge'
import { COVERAGE_STATUS, APPOINTMENT_STATUS, SELF_PAY_RATE } from '@/data/seed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import EditPatientDialog from '@/components/patients/EditPatientDialog'
import CaseDialog from '@/components/cases/CaseDialog'

function formatDate(d) {
  if (!d) return '—'
  try { return format(parseISO(d), 'MMM d, yyyy') } catch { return d }
}

function estPatientOwes(ins) {
  if (!ins) return null
  if (ins.coverageStatus === COVERAGE_STATUS.COVERED) {
    if (ins.deductibleMet) return `$${ins.copay}/visit`
    return ins.copay > 0
      ? `$${ins.copay} copay · deductible not yet met`
      : 'Deductible not yet met — higher out-of-pocket expected'
  }
  if (ins.coverageStatus === COVERAGE_STATUS.SELF_PAY || ins.coverageStatus === COVERAGE_STATUS.NOT_COVERED) {
    return `$${SELF_PAY_RATE}/visit`
  }
  return 'Verify to calculate'
}

function appointmentTypeLabel(type) {
  return { initial_consultation: 'Initial Consult', followup: 'Follow-up', wellness: 'Wellness' }[type] ?? type
}

function appointmentStatusBadge(status) {
  const map = {
    confirmed: 'success', completed: 'neutral', requested: 'warning',
    no_show: 'danger', cancelled: 'danger',
  }
  return map[status] ?? 'neutral'
}

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { patients, insuranceProfiles, appointments, visits, treatmentPlans, cases, intakeForms, updatePatient, addCase, updateCase, loggedInRole } = useApp()
  const canChart = loggedInRole !== 'frontdesk'
  const [showAdditional, setShowAdditional] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showCaseDialog, setShowCaseDialog] = useState(false)
  const [editingCase, setEditingCase] = useState(null)

  const patient = patients.find((p) => p.id === id)
  if (!patient) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Patient <strong>{id}</strong> not found in seed data.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/patients')}>
          Back to Patients
        </Button>
      </div>
    )
  }

  const ins = insuranceProfiles.find((i) => i.patientId === id)
  const patientAppointments = appointments
    .filter((a) => a.patientId === id)
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
  const patientVisits = visits
    .filter((v) => v.patientId === id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  const plan = treatmentPlans.find((tp) => tp.patientId === id)
  const patientCases = cases.filter((c) => c.patientId === id).sort((a, b) => new Date(b.dateOpened) - new Date(a.dateOpened))

  const painChartData = [...patientVisits]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((v) => ({ date: format(parseISO(v.date), 'MMM d'), pain: v.painLevel }))

  const upcoming = patientAppointments.filter(
    (a) => [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.REQUESTED].includes(a.status)
  )
  const past = patientAppointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED)

  const visitsRemaining =
    ins && ins.coverageStatus === COVERAGE_STATUS.COVERED
      ? Math.max(0, ins.visitsAuthorized - ins.visitsUsed)
      : null

  const isLowVisits = visitsRemaining !== null && visitsRemaining <= 2
  const isStale =
    ins &&
    ins.coverageStatus === COVERAGE_STATUS.UNVERIFIED ||
    (ins?.reverifyByDate && new Date(ins.reverifyByDate) < new Date())

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate('/patients')}
          className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Patients
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">{patient.primaryCondition}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={patient.status === 'active' ? 'success' : 'neutral'} className="capitalize">
              {patient.status}
            </Badge>
            {(() => {
              const intake = intakeForms.find((f) => f.patientId === id)
              return intake ? (
                <Button variant="outline" size="sm" onClick={() => navigate(`/intake/${id}`)}>
                  <ClipboardList className="h-3.5 w-3.5 text-teal-600" />
                  <span className="text-teal-700">Intake Complete</span>
                </Button>
              ) : (
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate(`/intake/${id}`)}>
                  <ClipboardList className="h-3.5 w-3.5" />
                  Intake Form
                </Button>
              )
            })()}
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </Button>
            {patient.status === 'active' ? (
              <Button
                variant="outline"
                size="sm"
                className="text-zinc-500 hover:text-red-600 hover:border-red-300"
                onClick={() => updatePatient(id, { status: 'inactive' })}
              >
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-teal-600 hover:border-teal-400"
                onClick={() => updatePatient(id, { status: 'active' })}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reactivate
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left column */}
        <div className="col-span-2 space-y-5">
          {/* Insurance Card — hero */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Insurance</CardTitle>
                {ins && <InsuranceBadge status={ins.coverageStatus} />}
              </div>
            </CardHeader>
            <CardContent>
              {!ins ? (
                <p className="text-sm text-muted-foreground">No insurance profile on file.</p>
              ) : (
                <div className="space-y-4">
                  {/* Alert flags */}
                  {(isLowVisits || isStale) && (
                    <div className="space-y-2">
                      {isLowVisits && (
                        <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          Only {visitsRemaining} visit{visitsRemaining === 1 ? '' : 's'} remaining — request authorization soon.
                        </div>
                      )}
                      {isStale && ins.coverageStatus !== COVERAGE_STATUS.SELF_PAY && (
                        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                          <Clock className="h-4 w-4 shrink-0" />
                          {ins.coverageStatus === COVERAGE_STATUS.UNVERIFIED
                            ? 'Benefits have not been verified yet.'
                            : `Verification expired ${formatDate(ins.reverifyByDate)} — re-verify now.`}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subscriber ID + Group # — most important for coverage verification */}
                  <div className="grid grid-cols-2 gap-3 rounded-md border bg-zinc-50 px-3 py-2.5 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subscriber ID</p>
                      <p className="font-semibold text-zinc-900 mt-0.5">{ins.memberId || <span className="text-muted-foreground font-normal">—</span>}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Group #</p>
                      <p className="font-semibold text-zinc-900 mt-0.5">{ins.groupNumber || <span className="text-muted-foreground font-normal">—</span>}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Payer</p>
                      <p className="font-medium">{ins.payer}</p>
                    </div>
                    {ins.planName && (
                      <div>
                        <p className="text-xs text-muted-foreground">Plan</p>
                        <p className="font-medium">{ins.planName}</p>
                      </div>
                    )}
                    {ins.coverageStatus === COVERAGE_STATUS.COVERED && (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">Visits Authorized</p>
                          <p className="font-medium">{ins.visitsAuthorized}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Visits Used / Remaining</p>
                          <p className={`font-medium ${isLowVisits ? 'text-amber-600' : ''}`}>
                            {ins.visitsUsed} used · <strong>{visitsRemaining} left</strong>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Copay</p>
                          <p className="font-medium">${ins.copay}</p>
                        </div>
                        {ins.coinsurancePct > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground">Coinsurance</p>
                            <p className="font-medium">{ins.coinsurancePct}%</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">Deductible Met</p>
                          <p className="font-medium">{ins.deductibleMet ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Est. Patient Owes</p>
                          <p className={`font-medium ${!ins.deductibleMet ? 'text-amber-700' : 'text-teal-700'}`}>
                            {estPatientOwes(ins)}
                          </p>
                        </div>
                        {ins.authReferenceNumber && (
                          <div>
                            <p className="text-xs text-muted-foreground">Auth Reference</p>
                            <p className="font-medium">{ins.authReferenceNumber}</p>
                          </div>
                        )}
                      </>
                    )}
                    {(ins.coverageStatus === COVERAGE_STATUS.SELF_PAY ||
                      ins.coverageStatus === COVERAGE_STATUS.NOT_COVERED) && (
                      <div>
                        <p className="text-xs text-muted-foreground">Est. Patient Owes</p>
                        <p className="font-medium text-teal-700">${SELF_PAY_RATE}/visit</p>
                      </div>
                    )}
                    {ins.coverageStatus === COVERAGE_STATUS.UNVERIFIED && (
                      <div>
                        <p className="text-xs text-muted-foreground">Est. Patient Owes</p>
                        <p className="font-medium text-zinc-400">Verify to calculate</p>
                      </div>
                    )}
                    {ins.lastVerifiedDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">Last Verified</p>
                        <p className="font-medium">{formatDate(ins.lastVerifiedDate)}</p>
                      </div>
                    )}
                    {ins.reverifyByDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">Re-verify By</p>
                        <p className={`font-medium ${new Date(ins.reverifyByDate) < new Date() ? 'text-red-600' : ''}`}>
                          {formatDate(ins.reverifyByDate)}
                        </p>
                      </div>
                    )}
                  </div>
                  {ins.verificationNotes && (
                    <div className="rounded-md bg-zinc-50 p-3 text-sm">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Verification Notes</p>
                      <p className="text-zinc-700">{ins.verificationNotes}</p>
                    </div>
                  )}
                  <div className="pt-1">
                    <Link
                      to="/insurance"
                      className="text-sm text-teal-700 hover:underline"
                    >
                      Manage in Insurance Tracker →
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cases */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Cases</CardTitle>
                {canChart && (
                  <Button size="sm" variant="outline" onClick={() => { setEditingCase(null); setShowCaseDialog(true) }}>
                    <Plus className="h-3.5 w-3.5" /> New Case
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {patientCases.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cases on file. Create a case to organize visits by diagnosis.</p>
              ) : (
                <div className="space-y-2">
                  {patientCases.map((c) => {
                    const visitCount = visits.filter((v) => v.caseId === c.id).length
                    const ins = insuranceProfiles.find((i) => i.id === c.insuranceId)
                    return (
                      <div key={c.id} className="flex items-start justify-between rounded-md border p-3">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{c.title}</p>
                            <Badge variant={c.status === 'active' ? 'success' : 'neutral'} className="text-xs capitalize shrink-0">
                              {c.status}
                            </Badge>
                          </div>
                          {c.icd10Code && (
                            <p className="text-xs text-muted-foreground font-mono">{c.icd10Code} — {c.icd10Label}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Opened {formatDate(c.dateOpened)} · {visitCount} visit{visitCount !== 1 ? 's' : ''}
                            {ins && ` · ${ins.payer}`}
                          </p>
                        </div>
                        {canChart && (
                          <button
                            className="ml-3 shrink-0 text-muted-foreground hover:text-zinc-900"
                            onClick={() => { setEditingCase(c); setShowCaseDialog(true) }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Treatment Plan */}
          {plan ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Treatment Plan</CardTitle>
                  {canChart && <Link to="/treatment-plans" className="text-xs text-teal-700 hover:underline">View all</Link>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Primary Complaint</p>
                    <p className="font-medium">{plan.primaryComplaint}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Frequency</p>
                    <p>{plan.frequencyRecommendation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Sessions</p>
                    <p>{plan.expectedSessions} · {past.length} completed</p>
                  </div>
                  {plan.progressNotes && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Progress</p>
                      <p className="text-zinc-700">{plan.progressNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">No treatment plan on file.</p>
              </div>
              {canChart && (
                <Link to="/treatment-plans">
                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                    Create Plan
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Pain Trend */}
          {painChartData.length >= 2 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pain Trend</CardTitle>
                <p className="text-xs text-muted-foreground">Self-reported pain level (1–10) across visits</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={painChartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} ticks={[0, 2, 4, 6, 8, 10]} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}
                      formatter={(v) => [`${v}/10`, 'Pain']}
                    />
                    <Line
                      type="monotone"
                      dataKey="pain"
                      stroke="#0d9488"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Visit History */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Visit History</CardTitle>
                <div className="flex items-center gap-3">
                  {canChart && (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/visits?patient=${id}`)}>
                      <Plus className="h-3.5 w-3.5" /> New Note
                    </Button>
                  )}
                  {canChart && <Link to="/visits" className="text-xs text-teal-700 hover:underline">All visits</Link>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {patientVisits.length === 0 ? (
                <p className="text-sm text-muted-foreground">No visits charted yet.</p>
              ) : (
                <div className="space-y-3">
                  {patientVisits.map((v) => (
                    <div key={v.id} className="flex items-start justify-between rounded-md border p-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{formatDate(v.date)}</p>
                        <p className="text-xs text-muted-foreground">{v.chiefComplaint}</p>
                        {v.pointsUsed?.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {v.pointsUsed.map((pt) => (
                              <span key={pt} className="rounded bg-teal-50 px-1.5 py-0.5 text-xs text-teal-700">
                                {pt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        Pain: {v.painLevel}/10
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Contact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
              {patient.dateOfBirth && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>DOB: {formatDate(patient.dateOfBirth)}</span>
                </div>
              )}
              {patient.address && (
                <p className="pt-1 text-xs text-muted-foreground">{patient.address}</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((a) => (
                    <div key={a.id} className="rounded-md border p-2.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {format(new Date(a.datetime), 'EEE MMM d · h:mm a')}
                        </span>
                        <Badge variant={appointmentStatusBadge(a.status)} className="text-xs capitalize">
                          {a.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{appointmentTypeLabel(a.type)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info (collapsible) */}
          <Card>
            <button
              className="flex w-full items-center justify-between p-4 text-left"
              onClick={() => setShowAdditional(!showAdditional)}
            >
              <span className="text-sm font-medium">Additional Info</span>
              {showAdditional ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {showAdditional && (
              <div className="border-t px-4 pb-4 pt-3 space-y-3 text-sm">
                {patient.referralSource && (
                  <div>
                    <p className="text-xs text-muted-foreground">Referral Source</p>
                    <p>{patient.referralSource}</p>
                  </div>
                )}
                {(patient.occupation || patient.employer) && (
                  <div>
                    <p className="text-xs text-muted-foreground">Occupation / Employer</p>
                    <p>{[patient.occupation, patient.employer].filter(Boolean).join(' — ')}</p>
                  </div>
                )}
                {patient.inCollections && (
                  <div className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
                    In Collections
                  </div>
                )}
                {patient.allergies && (
                  <div>
                    <p className="text-xs text-muted-foreground">Allergies</p>
                    <p>{patient.allergies}</p>
                  </div>
                )}
                {patient.medications && (
                  <div>
                    <p className="text-xs text-muted-foreground">Medications</p>
                    <p>{patient.medications}</p>
                  </div>
                )}
                {patient.medicalHistory && (
                  <div>
                    <p className="text-xs text-muted-foreground">Medical History</p>
                    <p>{patient.medicalHistory}</p>
                  </div>
                )}
                {patient.emergencyContact?.name && (
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    <p>
                      {patient.emergencyContact.name}
                      {patient.emergencyContact.relation ? ` (${patient.emergencyContact.relation})` : ''}
                      {patient.emergencyContact.phone ? ` · ${patient.emergencyContact.phone}` : ''}
                    </p>
                  </div>
                )}
                {patient.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p>{patient.notes}</p>
                  </div>
                )}
                {!patient.referralSource && !patient.allergies && !patient.medications && !patient.medicalHistory && !patient.emergencyContact?.name && !patient.notes && (
                  <p className="text-muted-foreground">No additional info recorded. Edit the patient to add details.</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      <EditPatientDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        patient={patient}
        onSave={(changes) => {
          updatePatient(id, changes)
          setShowEdit(false)
        }}
      />

      <CaseDialog
        open={showCaseDialog}
        onOpenChange={setShowCaseDialog}
        patientId={id}
        insuranceProfiles={insuranceProfiles}
        existingCase={editingCase}
        onSave={(caseData) => {
          if (editingCase) {
            updateCase(editingCase.id, caseData)
          } else {
            addCase(caseData)
          }
        }}
      />
    </div>
  )
}
