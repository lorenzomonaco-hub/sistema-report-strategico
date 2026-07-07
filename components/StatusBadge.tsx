import { faseById } from '@/lib/fasi'
import { FaseId } from '@/lib/types'

/** Badge colorato con la fase corrente di una pratica. */
export default function StatusBadge({ fase }: { fase: FaseId }) {
  const f = faseById(fase)
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${f.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${f.dot}`} />
      {f.label}
      <span className="opacity-60">· {f.owner}</span>
    </span>
  )
}
