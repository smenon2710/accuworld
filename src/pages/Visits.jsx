import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Lightbulb, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PointBadgeInput from '@/components/visits/PointBadgeInput'
import { suggestPointsForComplaint } from '@/data/pointSuggestions'
import { APPOINTMENT_STATUS, COVERAGE_STATUS } from '@/data/seed'

const SOAP_TEMPLATE = `S: [Chief complaint — what the patient reports today, severity, aggravating/relieving factors]

O: [TCM assessment findings — pulse, tongue, palpation, relevant exam]

A: [TCM diagnosis — pattern identification, channel diagnosis]

P: [Treatment applied — points, modalities, herbal formula, home care. Follow-up plan.]`

const MODALITY_OPTIONS = [
  'Acupuncture', 'E-Stim', 'Deep Tissue Massage',
  'Tsubo/Vibration', 'Cupping', 'Moxibustion',
]

export default function Visits() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const apptId = searchParams.get('appt')
  const patientIdParam = searchParams.get('patient')
  const { patients, appointments, visits, insuranceProfiles, addVisit, updateVisit, updateAppointment, updateInsurance } = useApp()

  const appointment = apptId ? appointments.find((a) => a.id === apptId) : null
  const existingVisit = appointment ? visits.find((v) => v.appointmentId === apptId) : null

  const patient = appointment
    ? patients.find((p) => p.id === appointment.patientId)
    : patientIdParam
    ? patients.find((p) => p.id === patientIdParam)
    : null
  const ins = patient ? insuranceProfiles.find((i) => i.patientId === patient.id) : null

  const [form, setForm] = useState({
    visitDate: existingVisit?.date ?? '2026-06-21',
    chiefComplaint: existingVisit?.chiefComplaint ?? '',
    painLevel: existingVisit?.painLevel ?? 5,
    pulseRate: existingVisit?.pulseRate ?? 'Normal',
    pulseQuality: existingVisit?.pulseQuality ?? 'Wiry',
    tongueBody: existingVisit?.tongueBody ?? 'Pink',
    tongueCoating: existingVisit?.tongueCoating ?? 'Thin White',
    meridians: existingVisit?.meridians ?? '',
    pointsUsed: existingVisit?.pointsUsed ?? [],
    modalities: existingVisit?.modalities ?? ['Acupuncture'],
    treatmentStrategy: existingVisit?.treatmentStrategy ?? '',
    herbalFormula: existingVisit?.herbalFormula ?? '',
    homeCareRecommendations: existingVisit?.homeCareRecommendations ?? '',
    soapNote: existingVisit?.soapNote ?? SOAP_TEMPLATE,
  })
  const [saved, setSaved] = useState(false)
  const [showSoap, setShowSoap] = useState(true)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  function toggleModality(mod) {
    set('modalities', form.modalities.includes(mod)
      ? form.modalities.filter((m) => m !== mod)
      : [...form.modalities, mod]
    )
  }

  function handleSuggestPoints() {
    const suggested = suggestPointsForComplaint(form.chiefComplaint)
    if (suggested.length > 0) {
      const merged = [...new Set([...form.pointsUsed, ...suggested])]
      set('pointsUsed', merged)
    }
  }

  function handleSave() {
    if (!patient) return

    const { visitDate, ...formData } = form
    const visitData = {
      ...formData,
      appointmentId: apptId ?? null,
      patientId: patient.id,
      date: apptId ? appointment.datetime.slice(0, 10) : visitDate,
    }

    if (existingVisit) {
      updateVisit(existingVisit.id, visitData)
    } else {
      addVisit({ id: `v${Date.now()}`, ...visitData })

      if (apptId) {
        // Mark appointment complete and decrement insurance visits
        updateAppointment(apptId, { status: APPOINTMENT_STATUS.COMPLETED })
        if (ins && ins.coverageStatus === COVERAGE_STATUS.COVERED) {
          updateInsurance(patient.id, { visitsUsed: ins.visitsUsed + 1 })
        }
      }
    }

    setSaved(true)
  }

  // No context — show list of recent visits
  if (!apptId && !patientIdParam) {
    const recentVisits = [...visits]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20)

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Visit / Chart</h1>
            <p className="text-sm text-muted-foreground">TCM clinical notes for completed appointments</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/schedule')}>
            Open from Schedule →
          </Button>
        </div>
        {recentVisits.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">No visits charted yet. Complete an appointment from the Schedule to start charting.</p>
          </div>
        ) : (
          <div className="rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-zinc-50/60">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Chief Complaint</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Pain</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Points</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((v) => {
                  const pt = patients.find((p) => p.id === v.patientId)
                  return (
                    <tr
                      key={v.id}
                      className="border-b last:border-0 hover:bg-zinc-50/50 cursor-pointer"
                      onClick={() => navigate(`/visits?appt=${v.appointmentId}`)}
                    >
                      <td className="px-4 py-3 font-medium">{format(new Date(v.date), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3">
                        {pt ? `${pt.firstName} ${pt.lastName}` : v.patientId}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{v.chiefComplaint}</td>
                      <td className="px-4 py-3">{v.painLevel}/10</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(v.pointsUsed ?? []).slice(0, 4).map((pt) => (
                            <span key={pt} className="rounded bg-teal-50 px-1.5 text-xs text-teal-700">{pt}</span>
                          ))}
                          {(v.pointsUsed ?? []).length > 4 && (
                            <span className="text-xs text-muted-foreground">+{v.pointsUsed.length - 4}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  if (apptId && !appointment) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">Appointment <strong>{apptId}</strong> not found.</p>
        <Button variant="link" onClick={() => navigate('/visits')}>Back to visits</Button>
      </div>
    )
  }

  if (patientIdParam && !patient) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">Patient <strong>{patientIdParam}</strong> not found.</p>
        <Button variant="link" onClick={() => navigate('/patients')}>Back to patients</Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(patientIdParam ? `/patients/${patientIdParam}` : '/visits')}
            className="mb-1 text-sm text-muted-foreground hover:text-zinc-900"
          >
            {patientIdParam ? '← Patient' : '← All Visits'}
          </button>
          <h1 className="text-xl font-semibold text-zinc-900">
            {apptId ? 'TCM Chart' : 'New Note'} — {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'}
          </h1>
          {apptId ? (
            <p className="text-sm text-muted-foreground">
              {format(new Date(appointment.datetime), 'EEEE, MMMM d, yyyy · h:mm a')}
            </p>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Date</span>
              <Input
                type="date"
                value={form.visitDate}
                onChange={(e) => set('visitDate', e.target.value)}
                className="h-7 w-40 text-sm"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-teal-600">Saved ✓</span>}
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Note
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Main form */}
        <div className="col-span-2 space-y-5">
          {/* Subjective */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Subjective</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Chief Complaint</Label>
                <Textarea
                  value={form.chiefComplaint}
                  onChange={(e) => set('chiefComplaint', e.target.value)}
                  rows={2}
                  placeholder="What the patient reports today…"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Pain Level</Label>
                  <span className="text-sm font-semibold text-teal-700">{form.painLevel} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={form.painLevel}
                  onChange={(e) => set('painLevel', Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 (minimal)</span><span>10 (severe)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objective — TCM Assessment */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Objective — TCM Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pulse</p>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Rate</Label>
                    <Select value={form.pulseRate} onChange={(e) => set('pulseRate', e.target.value)}>
                      {['Normal', 'Rapid', 'Slow'].map((v) => <option key={v} value={v}>{v}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Quality</Label>
                    <Select value={form.pulseQuality} onChange={(e) => set('pulseQuality', e.target.value)}>
                      {['Floating', 'Deep', 'Wiry', 'Slippery', 'Thin', 'Choppy'].map((v) => <option key={v} value={v}>{v}</option>)}
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tongue</p>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Body</Label>
                    <Select value={form.tongueBody} onChange={(e) => set('tongueBody', e.target.value)}>
                      {['Pale', 'Pink', 'Red', 'Purple', 'Dusky'].map((v) => <option key={v} value={v}>{v}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Coating</Label>
                    <Select value={form.tongueCoating} onChange={(e) => set('tongueCoating', e.target.value)}>
                      {['None', 'Thin White', 'Thick White', 'Yellow', 'Dry', 'Wet'].map((v) => <option key={v} value={v}>{v}</option>)}
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan / Treatment */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Plan / Treatment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Meridians</Label>
                <Input
                  value={form.meridians}
                  onChange={(e) => set('meridians', e.target.value)}
                  placeholder="e.g. Bladder, Kidney, Governing Vessel"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Acupuncture Points</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSuggestPoints}
                    className="h-7 gap-1 text-xs text-teal-700 hover:text-teal-800"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    Suggest Points
                  </Button>
                </div>
                <PointBadgeInput value={form.pointsUsed} onChange={(pts) => set('pointsUsed', pts)} />
              </div>
              <div className="space-y-1.5">
                <Label>Modalities</Label>
                <div className="flex flex-wrap gap-2">
                  {MODALITY_OPTIONS.map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => toggleModality(mod)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        form.modalities.includes(mod)
                          ? 'bg-teal-600 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Treatment Strategy</Label>
                <Textarea
                  value={form.treatmentStrategy}
                  onChange={(e) => set('treatmentStrategy', e.target.value)}
                  rows={2}
                  placeholder="TCM strategy and rationale…"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Herbal Formula</Label>
                  <Input
                    value={form.herbalFormula}
                    onChange={(e) => set('herbalFormula', e.target.value)}
                    placeholder="e.g. Du Huo Ji Sheng Wan"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Home Care</Label>
                  <Input
                    value={form.homeCareRecommendations}
                    onChange={(e) => set('homeCareRecommendations', e.target.value)}
                    placeholder="Stretches, ice, activity…"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SOAP Note */}
          <Card>
            <button
              className="flex w-full items-center justify-between p-4"
              onClick={() => setShowSoap(!showSoap)}
              type="button"
            >
              <CardTitle className="text-base">SOAP Note</CardTitle>
              {showSoap ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showSoap && (
              <CardContent>
                <Textarea
                  value={form.soapNote}
                  onChange={(e) => set('soapNote', e.target.value)}
                  rows={10}
                  className="font-mono text-xs"
                />
                <p className="mt-2 text-xs text-muted-foreground">Template pre-filled. Edit and save manually — nothing is auto-saved.</p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {patient && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Patient</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Link
                  to={`/patients/${patient.id}`}
                  className="font-medium text-zinc-900 hover:text-teal-700 hover:underline"
                >
                  {patient.firstName} {patient.lastName}
                </Link>
                <p className="text-xs text-muted-foreground">{patient.primaryCondition}</p>
                {ins && ins.coverageStatus === COVERAGE_STATUS.COVERED && (
                  <div className="rounded-md bg-zinc-50 p-2.5 text-xs space-y-0.5">
                    <p className="font-medium">{ins.payer} — {ins.planName}</p>
                    <p>Copay: ${ins.copay}</p>
                    <p>Visits: {ins.visitsAuthorized - ins.visitsUsed} remaining</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">TCM Quick Reference</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2 text-zinc-600">
              <div>
                <p className="font-medium mb-1">Pulse Qualities</p>
                <p>Wiry → Liver Qi stagnation</p>
                <p>Slippery → Phlegm / Damp</p>
                <p>Thin → Blood deficiency</p>
                <p>Deep + Slow → Yang deficiency</p>
              </div>
              <div>
                <p className="font-medium mb-1">Tongue Signs</p>
                <p>Pale → Blood or Yang deficiency</p>
                <p>Red → Heat or Yin deficiency</p>
                <p>Yellow coat → Heat</p>
                <p>Wet/Swollen → Dampness</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
