import { useState } from 'react'
import { format, addMinutes } from 'date-fns'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useApp } from '@/context/AppContext'
import { APPOINTMENT_STATUS, APPOINTMENT_TYPE, APPOINTMENT_SOURCE } from '@/data/seed'

const BUSINESS_HOURS = { start: 9, end: 18 }

function isWithinBusinessHours(datetime) {
  const d = new Date(datetime)
  const hour = d.getHours()
  return hour >= BUSINESS_HOURS.start && hour < BUSINESS_HOURS.end
}

export default function NewAppointmentDialog({ open, onOpenChange, defaultDate, defaultPatientId }) {
  const { patients, appointments, addAppointment } = useApp()
  const [form, setForm] = useState({
    patientId: defaultPatientId ?? '',
    date: defaultDate ?? format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    durationMin: 45,
    type: APPOINTMENT_TYPE.FOLLOWUP,
    source: APPOINTMENT_SOURCE.TEXT,
    status: APPOINTMENT_STATUS.CONFIRMED,
    note: '',
  })
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.patientId) { setError('Please select a patient.'); return }

    const datetime = `${form.date}T${form.time}:00`

    if (!isWithinBusinessHours(datetime)) {
      setError('Appointment must be between 9:00 AM and 6:00 PM.')
      return
    }

    // Check double booking
    const start = new Date(datetime)
    const end = addMinutes(start, Number(form.durationMin))
    const conflict = appointments.find((a) => {
      if ([APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW].includes(a.status)) return false
      const aStart = new Date(a.datetime)
      const aEnd = addMinutes(aStart, a.durationMin)
      return start < aEnd && end > aStart
    })
    if (conflict) {
      setError('This time slot conflicts with an existing appointment.')
      return
    }

    addAppointment({
      id: `a${Date.now()}`,
      patientId: form.patientId,
      datetime,
      durationMin: Number(form.durationMin),
      type: form.type,
      status: form.status,
      source: form.source,
      note: form.note,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-3">
          <div className="space-y-1.5">
            <Label>Patient *</Label>
            <Select value={form.patientId} onChange={(e) => set('patientId', e.target.value)} required>
              <option value="">Select a patient…</option>
              {patients.filter(p => p.status === 'active').map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Select value={form.durationMin} onChange={(e) => set('durationMin', e.target.value)}>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value={APPOINTMENT_TYPE.INITIAL}>Initial Consult</option>
                <option value={APPOINTMENT_TYPE.FOLLOWUP}>Follow-up</option>
                <option value={APPOINTMENT_TYPE.WELLNESS}>Wellness</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={form.source} onChange={(e) => set('source', e.target.value)}>
                <option value={APPOINTMENT_SOURCE.TEXT}>Text</option>
                <option value={APPOINTMENT_SOURCE.PHONE}>Phone</option>
                <option value={APPOINTMENT_SOURCE.WALK_IN}>Walk-in</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value={APPOINTMENT_STATUS.CONFIRMED}>Confirmed</option>
                <option value={APPOINTMENT_STATUS.REQUESTED}>Requested</option>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Note</Label>
            <Textarea value={form.note} onChange={(e) => set('note', e.target.value)} rows={2} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Schedule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
