'use client'

// ─── Umano ───
// Gli 87 clienti reali in erogazione, oggi, se tutto resta umano — 4 passaggi
// separati: Carlo scrive, Caputo fa le slide, Grippo/Tabita revisiona, Valentino
// impagina. Consegna calcolata in avanti (chi consegna prima sta in alto); i
// clienti senza documenti (stadio 1) vanno in fondo, in coda dopo l'ultimo in
// lavorazione, scritti in serie dal copy.

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  EROG_CLIENTI, EROG_OGGI, EROG_TOT, GIORNO_MS, MEDIANA_STAGE3_STORICO, MEDIANA_STAGE4_STORICO,
  RigaErog, StadioErog, UMANO_GRIPPO_GG, UMANO_VALENTINO_GG, fmtData, programmaAttesa, stimaConsegnaUmanoV2,
} from '@/lib/quadroaziendale'

const LARGHEZZA_TABELLA = 260

function Carta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-linea bg-carta p-4 shadow-sm ${className}`}>{children}</div>
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

/** I 4 segmenti fissi del flusso: passati pieni tenui, attuale acceso, futuri vuoti. */
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

type RigaGantt = { r: RigaErog; start: Date; data: Date; attesa: boolean; ritardo: number }

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
        <div className={`absolute top-1/2 h-[11px] -translate-y-1/2 rounded-full ${g.attesa ? 'bg-inchiostro/20' : c.barra}`}
             style={{ left: `${startPct}%`, width: `${Math.max(endPct - startPct, 1.2)}%` }} />
        <div className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded bg-carta px-1 text-[10.5px] font-bold tabular-nums ${g.attesa ? 'text-inchiostro/55' : c.testo}`}
             style={labLeft ? { right: `${100 - endPct}%`, textAlign: 'right' } : { left: `${endPct}%`, paddingLeft: 6 }}>
          <span>{fmtData(g.data)}</span>
          {g.ritardo > 0 && !g.attesa && <span className="rounded bg-rose-100 px-1 py-px text-[8.5px] font-bold text-rose-700">era +{g.ritardo}gg</span>}
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

export default function PrevisioneUmana() {
  const [copyCount, setCopyCount] = useState(1)

  const { righe, maxDays, stadio1Count, inLavorazione } = useMemo(() => {
    const inProg = EROG_CLIENTI
      .map((r) => { const s = stimaConsegnaUmanoV2(r); return s ? { r, start: EROG_OGGI, data: s.data, attesa: false, ritardo: s.giorniRitardo } : null })
      .filter((x): x is RigaGantt => x !== null)
      .sort((a, b) => a.data.getTime() - b.data.getTime())
    const ancora = inProg.reduce((m, x) => (x.data > m ? x.data : m), EROG_OGGI)
    const attesa = programmaAttesa(EROG_CLIENTI, ancora, { hitl: false, copyCount, genAgentica: false, caputoAgente: false })
      .map((a): RigaGantt => ({ r: a.r, start: ancora, data: a.data, attesa: true, ritardo: 0 }))
      .sort((a, b) => a.data.getTime() - b.data.getTime())
    const tutte = [...inProg, ...attesa]
    const maxDate = tutte.reduce((m, x) => (x.data > m ? x.data : m), ancora)
    const md = Math.max(1, Math.round((maxDate.getTime() - EROG_OGGI.getTime()) / GIORNO_MS))
    return { righe: tutte, maxDays: md, stadio1Count: attesa.length, inLavorazione: inProg.length }
  }, [copyCount])

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Umano: il processo di oggi</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              {EROG_TOT} clienti, 4 passaggi separati — così come funziona oggi, nessun agente. Ordinati per data di consegna: chi esce prima è in cima.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/previsione-agentica" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">Pagina Human in the loop →</Link>
            <Link href="/amministrazione/quadro-aziendale" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">Quadro Aziendale</Link>
          </div>
        </header>

        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">I 4 passaggi, uno per uno</h3>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Carta>
              <p className="text-[11px] font-bold uppercase text-inchiostro/50">1 · Copy — Carlo</p>
              <p className="font-display mt-1 text-2xl font-bold text-petrolio-scuro">4h</p>
              <p className="mt-1 text-[11px] text-inchiostro/50">scrittura del testo, lavorazione pura</p>
            </Carta>
            <Carta>
              <p className="text-[11px] font-bold uppercase text-inchiostro/50">2 · Slide — Caputo</p>
              <p className="font-display mt-1 text-2xl font-bold text-amber-700">2h</p>
              <p className="mt-1 text-[11px] text-inchiostro/50">crea e inserisce le slide, lavorazione pura</p>
            </Carta>
            <Carta>
              <p className="text-[11px] font-bold uppercase text-inchiostro/50">3 · Revisione — Grippo/Tabita</p>
              <p className="font-display mt-1 text-2xl font-bold text-teal-700">{UMANO_GRIPPO_GG}gg</p>
              <p className="mt-1 text-[11px] text-inchiostro/50">dato reale, code comprese — mediana storica {MEDIANA_STAGE3_STORICO}gg</p>
            </Carta>
            <Carta>
              <p className="text-[11px] font-bold uppercase text-inchiostro/50">4 · Impaginazione — Valentino</p>
              <p className="font-display mt-1 text-2xl font-bold text-indigo-700">{UMANO_VALENTINO_GG}gg</p>
              <p className="mt-1 text-[11px] text-inchiostro/50">dato reale, code comprese — mediana storica {MEDIANA_STAGE4_STORICO}gg</p>
            </Carta>
          </div>
          <p className="mt-2 rounded-xl border border-linea bg-carta p-3 text-xs text-inchiostro/60">
            <b className="text-inchiostro">Da dove vengono questi numeri.</b> Copy (4h) e Caputo (2h) sono lavorazione pura, non includono l&apos;attesa in coda. Grippo/Tabita e Valentino sono il dato reale dal foglio &quot;CONSULENZE FRANK - Report in lavorazione&quot; (317 righe): colonne INVIO A GRIPPO → RICEVUTO DA GRIPPO (mediana ultimi 90gg, n=73) e INVIO A GRAFICI → RICEVUTO DA GRAFICI (mediana, n=69). Giorni lavorativi reali, code comprese.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Carta>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-petrolio" />Chi scrive i nuovi (stadio 1)</p>
            <div className="space-y-1.5">
              <Opzione attiva={copyCount === 1} label="Solo Carlo" tinta="bg-petrolio/10 text-petrolio-scuro" onClick={() => setCopyCount(1)} />
              <Opzione attiva={copyCount === 2} label="Carlo + Paolo" tinta="bg-petrolio/10 text-petrolio-scuro" onClick={() => setCopyCount(2)} />
            </div>
          </Carta>
          <div className="sm:col-span-3 flex items-center rounded-2xl border border-linea bg-carta p-4 text-[11px] leading-relaxed text-inchiostro/55">
            {inLavorazione} clienti sono già in lavorazione con una data stimabile; i {stadio1Count} in stadio 1 (documenti mancanti) partono in coda, dopo l&apos;ultimo consegnato, e vengono scritti in serie — per questo la scelta di quante persone scrivono sposta solo la loro parte.
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-display text-xl font-bold tracking-tight text-inchiostro">Quando consegniamo, tutto umano</h3>
          <p className="text-[11px] text-inchiostro/45">In alto chi esce prima. Le barre grigie in fondo sono i clienti in attesa dei documenti: partono quando si libera la coda.</p>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
            <div className="min-w-[760px]">
              <Assi maxDays={maxDays} />
              {righe.map((g, i) => <RigaBarra key={g.r.nome + g.r.azienda + i} g={g} maxDays={maxDays} zebra={i % 2 === 0} />)}
            </div>
          </div>
        </div>

        <Carta className="mt-6 bg-petrolio/10 text-xs leading-relaxed text-petrolio-scuro/80">
          <p className="text-xs font-semibold uppercase text-petrolio-scuro">E se un agente facesse il resto?</p>
          <p className="mt-1">Stessi {EROG_TOT} clienti, ma con un agente che genera e un umano che controlla invece di rifare da zero.</p>
          <Link href="/amministrazione/previsione-agentica" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-petrolio px-4 py-2 text-xs font-semibold text-white hover:opacity-90">Vedi human in the loop →</Link>
        </Carta>
      </div>
    </div>
  )
}
