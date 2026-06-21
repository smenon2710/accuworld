import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, CalendarPlus, CheckCircle2, XCircle,
  MessageSquare, Phone, User,
} from 'lucide-react'
import {
  format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameDay, addMinutes, parseISO,
} from 'date-fns'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import InsuranceBadge from '@/components/patients/InsuranceBadge'
import NewAppointmentDialog from '@/components/schedule/NewAppointmentDialog'
import { APPOINTMENT_STATUS, APPOINTMENT_TYPE } from '@/data/seed'

// Prototype "today"
const TODAY = new Date('2026-06-21T12:00:00')

function appointmentTypeLabel(type) {
  return {
    [APPOINTMENT_TYPE.INITIAL]: 'Initial Consult',
    [APPOINTMENT_TYPE.FOLLOWUP]: 'Follow-up',
    [APPOINTMENT_TYPE.WELLNESS]: 'Wellness',
  }[type] ?? type
}

const STATUS_COLOR = {
  [APPOINTMENT_STATUS.CONFIRMED]: 'bg-teal-500',
  [APPOINTMENT_STATUS.COMPLETED]: 'bg-zinc-400',
  [APPOINTMENT_STATUS.REQUESTED]: 'bg-amber-400',
  [APPOINTMENT_STATUS.NO_SHOW]: 'bg-red-400',
  [APPOINTMENT_STATUS.CANCELLED]: 'bg-zinc-300',
}

const HOURS = Array.from({ length: 10 }, (_, i) => i + 9) // 9am–6pm

export default function Schedule() {
  const { patients, appointments, updateAppointment } = useApp()
  const navigate = useNavigate()
  const [view, setView] = useState('week')
  const [currentDate, setCurrentDate] = useState(TODAY)
  const [showNew, setShowNew] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]))

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const visibleAppts = appointments.filter((a) => {
    const d = new Date(a.datetime)
    if (view === 'day') return isSameDay(d, currentDate)
    return d >= weekStart && d <= weekEnd
  })

  const requested = appointments.filter((a) => a.status === APPOINTMENT_STATUS.REQUESTED)

  function navigate_week(dir) {
    setCurrentDate((d) => addDays(d, dir * 7))
  }
  function navigate_day(dir) {
    setCurrentDate((d) => addDays(d, dir))
  }

  function handleComplete(apptId) {
    updateAppointment(apptId, { status: APPOINTMENT_STATUS.COMPLETED })
    // Decrement insurance visits — handled by visiting the chart
    navigate(`/visits?appt=${apptId}`)
  }

  function handleNoShow(apptId) {
    updateAppointment(apptId, { status: APPOINTMENT_STATUS.NO_SHOW })
  }

  function handleConfirm(apptId) {
    updateAppointment(apptId, { status: APPOINTMENT_STATUS.CONFIRMED })
  }

  function handleCancel(apptId) {
    updateAppointment(apptId, { status: APPOINTMENT_STATUS.CANCELLED })
  }

  // Week grid: slot = day + hour
  function getApptsForSlot(day, hour) {
    return visibleAppts.filter((a) => {
      const d = new Date(a.datetime)
      return isSameDay(d, day) && d.getHours() === hour
    })
  }

  const daysToShow = view === 'day' ? [currentDate] : weekDays

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Schedule</h1>
          <p className="text-sm text-muted-foreground">
            {view === 'day'
              ? format(currentDate, 'EEEE, MMMM d, yyyy')
              : `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg border p-1">
            {['week', 'day'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  view === v ? 'bg-teal-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => (view === 'day' ? navigate_day(-1) : navigate_week(-1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(TODAY)}>Today</Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => (view === 'day' ? navigate_day(1) : navigate_week(1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" onClick={() => setShowNew(true)}>
            <CalendarPlus className="h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Calendar grid */}
        <div className="col-span-2">
          <div className="rounded-lg border bg-white overflow-hidden">
            {/* Day headers */}
            <div className={`grid border-b bg-zinc-50/60`} style={{ gridTemplateColumns: `4rem repeat(${daysToShow.length}, 1fr)` }}>
              <div className="h-10" />
              {daysToShow.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`flex flex-col items-center justify-center py-2 text-xs font-medium ${
                    isSameDay(day, TODAY) ? 'text-teal-700' : 'text-muted-foreground'
                  }`}
                >
                  <span className="uppercase">{format(day, 'EEE')}</span>
                  <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                    isSameDay(day, TODAY) ? 'bg-teal-600 text-white font-semibold' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>
              ))}
            </div>
            {/* Hour rows */}
            <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid border-b last:border-0"
                  style={{ gridTemplateColumns: `4rem repeat(${daysToShow.length}, 1fr)`, minHeight: '4rem' }}
                >
                  <div className="flex items-start justify-end pr-3 pt-1 text-xs text-muted-foreground">
                    {format(new Date().setHours(hour, 0, 0), 'h a')}
                  </div>
                  {daysToShow.map((day) => {
                    const slotAppts = getApptsForSlot(day, hour)
                    return (
                      <div
                        key={day.toISOString()}
                        className="border-l p-0.5 space-y-0.5"
                        onClick={() => {
                          setSelectedDate(format(day, 'yyyy-MM-dd'))
                          setShowNew(true)
                        }}
                      >
                        {slotAppts.map((a) => {
                          const patient = patientMap[a.patientId]
                          return (
                            <div
                              key={a.id}
                              className={`${STATUS_COLOR[a.status] ?? 'bg-zinc-400'} cursor-pointer rounded px-1.5 py-1 text-white`}
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/patients/${a.patientId}`)
                              }}
                            >
                              <p className="text-xs font-medium leading-tight truncate">
                                {patient ? `${patient.firstName} ${patient.lastName[0]}.` : 'Unknown'}
                              </p>
                              <p className="text-xs opacity-80">{format(new Date(a.datetime), 'h:mm a')} · {a.durationMin}m</p>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Booking Inbox + Appointment Details */}
        <div className="space-y-4">
          {/* Booking inbox */}
          <div className="rounded-lg border bg-white">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-zinc-700">Booking Requests</span>
              {requested.length > 0 && <Badge variant="warning">{requested.length}</Badge>}
            </div>
            {requested.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">No pending requests.</div>
            ) : (
              <div className="divide-y">
                {requested.map((a) => {
                  const patient = patientMap[a.patientId]
                  if (!patient) return null
                  return (
                    <div key={a.id} className="p-4 space-y-2">
                      <div className="flex items-center gap-1.5">
                        {a.source === 'text' ? (
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">{patient.firstName} {patient.lastName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(a.datetime), 'EEE MMM d · h:mm a')} · {appointmentTypeLabel(a.type)}
                      </p>
                      {a.note && (
                        <p className="text-xs text-zinc-600 italic leading-relaxed">"{a.note}"</p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => handleConfirm(a.id)}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleCancel(a.id)}>
                          Decline
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Today's appointments list for quick actions */}
          <div className="rounded-lg border bg-white">
            <div className="border-b px-4 py-3">
              <span className="text-sm font-semibold text-zinc-700">Today's Actions</span>
            </div>
            {appointments
              .filter((a) => {
                const d = new Date(a.datetime)
                return (
                  isSameDay(d, TODAY) &&
                  [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.COMPLETED].includes(a.status)
                )
              })
              .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
              .map((a) => {
                const patient = patientMap[a.patientId]
                if (!patient) return null
                return (
                  <div key={a.id} className="border-b last:border-0 px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(a.datetime), 'h:mm a')}</p>
                      </div>
                      <Badge
                        variant={
                          a.status === APPOINTMENT_STATUS.COMPLETED ? 'neutral' : 'success'
                        }
                        className="capitalize"
                      >
                        {a.status}
                      </Badge>
                    </div>
                    {a.status === APPOINTMENT_STATUS.CONFIRMED && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleComplete(a.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Complete + Chart
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleNoShow(a.id)}
                        >
                          No-Show
                        </Button>
                      </div>
                    )}
                    {a.status === APPOINTMENT_STATUS.COMPLETED && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => navigate(`/visits?appt=${a.id}`)}
                      >
                        Open Chart
                      </Button>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      <NewAppointmentDialog
        open={showNew}
        onOpenChange={(o) => {
          setShowNew(o)
          if (!o) setSelectedDate(null)
        }}
        defaultDate={selectedDate}
      />
    </div>
  )
}
