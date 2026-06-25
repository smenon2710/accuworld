import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Edit2, Check, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'

function formatDate(d) {
  if (!d) return '—'
  try { return format(parseISO(d), 'MMM d, yyyy') } catch { return d }
}

const EMPTY_PLAN = {
  patientId: '',
  primaryComplaint: '',
  treatmentGoals: '',
  frequencyRecommendation: '',
  expectedSessions: '',
  progressNotes: '',
}

export default function TreatmentPlans() {
  const { patients, treatmentPlans, appointments, visits, saveTreatmentPlan } = useApp()
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_PLAN)
  const [suggestionDismissed, setSuggestionDismissed] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function openNew() {
    setEditing(null)
    setForm(EMPTY_PLAN)
    setSuggestionDismissed(false)
    setShowDialog(true)
  }

  function openEdit(plan) {
    setEditing(plan)
    setForm({ ...plan })
    setShowDialog(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const now = new Date().toISOString().slice(0, 10)
    saveTreatmentPlan({
      ...form,
      id: editing?.id ?? `tp${Date.now()}`,
      expectedSessions: Number(form.expectedSessions) || 0,
      createdAt: editing?.createdAt ?? now,
      updatedAt: now,
    })
    setShowDialog(false)
  }

  const completedByPatient = {}
  appointments
    .filter((a) => a.status === 'completed')
    .forEach((a) => {
      completedByPatient[a.patientId] = (completedByPatient[a.patientId] ?? 0) + 1
    })

  const patientsWithoutPlan = patients.filter(
    (p) => p.status === 'active' && !treatmentPlans.find((tp) => tp.patientId === p.id)
  )

  const dialogLatestVisit = !editing && form.patientId
    ? [...visits]
        .filter((v) => v.patientId === form.patientId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0] ?? null
    : null

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Treatment Plans</h1>
          <p className="text-sm text-muted-foreground">{treatmentPlans.length} plans active</p>
        </div>
        <Button onClick={openNew}>
          <ClipboardList className="h-4 w-4" />
          New Plan
        </Button>
      </div>

      {treatmentPlans.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">No treatment plans yet. Create one from a patient's profile.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {treatmentPlans.map((plan) => {
            const patient = patients.find((p) => p.id === plan.patientId)
            const completed = completedByPatient[plan.patientId] ?? 0
            const progress = plan.expectedSessions > 0
              ? Math.min(100, Math.round((completed / plan.expectedSessions) * 100))
              : 0

            return (
              <Card key={plan.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      {patient && (
                        <Link
                          to={`/patients/${patient.id}`}
                          className="text-sm font-semibold text-zinc-900 hover:text-teal-700 hover:underline"
                        >
                          {patient.firstName} {patient.lastName}
                        </Link>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Updated {formatDate(plan.updatedAt)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openEdit(plan)}>
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Primary Complaint</p>
                      <p>{plan.primaryComplaint}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Frequency</p>
                      <p>{plan.frequencyRecommendation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                      <p>
                        <span className="font-semibold text-teal-700">{completed}</span>
                        {' / '}{plan.expectedSessions} completed
                      </p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  {plan.expectedSessions > 0 && (
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-100">
                        <div
                          className="h-1.5 rounded-full bg-teal-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {plan.treatmentGoals && (
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground mb-0.5">Goals</p>
                      <p className="text-zinc-700">{plan.treatmentGoals}</p>
                    </div>
                  )}
                  {plan.progressNotes && (
                    <div className="rounded-md bg-zinc-50 p-3 text-sm">
                      <p className="text-xs text-muted-foreground mb-0.5">Progress Notes</p>
                      <p className="text-zinc-700">{plan.progressNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {patientsWithoutPlan.length > 0 && (
        <div className="rounded-lg border border-dashed p-4">
          <p className="text-xs text-muted-foreground mb-2">Active patients without a treatment plan:</p>
          <div className="flex flex-wrap gap-2">
            {patientsWithoutPlan.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setEditing(null)
                  setForm({ ...EMPTY_PLAN, patientId: p.id })
                  setSuggestionDismissed(false)
                  setShowDialog(true)
                }}
                className="rounded-full border px-3 py-1 text-xs hover:bg-zinc-50"
              >
                {p.firstName} {p.lastName} +
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Treatment Plan' : 'New Treatment Plan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-3">
            {!editing && (
              <div className="space-y-1.5">
                <Label>Patient *</Label>
                <Select value={form.patientId} onChange={(e) => set('patientId', e.target.value)} required>
                  <option value="">Select patient…</option>
                  {patients.filter(p => p.status === 'active').map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </Select>
              </div>
            )}
            {dialogLatestVisit && !suggestionDismissed && (
              <div className="rounded-md border border-teal-200 bg-teal-50 p-3 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-medium text-teal-800">Suggestions from last visit ({formatDate(dialogLatestVisit.date)})</p>
                  <button type="button" onClick={() => setSuggestionDismissed(true)} className="text-muted-foreground hover:text-zinc-700">✕</button>
                </div>
                {dialogLatestVisit.chiefComplaint && (
                  <p className="text-teal-700 mb-1"><span className="font-medium">Complaint:</span> {dialogLatestVisit.chiefComplaint}</p>
                )}
                {dialogLatestVisit.treatmentStrategy && (
                  <p className="text-teal-700 mb-2"><span className="font-medium">Strategy:</span> {dialogLatestVisit.treatmentStrategy}</p>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-teal-700 px-2"
                  onClick={() => {
                    if (dialogLatestVisit.chiefComplaint) set('primaryComplaint', dialogLatestVisit.chiefComplaint)
                    if (dialogLatestVisit.treatmentStrategy) set('treatmentGoals', dialogLatestVisit.treatmentStrategy)
                    setSuggestionDismissed(true)
                  }}
                >
                  Use suggestions →
                </Button>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Primary Complaint</Label>
              <Textarea value={form.primaryComplaint} onChange={(e) => set('primaryComplaint', e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Treatment Goals</Label>
              <Textarea value={form.treatmentGoals} onChange={(e) => set('treatmentGoals', e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Input
                  value={form.frequencyRecommendation}
                  onChange={(e) => set('frequencyRecommendation', e.target.value)}
                  placeholder="e.g. 2x/week for 4 weeks"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Expected Sessions</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.expectedSessions}
                  onChange={(e) => set('expectedSessions', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Progress Notes</Label>
              <Textarea value={form.progressNotes} onChange={(e) => set('progressNotes', e.target.value)} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button type="submit">Save Plan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
