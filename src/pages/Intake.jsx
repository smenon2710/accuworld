import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Check, ChevronRight, ChevronLeft, ClipboardList } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import PainBodyDiagram from '@/components/intake/PainBodyDiagram'
import {
  HIPAA_NOTICE, CONSENT_TEXT, FINANCIAL_POLICY, ARBITRATION_AGREEMENT,
  ASSIGNMENT_OF_BENEFITS, FAMILY_HISTORY_CONDITIONS,
  BODY_SYMPTOM_OPTIONS, EMOTIONAL_SYMPTOM_OPTIONS,
} from '@/data/intakeContent'

const TODAY = new Date().toISOString().slice(0, 10)

const EMPTY = {
  // Screen 1
  printName: '', address: '', city: '', state: 'NJ', zip: '',
  phone: '', email: '', dob: '', age: '', sex: '', maritalStatus: '',
  referralSource: '', occupation: '', employer: '',
  emergencyName: '', emergencyRelation: '', emergencyPhone: '',
  sig1: '', sig1Date: TODAY,
  // Screen 2
  chiefComplaint: '', onsetDate: '',
  surgeries: [],
  injuries: [],
  illnesses: '',
  medications: [],
  familyHistory: [],
  bodySymptoms: [],
  stressLevel: 5,
  emotionalSymptoms: [],
  // Screen 3
  painMarkers: [],
  sig3: '', sig3Date: TODAY,
  // Screen 4
  sig4: '', sig4Date: TODAY,
  // Screen 5
  sig5: '', sig5Date: TODAY, initials5: '',
}

const STEP_LABELS = [
  'Patient Information',
  'Medical History',
  'Pain Diagram',
  'Consent to Treat',
  'Legal & Financial',
]

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border-2 ${
                done ? 'bg-teal-600 border-teal-600 text-white' :
                active ? 'bg-white border-teal-600 text-teal-700' :
                'bg-white border-zinc-300 text-zinc-400'
              }`}>
                {done ? <Check className="h-4 w-4" /> : step}
              </div>
              <span className={`mt-1 text-[10px] font-medium max-w-[72px] text-center leading-tight ${
                active ? 'text-teal-700' : done ? 'text-teal-600' : 'text-zinc-400'
              }`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-12 h-0.5 mb-5 ${step < current ? 'bg-teal-600' : 'bg-zinc-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function SectionTitle({ children }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 border-b pb-1">{children}</p>
}

function SignatureLine({ label, value, onChange, dateValue, onDateChange, required }) {
  return (
    <div className="mt-6 rounded-lg border border-zinc-300 bg-zinc-50 p-4 space-y-3">
      <p className="text-sm font-semibold text-zinc-700">{label}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Signature (type full name)</Label>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-lg">✕</span>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Type your full name to sign"
              className="font-signature text-base"
              style={{ fontFamily: 'cursive', fontSize: '1.1rem' }}
              required={required}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date</Label>
          <Input type="date" value={dateValue} onChange={(e) => onDateChange(e.target.value)} />
        </div>
      </div>
    </div>
  )
}

function AddRowTable({ rows, onAdd, onRemove, onUpdate, columns, addLabel }) {
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          {columns.map((col) => (
            <Input
              key={col.field}
              value={row[col.field] ?? ''}
              onChange={(e) => {
                const next = rows.map((r, ri) => ri === i ? { ...r, [col.field]: e.target.value } : r)
                onUpdate(next)
              }}
              placeholder={col.placeholder}
              className="flex-1 text-sm"
            />
          ))}
          <button type="button" onClick={() => onRemove(i)} className="text-zinc-400 hover:text-red-500 text-lg leading-none shrink-0">×</button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="text-xs text-teal-700 hover:underline"
      >
        + {addLabel}
      </button>
    </div>
  )
}

function MultiSelect({ options, selected, onChange }) {
  function toggle(opt) {
    onChange(
      selected.includes(opt)
        ? selected.filter((o) => o !== opt)
        : [...selected, opt]
    )
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selected.includes(opt)
              ? 'bg-teal-600 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function Screen1({ data, set }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
        {HIPAA_NOTICE}
      </div>

      <div>
        <SectionTitle>Personal Information</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Full Legal Name (print clearly) *</Label>
            <Input value={data.printName} onChange={(e) => set('printName', e.target.value)} required />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Street Address</Label>
            <Input value={data.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">City</Label>
            <Input value={data.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">State</Label>
              <Input value={data.state} onChange={(e) => set('state', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">ZIP</Label>
              <Input value={data.zip} onChange={(e) => set('zip', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Primary Phone *</Label>
            <Input value={data.phone} onChange={(e) => set('phone', e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Date of Birth</Label>
            <Input type="date" value={data.dob} onChange={(e) => set('dob', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Age</Label>
            <Input value={data.age} onChange={(e) => set('age', e.target.value)} placeholder="Years" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sex</Label>
            <Select value={data.sex} onChange={(e) => set('sex', e.target.value)}>
              <option value="">—</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Marital Status</Label>
            <Select value={data.maritalStatus} onChange={(e) => set('maritalStatus', e.target.value)}>
              <option value="">—</option>
              {['Single', 'Married', 'Divorced', 'Widowed'].map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Practice Info</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Referral Source</Label>
            <Input value={data.referralSource} onChange={(e) => set('referralSource', e.target.value)} placeholder="Friend, Google, doctor…" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Occupation</Label>
            <Input value={data.occupation} onChange={(e) => set('occupation', e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Employer</Label>
            <Input value={data.employer} onChange={(e) => set('employer', e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Emergency Contact</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Name</Label>
            <Input value={data.emergencyName} onChange={(e) => set('emergencyName', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Relation</Label>
            <Input value={data.emergencyRelation} onChange={(e) => set('emergencyRelation', e.target.value)} placeholder="Spouse, Parent…" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Phone</Label>
            <Input value={data.emergencyPhone} onChange={(e) => set('emergencyPhone', e.target.value)} />
          </div>
        </div>
      </div>

      <SignatureLine
        label="Patient Signature — HIPAA Notice Acknowledgment"
        value={data.sig1}
        onChange={(v) => set('sig1', v)}
        dateValue={data.sig1Date}
        onDateChange={(v) => set('sig1Date', v)}
        required
      />
      <p className="text-xs text-muted-foreground">By typing your name above, you acknowledge receipt of our Notice of Privacy Practices.</p>
    </div>
  )
}

function Screen2({ data, set }) {
  function updateSurgeries(next) { set('surgeries', next) }
  function updateInjuries(next) { set('injuries', next) }
  function updateMedications(next) { set('medications', next) }

  function toggleFH(cond) {
    set('familyHistory',
      data.familyHistory.includes(cond)
        ? data.familyHistory.filter((c) => c !== cond)
        : [...data.familyHistory, cond]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Chief Complaint</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Chief Complaint (what brings you in today?)</Label>
            <Textarea
              value={data.chiefComplaint}
              onChange={(e) => set('chiefComplaint', e.target.value)}
              rows={2}
              placeholder="Describe your main concern, symptoms, and how they affect your daily life…"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Date of Onset</Label>
            <Input type="date" value={data.onsetDate} onChange={(e) => set('onsetDate', e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Surgical History</SectionTitle>
        <AddRowTable
          rows={data.surgeries}
          onAdd={() => set('surgeries', [...data.surgeries, { procedure: '', date: '' }])}
          onRemove={(i) => set('surgeries', data.surgeries.filter((_, ri) => ri !== i))}
          onUpdate={updateSurgeries}
          columns={[
            { field: 'procedure', placeholder: 'Procedure / Surgery' },
            { field: 'date', placeholder: 'Approx. date' },
          ]}
          addLabel="Add surgery"
        />
      </div>

      <div>
        <SectionTitle>Traumatic Injuries</SectionTitle>
        <AddRowTable
          rows={data.injuries}
          onAdd={() => set('injuries', [...data.injuries, { type: '', date: '' }])}
          onRemove={(i) => set('injuries', data.injuries.filter((_, ri) => ri !== i))}
          onUpdate={updateInjuries}
          columns={[
            { field: 'type', placeholder: 'Car accident / sports / other' },
            { field: 'date', placeholder: 'Approx. date' },
          ]}
          addLabel="Add injury"
        />
      </div>

      <div>
        <SectionTitle>Serious Illnesses</SectionTitle>
        <Textarea
          value={data.illnesses}
          onChange={(e) => set('illnesses', e.target.value)}
          rows={2}
          placeholder="List any serious illnesses, including childhood illnesses, with approximate dates…"
        />
      </div>

      <div>
        <SectionTitle>Current Medications & Supplements</SectionTitle>
        <AddRowTable
          rows={data.medications}
          onAdd={() => set('medications', [...data.medications, { name: '', dose: '' }])}
          onRemove={(i) => set('medications', data.medications.filter((_, ri) => ri !== i))}
          onUpdate={updateMedications}
          columns={[
            { field: 'name', placeholder: 'Medication / supplement name' },
            { field: 'dose', placeholder: 'Dose / frequency' },
          ]}
          addLabel="Add medication"
        />
      </div>

      <div>
        <SectionTitle>Family History — check all that apply to blood relatives</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {FAMILY_HISTORY_CONDITIONS.map((cond) => (
            <label key={cond} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-teal-600"
                checked={data.familyHistory.includes(cond)}
                onChange={() => toggleFH(cond)}
              />
              <span className="text-sm">{cond}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Body Temperature / Perspiration — select all that apply</SectionTitle>
        <MultiSelect
          options={BODY_SYMPTOM_OPTIONS}
          selected={data.bodySymptoms}
          onChange={(v) => set('bodySymptoms', v)}
        />
      </div>

      <div>
        <SectionTitle>Emotional & Mental Health</SectionTitle>
        <div className="space-y-3">
          <MultiSelect
            options={EMOTIONAL_SYMPTOM_OPTIONS}
            selected={data.emotionalSymptoms}
            onChange={(v) => set('emotionalSymptoms', v)}
          />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Stress Level</Label>
              <span className="text-sm font-semibold text-zinc-700">{data.stressLevel} / 10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={data.stressLevel}
              onChange={(e) => set('stressLevel', Number(e.target.value))}
              className="w-full accent-teal-600"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 (no stress)</span><span>10 (extreme)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Screen3({ data, set }) {
  const [markerType, setMarkerType] = useState('local')

  function handleAdd(marker) {
    set('painMarkers', [...data.painMarkers, marker])
  }

  function handleRemove(index) {
    set('painMarkers', data.painMarkers.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-zinc-50 p-3 text-sm text-zinc-700">
        <p className="font-medium mb-1">Instructions</p>
        <p className="text-xs text-muted-foreground">Tap on the body diagram to mark areas of pain or discomfort. Use the buttons below to switch between pain types. Tap a marker to remove it.</p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setMarkerType('local')}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            markerType === 'local' ? 'bg-red-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <span className="inline-block h-3 w-3 rounded-full bg-current opacity-80" />
          Local Pain
        </button>
        <button
          type="button"
          onClick={() => setMarkerType('radiating')}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            markerType === 'radiating' ? 'bg-red-400 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-dashed" />
          Radiating Pain
        </button>
        {data.painMarkers.length > 0 && (
          <button
            type="button"
            onClick={() => set('painMarkers', [])}
            className="text-xs text-muted-foreground hover:text-red-600"
          >
            Clear all
          </button>
        )}
      </div>

      <PainBodyDiagram
        markers={data.painMarkers}
        onAdd={handleAdd}
        onRemove={handleRemove}
        markerType={markerType}
      />

      {data.painMarkers.length === 0 && (
        <p className="text-center text-xs text-muted-foreground italic">No markers placed — tap the diagram above to mark pain locations.</p>
      )}

      <SignatureLine
        label="Patient Signature — Pain Diagram"
        value={data.sig3}
        onChange={(v) => set('sig3', v)}
        dateValue={data.sig3Date}
        onDateChange={(v) => set('sig3Date', v)}
        required
      />
      <p className="text-xs text-muted-foreground">I confirm this diagram accurately reflects my areas of pain and discomfort as of today.</p>
    </div>
  )
}

function Screen4({ data, set }) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-line">
        {CONSENT_TEXT}
      </div>
      <SignatureLine
        label="Patient Signature — Informed Consent to Treat"
        value={data.sig4}
        onChange={(v) => set('sig4', v)}
        dateValue={data.sig4Date}
        onDateChange={(v) => set('sig4Date', v)}
        required
      />
      <p className="text-xs text-muted-foreground">By typing your name above, you confirm that you have read the Informed Consent to Treat, have had the opportunity to ask questions, and voluntarily consent to acupuncture and related treatments.</p>
    </div>
  )
}

function Screen5({ data, set }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-zinc-800 mb-2">Financial Policy</p>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700 leading-relaxed max-h-44 overflow-y-auto whitespace-pre-line">
          {FINANCIAL_POLICY}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-zinc-800 mb-2">Agreement to Arbitrate Disputes</p>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700 leading-relaxed max-h-44 overflow-y-auto whitespace-pre-line">
          {ARBITRATION_AGREEMENT}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-zinc-800 mb-2">Assignment of Benefits</p>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
          {ASSIGNMENT_OF_BENEFITS}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-zinc-300 bg-zinc-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-zinc-700">Patient Signature — Legal Agreements & Financial Policy</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Signature (type full name)</Label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-lg">✕</span>
              <Input
                value={data.sig5}
                onChange={(e) => set('sig5', e.target.value)}
                placeholder="Type your full name to sign"
                style={{ fontFamily: 'cursive', fontSize: '1.1rem' }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Initials</Label>
            <Input
              value={data.initials5}
              onChange={(e) => set('initials5', e.target.value)}
              placeholder="e.g. J.D."
              className="text-center font-semibold"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date</Label>
          <Input type="date" value={data.sig5Date} onChange={(e) => set('sig5Date', e.target.value)} className="w-40" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">By signing above, I acknowledge that I have read, understood, and agree to the Financial Policy, Agreement to Arbitrate Disputes, and Assignment of Benefits above.</p>
    </div>
  )
}

export default function Intake() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { patients, intakeForms, saveIntakeForm, updatePatient } = useApp()
  const [step, setStep] = useState(1)
  const [data, setData] = useState(() => {
    const existing = intakeForms.find((f) => f.patientId === patientId)
    return existing ? { ...EMPTY, ...existing } : { ...EMPTY }
  })
  const [complete, setComplete] = useState(false)

  const patient = patients.find((p) => p.id === patientId)

  function set(field, value) {
    setData((d) => ({ ...d, [field]: value }))
  }

  function canAdvance() {
    if (step === 1) return data.printName.trim() && data.phone.trim() && data.sig1.trim()
    if (step === 3) return data.sig3.trim()
    if (step === 4) return data.sig4.trim()
    if (step === 5) return data.sig5.trim() && data.initials5.trim()
    return true
  }

  function handleNext() {
    if (step < 5) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    } else {
      // Complete
      const completedData = { ...data, patientId, completedAt: new Date().toISOString() }
      saveIntakeForm(completedData)
      // Sync key demographic fields back to patient record
      if (patient) {
        updatePatient(patientId, {
          phone: data.phone || patient.phone,
          email: data.email || patient.email,
          dateOfBirth: data.dob || patient.dateOfBirth,
          sex: data.sex || patient.sex,
          maritalStatus: data.maritalStatus || patient.maritalStatus,
          address: data.address ? `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim() : patient.address,
          occupation: data.occupation || patient.occupation,
          employer: data.employer || patient.employer,
          referralSource: data.referralSource || patient.referralSource,
          emergencyContact: {
            name: data.emergencyName,
            relation: data.emergencyRelation,
            phone: data.emergencyPhone,
          },
        })
      }
      setComplete(true)
    }
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">Patient <strong>{patientId}</strong> not found.</p>
          <Button onClick={() => navigate('/patients')}>Back to Patients</Button>
        </div>
      </div>
    )
  }

  if (complete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="max-w-md w-full mx-auto text-center space-y-5 bg-white rounded-xl border p-10 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 mx-auto">
            <Check className="h-8 w-8 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Intake Complete</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {patient.firstName} {patient.lastName}'s intake has been submitted and saved to their record.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Completed {format(new Date(), 'MMMM d, yyyy · h:mm a')}
          </p>
          <Button onClick={() => navigate(`/patients/${patientId}`)} className="w-full bg-teal-600 hover:bg-teal-700">
            Return to Patient Record →
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="max-w-[680px] mx-auto">
        {/* Clinic header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ClipboardList className="h-5 w-5 text-teal-600" />
            <span className="text-base font-semibold text-zinc-900">Patient Intake Form</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {patient.firstName} {patient.lastName} · {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>

        <StepBar current={step} />

        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-zinc-900 mb-5">{STEP_LABELS[step - 1]}</h2>

          {step === 1 && <Screen1 data={data} set={set} />}
          {step === 2 && <Screen2 data={data} set={set} />}
          {step === 3 && <Screen3 data={data} set={set} />}
          {step === 4 && <Screen4 data={data} set={set} />}
          {step === 5 && <Screen5 data={data} set={set} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : navigate(`/patients/${patientId}`)}
          >
            <ChevronLeft className="h-4 w-4" />
            {step > 1 ? 'Back' : 'Cancel'}
          </Button>

          <div className="flex items-center gap-3">
            {!canAdvance() && step !== 2 && (
              <span className="text-xs text-amber-600">Signature required to continue</span>
            )}
            <Button
              onClick={handleNext}
              disabled={!canAdvance()}
              className={step === 5 ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              {step === 5 ? (
                <>Complete Intake <Check className="h-4 w-4" /></>
              ) : (
                <>Next <ChevronRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
