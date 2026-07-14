'use client'

// ─── Previsione Agentica ───
// Un'unica lista di 145 clienti (87 in erogazione + 58 futuri in coda) e due
// soli Gantt: "Umano" (tutto come oggi) e "Human in the loop" (i passaggi non
// ancora iniziati li fa l'agente, ma uno specialista rivede sempre il suo
// lavoro — Grippo il testo, Valentino l'impaginazione, Caputo le slide per i
// futuri). Le leve si scelgono PRIMA di vedere i gantt, come nel calcolatore
// Futuri. Il passaggio IN CORSO di un cliente in erogazione non si tocca mai:
// non si toglie lavoro già iniziato.

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  AGENTE_IMPAG, AGENTE_SLIDE, AGENTE_TESTO, CAPUTO_MANUALE, EROG_CLIENTI, EROG_OGGI, EROG_STADI,
  EROG_TOT, GIORNO_MS, N_FUTURI, REV_SLIDE, REVI, REVT, RigaErog, RigaFutura, StadioErog,
  fmtData, futuriHITL, futuriUmano, stimaConsegna, stimaConsegnaAgentica,
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

const STADIO_COLORE: Record<StadioErog, { barra: string; testo: string }> = {
  1: { barra: 'bg-rose-500', testo: 'text-rose-700' },
  2: { barra: 'bg-petrolio', testo: 'text-petrolio-scuro' },
  3: { barra: 'bg-teal-600', testo: 'text-teal-700' },
  4: { barra: 'bg-indigo-600', testo: 'text-indigo-700' },
}
const FUTURO_COLORE = { barra: 'bg-violet-500', testo: 'text-violet-700' }

type RigaGantt = { titolo: string; sottotitolo: string; data: Date; overdue: boolean; bg: string; testo: string; tag?: string }

/** Riga del Gantt: nome+contesto a sinistra, una barra da oggi alla data a destra. */
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
        <div className={`absolute top-1/2 h-[11px] -translate-y-1/2 rounded-full ${r.overdue ? 'bg-rose-500' : r.bg}`}
             style={{ left: 0, width: `${endPct}%` }} />
        <div className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded bg-carta px-1 text-[10.5px] font-bold tabular-nums ${r.overdue ? 'text-rose-700' : r.testo}`}
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

/** Un gantt completo: clienti in erogazione (ordinati per data), poi i futuri in coda sotto. */
function GanttSezione({ titolo, sub, erogazione, futuri }: {
  titolo: string; sub: string
  erogazione: { r: RigaErog; data: Date; overdue: boolean }[]
  futuri: RigaFutura[]
}) {
  const righeErog: RigaGantt[] = erogazione.map(({ r, data, overdue }) => ({
    titolo: r.nome, sottotitolo: `${r.azienda} · ${EROG_STADI[r.stadio - 1].label}`, data, overdue,
    bg: STADIO_COLORE[r.stadio].barra, testo: STADIO_COLORE[r.stadio].testo,
    tag: r.daVerificare ? 'da verificare' : r.dataApprox ? 'data stimata' : undefined,
  }))
  const righeFut: RigaGantt[] = [...futuri]
    .sort((a, b) => a.data.getTime() - b.data.getTime())
    .map((f) => ({
      titolo: f.nome, sottotitolo: `${f.azienda} · nuovo`, data: f.data, overdue: false,
      bg: FUTURO_COLORE.barra, testo: FUTURO_COLORE.testo, tag: f.rifare ? 'rifare' : undefined,
    }))
  const maxDate = [...righeErog, ...righeFut].reduce((m, x) => (x.data > m ? x.data : m), EROG_OGGI)
  const maxDays = Math.max(1, Math.round((maxDate.getTime() - EROG_OGGI.getTime()) / GIORNO_MS))

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="font-display text-xl font-bold tracking-tight text-inchiostro">{titolo}</h3>
        <p className="text-[11px] text-inchiostro/45">{sub}</p>
      </div>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
        <div className="min-w-[760px]">
          <Assi maxDays={maxDays} />
          <div className="border-b border-linea bg-inchiostro/[0.03] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-inchiostro/50">
            In erogazione ({righeErog.length})
          </div>
          {righeErog.map((r, i) => <RigaBarra key={r.titolo + i} r={r} maxDays={maxDays} zebra={i % 2 === 0} />)}
          <div className="border-b border-t border-linea bg-violet-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-violet-700">
            {N_FUTURI} progetti futuri, in coda
          </div>
          {righeFut.map((r, i) => <RigaBarra key={r.titolo + i} r={r} maxDays={maxDays} zebra={i % 2 === 0} />)}
        </div>
      </div>
    </div>
  )
}

export default function PrevisioneAgentica() {
  const [copyCount, setCopyCount] = useState(1)
  const [grippoOn, setGrippoOn] = useState(false)
  const [valentinoOn, setValentinoOn] = useState(false)
  const [caputoAgenteOn, setCaputoAgenteOn] = useState(false)
  const [fullAiOn, setFullAiOn] = useState(false)

  const erogUmano = useMemo(() => EROG_CLIENTI
    .map((r) => { const s = stimaConsegna(r); return s ? { r, data: s.data, overdue: s.giorniRitardo > 0 } : null })
    .filter((x): x is { r: RigaErog; data: Date; overdue: boolean } => x !== null)
    .sort((a, b) => a.data.getTime() - b.data.getTime()), [])

  const erogHITL = useMemo(() => EROG_CLIENTI
    .map((r) => {
      const a = stimaConsegnaAgentica(r, grippoOn, valentinoOn)
      return a?.tipo === 'data' ? { r, data: a.data, overdue: false, risparmio: Math.max(a.giorniRisparmiati, 0) } : null
    })
    .filter((x): x is { r: RigaErog; data: Date; overdue: boolean; risparmio: number } => x !== null)
    .sort((a, b) => a.data.getTime() - b.data.getTime()), [grippoOn, valentinoOn])

  const futUmano = useMemo(() => futuriUmano(copyCount), [copyCount])
  const futHITL = useMemo(() => futuriHITL(copyCount, grippoOn, valentinoOn, caputoAgenteOn, fullAiOn),
    [copyCount, grippoOn, valentinoOn, caputoAgenteOn, fullAiOn])

  const totaleRisparmiato = erogHITL.reduce((s, x) => s + x.risparmio, 0)
  const mediaRisparmiata = erogHITL.length ? Math.round(totaleRisparmiato / erogHITL.length) : 0
  const stadio1Count = EROG_CLIENTI.filter((r) => r.stadio === 1).length
  const ultimoFuturoUmano = [...futUmano.righe].sort((a, b) => b.data.getTime() - a.data.getTime())[0]
  const ultimoFuturoHITL = [...futHITL.righe].sort((a, b) => b.data.getTime() - a.data.getTime())[0]

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Previsione: umano vs human-in-the-loop</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              {EROG_TOT} clienti in erogazione + {N_FUTURI} progetti futuri, un&apos;unica coda. Scegli le leve, poi guarda i due gantt: cosa succede se resta tutto umano, e cosa cambia se un agente lavora e uno specialista rivede sempre il suo output.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/quadro-aziendale" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Quadro Aziendale
            </Link>
          </div>
        </header>

        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Le leve — scegli prima di vedere i gantt</h3>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-5">
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-petrolio" />Chi scrive — copy</p>
              <div className="space-y-1.5">
                <Opzione attiva={copyCount === 1} label="Solo Carlo" tinta="bg-petrolio/10 text-petrolio-scuro" onClick={() => setCopyCount(1)} />
                <Opzione attiva={copyCount === 2} label="Carlo + Paolo" tinta="bg-petrolio/10 text-petrolio-scuro" onClick={() => setCopyCount(2)} />
              </div>
            </Carta>
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-amber-500" />Slide — Caputo</p>
              <div className="space-y-1.5">
                <Opzione attiva={!caputoAgenteOn} label="Manuale — 2h" tinta="bg-amber-50 text-amber-700" onClick={() => setCaputoAgenteOn(false)} />
                <Opzione attiva={caputoAgenteOn} label="Assistito da agente" tinta="bg-amber-50 text-amber-700" onClick={() => setCaputoAgenteOn(true)} />
              </div>
            </Carta>
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-teal-600" />Revisore testo — Grippo</p>
              <div className="space-y-1.5">
                <Opzione attiva={!grippoOn} label="Off — resta al copy" tinta="bg-teal-50 text-teal-700" onClick={() => setGrippoOn(false)} />
                <Opzione attiva={grippoOn} label="On — assorbe la revisione" tinta="bg-teal-50 text-teal-700" onClick={() => setGrippoOn(true)} />
              </div>
            </Carta>
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-indigo-600" />Impaginazione — Valentino</p>
              <div className="space-y-1.5">
                <Opzione attiva={!valentinoOn} label="Off — resta al copy" tinta="bg-indigo-50 text-indigo-700" onClick={() => setValentinoOn(false)} />
                <Opzione attiva={valentinoOn} label="On — assorbe l'impaginazione" tinta="bg-indigo-50 text-indigo-700" onClick={() => setValentinoOn(true)} />
              </div>
            </Carta>
            <Carta>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-inchiostro/50"><span className="h-2 w-2 rounded-full bg-violet-600" />Generazione — Full AI</p>
              <div className="space-y-1.5">
                <Opzione attiva={!fullAiOn} label="Off — scrive il copy" tinta="bg-violet-50 text-violet-700" onClick={() => setFullAiOn(false)} />
                <Opzione attiva={fullAiOn} label="On — genera l'AI" tinta="bg-violet-50 text-violet-700" onClick={() => setFullAiOn(true)} />
              </div>
            </Carta>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-inchiostro/45">
            Copy e Full AI influenzano solo la coda dei {N_FUTURI} futuri (chi è già in erogazione ha già scritto). Caputo, invece, conta solo per i futuri: chi è già in stadio 2 ha il suo passaggio già compreso, indistinguibile, nella stima di quello stadio.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Statistica label={`${EROG_TOT + N_FUTURI} clienti totali`} valore={`-${mediaRisparmiata}gg`} sub="risparmio medio in erogazione, human-in-the-loop vs umano" tinta="text-petrolio-scuro" grande />
          <Statistica label="Passaggio in corso" valore="resta umano" sub="nessun lavoro tolto a chi lo sta già facendo" />
          <Statistica label="Stadio 1 (informazioni mancanti)" valore={String(stadio1Count)} sub="non stimabile finché non arrivano le info" tinta="text-rose-700" />
          <Statistica label={`Ultimo dei ${N_FUTURI} futuri`} valore={ultimoFuturoHITL ? fmtData(ultimoFuturoHITL.data) : '—'} sub={ultimoFuturoUmano ? `umano: ${fmtData(ultimoFuturoUmano.data)}` : ''} tinta="text-violet-700" />
        </div>

        <div className="mt-6 space-y-8">
          <GanttSezione
            titolo="Gantt 1 — Tutto umano"
            sub="nessun agente da nessuna parte: dati reali per l'erogazione, stessa coda di oggi per i futuri"
            erogazione={erogUmano}
            futuri={futUmano.righe}
          />
          <GanttSezione
            titolo="Gantt 2 — Human in the loop"
            sub="l'agente lavora dal passaggio successivo a quello in corso, uno specialista rivede sempre il suo output"
            erogazione={erogHITL}
            futuri={futHITL.righe}
          />
        </div>

        <Carta className="mt-6 text-xs leading-relaxed text-inchiostro/65">
          <p><b className="text-inchiostro">Il vincolo di partenza.</b> Chi sta scrivendo, revisionando o impaginando un report oggi lo finisce lui — non ha senso interrompere un lavoro a metà per darlo a un agente. Il gantt &quot;human in the loop&quot; sostituisce solo i passaggi che la persona in corso <b className="text-inchiostro">non ha ancora iniziato</b>: l&apos;agente genera la bozza, lo specialista (Grippo per il testo, Valentino per l&apos;impaginazione, Caputo per le slide dei futuri) la rivede invece di costruirla da zero.</p>
          <p className="mt-2">Per i {stadio1Count} clienti ancora in stadio 1 non c&apos;è una data di partenza (dipende da quando il cliente manda i documenti, non dal team): restano esclusi da entrambi i gantt finché non arrivano le informazioni.</p>
          <p className="mt-2"><b className="text-inchiostro">I {N_FUTURI} progetti futuri</b> vengono aggiunti in coda dopo l&apos;erogazione: prima Carlo (o Carlo+Paolo) li scrive nell&apos;ordine della schedulazione, poi attraversano slide→revisione→impaginazione — manuali nel gantt 1, assistiti secondo le leve scelte nel gantt 2. Non essendo ancora iniziati, per loro non c&apos;è nessun lavoro in corso da proteggere: possono partire assistiti fin dal primo passaggio.</p>
        </Carta>
      </div>
    </div>
  )
}
