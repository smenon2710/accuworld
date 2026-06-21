// Local frontend mapping — no external API, no AI.
// condition keyword → suggested acupuncture points

export const POINT_SUGGESTIONS = {
  'lower back': ['BL23', 'BL40', 'KD3', 'GV4', 'GB30', 'BL25'],
  'lumbar': ['BL23', 'BL40', 'KD3', 'GV4', 'GB30', 'BL25'],
  'back pain': ['BL23', 'BL40', 'KD3', 'GV4', 'GB30'],
  'sciatica': ['BL23', 'BL25', 'BL40', 'GB30', 'GB34', 'ST36'],
  'neck': ['GB20', 'GB21', 'BL10', 'GV14', 'SI3', 'LI4'],
  'cervical': ['GB20', 'GB21', 'BL10', 'GV14', 'SI3'],
  'headache': ['GB20', 'GB21', 'LI4', 'LV3', 'TB5', 'GV20'],
  'migraine': ['GB20', 'LI4', 'LV3', 'TB5', 'ST8'],
  'plantar fasciitis': ['KD1', 'KD3', 'SP6', 'SP9', 'ST36', 'BL62'],
  'heel': ['KD1', 'KD3', 'BL62', 'SP6'],
  'piriformis': ['GB30', 'GB34', 'BL40', 'BL57', 'SP10'],
  'hip': ['GB30', 'GB34', 'BL54', 'ST31'],
  'shoulder': ['LI15', 'LI14', 'SI9', 'SI10', 'GB21', 'TB14'],
  'knee': ['ST35', 'ST36', 'SP9', 'GB34', 'BL40'],
  'fibromyalgia': ['LV3', 'SP6', 'ST36', 'KD3', 'PC6', 'GV20'],
  'fatigue': ['ST36', 'SP6', 'KD3', 'GV4', 'BL23', 'PC6'],
  'anxiety': ['PC6', 'HT7', 'GV20', 'KD1', 'SP6', 'LV3'],
  'insomnia': ['HT7', 'PC6', 'SP6', 'KD1', 'GV20', 'BL15'],
  'elbow': ['LI10', 'LI11', 'LI4', 'TB5'],
  'wrist': ['PC7', 'LI4', 'TB4', 'SI5'],
}

export const ALL_POINTS = [
  'BL10','BL13','BL14','BL15','BL17','BL18','BL20','BL21','BL23','BL25',
  'BL40','BL54','BL57','BL60','BL62','BL67',
  'CV4','CV6','CV12','CV17',
  'GB20','GB21','GB30','GB34','GB39','GB40',
  'GV4','GV14','GV20',
  'HT7',
  'KD1','KD3','KD6','KD7',
  'LI4','LI10','LI11','LI14','LI15',
  'LU5','LU7','LU9',
  'LV2','LV3','LV8','LV14',
  'PC6','PC7',
  'SI3','SI5','SI9','SI10',
  'SP6','SP9','SP10',
  'ST25','ST31','ST35','ST36','ST40','ST44',
  'TB4','TB5','TB14',
]

export function suggestPointsForComplaint(complaint) {
  if (!complaint) return []
  const lower = complaint.toLowerCase()
  for (const [keyword, points] of Object.entries(POINT_SUGGESTIONS)) {
    if (lower.includes(keyword)) return points
  }
  return []
}
