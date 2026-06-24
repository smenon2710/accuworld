const HOME_CARE_MAP = [
  {
    keywords: ['lower back', 'lumbar', 'low back', 'lumbago', 'back pain'],
    suggestions: [
      'Gentle lumbar stretches twice daily.',
      'Heat pack on lower back 20 min nightly.',
      'Stand and walk 5 min every 30 min of sitting.',
    ],
  },
  {
    keywords: ['sciatica', 'sciatic', 'piriformis', 'posterior thigh', 'buttock'],
    suggestions: [
      'Piriformis stretch 3× daily.',
      'Walk 20 min daily on flat ground.',
      'Avoid sitting on hard surfaces or crossing legs.',
    ],
  },
  {
    keywords: ['headache', 'migraine', 'head pain', 'temporal', 'tension headache'],
    suggestions: [
      'Limit screen time — 5-min break every 30 min.',
      'Neck rolls and shoulder shrugs 3× daily.',
      'Magnesium glycinate 400 mg at bedtime.',
    ],
  },
  {
    keywords: ['neck', 'cervical', 'cervical tension', 'stiff neck'],
    suggestions: [
      'Chin tucks and side-tilt neck stretches 3× daily.',
      'Keep monitor at eye level.',
      'Heat pack on neck 15 min before bed.',
    ],
  },
  {
    keywords: ['shoulder', 'rotator cuff', 'rotator', 'impingement'],
    suggestions: [
      'Pendulum exercises twice daily.',
      'Ice 15 min after activity.',
      'Avoid overhead lifting until pain resolves.',
    ],
  },
  {
    keywords: ['knee', 'patellar', 'kneecap'],
    suggestions: [
      'Straight-leg raise quad strengthening daily.',
      'Ice 15–20 min after activity.',
      'Avoid prolonged kneeling or deep squats.',
    ],
  },
  {
    keywords: ['plantar', 'heel', 'arch', 'foot pain', 'plantar fasciitis'],
    suggestions: [
      'Stretch plantar fascia before first steps each morning.',
      'Wear supportive footwear — avoid flat shoes.',
      'Calf stretches twice daily.',
    ],
  },
  {
    keywords: ['fibromyalgia', 'chronic pain', 'diffuse pain', 'widespread pain'],
    suggestions: [
      'Gentle Qi Gong or tai chi 10 min daily.',
      'Maintain consistent sleep and wake times.',
      'Warm Epsom salt bath 20 min.',
    ],
  },
  {
    keywords: ['hip', 'iliotibial', 'it band', 'trochanter', 'greater trochanter'],
    suggestions: [
      'Hip flexor and piriformis stretches twice daily.',
      'Avoid sitting cross-legged or on very soft chairs.',
      'Gentle walking 20 min on flat terrain.',
    ],
  },
  {
    keywords: ['insomnia', 'sleep', 'fatigue', 'tired', 'exhaustion'],
    suggestions: [
      'Consistent bedtime — same time nightly.',
      'No screens 1 hour before bed.',
      'Chamomile or valerian tea 30 min before sleep.',
    ],
  },
  {
    keywords: ['anxiety', 'stress', 'nervous', 'worry'],
    suggestions: [
      'Diaphragmatic breathing 5 min twice daily.',
      'Daily 20-min walk in nature.',
      'Limit caffeine after noon.',
    ],
  },
  {
    keywords: ['menstrual', 'period', 'pms', 'dysmenorrhea', 'cramps'],
    suggestions: [
      'Apply heat to lower abdomen during cycle.',
      'Reduce cold or raw foods the week before menstruation.',
      'Gentle yoga or walking during cycle.',
    ],
  },
  {
    keywords: ['digestion', 'stomach', 'bloating', 'ibs', 'constipation', 'nausea', 'digestive'],
    suggestions: [
      'Eat slowly and chew thoroughly.',
      'Favor warm cooked foods over cold or raw.',
      'Light 10-min walk after each meal.',
    ],
  },
  {
    keywords: ['elbow', 'tennis elbow', 'lateral epicondyle', 'golfer', 'medial epicondyle'],
    suggestions: [
      'Ice elbow 15 min after activity.',
      'Eccentric wrist extension/flexion stretches.',
      'Avoid repetitive gripping or twisting motions.',
    ],
  },
  {
    keywords: ['wrist', 'carpal', 'carpal tunnel', 'hand', 'finger'],
    suggestions: [
      'Wrist flexor and extensor stretches every hour.',
      'Ice if inflamed — 15 min on/off.',
      'Ensure ergonomic mouse and keyboard position.',
    ],
  },
]

export function suggestHomeCareForComplaint(complaint) {
  if (!complaint) return []
  const lower = complaint.toLowerCase()
  for (const entry of HOME_CARE_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.suggestions
    }
  }
  return []
}
