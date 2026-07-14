'use client'

// ─── Human in the loop ───
// Gli 87 clienti reali in erogazione. Il passaggio in corso resta alla persona;
// TUTTI i passaggi successivi passano all'agente con controllo umano (chi è in
// revisione Grippo → l'impaginazione la fa l'agente; chi è in scrittura copy →
// non passa più dalla revisione Grippo umana, va all'agente). Consegna calcolata
// in avanti, ordinata per chi esce prima; i clienti senza documenti (stadio 1)
// in coda dopo l'ultimo in lavorazione. La generazione agentica (l'agente scrive
// anche di notte) fa crollare i tempi della coda in attesa.

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  EROG_CLIENTI, EROG_OGGI, EROG_TOT, GIORNO_MS, RigaErog, StadioErog,
  fmtData, occupazioneHITL, programmaAttesa, stimaConsegnaHITL,
} from '@/lib/quadroaziendale'

const LARGHEZZA_TABELLA = 260

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

function Opzione({ attiva, label, tinta, onClick }:
  { attiva: boolean; label: string; tinta: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
        attiva ? `border-transparent font-bold ${tinta}` : 'border-linea text-inchiostro/70 hover:border-inchiostro/20'
      }`}>
      {label}
    </button>
  )
}

const STADIO_INFO: Record<StadioErog, { label: string; barra: string; barraDone: string; testo: string }> = {
  1: { label: 'Informazioni mancanti', barra: 'bg-rose-500', barraDone: 'bg-rose-500/25', testo: 'text-rose-700' },
  2: { label: 'Copy e Caputo', barra: 'bg-petrolio', barraDone: 'bg-petrolio/25', testo: 'text-petrolio-scuro' },
  3: { label: 'Revisione Grippo/Tabita', barra: 'bg-teal-600', barraDone: 'bg-teal-600/25', testo: 'text-teal-700' },
  4: { label: 'Impaginazione Valentino', barra: 'bg-indigo-600', barraDone: 'bg-indigo-600/25', testo: 'text-indigo-700' },
}

function SegmentiStadi({ stadio }: { stadio: StadioErog }) {
  return (
    <div className="mt-1 flex items-center gap-1">
      {([1, 2, 3, 4] as StadioErog[]).map((n) => {
        const c = STADIO_INFO[n]
        const cls = n === stadio ? c.barra : n < stadio ? c.barraDone : 'bg-inchiostro/[0.07]'
        return <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${cls}`} />
      })}
    </div>
  )
}

type RigaGantt = { r: RigaErog; start: Date; data: Date; attesa: boolean }

function RigaBarra({ g, maxDays, zebra }: { g: RigaGantt; maxDays: number; zebra: boolean }) {
  const startPct = Math.max(0, (Math.round((g.start.getTime() - EROG_OGGI.getTime()) / GIORNO_MS) / maxDays) * 100)
  const endGiorni = Math.round((g.data.getTime() - EROG_OGGI.getTime()) / GIORNO_MS)
  const endPct = Math.max((endGiorni / maxDays) * 100, startPct + 1.2)
  const c = STADIO_INFO[g.r.stadio]
  const tag = g.r.daVerificare ? 'da verificare' : g.r.dataApprox ? 'data stimata' : undefined
  const labLeft = endPct > 72
  return (
    <div className={`grid border-b border-linea/70 last:border-b-0 ${zebra ? 'bg-inchiostro/[0.02]' : ''}`}
         style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
      <div className="border-r border-linea px-3 py-2">
        <p className="truncate text-[12.5px] font-bold text-inchiostro">{g.r.nome}</p>
        <p className="truncate text-[10.5px] text-inchiostro/45">{g.r.azienda} · {g.attesa ? 'in attesa documenti' : STADIO_INFO[g.r.stadio].label}</p>
        <SegmentiStadi stadio={g.r.stadio} />
      </div>
      <div className="relative h-11">
        <div className={`absolute top-1/2 h-[11px] -translate-y-1/2 rounded-full ${g.attesa ? 'bg-petrolio/40' : c.barra}`}
             style={{ left: `${startPct}%`, width: `${Math.max(endPct - startPct, 1.2)}%` }} />
        <div className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded bg-carta px-1 text-[10.5px] font-bold tabular-nums ${g.attesa ? 'text-inchiostro/55' : c.testo}`}
             style={labLeft ? { right: `${100 - endPct}%`, textAlign: 'right' } : { left: `${endPct}%`, paddingLeft: 6 }}>
          <span>{fmtData(g.data)}</span>
          {tag && <span className="rounded bg-amber-100 px-1 py-px text-[8.5px] font-bold text-amber-800">{tag}</span>}
        </div>
      </div>
    </div>
  )
}

function Assi({ maxDays }: { maxDays: number }) {
  const n = Math.min(7, Math.max(1, maxDays))
  const seen = new Set<number>()
  const tacche: { pct: number; label: string }[] = []
  for (let i = 0; i <= n; i++) {
    const d = Math.max(0, Math.round((maxDays * i) / n))
    if (seen.has(d)) continue
    seen.add(d)
    tacche.push({ pct: (d / maxDays) * 100, label: fmtData(new Date(EROG_OGGI.getTime() + d * GIORNO_MS)) })
  }
  return (
    <div className="grid border-b border-linea bg-inchiostro/[0.03]" style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
      <div className="flex items-end border-r border-linea px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/40">Cliente</div>
      <div className="relative h-8">
        <span className="absolute bottom-1.5 left-0 text-[10px] font-bold text-petrolio-scuro">oggi</span>
        {tacche.map((t, i) => (
          <span key={i} className="absolute bottom-1.5 -translate-x-1/2 text-[10px] text-inchiostro/45" style={{ left: `${t.pct}%` }}>{t.label}</span>
        ))}
      </div>
    </div>
  )
}

export default function PrevisioneAgentica() {
  const [copyCount, setCopyCount] = useState(1)
  const [genAgentica, setGenAgentica] = useState(false)
  const [caputoAgenteOn, setCaputoAgenteOn] = useState(false)
  const [grippoOn, setGrippoOn] = useState(false)
  const [valentinoOn, setValentinoOn] = useState(false)

  const occupazione = useMemo(() => occupazioneHITL(EROG_CLIENTI, { caputoAgente: caputoAgenteOn, grippoOn, valentinoOn }), [caputoAgenteOn, grippoOn, valentinoOn])

  const { righe, maxDays, stadio1Count, ultimo } = useMemo(() => {
    const inProg = EROG_CLIENTI
      .map((r): RigaGantt | null => {
        const h = stimaConsegnaHITL(r)
        if (!h || h.tipo === 'condizionale') return null
        return { r, start: EROG_OGGI, data: h.data, attesa: false }
      })
      .filter((x): x is RigaGantt => x !== null)
      .sort((a, b) => a.data.getTime() - b.data.getTime())
    const ancora = inProg.reduce((m, x) => (x.data > m ? x.data : m), EROG_OGGI)
    const attesa = programmaAttesa(EROG_CLIENTI, ancora, { hitl: true, copyCount, genAgentica, caputoAgente: caputoAgenteOn })
      .map((a): RigaGantt => ({ r: a.r, start: ancora, data: a.data, attesa: true }))
      .sort((a, b) => a.data.getTime() - b.data.getTime())
    const tutte: RigaGantt[] = [...inProg, ...attesa]
    const maxDate = tutte.reduce((m, x) => (x.data > m ? x.data : m), ancora)
    const md = Math.max(1, Math.round((maxDate.getTime() - EROG_OGGI.getTime()) / GIORNO_MS))
    return {
      righe: tutte, maxDays: md, stadio1Count: attesa.length,
      ultimo: attesa.length ? attesa[attesa.length - 1].data : ancora,
    }
  }, [copyCount, genAgentica, caputoAgenteOn])

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Human in the loop: l&apos;agente prende i passaggi successivi</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              Gli stessi {EROG_TOT} clienti. Il passaggio in corso resta alla persona; tutti quelli dopo passano all&apos;agente con un umano che controlla. Ordinati per data di consegna.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/previsione-umana" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">← Pagina Umano</Link>
            <Link href="/amministrazione/quadro-aziendale" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">Quadro Aziendale</Link>
          </div>
        </header>

        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Le variabili — scegli prima di vedere i risultati</h3>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-5">
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-violet-600" />Generazione agentica</p>
              <div className="space-y-1.5">
                <Opzione attiva={!genAgentica} label="Off — scrive il copy" tinta="bg-violet-50 text-violet-700" onClick={() => setGenAgentica(false)} />
                <Opzione attiva={genAgentica} label="On — l'agente scrive (anche di notte)" tinta="bg-violet-50 text-violet-700" onClick={() => setGenAgentica(true)} />
              </div>
            </Carta>
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-petrolio" />Chi scrive i nuovi</p>
              <div className="space-y-1.5">
                <Opzione attiva={copyCount === 1} label="Solo Carlo" tinta="bg-petrolio/10 text-petrolio-scuro" onClick={() => setCopyCount(1)} />
                <Opzione attiva={copyCount === 2} label="Carlo + Paolo" tinta="bg-petrolio/10 text-petrolio-scuro" onClick={() => setCopyCount(2)} />
              </div>
            </Carta>
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-amber-500" />Slide — Caputo</p>
              <div className="space-y-1.5">
                <Opzione attiva={!caputoAgenteOn} label="Il copy controlla — manuale, 2h" tinta="bg-amber-50 text-amber-700" onClick={() => setCaputoAgenteOn(false)} />
                <Opzione attiva={caputoAgenteOn} label="Caputo si inserisce nel flusso — 25min" tinta="bg-amber-50 text-amber-700" onClick={() => setCaputoAgenteOn(true)} />
              </div>
            </Carta>
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-teal-600" />Controllo testo</p>
              <div className="space-y-1.5">
                <Opzione attiva={!grippoOn} label="Il copy controlla" tinta="bg-teal-50 text-teal-700" onClick={() => setGrippoOn(false)} />
                <Opzione attiva={grippoOn} label="Grippo/Tabita si inserisce nel flusso" tinta="bg-teal-50 text-teal-700" onClick={() => setGrippoOn(true)} />
              </div>
            </Carta>
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-indigo-600" />Controllo impaginazione</p>
              <div className="space-y-1.5">
                <Opzione attiva={!valentinoOn} label="Il copy controlla" tinta="bg-indigo-50 text-indigo-700" onClick={() => setValentinoOn(false)} />
                <Opzione attiva={valentinoOn} label="Valentino si inserisce nel flusso" tinta="bg-indigo-50 text-indigo-700" onClick={() => setValentinoOn(true)} />
              </div>
            </Carta>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-inchiostro/45">
            La <b>generazione agentica</b> abbatte i tempi della coda in attesa: l&apos;agente scrive i nuovi report in parallelo, anche di notte, senza fare la fila dietro al copy. Il controllo dei passaggi agentici dura sempre uguale — le leve &quot;chi controlla&quot; decidono solo di chi è il tempo (e quindi l&apos;occupazione qui sotto), non spostano le date.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Statistica label="Consegna dell'ultimo cliente" valore={fmtData(ultimo)} sub={genAgentica ? "con generazione agentica: la coda crolla" : `coda scritta ${copyCount === 2 ? 'da Carlo + Paolo' : 'dal solo Carlo'}`} tinta="text-petrolio-scuro" grande />
          <Statistica label="Caputo — occupazione" valore={`${occupazione.caputoGg}gg`} sub={caputoAgenteOn ? 'assistito da agente' : 'manuale, 2h a cliente'} tinta="text-amber-700" />
          <Statistica label="Grippo/Tabita — occupazione" valore={grippoOn ? `${occupazione.grippoGg}gg` : '—'} sub={grippoOn ? 'controlla lui il testo' : 'il testo lo controlla il copy'} tinta={grippoOn ? 'text-teal-700' : 'text-inchiostro/40'} />
          <Statistica label="Valentino — occupazione" valore={valentinoOn ? `${occupazione.valentinoGg}gg` : '—'} sub={valentinoOn ? "controlla lui l'impaginazione" : "l'impaginazione la controlla il copy"} tinta={valentinoOn ? 'text-indigo-700' : 'text-inchiostro/40'} />
        </div>

        <div className="mt-6">
          <h3 className="font-display text-xl font-bold tracking-tight text-inchiostro">Quando consegniamo, human in the loop</h3>
          <p className="text-[11px] text-inchiostro/45">In alto chi esce prima. Le barre chiare in fondo sono i clienti in attesa dei documenti: partono quando si libera la coda ({stadio1Count} clienti).</p>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
            <div className="min-w-[760px]">
              <Assi maxDays={maxDays} />
              {righe.map((g, i) => <RigaBarra key={g.r.nome + g.r.azienda + i} g={g} maxDays={maxDays} zebra={i % 2 === 0} />)}
            </div>
          </div>
        </div>

        <Carta className="mt-6 text-xs leading-relaxed text-inchiostro/65">
          <p><b className="text-inchiostro">Come funziona.</b> Il passaggio in cui un cliente si trova oggi lo finisce la persona che lo sta già facendo (non si interrompe un lavoro a metà). Da lì in poi, ogni passaggio è dell&apos;agente con un umano che controlla: chi è in <b className="text-inchiostro">scrittura copy</b> non passa più dalla revisione Grippo umana → va all&apos;agente; chi è in <b className="text-inchiostro">revisione Grippo</b> avrà l&apos;impaginazione fatta dall&apos;agente; chi è già in <b className="text-inchiostro">impaginazione</b> è all&apos;ultimo passaggio e non cambia.</p>
          <p className="mt-2"><b className="text-inchiostro">La coda in attesa (stadio 1).</b> I {stadio1Count} clienti senza documenti partono dalla consegna dell&apos;ultimo cliente già in lavorazione. Senza generazione agentica il copy li scrive in serie (uno alla volta); con la generazione agentica li scrive l&apos;agente in parallelo, anche di notte — ed è lì che i tempi crollano.</p>
        </Carta>
      </div>
    </div>
  )
}
