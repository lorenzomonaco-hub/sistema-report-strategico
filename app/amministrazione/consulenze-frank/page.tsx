'use client'

// ─── Consulenze Frank — Gantt ufficiale ───
// Lista unica dei 34 clienti attivi del progetto, con le date di consegna del
// piano ufficiale (vincolo: massimo 2 consegne per giornata lavorativa, weekend
// esclusi, coda per fase 5→4→3→1→2). Stesso stile Gantt del Quadro Aziendale.

import Link from 'next/link'
import { CONSULENZE_FRANK, FASI_FRANK, FRANK_OGGI, FaseFrank } from '@/lib/consulenzeFrank'
import { GIORNO_MS, fmtData } from '@/lib/quadroaziendale'

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

const FASE_COLORE: Record<FaseFrank, { barra: string; testo: string; bg: string }> = {
  1: { barra: 'bg-rose-500', testo: 'text-rose-700', bg: 'bg-rose-50' },
  2: { barra: 'bg-amber-500', testo: 'text-amber-700', bg: 'bg-amber-50' },
  3: { barra: 'bg-teal-600', testo: 'text-teal-700', bg: 'bg-teal-50' },
  4: { barra: 'bg-orange-500', testo: 'text-orange-700', bg: 'bg-orange-50' },
  5: { barra: 'bg-indigo-600', testo: 'text-indigo-700', bg: 'bg-indigo-50' },
  6: { barra: 'bg-inchiostro/50', testo: 'text-inchiostro/70', bg: 'bg-inchiostro/[0.05]' },
}

/** Riga del Gantt: nome+contesto a sinistra, UNA barra da oggi alla consegna a destra. */
function RigaBarra({ titolo, sottotitolo, endPct, bg, testo, etichetta, tag, zebra }: {
  titolo: string; sottotitolo: string; endPct: number
  bg: string; testo: string; etichetta: string; tag?: string; zebra: boolean
}) {
  const larghezza = Math.max(endPct, 1.2)
  const labLeft = endPct > (tag ? 55 : 78)
  return (
    <div className={`grid border-b border-linea/70 last:border-b-0 ${zebra ? 'bg-inchiostro/[0.02]' : ''}`}
         style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
      <div className="border-r border-linea px-3 py-2">
        <p className="truncate text-[12.5px] font-bold text-inchiostro">{titolo}</p>
        <p className="truncate text-[10.5px] text-inchiostro/45">{sottotitolo}</p>
      </div>
      <div className="relative h-9">
        <div className={`absolute top-1/2 h-[11px] -translate-y-1/2 rounded-full ${bg}`}
             style={{ left: 0, width: `${larghezza}%` }} />
        <div className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded bg-carta px-1 text-[10.5px] font-bold tabular-nums ${testo}`}
             style={labLeft ? { right: `${100 - endPct}%`, textAlign: 'right' } : { left: `${endPct}%`, paddingLeft: 6 }}>
          <span>{etichetta}</span>
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
    const gg = Math.max(0, Math.round((maxDays * i) / n))
    if (seen.has(gg)) continue
    seen.add(gg)
    tacche.push({ pct: (gg / maxDays) * 100, label: fmtData(new Date(FRANK_OGGI.getTime() + gg * GIORNO_MS)) })
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

export default function ConsulenzeFrank() {
  const righe = [...CONSULENZE_FRANK].sort((a, b) => a.consegnaPrevista.getTime() - b.consegnaPrevista.getTime())
  const maxDate = righe.reduce((m, r) => (r.consegnaPrevista > m ? r.consegnaPrevista : m), FRANK_OGGI)
  const maxDays = Math.max(1, Math.round((maxDate.getTime() - FRANK_OGGI.getTime()) / GIORNO_MS))
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
              {CONSULENZE_FRANK.length} clienti attivi, un&apos;unica lista ordinata per data di consegna prevista. Piano ufficiale del 14/07/2026: massimo 2 consegne per giornata lavorativa, weekend esclusi.
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
          {([1, 2, 3, 4, 5] as FaseFrank[]).map((f, i) => (
            <Statistica key={f} label={`${f} · ${FASI_FRANK[f].label}`} valore={String(perFase[i])} sub={FASI_FRANK[f].sub} tinta={FASE_COLORE[f].testo} />
          ))}
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-bold tracking-tight text-inchiostro">Quando consegniamo, cliente per cliente</h3>
            <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-inchiostro/55">
              {([1, 2, 3, 4, 5, 6] as FaseFrank[]).map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-4 rounded-full ${FASE_COLORE[f].barra}`} />{f}. {FASI_FRANK[f].label}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
            <div className="min-w-[760px]">
              <Assi maxDays={maxDays} />
              {righe.map((r, i) => {
                const giorni = Math.round((r.consegnaPrevista.getTime() - FRANK_OGGI.getTime()) / GIORNO_MS)
                const endPct = Math.max((giorni / maxDays) * 100, 1.2)
                const c = FASE_COLORE[r.fase]
                return (
                  <RigaBarra key={r.cliente + i} zebra={i % 2 === 0}
                    titolo={r.cliente} sottotitolo={`${r.owner} · ${FASI_FRANK[r.fase].label}`}
                    endPct={endPct} bg={c.barra} testo={c.testo}
                    etichetta={fmtData(r.consegnaPrevista)}
                    tag={r.nota ? 'nota' : undefined} />
                )
              })}
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
          <p><b className="text-inchiostro">Fonte e regole del piano.</b> Date ufficiali dal file &quot;Gantt_Consulenze_Frank_XY_Max2_14-07-2026.xlsx&quot; (foglio &quot;Elenco consegne&quot;), non ricalcolate da questa piattaforma. Vincolo applicato: <b className="text-inchiostro">massimo 2 consegne per giornata lavorativa</b>, weekend esclusi — chi è pronto il venerdì può slittare al lunedì. Priorità di coda: fase 5, poi 4, poi 3, poi le pratiche in fase 1 e 2 nell&apos;ordine fornito.</p>
          <p className="mt-2">Per i clienti in fase 1 (Mastella, Rea, Banfi, Donnantuono, Novella, Tamburini) la data indicata è trattata come fine copy, non come consegna finale: da lì il progetto attraversa comunque revisione Grippo, Caputo e Valentino (e l&apos;avvocato Jelo se il progetto è di branding — <b className="text-inchiostro">da confermare per ciascuno</b>). Solo i clienti già presenti dal Avv. Jelo (Pessot, Lancia, Barcello, Cazan, Imbriano 1) includono i 3 giorni lavorativi legali nel calcolo.</p>
          <p className="mt-2">Se il piano cambia, aggiornare i dati in <code className="rounded bg-inchiostro/[0.06] px-1 py-0.5">lib/consulenzeFrank.ts</code> con il nuovo file ufficiale.</p>
        </Carta>
      </div>
    </div>
  )
}
