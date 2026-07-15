// ─── Log timeline del singolo progetto ─── (pagina statica, una per cliente)
// Il registro cronologico completo del progetto: cosa è stato fatto e quando
// (date reali), cosa è in corso e cosa resta (previsto). Ultimo step: la
// consulenza con Frank.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  CONSULENZE_FRANK, EventoTimeline, FASI_FRANK, RigaFrank, frankBySlug, slugFrank, timelineFrank,
} from '@/lib/consulenzeFrank'
import { fmtData } from '@/lib/quadroaziendale'

export function generateStaticParams() {
  return CONSULENZE_FRANK.map((r) => ({ slug: slugFrank(r.cliente) }))
}

// Scala rosso → verde per step (0 = ingresso, 1-5 fasi, 6 consegna, 7 consulenza).
const COLORE_STEP: Record<number, { punto: string; testo: string }> = {
  0: { punto: 'bg-inchiostro/40', testo: 'text-inchiostro/60' },
  1: { punto: 'bg-red-500', testo: 'text-red-700' },
  2: { punto: 'bg-orange-500', testo: 'text-orange-700' },
  3: { punto: 'bg-amber-500', testo: 'text-amber-700' },
  4: { punto: 'bg-lime-500', testo: 'text-lime-700' },
  5: { punto: 'bg-green-500', testo: 'text-green-700' },
  6: { punto: 'bg-green-700', testo: 'text-green-800' },
  7: { punto: 'bg-green-800', testo: 'text-green-800' },
}

const BADGE_STATO: Record<EventoTimeline['stato'], { label: string; cls: string }> = {
  'fatto': { label: 'completato', cls: 'bg-green-100 text-green-700' },
  'in-corso': { label: 'in corso', cls: 'bg-amber-100 text-amber-800' },
  'da-fare': { label: 'da fare', cls: 'bg-inchiostro/[0.06] text-inchiostro/50' },
}

function Carta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-linea bg-carta p-4 shadow-sm ${className}`}>{children}</div>
}

function RigaLog({ ev, ultimo }: { ev: EventoTimeline; ultimo: boolean }) {
  const col = COLORE_STEP[ev.step] ?? COLORE_STEP[0]
  const badge = BADGE_STATO[ev.stato]
  const spento = ev.stato === 'da-fare'
  return (
    <div className="relative grid grid-cols-[92px_1fr] gap-3">
      {/* colonna data */}
      <div className={`pt-0.5 text-right text-[12px] font-bold tabular-nums ${spento ? 'text-inchiostro/35' : col.testo}`}>
        {ev.data ? fmtData(ev.data) : <span className="text-[11px] font-medium text-inchiostro/35">{ev.dataLabel ?? '—'}</span>}
      </div>
      {/* colonna pallino + linea + contenuto */}
      <div className="relative pb-6 pl-6">
        {!ultimo && <span className="absolute left-[6px] top-3 bottom-0 w-px bg-linea" />}
        <span className={`absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-carta ${spento ? 'bg-inchiostro/15' : col.punto} shadow-sm`} />
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[13.5px] font-bold ${spento ? 'text-inchiostro/45' : 'text-inchiostro'}`}>{ev.titolo}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}>{badge.label}</span>
        </div>
        <p className="mt-0.5 text-[11.5px] text-inchiostro/50">
          {ev.owner}
          {ev.dataLabel && ev.data === undefined && ev.stato !== 'da-fare' ? '' : ''}
        </p>
      </div>
    </div>
  )
}

export default async function ProgettoFrank({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const r: RigaFrank | null = frankBySlug(slug)
  if (!r) notFound()

  const eventi = timelineFrank(r)
  const fatti = eventi.filter((e) => e.stato === 'fatto').length
  const totali = eventi.length

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Consulenze Frank · log progetto</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">{r.cliente}</h1>
            <p className="mt-1 text-sm text-inchiostro/55">
              {r.fase === 6 ? 'Consegnato' : `Fase attuale: ${r.fase} — ${FASI_FRANK[r.fase].label}`}
              {' · '}consegna prevista {fmtData(r.consegnaPrevista)}
            </p>
          </div>
          <div className="ml-auto">
            <Link href="/amministrazione/consulenze-frank" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Gantt Consulenze Frank
            </Link>
          </div>
        </header>

        {r.nota && (
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-inchiostro/75">
            <b className="text-amber-800">Nota:</b> {r.nota}
          </div>
        )}

        <Carta className="mt-6">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">Log della timeline</h3>
            <span className="text-[11px] font-semibold text-inchiostro/45">{fatti}/{totali} passaggi completati</span>
          </div>
          <div className="mt-4">
            {eventi.map((ev, i) => <RigaLog key={i} ev={ev} ultimo={i === eventi.length - 1} />)}
          </div>
        </Carta>

        <p className="mt-4 text-[11px] leading-relaxed text-inchiostro/45">
          Le date con il pallino pieno sono milestone reali dal foglio maestro (ingresso in pipeline, copy, revisione Grippo) o dal piano ufficiale (consegna, consulenza Frank). I passaggi &quot;da fare&quot; non hanno ancora una data: la timeline si aggiornerà man mano che il progetto avanza. La consulenza con Frank è l&apos;ultimo step: quando viene fissata, la data compare qui e come rombo finale nel Gantt.
        </p>
      </div>
    </div>
  )
}
