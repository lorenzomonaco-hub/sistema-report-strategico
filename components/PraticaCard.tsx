import Link from 'next/link'
import StatusBadge from './StatusBadge'
import { Pratica } from '@/lib/types'

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

interface Props {
  pratica: Pratica
  href?: string
  /** se true nasconde il dettaglio fase (per ruoli che non devono vedere la pipeline) */
  nascondiFase?: boolean
  azioni?: React.ReactNode
}

/** Card riepilogativa di una pratica cliente. */
export default function PraticaCard({ pratica, href, nascondiFase, azioni }: Props) {
  const corpo = (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="truncate font-semibold text-slate-900">{pratica.azienda}</h3>
        <p className="truncate text-sm text-slate-500">
          {pratica.cliente} · {pratica.email}
        </p>
        <p className="mt-1 text-xs text-slate-400">Creata il {dataIt(pratica.dataCreazione)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {!nascondiFase && <StatusBadge fase={pratica.faseCorrente} />}
        {azioni}
      </div>
    </div>
  )

  const classi = 'block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow'

  if (href) {
    return (
      <Link href={href} className={classi}>
        {corpo}
      </Link>
    )
  }
  return <div className={classi}>{corpo}</div>
}
