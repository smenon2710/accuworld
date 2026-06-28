export default function PainBodyDiagram({ markers, onAdd, onRemove, markerType }) {
  function handleSvgClick(e, view) {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 240
    onAdd({ view, x, y, type: markerType })
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-8">
        {['front', 'back'].map((view) => (
          <div key={view} className="flex flex-col items-center gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {view === 'front' ? 'Front View' : 'Back View'}
            </p>
            <div className="flex w-[110px] justify-between text-[10px] font-bold text-zinc-400">
              <span>R</span><span>L</span>
            </div>
            <svg
              viewBox="0 0 100 240"
              width="110"
              className="cursor-crosshair border border-zinc-200 rounded-lg bg-zinc-50"
              onClick={(e) => handleSvgClick(e, view)}
            >
              {/* Body silhouette */}
              <g fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2">
                {/* Head */}
                <ellipse cx="50" cy="18" rx="15" ry="17" />
                {/* Neck */}
                <rect x="44" y="33" width="12" height="10" />
                {/* Torso */}
                <rect x="29" y="43" width="42" height="70" rx="5" />
                {/* Left arm (patient L = SVG right) */}
                <rect x="71" y="46" width="12" height="44" rx="6" />
                {/* Right arm */}
                <rect x="17" y="46" width="12" height="44" rx="6" />
                {/* Left hand */}
                <ellipse cx="77" cy="96" rx="6.5" ry="8" />
                {/* Right hand */}
                <ellipse cx="23" cy="96" rx="6.5" ry="8" />
                {/* Hips/pelvis */}
                <rect x="27" y="111" width="46" height="22" rx="8" />
                {/* Left thigh */}
                <rect x="51" y="131" width="18" height="52" rx="9" />
                {/* Right thigh */}
                <rect x="31" y="131" width="18" height="52" rx="9" />
                {/* Left lower leg */}
                <rect x="52" y="181" width="16" height="42" rx="8" />
                {/* Right lower leg */}
                <rect x="32" y="181" width="16" height="42" rx="8" />
                {/* Left foot */}
                <ellipse cx="60" cy="228" rx="10" ry="6" />
                {/* Right foot */}
                <ellipse cx="40" cy="228" rx="10" ry="6" />
                {view === 'back' && (
                  /* Hair / back of head indicator */
                  <ellipse cx="50" cy="10" rx="13" ry="6" fill="#cbd5e1" />
                )}
              </g>

              {/* Pain markers */}
              {markers.map((m, i) =>
                m.view === view ? (
                  <g
                    key={i}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); onRemove(i) }}
                  >
                    {m.type === 'local' ? (
                      <circle
                        cx={m.x} cy={m.y} r="5"
                        fill="rgba(239,68,68,0.75)"
                        stroke="#b91c1c"
                        strokeWidth="1.5"
                      />
                    ) : (
                      <circle
                        cx={m.x} cy={m.y} r="8"
                        fill="rgba(239,68,68,0.15)"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeDasharray="3,2"
                      />
                    )}
                  </g>
                ) : null
              )}
            </svg>
            <p className="text-[10px] text-zinc-400 text-center">
              {markers.filter((m) => m.view === view).length} marker{markers.filter((m) => m.view === view).length !== 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-muted-foreground">
        Tap body to add marker · Tap marker to remove
      </p>
    </div>
  )
}
