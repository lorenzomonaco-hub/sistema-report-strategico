// ─── Cliente del tutor ─── (pagina statica, una per tutor)
// Elenco completo dei clienti di un singolo tutor: chi è già in erogazione
// (con stadio e consegna stimata) e chi è ancora in attesa di informazioni.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  EROG_STADI, RigaErog, StadioErog, TUTOR_LIST, clientiPerTutor, fmtData, stimaConsegna, tutorDaSlug,
} from '@/lib/quadroaziendale'

export async function generateStaticParams() {
  return TUTOR_LIST.map((t) => ({ slug: t.slug }))
}

function Carta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-linea bg-carta p-4 shadow-sm ${className}`}>{children}</div>
}

function Statistica({ label, valore, sub, tinta = 'text-inchiostro' }:
  { label: string; valore: string; sub?: string; tinta?: string }) {
  return (
    <Carta>
      <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">{label}</p>
      <p className={`font-display mt-1 text-2xl font-bold tracking-tight ${tinta}`}>{valore}</p>
      {sub && <p className="mt-1 text-[11px] text-inchiostro/50">{sub}</p>}
    </Carta>
  )
}

const STADIO_INFO: Record<StadioErog, { barra: string; barraDone: string; testo: string; bg: string }> = {
  1: { barra: 'bg-rose-500', barraDone: 'bg-rose-500/25', testo: 'text-rose-700', bg: 'bg-rose-50' },
  2: { barra: 'bg-petrolio', barraDone: 'bg-petrolio/25', testo: 'text-petrolio-scuro', bg: 'bg-petrolio/10' },
  3: { barra: 'bg-teal-600', barraDone: 'bg-teal-600/25', testo: 'text-teal-700', bg: 'bg-teal-50' },
  4: { barra: 'bg-indigo-600', barraDone: 'bg-indigo-600/25', testo: 'text-indigo-700', bg: 'bg-indigo-50' },
}

function SegmentiStadi({ stadio }: { stadio: StadioErog }) {
  return (
    <div className="flex items-center gap-1">
      {([1, 2, 3, 4] as StadioErog[]).map((n) => {
        const c = STADIO_INFO[n]
        const cls = n === stadio ? c.barra : n < stadio ? c.barraDone : 'bg-inchiostro/[0.07]'
        return <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${cls}`} />
      })}
    </div>
  )
}

function RigaCliente({ r }: { r: RigaErog }) {
  const info = EROG_STADI[r.stadio - 1]
  const c = STADIO_INFO[r.stadio]
  const stima = stimaConsegna(r)
  return (
    <div className="grid items-center gap-3 border-b border-linea/70 px-3 py-2.5 last:border-b-0">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-[13px] font-bold text-inchiostro">
          {r.nome}
          {r.daVerificare && <span className="shrink-0 rounded bg-amber-100 px-1.5 py-px text-[9px] font-bold text-amber-800">DA VERIFICARE</span>}
          {r.dataApprox && <span className="shrink-0 rounded bg-amber-100 px-1.5 py-px text-[9px] font-bold text-amber-800">DATA STIMATA</span>}
        </p>
        <p className="truncate text-[11px] text-inchiostro/45">{r.azienda} · {r.servizio}</p>
        <div className="mt-1.5 max-w-[220px]"><SegmentiStadi stadio={r.stadio} /></div>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        <span className={`font-semibold ${c.testo}`}>{info.label}</span>
        {stima ? (
          <span>
            <span className="font-bold text-inchiostro">consegna stimata {fmtData(stima.data)}</span>
            {stima.giorniRitardo > 0 && <span className="ml-1 rounded bg-rose-100 px-1 py-px text-[9px] font-bold text-rose-700">+{stima.giorniRitardo}gg ritardo</span>}
          </span>
        ) : (
          <span className="text-inchiostro/40">consegna non stimabile</span>
        )}
      </div>
    </div>
  )
}

export default async function TutorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tutor = tutorDaSlug(slug)
  if (!tutor) notFound()

  const clienti = clientiPerTutor(tutor)
  const inAttesa = clienti.filter((r) => r.stadio === 1)
  const inErogazione = ([4, 3, 2] as StadioErog[]).flatMap((s) => clienti.filter((r) => r.stadio === s))

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">{tutor}</h1>
            <p className="mt-1 text-sm text-inchiostro/55">{clienti.length} clienti seguiti da questo tutor.</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/tutor" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Tutti i tutor
            </Link>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Statistica label="Clienti totali" valore={String(clienti.length)} tinta="text-petrolio-scuro" />
          <Statistica label="In erogazione" valore={String(inErogazione.length)} />
          <Statistica label="In attesa di informazioni" valore={String(inAttesa.length)} tinta="text-rose-700" />
        </div>

        {inErogazione.length > 0 && (
          <div className="mt-6">
            <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">Già in erogazione</h3>
            <div className="mt-2 overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm">
              {inErogazione.map((r, i) => <RigaCliente key={r.nome + r.azienda + i} r={r} />)}
            </div>
          </div>
        )}

        {inAttesa.length > 0 && (
          <div className="mt-6">
            <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">In attesa di entrare in erogazione</h3>
            <p className="text-[11px] text-inchiostro/45">Informazioni mancanti dal cliente — nessuna data di partenza, dipende da quando manda i documenti.</p>
            <div className="mt-2 overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm">
              {inAttesa.map((r, i) => (
                <div key={r.nome + r.azienda + i} className="flex items-center justify-between gap-3 border-b border-linea/70 px-3 py-2.5 last:border-b-0">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-inchiostro">{r.nome}</p>
                    <p className="truncate text-[11px] text-inchiostro/45">{r.azienda} · {r.servizio}</p>
                  </div>
                  <span className="shrink-0 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">in attesa</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
