import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { ALL_POINTS } from '@/data/pointSuggestions'
import { cn } from '@/lib/utils'

export default function PointBadgeInput({ value = [], onChange }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const suggestions = query
    ? ALL_POINTS.filter((p) => p.toLowerCase().startsWith(query.toLowerCase()) && !value.includes(p))
    : []

  function addPoint(point) {
    if (!value.includes(point)) onChange([...value, point])
    setQuery('')
    inputRef.current?.focus()
  }

  function removePoint(point) {
    onChange(value.filter((p) => p !== point))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault()
      addPoint(suggestions[0])
    } else if (e.key === 'Backspace' && !query && value.length > 0) {
      removePoint(value[value.length - 1])
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-[36px] flex-wrap gap-1 rounded-md border bg-transparent px-3 py-1.5 text-sm transition-colors',
        focused ? 'ring-1 ring-ring' : ''
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((point) => (
        <span
          key={point}
          className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700"
        >
          {point}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removePoint(point) }}
            className="hover:text-red-500"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <div className="relative flex-1">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? 'Type a point (e.g. LI4, ST36)…' : ''}
          className="w-full min-w-[120px] border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground"
        />
        {focused && suggestions.length > 0 && (
          <div className="absolute left-0 top-6 z-50 flex flex-wrap gap-1 rounded-md border bg-white p-2 shadow-md">
            {suggestions.slice(0, 12).map((pt) => (
              <button
                key={pt}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addPoint(pt) }}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs hover:bg-teal-100 hover:text-teal-700"
              >
                {pt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
