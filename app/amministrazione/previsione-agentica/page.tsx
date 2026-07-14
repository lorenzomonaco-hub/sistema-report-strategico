'use client'

// ─── Human in the loop ───
// Gli 87 clienti reali in erogazione (non i 58 futuri — quelli restano nel
// calcolatore Futuri). L'agente genera, un umano controlla sempre: il
// controllo dura sempre la stessa ora/mezz'ora, la leva sceglie solo CHI lo fa
// (Grippo o Carlo per il testo, Valentino o Carlo per l'impaginazione, Caputo
// manuale o assistito per le slide). Il passaggio IN CORSO di ogni cliente non
// si tocca mai: non si toglie lavoro già iniziato.

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  EROG_CLIENTI, EROG_OGGI, EROG_TOT, GIORNO_MS, RigaErog, StadioErog,
  fmtData, occupazioneHITL, stimaConsegnaHITL, stimaConsegnaUmanoV2,
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
    <button
      onClick={onClick}
      className={`w-full rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
        attiva ? `border-transparent font-bold ${tinta}` : 'border-linea text-inchiostro/70 hover:border-inchiostro/20'
      }`}
    >
      {label}
    </button>
  )
}

const STADIO_INFO: Record<StadioErog, { label: string; barra: string; testo: string }> = {
  1: { label: 'Informazioni mancanti', barra: 'bg-rose-500', testo: 'text-rose-700' },
  2: { label: 'Copy e Caputo', barra: 'bg-petrolio', testo: 'text-petrolio-scuro' },
  3: { label: 'Revisione Grippo/Tabita', barra: 'bg-teal-600', testo: 'text-teal-700' },
  4: { label: 'Impaginazione Valentino', barra: 'bg-indigo-600', testo: 'text-indigo-700' },
}

type RigaGantt = { titolo: string; sottotitolo: string; data: Date; overdue: boolean; tag?: string }

function RigaBarra({ r, maxDays, zebra }: { r: RigaGantt; maxDays: number; zebra: boolean }) {
  const giorni = Math.round((r.data.getTime() - EROG_OGGI.getTime()) / GIORNO_MS)
  const endPct = r.overdue ? 1.5 : Math.max((giorni / maxDays) * 100, 1.5)
  const labLeft = endPct > (r.tag ? 48 : 74)
  return (
    <div className={`grid border-b border-linea/70 last:border-b-0 ${zebra ? 'bg-inchiostro/[0.02]' : ''}`}
         style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
      <div className="border-r border-linea px-3 py-2">
        <p className="truncate text-[12.5px] font-bold text-inchiostro">{r.titolo}</p>
        <p className="truncate text-[10.5px] text-inchiostro/45">{r.sottotitolo}</p>
      </div>
      <div className="relative h-9">
        <div className={`absolute top-1/2 h-[11px] -translate-y-1/2 rounded-full ${r.overdue ? 'bg-rose-500' : 'bg-petrolio'}`}
             style={{ left: 0, width: `${endPct}%` }} />
        <div className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded bg-carta px-1 text-[10.5px] font-bold tabular-nums ${r.overdue ? 'text-rose-700' : 'text-petrolio-scuro'}`}
             style={labLeft ? { right: `${100 - endPct}%`, textAlign: 'right' } : { left: `${endPct}%`, paddingLeft: 6 }}>
          <span>{r.overdue ? 'già in ritardo' : fmtData(r.data)}</span>
          {r.tag && <span className="rounded bg-amber-100 px-1 py-px text-[8.5px] font-bold text-amber-800">{r.tag}</span>}
        </div>
      </div>
    </div>
  )
}

function Assi({ maxDays }: { maxDays: number }) {
  const n = Math.min(6, Math.max(1, maxDays))
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
      <div className="flex items-end border-r border-linea px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/40">
        Cliente
      </div>
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
  const [grippoOn, setGrippoOn] = useState(false)
  const [valentinoOn, setValentinoOn] = useState(false)
  const [caputoAgenteOn, setCaputoAgenteOn] = useState(false)

  const righe = useMemo(() => EROG_CLIENTI
    .map((r) => {
      const h = stimaConsegnaHITL(r)
      if (!h || h.tipo === 'condizionale') return null
      return { r, data: h.data, risparmio: Math.max(h.giorniRisparmiati, 0) }
    })
    .filter((x): x is { r: RigaErog; data: Date; risparmio: number } => x !== null)
    .sort((a, b) => a.data.getTime() - b.data.getTime()), [])

  const occupazione = useMemo(() => occupazioneHITL(EROG_CLIENTI, caputoAgenteOn), [caputoAgenteOn])

  const totaleRisparmiato = righe.reduce((s, x) => s + x.risparmio, 0)
  const mediaRisparmiata = righe.length ? Math.round(totaleRisparmiato / righe.length) : 0
  const stadio1Count = EROG_CLIENTI.filter((r) => r.stadio === 1).length

  const righeGantt: RigaGantt[] = righe.map(({ r, data }) => ({
    titolo: r.nome, sottotitolo: `${r.azienda} · ${STADIO_INFO[r.stadio].label}`, data, overdue: data < EROG_OGGI,
    tag: r.daVerificare ? 'da verificare' : r.dataApprox ? 'data stimata' : undefined,
  }))
  const maxDate = righeGantt.reduce((m, x) => (x.data > m ? x.data : m), EROG_OGGI)
  const maxDays = Math.max(1, Math.round((maxDate.getTime() - EROG_OGGI.getTime()) / GIORNO_MS))

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Human in the loop: chi controlla l&apos;agente</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              Gli stessi {EROG_TOT} clienti in erogazione della pagina Umano. L&apos;agente genera, un umano controlla sempre: il controllo dura uguale, la leva sceglie solo chi lo fa.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/previsione-umana" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Pagina Umano
            </Link>
            <Link href="/amministrazione/quadro-aziendale" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              Quadro Aziendale
            </Link>
          </div>
        </header>

        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Le variabili — chi fa il controllo</h3>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-amber-500" />Slide — Caputo</p>
              <div className="space-y-1.5">
                <Opzione attiva={!caputoAgenteOn} label="Manuale — 2h" tinta="bg-amber-50 text-amber-700" onClick={() => setCaputoAgenteOn(false)} />
                <Opzione attiva={caputoAgenteOn} label="Assistito da agente — 25min" tinta="bg-amber-50 text-amber-700" onClick={() => setCaputoAgenteOn(true)} />
              </div>
            </Carta>
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-teal-600" />Controllo testo — chi lo fa</p>
              <div className="space-y-1.5">
                <Opzione attiva={!grippoOn} label="Carlo controlla" tinta="bg-teal-50 text-teal-700" onClick={() => setGrippoOn(false)} />
                <Opzione attiva={grippoOn} label="Grippo/Tabita controlla" tinta="bg-teal-50 text-teal-700" onClick={() => setGrippoOn(true)} />
              </div>
            </Carta>
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-indigo-600" />Controllo impaginazione — chi lo fa</p>
              <div className="space-y-1.5">
                <Opzione attiva={!valentinoOn} label="Carlo controlla" tinta="bg-indigo-50 text-indigo-700" onClick={() => setValentinoOn(false)} />
                <Opzione attiva={valentinoOn} label="Valentino controlla" tinta="bg-indigo-50 text-indigo-700" onClick={() => setValentinoOn(true)} />
              </div>
            </Carta>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-inchiostro/45">
            Il controllo dura sempre lo stesso tempo (35+60min per il testo, 2+30min per l&apos;impaginazione) sia che lo faccia lo specialista sia Carlo: la leva decide solo di chi è il tempo, non quanto ci mette — per questo il gantt sotto non cambia scegliendo chi controlla. Cambia invece l&apos;occupazione di ciascuno, qui sotto.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Statistica label={`${EROG_TOT} clienti attivi`} valore={`-${mediaRisparmiata}gg`} sub="risparmio medio vs la pagina Umano, sui clienti con una data stimabile" tinta="text-petrolio-scuro" grande />
          <Statistica label="Caputo — occupazione" valore={`${occupazione.caputoGg}gg`} sub={caputoAgenteOn ? 'assistito da agente' : 'manuale, 2h a cliente'} tinta="text-amber-700" />
          <Statistica label="Grippo/Tabita — occupazione" valore={`${occupazione.grippoGg}gg`} sub="se assorbe lui tutti i controlli testo" tinta="text-teal-700" />
          <Statistica label="Valentino — occupazione" valore={`${occupazione.valentinoGg}gg`} sub="se assorbe lui tutti i controlli impaginazione" tinta="text-indigo-700" />
        </div>

        <div className="mt-6">
          <h3 className="font-display text-xl font-bold tracking-tight text-inchiostro">Quando consegniamo, human in the loop</h3>
          <p className="text-[11px] text-inchiostro/45">{righe.length} clienti con una data stimabile su {EROG_TOT} — i {stadio1Count} in stadio 1 restano esclusi finché non arrivano le informazioni</p>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
            <div className="min-w-[760px]">
              <Assi maxDays={maxDays} />
              {righeGantt.map((r, i) => <RigaBarra key={r.titolo + i} r={r} maxDays={maxDays} zebra={i % 2 === 0} />)}
            </div>
          </div>
        </div>

        <Carta className="mt-6 text-xs leading-relaxed text-inchiostro/65">
          <p><b className="text-inchiostro">Il vincolo di partenza.</b> Chi sta scrivendo, revisionando o impaginando un report oggi lo finisce lui, alla velocità normale — non ha senso interrompere un lavoro a metà. L&apos;agente sostituisce solo i passaggi <b className="text-inchiostro">non ancora iniziati</b>: genera la bozza, un umano la controlla in 35+60 minuti (testo) o 2+30 minuti (impaginazione) invece di rifare tutto da zero.</p>
          <p className="mt-2"><b className="text-inchiostro">Perché Caputo non cambia le date qui sopra.</b> Chi è oggi in "copy e Caputo" ha quel passaggio già in corso, protetto: la leva Caputo non lo tocca (conta solo per l&apos;occupazione, sopra, come proiezione in avanti). Cambia le date solo per i passaggi successivi al proprio, cioè controllo testo e impaginazione.</p>
          <p className="mt-2">Per i {stadio1Count} clienti ancora in stadio 1 non c&apos;è una data di partenza (dipende da quando il cliente manda i documenti, non dal team).</p>
        </Carta>
      </div>
    </div>
  )
}
