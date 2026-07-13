'use client'

// ─── Previsione Agentica ───
// Non tocchiamo il lavoro di chi lo sta già facendo: il passaggio in corso
// resta alla persona (Carlo/Francesco/Tabita.../Grippo/Valentino), solo i
// passaggi SUCCESSIVI a quello in cui si trova oggi ogni cliente li fa
// l'agente. Confronto: "resta tutto umano" vs "da qui in poi, agente".

import Link from 'next/link'
import {
  EROG_CLIENTI, EROG_OGGI, EROG_STADI, EROG_TOT, GIORNI_AGENTE_RESTANTI, GIORNO_MS, RigaErog,
  STIMA_LARGA_STAGE2, STIMA_LARGA_STAGE3, STIMA_LARGA_STAGE4, StadioErog,
  fmtData, stimaConsegna, stimaConsegnaAgentica,
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

const STADIO_COLORE: Record<StadioErog, { testo: string; bg: string }> = {
  1: { testo: 'text-rose-700', bg: 'bg-rose-50' },
  2: { testo: 'text-petrolio-scuro', bg: 'bg-petrolio/10' },
  3: { testo: 'text-teal-700', bg: 'bg-teal-50' },
  4: { testo: 'text-indigo-700', bg: 'bg-indigo-50' },
}

function RigaConfronto({ r }: { r: RigaErog }) {
  const baseline = stimaConsegna(r)
  const agentica = stimaConsegnaAgentica(r)
  return (
    <div className="grid items-center gap-3 border-b border-linea/70 px-3 py-2.5 last:border-b-0 hover:bg-inchiostro/[0.02]"
         style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr 1fr 130px` }}>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-inchiostro">{r.nome}</p>
        <p className="truncate text-[11px] text-inchiostro/45">{r.azienda} · {r.tutor}</p>
      </div>
      <div className="text-[11px] text-inchiostro/70">
        {baseline ? (
          <>resta umano: <b className="text-inchiostro">{fmtData(baseline.data)}</b></>
        ) : (
          <span className="text-inchiostro/40">non stimabile finché non arrivano le informazioni</span>
        )}
      </div>
      <div className="text-[11px]">
        {agentica?.tipo === 'data' ? (
          <span className="text-petrolio-scuro">agente da qui in poi: <b>{fmtData(agentica.data)}</b></span>
        ) : agentica?.tipo === 'condizionale' ? (
          <span className="text-petrolio-scuro">una volta ricevute le info: <b>+{agentica.giorniDopoInfo}gg</b> con agente pieno</span>
        ) : (
          <span className="text-inchiostro/40">—</span>
        )}
      </div>
      <div className="text-right">
        {agentica?.tipo === 'data' && agentica.giorniRisparmiati > 0 ? (
          <span className="rounded-full bg-petrolio px-2 py-0.5 text-[11px] font-bold text-white">-{agentica.giorniRisparmiati}gg</span>
        ) : (
          <span className="text-[11px] text-inchiostro/30">—</span>
        )}
      </div>
    </div>
  )
}

/** Asse a calendario condiviso dal Gantt di confronto. */
function AssiConfronto({ maxDate }: { maxDate: Date }) {
  const totalDays = Math.max(1, Math.round((maxDate.getTime() - EROG_OGGI.getTime()) / GIORNO_MS))
  const n = Math.min(6, Math.max(1, totalDays))
  const seen = new Set<number>()
  const tacche: { pct: number; label: string }[] = []
  for (let i = 0; i <= n; i++) {
    const d = Math.max(0, Math.round((totalDays * i) / n))
    if (seen.has(d)) continue
    seen.add(d)
    tacche.push({ pct: (d / totalDays) * 100, label: fmtData(new Date(EROG_OGGI.getTime() + d * GIORNO_MS)) })
  }
  return (
    <div className="grid border-b border-linea bg-inchiostro/[0.03]" style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
      <div className="flex items-end border-r border-linea px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/40">
        Cliente
      </div>
      <div className="relative h-8">
        <span className="absolute bottom-1.5 left-0 text-[10px] font-bold text-petrolio-scuro">oggi</span>
        {tacche.map((t, i) => (
          <span key={i} className="absolute bottom-1.5 -translate-x-1/2 text-[10px] text-inchiostro/45"
                style={{ left: `${t.pct}%` }}>{t.label}</span>
        ))}
      </div>
    </div>
  )
}

/** Riga a due barre sovrapposte: sopra "resta umano" (tenue, lunga — o rossa se già in ritardo), sotto "agente da qui in poi" (piena, corta). */
function RigaBarraDoppia({ r, humanPct, humanData, humanOverdue, agentPct, agentData, zebra }: {
  r: RigaErog; humanPct: number; humanData: Date; humanOverdue: boolean; agentPct: number; agentData: Date; zebra: boolean
}) {
  return (
    <div className={`grid items-center gap-3 border-b border-linea/70 last:border-b-0 ${zebra ? 'bg-inchiostro/[0.02]' : ''}`}
         style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
      <div className="border-r border-linea px-3 py-2">
        <p className="truncate text-[12.5px] font-bold text-inchiostro">{r.nome}</p>
        <p className="truncate text-[10.5px] text-inchiostro/45">{r.azienda} · {EROG_STADI[r.stadio - 1].label}</p>
      </div>
      <div className="relative h-11">
        <div className={`absolute top-[28%] h-[7px] -translate-y-1/2 rounded-full ${humanOverdue ? 'bg-rose-400' : 'bg-inchiostro/15'}`} style={{ left: 0, width: `${Math.max(humanPct, 1.2)}%` }} />
        <span className={`absolute top-[28%] -translate-y-1/2 whitespace-nowrap text-[9.5px] font-semibold ${humanOverdue ? 'text-rose-700' : 'text-inchiostro/45'}`}
              style={{ left: `${Math.max(humanPct, 1.2)}%`, paddingLeft: 6 }}>{humanOverdue ? 'già in ritardo' : fmtData(humanData)}</span>
        <div className="absolute top-[74%] h-[7px] -translate-y-1/2 rounded-full bg-petrolio" style={{ left: 0, width: `${Math.max(agentPct, 1.2)}%` }} />
        <span className="absolute top-[74%] -translate-y-1/2 whitespace-nowrap text-[9.5px] font-bold text-petrolio-scuro"
              style={{ left: `${Math.max(agentPct, 1.2)}%`, paddingLeft: 6 }}>{fmtData(agentData)}</span>
      </div>
    </div>
  )
}

type ConfrontoRiga = { r: RigaErog; humanData: Date; humanOverdue: boolean; agentData: Date; risparmio: number }

/** Gantt di confronto: per ogni cliente, la barra "resta umano" (tenue) contro "agente da qui in poi" (piena) — stesso asse. */
function GanttConfronto() {
  const righe: ConfrontoRiga[] = EROG_CLIENTI
    .map((r) => {
      const baseline = stimaConsegna(r)
      const agentica = stimaConsegnaAgentica(r)
      if (!baseline || agentica?.tipo !== 'data') return null
      return { r, humanData: baseline.data, humanOverdue: baseline.giorniRitardo > 0, agentData: agentica.data, risparmio: Math.max(agentica.giorniRisparmiati, 0) }
    })
    .filter((x): x is ConfrontoRiga => x !== null)
    .sort((a, b) => a.humanData.getTime() - b.humanData.getTime())

  const maxDate = righe.reduce((m, x) => (x.humanData > m ? x.humanData : m), EROG_OGGI)
  const totalDays = Math.max(1, Math.round((maxDate.getTime() - EROG_OGGI.getTime()) / GIORNO_MS))
  const pct = (d: Date) => Math.max((Math.round((d.getTime() - EROG_OGGI.getTime()) / GIORNO_MS) / totalDays) * 100, 0)

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-xl font-bold tracking-tight text-inchiostro">Il vantaggio, in un colpo d&apos;occhio</h3>
        <div className="ml-auto flex items-center gap-4 text-[11px] text-inchiostro/55">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-inchiostro/15" />resta umano</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-rose-400" />resta umano, già in ritardo</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-petrolio" />agente da qui in poi</span>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-inchiostro/45">{righe.length} clienti con una data stimabile su {EROG_TOT}, dal più vicino al più lontano</p>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
        <div className="min-w-[760px]">
          <AssiConfronto maxDate={maxDate} />
          {righe.map((x, i) => (
            <RigaBarraDoppia key={x.r.nome + x.r.azienda + i} r={x.r} zebra={i % 2 === 0}
              humanPct={x.humanOverdue ? 1.2 : pct(x.humanData)} humanData={x.humanData} humanOverdue={x.humanOverdue}
              agentPct={pct(x.agentData)} agentData={x.agentData} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PrevisioneAgentica() {
  const conData = EROG_CLIENTI
    .map((r) => ({ r, a: stimaConsegnaAgentica(r) }))
    .filter((x): x is { r: RigaErog; a: { tipo: 'data'; data: Date; giorniRisparmiati: number } } => x.a?.tipo === 'data')
  const totaleRisparmiato = conData.reduce((s, x) => s + Math.max(x.a.giorniRisparmiati, 0), 0)
  const mediaRisparmiata = conData.length ? Math.round(totaleRisparmiato / conData.length) : 0
  const stadio1Count = EROG_CLIENTI.filter((r) => r.stadio === 1).length

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Previsione agentica: da qui in poi</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              Non si tocca il lavoro di chi lo sta già facendo. Il passaggio in cui si trova oggi ogni cliente resta alla
              persona; solo i passaggi <b>successivi</b> a quello li fa l&apos;agente.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/quadro-aziendale" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Quadro Aziendale
            </Link>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Statistica label={`${EROG_TOT} clienti attivi`} valore={`-${mediaRisparmiata}gg`} sub="risparmio medio, sui clienti con una data stimabile" tinta="text-petrolio-scuro" grande />
          <Statistica label="Passaggio in corso" valore="resta umano" sub="nessun lavoro tolto a chi lo sta già facendo" />
          <Statistica label="Passaggi successivi" valore={`+${GIORNI_AGENTE_RESTANTI}gg`} sub="revisione + grafica + impaginazione, tutte agente" />
          <Statistica label="Stadio 1 (informazioni mancanti)" valore={String(stadio1Count)} sub="una volta arrivate le info: tutto agente, +1gg" tinta="text-rose-700" />
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Come funziona il confronto</h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <Carta>
              <p className="text-[11px] font-bold uppercase text-inchiostro/50">2 · Con copy o Caputo oggi</p>
              <p className="mt-1 text-[12.5px] text-inchiostro/70">Il copy finisce di scriverlo e Caputo monta le slide (stima larga, tempo combinato: {STIMA_LARGA_STAGE2}gg). Da lì, Grippo e Valentino sono agente: +{GIORNI_AGENTE_RESTANTI}gg.</p>
            </Carta>
            <Carta>
              <p className="text-[11px] font-bold uppercase text-inchiostro/50">3 · In revisione oggi</p>
              <p className="mt-1 text-[12.5px] text-inchiostro/70">Grippo finisce la revisione (stima larga: {STIMA_LARGA_STAGE3}gg). Da lì, la grafica è agente: +{GIORNI_AGENTE_RESTANTI}gg.</p>
            </Carta>
            <Carta>
              <p className="text-[11px] font-bold uppercase text-inchiostro/50">4 · In grafica oggi</p>
              <p className="mt-1 text-[12.5px] text-inchiostro/70">Valentino finisce la grafica (stima larga: {STIMA_LARGA_STAGE4}gg) — è già l&apos;ultimo passaggio, l&apos;agente non ha nulla da fare dopo.</p>
            </Carta>
          </div>
        </div>

        <GanttConfronto />

        <div className="mt-6">
          <h3 className="font-display text-xl font-bold tracking-tight text-inchiostro">Cliente per cliente</h3>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
            <div className="min-w-[860px]">
              <div className="grid items-center gap-3 border-b border-linea bg-inchiostro/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/40"
                   style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr 1fr 130px` }}>
                <div>Cliente · azienda · tutor</div>
                <div>Se resta tutto umano</div>
                <div>Con agente da qui in poi</div>
                <div className="text-right">Risparmio</div>
              </div>
              {([4, 3, 2, 1] as StadioErog[]).map((stadioNum) => {
                const righe = EROG_CLIENTI.filter((r) => r.stadio === stadioNum)
                const info = EROG_STADI[stadioNum - 1]
                return (
                  <div key={stadioNum}>
                    <div className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${STADIO_COLORE[stadioNum].bg} ${STADIO_COLORE[stadioNum].testo}`}>
                      {stadioNum} · {info.label} ({righe.length})
                    </div>
                    {righe.map((r, i) => <RigaConfronto key={r.nome + r.azienda + i} r={r} />)}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <Carta className="mt-6 text-xs leading-relaxed text-inchiostro/65">
          <p><b className="text-inchiostro">Il vincolo di partenza.</b> Chi sta scrivendo, revisionando o graficando un report oggi lo finisce lui — non ha senso interrompere un lavoro a metà per darlo a un agente. La previsione &quot;agente da qui in poi&quot; sostituisce solo i passaggi che questa persona <b className="text-inchiostro">non ha ancora iniziato</b>.</p>
          <p className="mt-2">Le stime del passaggio umano in corso sono le stesse &quot;a maglie larghe&quot; del Quadro Aziendale (75° percentile degli ultimi 90 giorni: {STIMA_LARGA_STAGE2}/{STIMA_LARGA_STAGE3}/{STIMA_LARGA_STAGE4} giorni lavorativi per copy+Caputo/Grippo/grafica). Il tempo agente per tutto il resto — revisione testo, creazione grafici, impaginazione — è sempre sotto l&apos;ora: arrotondato a {GIORNI_AGENTE_RESTANTI} giorno lavorativo per prudenza, non perché ci metta davvero un giorno intero.</p>
          <p className="mt-2"><b className="text-inchiostro">Nota su Caputo.</b> Tra la scrittura del copy e la revisione Grippo c&apos;è un passaggio reale — Alessio Caputo crea e monta le slide — ma il foglio maestro non lo traccia con una data propria (zero menzioni in 317 righe), quindi è compreso nello stadio 2 e non ha una stima agentica separata al suo interno.</p>
          <p className="mt-2">Per i {stadio1Count} clienti ancora in stadio 1 non c&apos;è una data di partenza (dipende da quando il cliente manda i documenti, non dal team) — ma una volta arrivate le informazioni, non c&apos;è nessun lavoro umano in corso da proteggere: possono essere pienamente agentizzati da subito, non solo dal passaggio successivo.</p>
        </Carta>
      </div>
    </div>
  )
}
