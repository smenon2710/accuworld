import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Lightbulb, Save, ChevronDown, ChevronUp, Sparkles, Loader2, Wand2 } from 'lucide-react'
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
import { suggestHomeCareForComplaint } from '@/data/homeCareSuggestions'

const SOAP_TEMPLATE = `S: [Chief complaint — what the patient reports today, severity, aggravating/relieving factors]

O: [TCM assessment findings — pulse, tongue, palpation, relevant exam]

A: [TCM diagnosis — pattern identification, channel diagnosis]

P: [Treatment applied — points, modalities, herbal formula, home care. Follow-up plan.]`

const MODALITY_OPTIONS = [
  'Acupuncture', 'E-Stim', 'Deep Tissue Massage',
  'Tsubo/Vibration', 'Cupping', 'Moxibustion',
]

// Shared streaming helper for all AI suggestion calls in this file.
async function streamOpenRouter(apiKey, prompt, onToken) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://accuworld.vercel.app',
      'X-Title': 'AccuWorld - TCM Charting',
    },
    body: JSON.stringify({ model: 'openrouter/free', messages: [{ role: 'user', content: prompt }], stream: true }),
  })
  if (!res.ok) throw new Error(`OpenRouter error ${res.status}: ${await res.text()}`)
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let acc = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    for (const line of decoder.decode(value, { stream: true }).split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') break
      try {
        acc += JSON.parse(data).choices?.[0]?.delta?.content ?? ''
        onToken(acc)
      } catch { /* skip malformed chunk */ }
    }
  }
  return acc
}

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
  const [draftingNote, setDraftingNote] = useState(false)
  const [draftError, setDraftError] = useState(null)
  const [suggestHint, setSuggestHint] = useState(null)
  const [autoFillHint, setAutoFillHint] = useState(null)
  const [diagnosisLoading, setDiagnosisLoading] = useState(false)
  const [diagnosisSuggestion, setDiagnosisSuggestion] = useState(null)
  const [homeCareLoading, setHomeCareLoading] = useState(false)
  const [homeCareSuggestion, setHomeCareSuggestion] = useState(null)
  const [homeCareHint, setHomeCareHint] = useState(null)
  const [formulaLoading, setFormulaLoading] = useState(false)
  const [formulaSuggestion, setFormulaSuggestion] = useState(null)

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
    if (!form.chiefComplaint.trim()) {
      setSuggestHint('Enter a chief complaint first.')
      return
    }
    const suggested = suggestPointsForComplaint(form.chiefComplaint)
    if (suggested.length > 0) {
      const merged = [...new Set([...form.pointsUsed, ...suggested])]
      set('pointsUsed', merged)
      setSuggestHint(null)
    } else {
      setSuggestHint('No suggestions for this complaint — try keywords like "lower back", "sciatica", "headache".')
    }
  }

  async function handleDraftNote() {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
    if (!apiKey) {
      setDraftError('Add your OpenRouter API key to .env as VITE_OPENROUTER_API_KEY to enable AI drafting.')
      return
    }

    setDraftingNote(true)
    setDraftError(null)
    set('soapNote', '')

    const prompt = `You are an experienced licensed acupuncturist and TCM practitioner. Write a concise clinical SOAP note based on this visit.

Patient: ${patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'}
Chief complaint: ${form.chiefComplaint || 'Not specified'}
Pain level: ${form.painLevel}/10
Pulse: ${form.pulseRate}, ${form.pulseQuality}
Tongue: ${form.tongueBody} body, ${form.tongueCoating} coating
Meridians: ${form.meridians || 'Not specified'}
Points used: ${form.pointsUsed.join(', ') || 'Not specified'}
Modalities: ${form.modalities.join(', ')}
Treatment strategy: ${form.treatmentStrategy || 'Not specified'}
Herbal formula: ${form.herbalFormula || 'None'}
Home care: ${form.homeCareRecommendations || 'None'}

Write the SOAP note in exactly this format (no preamble, just the note):
S: [what the patient reports — chief complaint, severity, aggravating/relieving factors]

O: [TCM objective findings — pulse, tongue, palpation]

A: [TCM diagnosis — pattern identification, channel involvement]

P: [treatment applied today — points, modalities, herbal, home care, follow-up plan]

Be specific, clinical, and concise. Use proper TCM terminology.`

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://accuworld.vercel.app',
          'X-Title': 'AccuWorld - SOAP Note Drafting',
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
      })

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`OpenRouter error ${response.status}: ${err}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content ?? ''
            accumulated += delta
            set('soapNote', accumulated)
          } catch {
            // malformed SSE chunk — skip
          }
        }
      }
    } catch (err) {
      console.error('[Visits] AI draft failed:', err)
      setDraftError('Draft failed — check your API key or network. You can still write the note manually.')
      set('soapNote', SOAP_TEMPLATE)
    } finally {
      setDraftingNote(false)
    }
  }

  function handleAutoFillObjective() {
    const text = `Pulse: ${form.pulseRate}, ${form.pulseQuality}. Tongue: ${form.tongueBody} body, ${form.tongueCoating} coating.`
    const lines = form.soapNote.split('\n')
    const oIdx = lines.findIndex((l) => l.startsWith('O:'))
    if (oIdx !== -1) {
      lines[oIdx] = `O: ${text}`
      set('soapNote', lines.join('\n'))
      setShowSoap(true)
      setAutoFillHint(null)
    } else {
      setAutoFillHint(text)
    }
  }

  async function handleSuggestDiagnosis() {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
    if (!apiKey) {
      setDiagnosisSuggestion('Add VITE_OPENROUTER_API_KEY to .env to enable AI suggestions.')
      return
    }
    setDiagnosisLoading(true)
    setDiagnosisSuggestion(null)
    const prompt = `You are an expert TCM practitioner. Based on these clinical findings, suggest 1–3 TCM pattern diagnoses. Be concise.

Chief complaint: ${form.chiefComplaint || 'Not specified'}
Pulse: ${form.pulseRate}, ${form.pulseQuality}
Tongue: ${form.tongueBody} body, ${form.tongueCoating} coating

Return just the pattern diagnoses in this exact format (no preamble):
1. Pattern Name — brief rationale (10–15 words)
2. Pattern Name — rationale (if applicable)
3. Pattern Name — rationale (if applicable)`
    try {
      await streamOpenRouter(apiKey, prompt, (acc) => setDiagnosisSuggestion(acc))
    } catch (err) {
      console.error('[Visits] Suggest diagnosis failed:', err)
      setDiagnosisSuggestion('Suggestion failed — check your API key or network.')
    } finally {
      setDiagnosisLoading(false)
    }
  }

  async function handleSuggestHomeCare() {
    setHomeCareSuggestion(null)
    setHomeCareHint(null)
    if (!form.chiefComplaint.trim()) {
      setHomeCareHint('Enter a chief complaint to get home care suggestions.')
      return
    }
    const local = suggestHomeCareForComplaint(form.chiefComplaint)
    if (local.length > 0) {
      setHomeCareSuggestion(local.join(' '))
      return
    }
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
    if (!apiKey) {
      setHomeCareHint('No suggestions for this complaint. Try keywords like "lower back", "headache", "neck", "sciatica".')
      return
    }
    setHomeCareLoading(true)
    const prompt = `You are a TCM practitioner. Give 2–3 home care recommendations for a patient whose chief complaint is: "${form.chiefComplaint}".
Return only brief, actionable items — one per line, no numbering, under 15 words each. No preamble.`
    try {
      await streamOpenRouter(apiKey, prompt, (acc) => setHomeCareSuggestion(acc))
    } catch (err) {
      console.error('[Visits] Suggest home care failed:', err)
      setHomeCareHint('Suggestion failed — check your API key or network.')
    } finally {
      setHomeCareLoading(false)
    }
  }

  async function handleSuggestFormula() {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
    if (!apiKey) {
      setFormulaSuggestion('Add VITE_OPENROUTER_API_KEY to .env to enable AI suggestions.')
      return
    }
    setFormulaLoading(true)
    setFormulaSuggestion(null)
    const prompt = `You are a TCM practitioner. Suggest a classical herbal formula for this patient.

Chief complaint: ${form.chiefComplaint || 'Not specified'}
Treatment strategy / TCM pattern: ${form.treatmentStrategy || 'Not specified'}

Return only: "Formula Name — one-sentence rationale". Nothing else.`
    try {
      await streamOpenRouter(apiKey, prompt, (acc) => setFormulaSuggestion(acc))
    } catch (err) {
      console.error('[Visits] Suggest formula failed:', err)
      setFormulaSuggestion('Suggestion failed — check your API key or network.')
    } finally {
      setFormulaLoading(false)
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
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Objective — TCM Assessment</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoFillObjective}
                  className="h-7 gap-1 text-xs text-teal-700 hover:text-teal-800"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Auto-fill O:
                </Button>
              </div>
            </CardHeader>
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
              {autoFillHint && (
                <div className="rounded-md border border-teal-200 bg-teal-50 p-2.5 text-xs text-teal-700">
                  O: section not found in SOAP note. Composed: <span className="font-medium">{autoFillHint}</span>
                  <button type="button" onClick={() => setAutoFillHint(null)} className="ml-2 text-muted-foreground hover:text-zinc-700">✕</button>
                </div>
              )}
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
                {suggestHint && (
                  <p className="text-xs text-amber-600">{suggestHint}</p>
                )}
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
                <div className="flex items-center justify-between">
                  <Label>Treatment Strategy</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSuggestDiagnosis}
                    disabled={diagnosisLoading}
                    className="h-7 gap-1 text-xs text-teal-700 hover:text-teal-800 disabled:opacity-60"
                  >
                    {diagnosisLoading
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Suggesting…</>
                      : <><Sparkles className="h-3.5 w-3.5" />Suggest Diagnosis</>
                    }
                  </Button>
                </div>
                <Textarea
                  value={form.treatmentStrategy}
                  onChange={(e) => set('treatmentStrategy', e.target.value)}
                  rows={2}
                  placeholder="TCM strategy and rationale…"
                />
                {diagnosisSuggestion && (
                  <div className="rounded-md border border-teal-200 bg-teal-50 p-3 text-xs">
                    <p className="whitespace-pre-wrap text-teal-800">{diagnosisSuggestion}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-teal-700 px-2"
                        onClick={() => { set('treatmentStrategy', diagnosisSuggestion); setDiagnosisSuggestion(null) }}
                      >
                        Use this →
                      </Button>
                      <button type="button" onClick={() => setDiagnosisSuggestion(null)} className="text-xs text-muted-foreground hover:text-zinc-700">
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Herbal Formula</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSuggestFormula}
                    disabled={formulaLoading}
                    className="h-7 gap-1 text-xs text-teal-700 hover:text-teal-800 disabled:opacity-60"
                  >
                    {formulaLoading
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Suggesting…</>
                      : <><Sparkles className="h-3.5 w-3.5" />Suggest Formula</>
                    }
                  </Button>
                </div>
                <Input
                  value={form.herbalFormula}
                  onChange={(e) => set('herbalFormula', e.target.value)}
                  placeholder="e.g. Du Huo Ji Sheng Wan"
                />
                {formulaSuggestion && (
                  <div className="rounded-md border border-teal-200 bg-teal-50 p-3 text-xs">
                    <p className="text-teal-800">{formulaSuggestion}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-teal-700 px-2"
                        onClick={() => {
                          const name = formulaSuggestion.split(' — ')[0].trim()
                          set('herbalFormula', name)
                          setFormulaSuggestion(null)
                        }}
                      >
                        Use this →
                      </Button>
                      <button type="button" onClick={() => setFormulaSuggestion(null)} className="text-xs text-muted-foreground hover:text-zinc-700">
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Home Care</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSuggestHomeCare}
                    disabled={homeCareLoading}
                    className="h-7 gap-1 text-xs text-teal-700 hover:text-teal-800 disabled:opacity-60"
                  >
                    {homeCareLoading
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Suggesting…</>
                      : <><Lightbulb className="h-3.5 w-3.5" />Suggest</>
                    }
                  </Button>
                </div>
                <Textarea
                  value={form.homeCareRecommendations}
                  onChange={(e) => set('homeCareRecommendations', e.target.value)}
                  rows={2}
                  placeholder="Stretches, ice, activity…"
                />
                {homeCareSuggestion && (
                  <div className="rounded-md border border-teal-200 bg-teal-50 p-3 text-xs">
                    <p className="whitespace-pre-wrap text-teal-800">{homeCareSuggestion}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-teal-700 px-2"
                        onClick={() => { set('homeCareRecommendations', homeCareSuggestion.replace(/\n+/g, ' ').trim()); setHomeCareSuggestion(null) }}
                      >
                        Use this →
                      </Button>
                      <button type="button" onClick={() => setHomeCareSuggestion(null)} className="text-xs text-muted-foreground hover:text-zinc-700">
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
                {homeCareHint && (
                  <p className="text-xs text-amber-600">{homeCareHint}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SOAP Note */}
          <Card>
            <div className="flex items-center justify-between p-4">
              <button
                className="flex items-center gap-2"
                onClick={() => setShowSoap(!showSoap)}
                type="button"
              >
                <CardTitle className="text-base">SOAP Note</CardTitle>
                {showSoap ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDraftNote}
                disabled={draftingNote}
                className="h-7 gap-1.5 text-xs text-teal-700 border-teal-200 hover:bg-teal-50 hover:text-teal-800 disabled:opacity-60"
              >
                {draftingNote
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Drafting…</>
                  : <><Sparkles className="h-3.5 w-3.5" />Draft with AI</>
                }
              </Button>
            </div>
            {showSoap && (
              <CardContent>
                {draftError && (
                  <p className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 border border-amber-200">
                    {draftError}
                  </p>
                )}
                <Textarea
                  value={form.soapNote}
                  onChange={(e) => set('soapNote', e.target.value)}
                  rows={10}
                  className="font-mono text-xs"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {draftingNote ? 'AI is writing…' : 'Edit and save manually — nothing is auto-saved.'}
                </p>
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
