import { Badge } from '@/components/ui/badge'
import { COVERAGE_STATUS } from '@/data/seed'

const config = {
  [COVERAGE_STATUS.COVERED]: { label: 'Covered', variant: 'success' },
  [COVERAGE_STATUS.UNVERIFIED]: { label: 'Unverified', variant: 'warning' },
  [COVERAGE_STATUS.NOT_COVERED]: { label: 'Not Covered', variant: 'danger' },
  [COVERAGE_STATUS.SELF_PAY]: { label: 'Self-Pay', variant: 'neutral' },
}

export default function InsuranceBadge({ status, className }) {
  const { label, variant } = config[status] ?? { label: status, variant: 'neutral' }
  return <Badge variant={variant} className={className}>{label}</Badge>
}
