// ─── Clienti di un tutor ─── (pagina statica, una per tutor)
// I clienti in produzione seguiti dal tutor, con fase attuale (scala rosso→verde),
// consegna prevista e stato della consulenza con Frank (prenotata o da prenotare).

import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  FASI_FRANK, FaseFrank, RigaFrank, TUTOR_FRANK, attesaTutor, clientiTutorFrank,
  slugFrank, tutorFrankDaSlug,
} from '@/lib/consulenzeFrank'
import { fmtData } from '@/lib/quadroaziendale'
import { pcPerTutor } from '@/lib/prontoConsulenza'

export function generateStaticParams() {
  return TUTOR_FRANK.map((t) => ({ slug: t.slug }))
}

const fmtGiorno = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

const FASE_COL: Record<FaseFrank, { pieno: string; testo: string }> = {
  1: { pieno: 'bg-red-500', testo: 'text-red-700' },
  2: { pieno: 'bg-orange-500', testo: 'text-orange-700' },
  3: { pieno: 'bg-amber-500', testo: 'text-amber-700' },
  4: { pieno: 'bg-lime-500', testo: 'text-lime-700' },
  5: { pieno: 'bg-green-500', testo: 'text-green-700' },
  6: { pieno: 'bg-green-700', testo: 'text-green-800' },
}

function Stepper({ fase }: { fase: FaseFrank }) {
  return (
    <div className="mt-1 flex items-center gap-1">
      {([1, 2, 3, 4, 5] as FaseFrank[]).map((n) => {
        const attivo = n <= fase || fase === 6
        return <div key={n} className={`h-1.5 flex-1 rounded-full ${attivo ? FASE_COL[n].pieno : 'bg-inchiostro/[0.08]'}`}
                    title={`${n}. ${FASI_FRANK[n].label}`} />
      })}
    </div>
  )
}

function RigaCliente({ r }: { r: RigaFrank }) {
  const c = FASE_COL[r.fase]
  return (
    <Link href={`/amministrazione/consulenze-frank/${slugFrank(r.cliente)}`}
          className="block border-b border-linea/70 px-3 py-3 last:border-b-0 hover:bg-inchiostro/[0.02]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13.5px] font-bold text-inchiostro">{r.cliente}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.testo}`}>
          {r.fase === 6 ? 'consegnato' : `${r.fase} · ${FASI_FRANK[r.fase].label}`}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-inchiostro/45">{r.owner}</p>
      <div className="mt-1 max-w-[240px]"><Stepper fase={r.fase} /></div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
        <span className={`font-semibold ${c.testo}`}>consegna prevista {fmtData(r.consegnaPrevista)}</span>
        {r.consulenzaFrank ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-bold text-green-700">
            ✓ consulenza {fmtData(r.consulenzaFrank)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 font-bold text-rose-700">
            ⚠ consulenza da prenotare
          </span>
        )}
      </div>
    </Link>
  )
}

export default async function TutorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tutor = tutorFrankDaSlug(slug)
  if (!tutor) notFound()

  const clienti = clientiTutorFrank(tutor).sort((a, b) => a.consegnaPrevista.getTime() - b.consegnaPrevista.getTime())
  const senzaCons = clienti.filter((r) => !r.consulenzaFrank)
  const attesa = attesaTutor(tutor)
  const pc = pcPerTutor().find((g) => g.tutor.toUpperCase() === tutor.toUpperCase())

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">{tutor}</h1>
            <p className="mt-1 text-sm text-inchiostro/55">{clienti.length} in produzione · {attesa.length} in attesa (questionario/AssessFirst){pc ? ` · ${pc.totale} pronto per consulenza` : ''}.</p>
          </div>
          <div className="ml-auto">
            <Link href="/amministrazione/tutor" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Tutti i tutor
            </Link>
          </div>
        </header>

        {senzaCons.length > 0 && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-inchiostro/80">
            <b className="text-rose-700">⚠ {senzaCons.length} client{senzaCons.length === 1 ? 'e' : 'i'} senza consulenza con Frank prenotata:</b>{' '}
            {senzaCons.map((r) => r.cliente).join(', ')}. Verifica se hanno prenotato e in caso segnala l&apos;errore.
          </div>
        )}

        {clienti.length > 0 && (
          <>
            <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-inchiostro/40">In produzione ({clienti.length})</h3>
            <div className="mt-2 overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm">
              {clienti.map((r, i) => <RigaCliente key={r.cliente + i} r={r} />)}
            </div>
          </>
        )}

        {attesa.length > 0 && (
          <>
            <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-inchiostro/40">In attesa — questionario / AssessFirst da compilare ({attesa.length})</h3>
            <p className="text-[11px] text-inchiostro/45">Non ancora in produzione: mancano il questionario o gli AssessFirst. Nessuna data finché non arrivano.</p>
            <div className="mt-2 overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm">
              {attesa.map((c, i) => (
                <div key={c.nome + c.azienda + i} className="flex items-center justify-between gap-3 border-b border-linea/70 px-3 py-2.5 last:border-b-0">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-inchiostro">{c.nome}</p>
                    <p className="truncate text-[11px] text-inchiostro/45">{c.azienda}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">in attesa</span>
                </div>
              ))}
            </div>
          </>
        )}

        {pc && pc.totale > 0 && (
          <>
            <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-inchiostro/40">
              Pronto per consulenza ({pc.totale})
              <span className="ml-2 font-normal normal-case tracking-normal">
                <span className="font-semibold text-green-700">{pc.fissate.length} fissate</span>
                {pc.daFissare.length > 0 && <span className="font-semibold text-rose-700"> · {pc.daFissare.length} da fissare</span>}
              </span>
            </h3>
            <p className="text-[11px] text-inchiostro/45">Report finito: il processo si chiude quando la call con Frank è prenotata.</p>
            <div className="mt-2 overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm">
              {[...pc.fissate, ...pc.daFissare].map((c, i) => (
                <div key={c.cliente + i} className="flex items-center justify-between gap-3 border-b border-linea/70 px-3 py-2.5 last:border-b-0">
                  <p className="min-w-0 truncate text-[13px] font-bold text-inchiostro">{c.cliente}</p>
                  {c.consulenza ? (
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">✓ {fmtGiorno(c.consulenza)}{c.ora ? ` · ${c.ora}` : ''}</span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">⚠ da fissare</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
