'use client'

// ─── Consulenze Frank — Gantt ufficiale ───
// Timeline a calendario scorrevole con linea "oggi". Scala colori rosso→verde
// sui passaggi (rosso = appena iniziato, verde = quasi/consegnato). Ogni barra
// parte dall'ingresso reale in pipeline; i rombi sono i passaggi completati,
// colorati per step, fino alla consegna e alla consulenza finale con Frank.
// Ogni cliente è cliccabile → log completo della timeline del progetto.

import { useState } from 'react'
import Link from 'next/link'
import { FASI_FRANK, FRANK_OGGI, FaseFrank, RigaFrank, slugFrank } from '@/lib/consulenzeFrank'
import { SILOS, SILO_TO_FASE, SiloId, siloById } from '@/lib/pipelineSilos'
import { useClientiPipeline } from '@/lib/clientiPipeline'
import { useApp } from '@/lib/store'
import { GIORNO_MS, fmtData } from '@/lib/quadroaziendale'

const LARGHEZZA_TABELLA = 300
const MIN_W = 1720

function Carta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-linea bg-carta p-4 shadow-sm ${className}`}>{children}</div>
}

function Statistica({ label, valore, sub, tinta = 'text-inchiostro', grande = false }:
  { label: string; valore: string; sub?: string; tinta?: string; grande?: boolean }) {
  return (
    <Carta className={grande ? 'bg-petrolio/10' : ''}>
      <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">{label}</p>
      <p className={`font-display mt-1 ${grande ? 'text-3xl' : 'text-2xl'} font-bold tracking-tight ${tinta}`}>{valore}</p>
      {sub && <p className="mt-1 text-[11px] text-inchiostro/50">{sub}</p>}
    </Carta>
  )
}

// Scala rosso → verde: 1 copy (rosso) … 5 grafica (verde) … 6 consegnato (verde scuro).
export const RAMPA: Record<number, { pieno: string; track: string; testo: string; rombo: string }> = {
  1: { pieno: 'bg-red-500', track: 'bg-red-500/20', testo: 'text-red-700', rombo: 'bg-red-600' },
  2: { pieno: 'bg-orange-500', track: 'bg-orange-500/20', testo: 'text-orange-700', rombo: 'bg-orange-500' },
  3: { pieno: 'bg-amber-500', track: 'bg-amber-500/20', testo: 'text-amber-700', rombo: 'bg-amber-500' },
  4: { pieno: 'bg-lime-500', track: 'bg-lime-500/20', testo: 'text-lime-700', rombo: 'bg-lime-600' },
  5: { pieno: 'bg-green-500', track: 'bg-green-500/20', testo: 'text-green-700', rombo: 'bg-green-600' },
  6: { pieno: 'bg-green-700', track: 'bg-green-700/20', testo: 'text-green-800', rombo: 'bg-green-700' },
}

/** Stepper a 5 tacche colorate rosso→verde: piene fino alla fase attuale, spente le future. */
function Stepper({ fase }: { fase: FaseFrank }) {
  return (
    <div className="mt-1 flex items-center gap-1">
      {([1, 2, 3, 4, 5] as FaseFrank[]).map((n) => {
        const attivo = n <= fase || fase === 6
        return <div key={n} className={`h-1.5 flex-1 rounded-full ${attivo ? RAMPA[n].pieno : 'bg-inchiostro/[0.08]'}`}
                    title={`${n}. ${FASI_FRANK[n].label}`} />
      })}
    </div>
  )
}

function RigaGantt({ r, fase, pct }: { r: RigaFrank; fase: FaseFrank; pct: (ms: number) => number }) {
  const c = RAMPA[fase]
  const oggiMs = FRANK_OGGI.getTime()
  const consegnaMs = r.consegnaPrevista.getTime()
  const inizioMs = r.entrata ? r.entrata.getTime() : oggiMs
  const sinistra = pct(inizioMs)
  const destra = pct(consegnaMs)
  const larghezza = Math.max(destra - sinistra, 0.6)
  const oggiPct = Math.min(Math.max(pct(oggiMs), sinistra), destra)
  const pienoW = Math.max(oggiPct - sinistra, 0)

  // milestone completati, ciascuno col colore del proprio step (rosso→verde)
  const milestone = [
    r.copyDone ? { ms: r.copyDone.getTime(), rombo: RAMPA[1].rombo, label: `Copy completato ${fmtData(r.copyDone)}` } : null,
    r.grippoDone ? { ms: r.grippoDone.getTime(), rombo: RAMPA[3].rombo, label: `Revisione Grippo completata ${fmtData(r.grippoDone)}` } : null,
    r.consulenzaFrank ? { ms: r.consulenzaFrank.getTime(), rombo: RAMPA[6].rombo, label: `Consulenza con Frank ${fmtData(r.consulenzaFrank)}` } : null,
  ].filter((m): m is { ms: number; rombo: string; label: string } => m !== null)

  const testoStorico = [
    r.entrata ? `in pipeline dal ${fmtData(r.entrata)}` : null,
    r.copyDone ? `copy ${fmtData(r.copyDone)}` : null,
    r.grippoDone ? `Grippo ${fmtData(r.grippoDone)}` : null,
    r.consulenzaFrank ? `consulenza ${fmtData(r.consulenzaFrank)}` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="grid border-b border-linea/70 last:border-b-0 hover:bg-inchiostro/[0.025]"
         style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
      <Link href={`/amministrazione/consulenze-frank/${slugFrank(r.cliente)}`} className="block border-r border-linea px-3 py-2.5">
        <div className="flex items-baseline gap-2">
          <span className="font-display truncate text-sm font-bold tracking-tight text-inchiostro">{r.cliente}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.track} ${c.testo}`}>
            {fase === 6 ? 'consegnato' : `${fase} · ${FASI_FRANK[fase].label}`}
          </span>
        </div>
        <div className="mt-0.5 truncate text-[11px] text-inchiostro/45">{r.owner}</div>
        <Stepper fase={fase} />
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[10.5px] text-inchiostro/50">
          {fase !== 6 && <span className={`font-semibold ${c.testo}`}>consegna {fmtData(r.consegnaPrevista)}</span>}
          {testoStorico && <span className="text-inchiostro/45">✓ {testoStorico}</span>}
          <span className="text-petrolio/70 underline decoration-dotted">log →</span>
        </div>
      </Link>

      <div className="relative h-full min-h-[64px]">
        <div className={`absolute top-1/2 h-4 -translate-y-1/2 rounded-full ${c.track}`}
             style={{ left: `${sinistra}%`, width: `${larghezza}%` }}>
          <div className={`h-full rounded-full ${c.pieno}`} style={{ width: `${larghezza > 0 ? (pienoW / larghezza) * 100 : 0}%` }} />
        </div>
        {milestone.map((m, i) => (
          <div key={i} className={`absolute top-1/2 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-carta ${m.rombo}`}
               style={{ left: `${pct(m.ms)}%` }} title={m.label} />
        ))}
        <div className="absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap"
             style={{ left: `${destra}%`, paddingLeft: 6 }}>
          <span className={`h-2.5 w-2.5 -translate-x-3 rotate-45 border border-carta ${c.pieno}`} />
          <span className={`-translate-x-2 text-[10.5px] font-bold tabular-nums ${c.testo}`}>{fmtData(r.consegnaPrevista)}</span>
        </div>
      </div>
    </div>
  )
}

export default function ConsulenzeFrank() {
  const { silos } = useApp()
  const clienti = useClientiPipeline()
  const [mostraNuovi, setMostraNuovi] = useState(false)
  const [faseFiltro, setFaseFiltro] = useState<SiloId | null>(null)
  const [mostraCons, setMostraCons] = useState(false)
  const faseDi = (r: RigaFrank): FaseFrank => {
    const s = silos[slugFrank(r.cliente)]
    return s ? SILO_TO_FASE[s] : r.fase
  }
  // Calendario: solo i clienti con una data di consegna (i 34 ufficiali).
  const righe = clienti
    .filter((c) => c.consegnaPrevista && c.riga)
    .map((c) => c.riga!)
    .sort((a, b) => a.consegnaPrevista.getTime() - b.consegnaPrevista.getTime())
  // Senza data: i clienti nuovi (step 0 / in lavorazione), ancora da programmare.
  const senzaData = clienti.filter((c) => !c.consegnaPrevista && c.origine === 'nuovo')
  const prontoCons = clienti.filter((c) => c.origine === 'consulenza')
  const consDaPren = prontoCons.filter((c) => !c.consulenza)
  const consFissate = prontoCons.filter((c) => c.consulenza)
  const oggiMs = FRANK_OGGI.getTime()

  const inizi = righe.map((r) => (r.entrata ? r.entrata.getTime() : oggiMs))
  const fini = righe.flatMap((r) => [r.consegnaPrevista.getTime(), r.consulenzaFrank ? r.consulenzaFrank.getTime() : 0])
  const da = Math.min(...inizi, oggiMs) - GIORNO_MS * 4
  const a = Math.max(...fini, oggiMs) + GIORNO_MS * 4
  const ampiezza = Math.max(a - da, GIORNO_MS * 7)
  const pct = (ms: number) => Math.max(0, Math.min(100, ((ms - da) / ampiezza) * 100))

  const settimane: number[] = []
  for (let t = Math.ceil(da / (GIORNO_MS * 7)) * GIORNO_MS * 7; t < a; t += GIORNO_MS * 7) settimane.push(t)
  const mesi: { inizio: number; label: string }[] = []
  {
    const dd = new Date(da); dd.setDate(1); dd.setHours(0, 0, 0, 0)
    while (dd.getTime() < a) {
      mesi.push({ inizio: dd.getTime(), label: dd.toLocaleDateString('it-IT', { month: 'long' }) })
      dd.setMonth(dd.getMonth() + 1)
    }
  }

  const contaSilo = (id: SiloId) => clienti.filter((c) => c.silo === id).length
  const consProgrammate = clienti.filter((c) => c.riga?.consulenzaFrank || c.consulenza).length
  const consFatte = clienti.filter((c) => {
    const d = c.riga?.consulenzaFrank ?? (c.consulenza ? new Date(c.consulenza) : null)
    return d && d.getTime() <= oggiMs
  }).length

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Consulenze Frank — Gantt ufficiale</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              {righe.length} clienti pianificati su un&apos;unica timeline{senzaData.length > 0 ? ` + ${senzaData.length} nuovi da programmare` : ''}. Colore dal rosso (appena iniziato) al verde (consegnato); i rombi sono i passaggi completati, l&apos;ultimo è la consulenza con Frank. Clicca un cliente per il log completo del progetto. La linea arancione è oggi.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/quadro-aziendale" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Quadro Aziendale
            </Link>
          </div>
        </header>

        {/* conteggio dettagliato per singola fase (silo) + consulenza finale */}
        <div className="mt-6">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Quanti clienti in ogni fase</h3>
            <span className="text-[11px] text-inchiostro/45">{clienti.length} clienti · il progetto si chiude con la consulenza con Frank</span>
          </div>
          {faseFiltro && (
            <p className="mt-2 text-[11px] text-inchiostro/60">
              Filtro attivo: <b className="text-inchiostro">{siloById(faseFiltro).label}</b> · <button onClick={() => setFaseFiltro(null)} className="font-semibold text-petrolio hover:underline">mostra tutti</button>
            </p>
          )}
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {SILOS.map((s) => {
              const attivo = faseFiltro === s.id
              return (
                <button key={s.id} onClick={() => setFaseFiltro(attivo ? null : s.id)}
                  className={`rounded-xl border bg-carta p-3 text-left shadow-sm transition ${attivo ? 'border-petrolio ring-2 ring-petrolio/20' : 'border-linea hover:border-petrolio/40'}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${s.colore.punto}`} />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-inchiostro/45">{s.ordine}</span>
                  </div>
                  <p className={`font-display mt-0.5 text-2xl font-bold ${s.colore.testo}`}>{contaSilo(s.id)}</p>
                  <p className="truncate text-[10.5px] text-inchiostro/50" title={s.label}>{s.label}</p>
                </button>
              )
            })}
            <div className="rounded-xl border border-linea bg-carta p-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rotate-45 bg-green-800" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-inchiostro/45">fine</span>
              </div>
              <p className="font-display mt-0.5 text-2xl font-bold text-green-800">{consProgrammate}</p>
              <p className="truncate text-[10.5px] text-inchiostro/50" title="Consulenza con Frank">Consulenza Frank{consDaPren.length > 0 ? ` · ${consDaPren.length} da prenotare` : ''}</p>
            </div>
          </div>
        </div>

        {senzaData.length > 0 && (
          <div className="mt-6">
            <button onClick={() => setMostraNuovi((v) => !v)} className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-linea bg-carta px-4 py-3 text-left shadow-sm hover:bg-inchiostro/[0.02]">
              <span className="text-inchiostro/40">{mostraNuovi ? '▲' : '▼'}</span>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Nuovi clienti — step 0, ancora senza data di consegna</h3>
              <span className="rounded-full bg-inchiostro/[0.06] px-2 py-0.5 text-[11px] font-bold text-inchiostro/60">{senzaData.length}</span>
              <span className="text-[11px] text-inchiostro/45">· registrati in commerciale o in attesa del questionario · {mostraNuovi ? 'clicca per chiudere' : 'clicca per aprire'}</span>
            </button>
            {mostraNuovi && (
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {senzaData.map((c) => {
                const s = siloById(c.silo)
                return (
                  <div key={c.slug} className="flex items-center justify-between gap-3 rounded-xl border border-linea bg-carta px-3 py-2.5 shadow-sm">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-inchiostro">{c.nome}</p>
                      <p className="truncate text-[11px] text-inchiostro/45">{c.owner}{c.nDipendenti ? ` · ${c.nDipendenti} person${c.nDipendenti === 1 ? 'a' : 'e'}` : ''}</p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${s.colore.track} ${s.colore.testo}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.colore.punto}`} /> {s.ordine === 0 ? 'step 0' : `${s.ordine}`} · {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
            )}
          </div>
        )}

        {/* Pronto per consulenza — report finito, il processo si chiude quando la call è prenotata */}
        {prontoCons.length > 0 && (
          <div className="mt-4">
            <button onClick={() => setMostraCons((v) => !v)} className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-linea bg-carta px-4 py-3 text-left shadow-sm hover:bg-inchiostro/[0.02]">
              <span className="text-inchiostro/40">{mostraCons ? '▲' : '▼'}</span>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Pronto per consulenza — report finito, in attesa della call</h3>
              {consDaPren.length > 0 && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">{consDaPren.length} da prenotare</span>}
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">{consFissate.length} fissate</span>
              <span className="text-[11px] text-inchiostro/45">· il processo si chiude quando la call è prenotata</span>
            </button>
            {mostraCons && (
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {[...consDaPren, ...consFissate].map((c) => (
                  <div key={c.slug} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 shadow-sm ${c.consulenza ? 'border-linea bg-carta' : 'border-rose-200 bg-rose-50/50'}`}>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-inchiostro">{c.nome}</p>
                      <p className="truncate text-[11px] text-inchiostro/45">{c.owner} · tutor {c.tutor}</p>
                    </div>
                    {c.consulenza
                      ? <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-semibold text-green-700">{fmtData(new Date(c.consulenza))}{c.consulenzaOra ? ` · ${c.consulenzaOra}` : ''}</span>
                      : <span className="shrink-0 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">da prenotare</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-bold tracking-tight text-inchiostro">Timeline del progetto</h3>
            <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-inchiostro/55">
              {([1, 2, 3, 4, 5] as FaseFrank[]).map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-4 rounded-full ${RAMPA[f].pieno}`} />{f}. {FASI_FRANK[f].label}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rotate-45 bg-green-700" />consulenza Frank</span>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
            <div style={{ minWidth: MIN_W }}>
              <div className="grid border-b border-linea bg-inchiostro/[0.03]" style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
                <div className="flex items-end border-r border-linea px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/40">
                  Cliente · fase · consegna
                </div>
                <div className="relative h-11">
                  {mesi.map((m) => (
                    <span key={m.inizio} className="absolute top-1 text-[10px] font-bold uppercase tracking-wider text-inchiostro/50"
                          style={{ left: `${Math.max(pct(m.inizio), 0.4)}%` }}>{m.label}</span>
                  ))}
                  {settimane.map((t) => (
                    <span key={t} className="absolute bottom-0.5 -translate-x-1/2 text-[10px] text-inchiostro/40"
                          style={{ left: `${pct(t)}%` }}>{new Date(t).getDate()}</span>
                  ))}
                  <span className="absolute top-1 -translate-x-1/2 rounded bg-ambra px-1 py-px text-[9px] font-bold uppercase text-white"
                        style={{ left: `${pct(oggiMs)}%` }}>oggi</span>
                </div>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-0 grid" style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
                  <div />
                  <div className="relative">
                    {settimane.map((t) => (
                      <div key={t} className="absolute top-0 bottom-0 w-px bg-inchiostro/[0.06]" style={{ left: `${pct(t)}%` }} />
                    ))}
                    {mesi.map((m) => (
                      <div key={m.inizio} className="absolute top-0 bottom-0 w-px bg-inchiostro/[0.14]" style={{ left: `${pct(m.inizio)}%` }} />
                    ))}
                    <div className="absolute top-0 bottom-0 z-10 w-0.5 bg-ambra" style={{ left: `${pct(oggiMs)}%` }} />
                  </div>
                </div>

                {righe
                  .filter((r) => !faseFiltro || (silos[slugFrank(r.cliente)] ?? 'copy') === faseFiltro)
                  .map((r, i) => <RigaGantt key={r.cliente + i} r={r} fase={faseDi(r)} pct={pct} />)}
              </div>
            </div>
          </div>
        </div>

        <Carta className="mt-6 text-xs leading-relaxed text-inchiostro/65">
          <p><b className="text-inchiostro">I colori.</b> Ogni passaggio ha un colore lungo una scala rosso→verde: <span className="font-semibold text-red-700">1 copy</span> → <span className="font-semibold text-orange-700">2 Jelo</span> → <span className="font-semibold text-amber-700">3 Grippo</span> → <span className="font-semibold text-lime-700">4 Caputo</span> → <span className="font-semibold text-green-700">5 Valentino</span> → <span className="font-semibold text-green-800">consegnato</span>. La barra è del colore della fase in cui il cliente si trova oggi.</p>
          <p className="mt-2"><b className="text-inchiostro">I rombi</b> sono i passaggi già completati, con la data reale dal foglio maestro, colorati per step. L&apos;ultimo step del progetto è la <b className="text-green-800">consulenza con Frank</b>: dove la data è già fissata (foglio maestro) compare come rombo verde scuro, altrimenti resta &quot;da programmare&quot; nel log del cliente.</p>
          <p className="mt-2"><b className="text-inchiostro">Clicca un cliente</b> per aprire il log completo della sua timeline — cosa è stato fatto e quando, e cosa resta.</p>
        </Carta>
      </div>
    </div>
  )
}
