'use client'

// ─── Quadro Aziendale ───
// Due code, un unico posto: i clienti già in erogazione (dati reali dal file
// di Grippo) e i 58 progetti futuri in attesa di produzione (modello a leve:
// chi scrive, chi revisiona, chi genera). Le variabili si scelgono PRIMA di
// vedere i risultati — è la regola che Lorenzo ha chiesto di non perdere.

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  AGENTE_GRAFICI, AGENTE_IMPAG, AGENTE_TESTO, DAY, EROG_ANCHE_REV_N, EROG_ANOMALIE,
  EROG_GENERAZIONE, EROG_GRAFICA, EROG_MAX, EROG_OGGI, EROG_SOLO_GRAFICA_N,
  FULLAI_AGENTE, FULLAI_INTERAZIONE, GEN, GIORNO_MS, N_FUTURI, REVG, REVI, REVT,
  Schedule, fmtData, fmtHM, schedule, workday,
} from '@/lib/quadroaziendale'

const LARGHEZZA_TABELLA = 260

type Scope = 'erogazione' | 'futuri' | 'entrambi'

// ── piccoli mattoncini di UI, nello stile già in uso in amministrazione/page.tsx ──

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

function Opzione({ attiva, label, giorni, tinta, onClick }:
  { attiva: boolean; label: string; giorni: number; tinta: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors ${
        attiva ? `border-transparent font-bold ${tinta}` : 'border-linea text-inchiostro/70 hover:border-inchiostro/20'
      }`}
    >
      <span className={attiva ? 'font-bold' : 'font-medium'}>{label}</span>
      <span className="font-display font-bold tabular-nums">{giorni}g</span>
    </button>
  )
}

/** Riga del Gantt semplice: nome+contesto a sinistra, UNA barra a destra. */
function RigaBarra({ titolo, sottotitolo, startPct, endPct, bg, testo, etichetta, tag, zebra }: {
  titolo: string; sottotitolo: string; startPct: number; endPct: number
  bg: string; testo: string; etichetta: string; tag?: string; zebra: boolean
}) {
  const larghezza = Math.max(endPct - startPct, 1.1)
  const conTag = Boolean(tag)
  const labLeft = endPct > (conTag ? 48 : 74)
  return (
    <div className={`grid border-b border-linea/70 last:border-b-0 ${zebra ? 'bg-inchiostro/[0.02]' : ''}`}
         style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
      <div className="border-r border-linea px-3 py-2">
        <p className="truncate text-[12.5px] font-bold text-inchiostro">{titolo}</p>
        <p className="truncate text-[10.5px] text-inchiostro/45">{sottotitolo}</p>
      </div>
      <div className="relative h-9">
        <div className={`absolute top-1/2 h-[11px] -translate-y-1/2 rounded-full ${bg}`}
             style={{ left: `${startPct}%`, width: `${larghezza}%` }} />
        <div className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded bg-carta px-1 text-[10.5px] font-bold tabular-nums ${testo}`}
             style={labLeft ? { right: `${100 - endPct}%`, textAlign: 'right' } : { left: `${endPct}%`, paddingLeft: 6 }}>
          <span>{etichetta}</span>
          {tag && <span className="rounded bg-amber-100 px-1 py-px text-[8.5px] font-bold text-amber-800">{tag}</span>}
        </div>
      </div>
    </div>
  )
}

function Assi({ maxDays, workdayFn }: { maxDays: number; workdayFn: (n: number) => Date }) {
  const n = Math.min(5, Math.max(1, maxDays - 1))
  const seen = new Set<number>()
  const tacche: { pct: number; label: string }[] = []
  for (let i = 0; i <= n; i++) {
    const wd = Math.max(1, Math.round((maxDays * i) / n))
    if (seen.has(wd)) continue
    seen.add(wd)
    tacche.push({ pct: (wd / maxDays) * 100, label: fmtData(workdayFn(wd)) })
  }
  return (
    <div className="grid border-b border-linea bg-inchiostro/[0.03]" style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
      <div className="flex items-end border-r border-linea px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/40">
        Cliente
      </div>
      <div className="relative h-8">
        {tacche.map((t, i) => (
          <span key={i} className="absolute bottom-1.5 -translate-x-1/2 text-[10px] text-inchiostro/45"
                style={{ left: `${t.pct}%` }}>{t.label}</span>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// SEZIONE "IN EROGAZIONE"
// ============================================================

function SezioneErogazione() {
  const spanDays = Math.round((EROG_MAX.getTime() - EROG_OGGI.getTime()) / GIORNO_MS)
  const xpos = (d: Date) => Math.min(97, Math.max(2, ((d.getTime() - EROG_OGGI.getTime()) / GIORNO_MS / spanDays) * 100))

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Statistica label="32 clienti realmente attivi" valore="7 ago – 17 ago" sub="finestra stimata per chiudere la coda attuale" tinta="text-petrolio-scuro" grande />
        <Statistica label="Pattern generazione" valore="22 gg" sub="mediana lead time, ultimi 90gg (storico: 16gg)" />
        <Statistica label="Pattern grafica" valore="3 gg" sub="mediana lead time, stabile" />
        <Statistica label="Ritmo squadra" valore="~5,6/sett" sub="consegne grafica storiche, ultime 8 settimane" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Carta className="bg-petrolio/10"><p className="text-xs font-semibold uppercase text-petrolio-scuro">Aspettano la generazione</p><p className="font-display mt-1 text-3xl font-bold text-petrolio-scuro">{EROG_GENERAZIONE.length}</p><p className="mt-1 text-[11px] text-petrolio-scuro/80">1 già in scrittura · 9 non assegnati</p></Carta>
        <Carta className="bg-amber-50"><p className="text-xs font-semibold uppercase text-amber-800">In revisione (bloccata)</p><p className="font-display mt-1 text-3xl font-bold text-amber-800">1</p><p className="mt-1 text-[11px] text-amber-800/80">anomalia — vedi sotto</p></Carta>
        <Carta className="bg-violet-50"><p className="text-xs font-semibold uppercase text-violet-700">Testo da revisionare + grafica</p><p className="font-display mt-1 text-3xl font-bold text-violet-700">{EROG_ANCHE_REV_N}</p><p className="mt-1 text-[11px] text-violet-700/80">già dai grafici, senza segnale di testo chiuso</p></Carta>
        <Carta className="bg-indigo-50"><p className="text-xs font-semibold uppercase text-indigo-700">Manca solo la grafica</p><p className="font-display mt-1 text-3xl font-bold text-indigo-700">{EROG_SOLO_GRAFICA_N}</p><p className="mt-1 text-[11px] text-indigo-700/80">testo consegnato/revisionato</p></Carta>
        <Carta className="bg-rose-50"><p className="text-xs font-semibold uppercase text-rose-700">Sospesi</p><p className="font-display mt-1 text-3xl font-bold text-rose-700">2</p><p className="mt-1 text-[11px] text-rose-700/80">stand-by / da rifare — esclusi</p></Carta>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Anomalie fuori pattern</h3>
        <div className="mt-2 space-y-2">
          {EROG_ANOMALIE.map((a, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3">
              <span className="text-sm">{a.icona}</span>
              <p className="text-xs text-inchiostro/80">{a.testo}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Gantt — stima di consegna, 32 clienti attivi</h3>
        <div className="mt-2 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
          <div className="min-w-[720px]">
            <Assi maxDays={spanDays} workdayFn={(n) => new Date(EROG_OGGI.getTime() + (n / spanDays) * (EROG_MAX.getTime() - EROG_OGGI.getTime()))} />
            {EROG_GRAFICA.map((r, i) => (
              <RigaBarra key={r.nome + i} zebra={i % 2 === 0}
                titolo={r.nome} sottotitolo={`${r.contesto} · ${r.tutor}`}
                startPct={2} endPct={xpos(r.data)}
                bg={r.ancheRevisione ? 'bg-violet-500' : 'bg-indigo-500'}
                testo={r.ancheRevisione ? 'text-violet-700' : 'text-indigo-700'}
                etichetta={fmtData(r.data)} tag={r.ancheRevisione ? '+revisione testo' : undefined} />
            ))}
            {EROG_GENERAZIONE.map((r, i) => (
              <RigaBarra key={r.nome + i} zebra={i % 2 === 0}
                titolo={r.nome} sottotitolo={`${r.contesto} · ${r.tutor}`}
                startPct={2} endPct={xpos(r.grafica)}
                bg="bg-petrolio" testo="text-petrolio-scuro"
                etichetta={fmtData(r.grafica)} tag={r.ipotetico ? 'se assegnato oggi' : undefined} />
            ))}
          </div>
        </div>
      </div>

      <Carta className="text-xs leading-relaxed text-inchiostro/65">
        <p><b className="text-inchiostro">Come ho calcolato queste date.</b> Dal file di Grippo ho estratto 53 righe ancora aperte (senza data di &quot;Graficato il&quot;); 21 sono scarti — voci di agosto 2025 mai chiuse ma quasi certamente già risolte, duplicati di clienti chiusi altrove nel file, o righe che sono etichette/istruzioni interne, non clienti. Restano 32 clienti realmente in coda.</p>
        <p className="mt-2">Per ognuno ho letto le note in &quot;Assegnato a&quot; per capire lo stadio reale, e ho usato le date storiche di consegna come pattern empirico: <b className="text-inchiostro">mediana 22 giorni lavorativi</b> da assegnazione a testo consegnato (ultimi 90gg — nello storico completo era 16, la coda si è allungata), <b className="text-inchiostro">mediana 3 giorni</b> da testo consegnato a grafica finita. Le 19 persone in coda da Alessio sono ordinate per data di consegna del testo e distanziate al ritmo storico di ~5,6 consegne/settimana. I 9 clienti non ancora assegnati sono uno scenario &quot;se partono oggi&quot;.</p>
        <p className="mt-2">Dentro i 19 &quot;aspettano la grafica&quot; non sono tutti uguali: per <b className="text-inchiostro">{EROG_SOLO_GRAFICA_N}</b> il testo ha un segnale chiaro di chiusura (data di consegna o &quot;revisionato&quot; in nota). Per gli altri <b className="text-inchiostro">{EROG_ANCHE_REV_N}</b> (in viola, tag &quot;+revisione testo&quot;) la nota dice solo &quot;inviato ad Alessio&quot;, senza conferma che il testo sia chiuso — vale la pena controllarli uno per uno.</p>
      </Carta>
    </div>
  )
}

// ============================================================
// SEZIONE "FUTURI"
// ============================================================

function SezioneFuturi() {
  const [copyCount, setCopyCount] = useState(1)
  const [grippoOn, setGrippoOn] = useState(false)
  const [valentinoOn, setValentinoOn] = useState(false)
  const [fullAiOn, setFullAiOn] = useState(false)

  const sch: Schedule = useMemo(() => schedule(copyCount, grippoOn, valentinoOn, fullAiOn),
    [copyCount, grippoOn, valentinoOn, fullAiOn])

  const preset = (cc: number, g: boolean, v: boolean, fa: boolean) => {
    setCopyCount(cc); setGrippoOn(g); setValentinoOn(v); setFullAiOn(fa)
  }
  const presets: { label: string; cc: number; g: boolean; v: boolean; fa: boolean }[] = [
    { label: '1 · Solo Carlo', cc: 1, g: false, v: false, fa: false },
    { label: '2 · + Paolo', cc: 2, g: false, v: false, fa: false },
    { label: '3 · + Grippo', cc: 2, g: true, v: false, fa: false },
    { label: '4 · + Valentino', cc: 2, g: true, v: true, fa: false },
    { label: '5 · Full AI', cc: 2, g: true, v: true, fa: true },
  ]

  const copyNomi = copyCount === 1 ? 'Carlo' : 'Carlo o Paolo'
  const pipeline = [
    ...(fullAiOn
      ? [
          { nm: '1. Generazione (agente)', tm: fmtHM(FULLAI_AGENTE), who: 'agente', bg: 'bg-violet-50', tinta: 'text-violet-700' },
          { nm: "1b. Interazione con l'AI", tm: fmtHM(FULLAI_INTERAZIONE), who: copyNomi, bg: 'bg-petrolio/10', tinta: 'text-petrolio-scuro' },
        ]
      : [{ nm: '1. Generazione', tm: fmtHM(GEN), who: copyNomi, bg: 'bg-petrolio/10', tinta: 'text-petrolio-scuro' }]),
    { nm: '2. Revisione testo (agente)', tm: `${AGENTE_TESTO}m`, who: 'agente', bg: 'bg-carta', tinta: 'text-inchiostro' },
    { nm: '2b. Revisione testo', tm: grippoOn ? fmtHM(REVT * 0.1) : fmtHM(REVT), who: grippoOn ? 'Grippo (−90%)' : copyNomi, bg: grippoOn ? 'bg-teal-50' : 'bg-petrolio/10', tinta: grippoOn ? 'text-teal-700' : 'text-petrolio-scuro' },
    { nm: '3. Creazione grafici (agente)', tm: `${AGENTE_GRAFICI}m`, who: 'agente', bg: 'bg-carta', tinta: 'text-inchiostro' },
    { nm: '3b. Revisione grafici', tm: valentinoOn ? fmtHM(REVG * 0.1) : fmtHM(REVG), who: valentinoOn ? 'Valentino (−90%)' : copyNomi, bg: valentinoOn ? 'bg-indigo-50' : 'bg-petrolio/10', tinta: valentinoOn ? 'text-indigo-700' : 'text-petrolio-scuro' },
    { nm: '4. Impaginazione (agente)', tm: `${AGENTE_IMPAG}m`, who: 'agente', bg: 'bg-carta', tinta: 'text-inchiostro' },
    { nm: '4b. Rev. impaginazione', tm: grippoOn ? fmtHM(REVI * 0.1) : fmtHM(REVI), who: grippoOn ? 'Grippo (−90%)' : copyNomi, bg: grippoOn ? 'bg-teal-50' : 'bg-petrolio/10', tinta: grippoOn ? 'text-teal-700' : 'text-petrolio-scuro' },
  ]

  const agenteTot = AGENTE_TESTO + AGENTE_GRAFICI + AGENTE_IMPAG + (fullAiOn ? FULLAI_AGENTE : 0)
  const agenteBreak = fullAiOn
    ? `${FULLAI_AGENTE}+${AGENTE_TESTO}+${AGENTE_GRAFICI}+${AGENTE_IMPAG}`
    : `${AGENTE_TESTO}+${AGENTE_GRAFICI}+${AGENTE_IMPAG}`

  const maxDays = sch.totalDays

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">La pipeline per ogni report</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {pipeline.map((s, i) => (
            <div key={i} className={`rounded-xl p-3 ${s.bg}`}>
              <p className="min-h-[2.4em] text-[10.5px] font-bold text-inchiostro/60">{s.nm}</p>
              <p className={`font-display mt-1 text-lg font-bold tabular-nums ${s.tinta}`}>{s.tm}</p>
              <p className={`text-[10px] font-semibold ${s.tinta}`}>{s.who}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 rounded-xl border border-linea bg-carta p-3 text-xs text-inchiostro/60">
          L&apos;agente lavora <b className="text-inchiostro">{agenteTot} min</b> a report ({agenteBreak}), sempre in parallelo
          {fullAiOn ? ' — ora genera anche il documento' : ''}. Mentre lui lavora, chi scrive non aspetta: investe
          almeno <b className="text-inchiostro">30 min</b>{' '}in anticipo sul report successivo. Il tempo &quot;copy&quot; qui sotto è già netto di questo recupero.
        </p>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Chi c&apos;è in squadra</h3>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Carta>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-petrolio" />Chi scrive — copy</p>
            <div className="space-y-1.5">
              <Opzione attiva={copyCount === 1} label="Solo Carlo" giorni={schedule(1, grippoOn, valentinoOn, fullAiOn).totalDays} tinta="bg-petrolio/10 text-petrolio-scuro" onClick={() => setCopyCount(1)} />
              <Opzione attiva={copyCount === 2} label="Carlo + Paolo" giorni={schedule(2, grippoOn, valentinoOn, fullAiOn).totalDays} tinta="bg-petrolio/10 text-petrolio-scuro" onClick={() => setCopyCount(2)} />
            </div>
          </Carta>
          <Carta>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-teal-600" />Revisore testo — Grippo</p>
            <div className="space-y-1.5">
              <Opzione attiva={!grippoOn} label="Off — resta al copy" giorni={schedule(copyCount, false, valentinoOn, fullAiOn).totalDays} tinta="bg-teal-50 text-teal-700" onClick={() => setGrippoOn(false)} />
              <Opzione attiva={grippoOn} label="On — assorbe la revisione" giorni={schedule(copyCount, true, valentinoOn, fullAiOn).totalDays} tinta="bg-teal-50 text-teal-700" onClick={() => setGrippoOn(true)} />
            </div>
          </Carta>
          <Carta>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-indigo-600" />Grafico — Valentino</p>
            <div className="space-y-1.5">
              <Opzione attiva={!valentinoOn} label="Off — resta al copy" giorni={schedule(copyCount, grippoOn, false, fullAiOn).totalDays} tinta="bg-indigo-50 text-indigo-700" onClick={() => setValentinoOn(false)} />
              <Opzione attiva={valentinoOn} label="On — assorbe la grafica" giorni={schedule(copyCount, grippoOn, true, fullAiOn).totalDays} tinta="bg-indigo-50 text-indigo-700" onClick={() => setValentinoOn(true)} />
            </div>
          </Carta>
          <Carta>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-violet-600" />Generazione — Full AI</p>
            <div className="space-y-1.5">
              <Opzione attiva={!fullAiOn} label="Off — scrive il copy" giorni={schedule(copyCount, grippoOn, valentinoOn, false).totalDays} tinta="bg-violet-50 text-violet-700" onClick={() => setFullAiOn(false)} />
              <Opzione attiva={fullAiOn} label="On — genera l'AI" giorni={schedule(copyCount, grippoOn, valentinoOn, true).totalDays} tinta="bg-violet-50 text-violet-700" onClick={() => setFullAiOn(true)} />
            </div>
          </Carta>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((p) => {
            const attivo = copyCount === p.cc && grippoOn === p.g && valentinoOn === p.v && fullAiOn === p.fa
            return (
              <button key={p.label} onClick={() => preset(p.cc, p.g, p.v, p.fa)}
                className={`rounded-lg border px-3 py-1 text-[11.5px] font-semibold ${attivo ? 'border-transparent bg-petrolio text-white' : 'border-linea bg-carta text-inchiostro/60 hover:text-inchiostro'}`}>
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Statistica label={`${N_FUTURI} progetti, prodotti così`} valore={`~${sch.totalDays} giornate`} sub={`ultimo report: ${fmtData(workday(sch.totalDays))}`} tinta="text-petrolio-scuro" grande />
        <Statistica label="Tempo copy / report" valore={fmtHM(sch.per) + (copyCount === 2 ? ' a testa' : '')} sub={fullAiOn ? "interazione con l'AI + revisioni non assorbite" : 'generazione + revisioni non assorbite'} />
        <Statistica label="Grippo — utilizzo" valore={grippoOn ? `${sch.grippoUtilPct.toFixed(0)}%` : '—'} sub={grippoOn ? 'della sua giornata, in media' : 'non attivo'} tinta={grippoOn ? 'text-teal-700' : 'text-inchiostro/40'} />
        <Statistica label="Valentino — utilizzo" valore={valentinoOn ? `${sch.valentinoUtilPct.toFixed(0)}%` : '—'} sub={valentinoOn ? 'della sua giornata, in media' : 'non attivo'} tinta={valentinoOn ? 'text-indigo-700' : 'text-inchiostro/40'} />
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Gantt — {N_FUTURI} progetti futuri</h3>
        <div className="mt-2 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
          <div className="min-w-[720px]">
            <Assi maxDays={maxDays} workdayFn={workday} />
            {sch.righe.map((r, i) => {
              const x0 = (r.start / DAY / maxDays) * 100
              const x1 = (r.finish / DAY / maxDays) * 100
              return (
                <RigaBarra key={r.nome + i} zebra={i % 2 === 0}
                  titolo={r.nome} sottotitolo={r.contesto}
                  startPct={x0} endPct={x1}
                  bg="bg-petrolio" testo="text-petrolio-scuro"
                  etichetta={fmtData(workday(Math.ceil(r.finish / DAY)))}
                  tag={r.rifare ? 'rifare' : undefined} />
              )
            })}
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-inchiostro/50">
        Roster aggiornato a venerdì, {N_FUTURI} progetti (alcuni clienti ne hanno più d&apos;uno). I 24 progetti già
        assegnati alle persone restano in lavorazione a parte, critici e non riassegnabili. Copy lavora 7h/giorno in
        seriale; Grippo e Valentino lavorano in parallelo e non risultano mai il collo di bottiglia a questi volumi.
      </p>
    </div>
  )
}

// ============================================================
// PAGINA
// ============================================================

export default function QuadroAziendale() {
  const [scope, setScope] = useState<Scope>('erogazione')

  const titoli: Record<Scope, [string, string]> = {
    erogazione: ['Quanto tempo serve per erogare i clienti aperti?', '32 clienti realmente in lavorazione oggi, secondo il file di Grippo. Nessuna ipotesi: solo pattern storici.'],
    futuri: ['Quante persone servono per smaltire i 58 progetti in coda?', 'Muovi le leve: chi scrive, chi revisiona il testo, chi revisiona la grafica. Il Gantt si ricalcola da solo.'],
    entrambi: ['Erogazione oggi + coda futura: il quadro completo', 'Prima i clienti già in lavorazione (dati reali), poi i 58 in attesa (modello a leve).'],
  }

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">{titoli[scope][0]}</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">{titoli[scope][1]}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Quadro Amministrativo
            </Link>
          </div>
        </header>

        <div className="mt-5 flex flex-wrap gap-2">
          {([
            ['erogazione', 'In erogazione'],
            ['futuri', 'Futuri (58)'],
            ['entrambi', 'Entrambi'],
          ] as [Scope, string][]).map(([v, label]) => (
            <button key={v} onClick={() => setScope(v)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                scope === v ? 'border-transparent bg-petrolio text-white' : 'border-linea bg-carta text-inchiostro/60 hover:text-inchiostro'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {(scope === 'erogazione' || scope === 'entrambi') && <SezioneErogazione />}
        {(scope === 'futuri' || scope === 'entrambi') && <SezioneFuturi />}
      </div>
    </div>
  )
}
