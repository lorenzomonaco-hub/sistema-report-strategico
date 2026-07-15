'use client'

// ─── Consulenze Frank — Gantt ufficiale ───
// Lista unica dei 34 clienti, timeline a calendario scorrevole con linea "oggi"
// centrale (stile del Gantt di /amministrazione). Ogni barra parte dall'ingresso
// reale in pipeline (dati foglio maestro) e arriva alla consegna prevista del
// piano ufficiale; la parte già percorsa è piena, quella futura è tenue. I
// milestone reali dei passaggi già completati (copy, revisione Grippo) sono
// marcati sulla barra. Le date di consegna vengono dal file ufficiale del
// 14/07/2026 (max 2 consegne/giorno lavorativo).

import Link from 'next/link'
import { CONSULENZE_FRANK, FASI_FRANK, FRANK_OGGI, FaseFrank, RigaFrank } from '@/lib/consulenzeFrank'
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

const FASE_COLORE: Record<FaseFrank, { barra: string; pieno: string; testo: string }> = {
  1: { barra: 'bg-rose-500/20', pieno: 'bg-rose-500', testo: 'text-rose-700' },
  2: { barra: 'bg-amber-500/20', pieno: 'bg-amber-500', testo: 'text-amber-700' },
  3: { barra: 'bg-teal-600/20', pieno: 'bg-teal-600', testo: 'text-teal-700' },
  4: { barra: 'bg-orange-500/20', pieno: 'bg-orange-500', testo: 'text-orange-700' },
  5: { barra: 'bg-indigo-600/20', pieno: 'bg-indigo-600', testo: 'text-indigo-700' },
  6: { barra: 'bg-green-600/20', pieno: 'bg-green-600', testo: 'text-green-700' },
}

/** Lo stepper dei 5 passaggi: pieni quelli già completati, acceso quello attuale, vuoti i futuri. */
function Stepper({ fase }: { fase: FaseFrank }) {
  return (
    <div className="mt-1 flex items-center gap-1">
      {([1, 2, 3, 4, 5] as FaseFrank[]).map((n) => {
        const done = n < fase || fase === 6
        const cur = n === fase
        const cls = cur ? FASE_COLORE[fase].pieno : done ? 'bg-green-600/40' : 'bg-inchiostro/[0.08]'
        return <div key={n} className={`h-1.5 flex-1 rounded-full ${cls}`} title={`${n}. ${FASI_FRANK[n].label}`} />
      })}
    </div>
  )
}

function RigaGantt({ r, pct }: { r: RigaFrank; pct: (ms: number) => number }) {
  const c = FASE_COLORE[r.fase]
  const oggiMs = FRANK_OGGI.getTime()
  const consegnaMs = r.consegnaPrevista.getTime()
  const inizioMs = r.entrata ? r.entrata.getTime() : oggiMs
  const sinistra = pct(inizioMs)
  const destra = pct(consegnaMs)
  const larghezza = Math.max(destra - sinistra, 0.6)
  // parte già percorsa: da inizio a oggi (limitata alla barra)
  const oggiPct = Math.min(Math.max(pct(oggiMs), sinistra), destra)
  const pienoW = Math.max(oggiPct - sinistra, 0)

  const milestoneCompletati = [
    r.copyDone ? { ms: r.copyDone.getTime(), label: `Copy completato ${fmtData(r.copyDone)}` } : null,
    r.grippoDone ? { ms: r.grippoDone.getTime(), label: `Revisione Grippo completata ${fmtData(r.grippoDone)}` } : null,
  ].filter((m): m is { ms: number; label: string } => m !== null)

  const testoStorico = [
    r.entrata ? `in pipeline dal ${fmtData(r.entrata)}` : null,
    r.copyDone ? `copy ${fmtData(r.copyDone)}` : null,
    r.grippoDone ? `Grippo ${fmtData(r.grippoDone)}` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="grid border-b border-linea/70 last:border-b-0 hover:bg-inchiostro/[0.025]"
         style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
      <div className="border-r border-linea px-3 py-2.5">
        <div className="flex items-baseline gap-2">
          <span className="font-display truncate text-sm font-bold tracking-tight text-inchiostro">{r.cliente}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.barra} ${c.testo}`}>
            {r.fase === 6 ? 'consegnato' : `${r.fase} · ${FASI_FRANK[r.fase].label}`}
          </span>
        </div>
        <div className="mt-0.5 truncate text-[11px] text-inchiostro/45">{r.owner}</div>
        <Stepper fase={r.fase} />
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[10.5px] text-inchiostro/50">
          {r.fase !== 6 && <span className={`font-semibold ${c.testo}`}>consegna {fmtData(r.consegnaPrevista)}</span>}
          {testoStorico && <span className="text-inchiostro/45">✓ {testoStorico}</span>}
        </div>
      </div>

      <div className="relative h-full min-h-[64px]"
           title={`${r.cliente} — fase ${r.fase}${testoStorico ? '\\n✓ ' + testoStorico : ''}\\nConsegna prevista ${fmtData(r.consegnaPrevista)}`}>
        <div className={`absolute top-1/2 h-4 -translate-y-1/2 rounded-full ${c.barra}`}
             style={{ left: `${sinistra}%`, width: `${larghezza}%` }}>
          <div className={`h-full rounded-full ${c.pieno}`} style={{ width: `${larghezza > 0 ? (pienoW / larghezza) * 100 : 0}%` }} />
        </div>
        {/* milestone reali dei passaggi completati */}
        {milestoneCompletati.map((m, i) => (
          <div key={i} className="absolute top-1/2 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-carta bg-green-700"
               style={{ left: `${pct(m.ms)}%` }} title={m.label} />
        ))}
        {/* consegna prevista */}
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
  const righe = [...CONSULENZE_FRANK].sort((a, b) => a.consegnaPrevista.getTime() - b.consegnaPrevista.getTime())
  const oggiMs = FRANK_OGGI.getTime()

  const inizi = righe.map((r) => (r.entrata ? r.entrata.getTime() : oggiMs))
  const da = Math.min(...inizi, oggiMs) - GIORNO_MS * 4
  const a = Math.max(...righe.map((r) => r.consegnaPrevista.getTime()), oggiMs) + GIORNO_MS * 4
  const ampiezza = Math.max(a - da, GIORNO_MS * 7)
  const pct = (ms: number) => Math.max(0, Math.min(100, ((ms - da) / ampiezza) * 100))

  // settimane e mesi per la griglia
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

  const perFase = ([1, 2, 3, 4, 5, 6] as FaseFrank[]).map((f) => CONSULENZE_FRANK.filter((r) => r.fase === f).length)
  const ultima = righe[righe.length - 1]

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Consulenze Frank — Gantt ufficiale</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              {CONSULENZE_FRANK.length} clienti su un&apos;unica timeline. Ogni barra va dall&apos;ingresso reale in pipeline alla consegna prevista; la parte piena è già stata percorsa, i rombi verdi sono i passaggi già completati. Scorri in orizzontale — la linea arancione è oggi.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/quadro-aziendale" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Quadro Aziendale
            </Link>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Statistica label={`${CONSULENZE_FRANK.length} clienti totali`} valore={fmtData(ultima.consegnaPrevista)} sub="ultima consegna prevista" tinta="text-petrolio-scuro" grande />
          <Statistica label="Copy da scrivere (fase 1)" valore={String(perFase[0])} sub="+ 5 dall'avvocato Jelo (fase 2)" tinta={FASE_COLORE[1].testo} />
          <Statistica label="Dall'agente AI (fasi 3-5)" valore={String(perFase[2] + perFase[3] + perFase[4])} sub="Grippo, Caputo, Valentino" tinta={FASE_COLORE[4].testo} />
          <Statistica label="Consegnati" valore={String(perFase[5])} sub="fase 6" tinta="text-green-700" />
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-bold tracking-tight text-inchiostro">Timeline del progetto</h3>
            <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-inchiostro/55">
              {([1, 2, 3, 4, 5] as FaseFrank[]).map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-4 rounded-full ${FASE_COLORE[f].pieno}`} />{f}. {FASI_FRANK[f].label}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rotate-45 bg-green-700" />passaggio completato</span>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
            <div style={{ minWidth: MIN_W }}>
              {/* intestazione: mesi + settimane + oggi */}
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

              {/* corpo: griglia + linea oggi dietro le righe */}
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

                {righe.map((r, i) => <RigaGantt key={r.cliente + i} r={r} pct={pct} />)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Note per cliente</h3>
          <div className="mt-2 space-y-1.5">
            {righe.filter((r) => r.nota).map((r, i) => (
              <div key={r.cliente + i} className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-2.5 text-xs">
                <span className="shrink-0 font-bold text-amber-800">{r.cliente}</span>
                <span className="text-inchiostro/70">{r.nota}</span>
              </div>
            ))}
          </div>
        </div>

        <Carta className="mt-6 text-xs leading-relaxed text-inchiostro/65">
          <p><b className="text-inchiostro">Cosa mostra la barra.</b> Da sinistra: l&apos;ingresso reale del cliente in pipeline (data del questionario ricevuto), poi la parte piena = tempo già percorso fino a oggi, poi la parte tenue = runway che resta fino alla consegna prevista. I <b className="text-green-700">rombi verdi</b> sono i passaggi già completati con la loro data reale (copy consegnato, revisione Grippo chiusa), presi dal foglio maestro &quot;CONSULENZE FRANK - Report in lavorazione&quot;. Lo stepper a 5 tacche sotto ogni nome dice quali passaggi sono fatti (verde), quale è in corso (colore fase) e quali restano.</p>
          <p className="mt-2"><b className="text-inchiostro">Date di consegna.</b> Dal file ufficiale &quot;Gantt_Consulenze_Frank_XY_Max2_14-07-2026.xlsx&quot;: vincolo massimo 2 consegne per giornata lavorativa, weekend esclusi, coda per fase 5→4→3→1→2.</p>
          <p className="mt-2"><b className="text-inchiostro">Nota di trasparenza.</b> Le date storiche a monte sono disponibili solo per i clienti già entrati in pipeline (fasi 3-6). Per chi è ancora in scrittura copy (fase 1) o dall&apos;avvocato Jelo (fase 2) non esistono ancora passaggi completati, quindi la barra parte da oggi. Il foglio maestro non traccia separatamente Caputo (immagini) da Valentino (grafica) né la revisione dell&apos;avvocato: i rombi verdi coprono copy e revisione testo, gli unici milestone a monte con una data certa.</p>
        </Carta>
      </div>
    </div>
  )
}
