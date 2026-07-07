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
        <h3 className="truncate font-display text-base font-bold tracking-tight text-inchiostro">{pratica.azienda}</h3>
        <p className="truncate text-sm text-inchiostro/50">
          {pratica.cliente} · {pratica.email}
        </p>
        <p className="mt-1 text-xs text-inchiostro/40">Creata il {dataIt(pratica.dataCreazione)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {!nascondiFase && <StatusBadge fase={pratica.faseCorrente} />}
        {azioni}
      </div>
    </div>
  )

  const classi = 'card-sollevabile block rounded-2xl border border-linea bg-carta p-5 shadow-sm hover:border-petrolio/40'

  if (href) {
    return (
      <Link href={href} className={classi}>
        {corpo}
      </Link>
    )
  }
  return <div className={classi}>{corpo}</div>
}
