'use client'

// ─── Human in the loop — clienti in erogazione ───
// SOLO i 32 clienti attualmente in erogazione (i 52 in attesa dati sono esclusi,
// come chiesto). Stato aggiornato al 14 lug 2026:
//  - 10 in scrittura (copy)
//  - 11 in attesa revisione immagini di Caputo (automatizzabile)
//  - 2 in revisione Grippo (1 oggi, 1 domani)
//  - 9 in grafica
// Pipeline agentica: la scrittura resta umana (4 copy, 4h a report); da lì in poi
// fa tutto l'agente con controllo umano — immagini (Caputo), testo (Grippo/Tabita),
// grafica (Valentino). Consegna calcolata in avanti, ordinata per chi esce prima.

import Link from 'next/link'
import { EROG_OGGI, GIORNO_MS, fmtData } from '@/lib/quadroaziendale'

// ── parametri (minuti) ──
const DAY = 420
const SCRITTURA = 240              // 4h, umana, 4 copy in parallelo
const AG_IMMAGINI = 10, REV_IMMAGINI = 15   // agente inserisce diagrammi/tabelle + revisione Caputo = 25'
const AG_TESTO = 35, REV_TESTO = 60          // agente + revisione Grippo/Tabita = 95'
const AG_GRAFICA = 2, REV_GRAFICA = 30       // agente + revisione Valentino = 32'
const N_COPY = 4
const IMMAGINI = AG_IMMAGINI + REV_IMMAGINI
const GRIPPO = AG_TESTO + REV_TESTO
const GRAFICA = AG_GRAFICA + REV_GRAFICA

const ceilDay = (min: number) => Math.max(0, Math.ceil(min / DAY))
function workdayAdd(base: Date, n: number): Date {
  const r = new Date(base)
  let added = 0
  while (added < n) {
    r.setDate(r.getDate() + 1)
    if (r.getDay() !== 0 && r.getDay() !== 6) added++
  }
  return r
}

type Fase = 1 | 2 | 3 | 4
type Cliente = { nome: string; azienda: string; fase: Fase; nota?: string }

const FASE = {
  1: { label: 'Scrittura copy', barra: 'bg-petrolio', testo: 'text-petrolio-scuro', done: 'bg-petrolio/25' },
  2: { label: 'Immagini Caputo', barra: 'bg-amber-500', testo: 'text-amber-700', done: 'bg-amber-500/25' },
  3: { label: 'Revisione Grippo', barra: 'bg-teal-600', testo: 'text-teal-700', done: 'bg-teal-600/25' },
  4: { label: 'Grafica Valentino', barra: 'bg-indigo-600', testo: 'text-indigo-700', done: 'bg-indigo-600/25' },
} as const

// ── i 32 clienti in erogazione (ordine di scrittura per i copy = ordine lista) ──
const CLIENTI: Cliente[] = [
  // 10 in scrittura
  { nome: 'Agostino Pessot', azienda: 'Pessot Flli SRL', fase: 1 },
  { nome: 'Alessio Barcello', azienda: 'Barcello Rappresentanze SAS', fase: 1 },
  { nome: 'Andrea Novella', azienda: 'Stilogistica SRL', fase: 1 },
  { nome: 'Massimiliano Rea', azienda: 'Erreesse SRL', fase: 1 },
  { nome: 'Desirèe Lancia', azienda: 'Garden House SRL', fase: 1 },
  { nome: 'Elia Banfi', azienda: 'Elia Banfi', fase: 1 },
  { nome: 'Marisa Benvegnù Ferrario', azienda: 'Dedi SRL', fase: 1 },
  { nome: 'Matteo Tamburini', azienda: 'MT Service SRL', fase: 1 },
  { nome: 'Paolo Mastella', azienda: 'Prima Group SRL', fase: 1 },
  { nome: 'Nicolò Donnantuono', azienda: 'Pitwo SRL', fase: 1 },
  // 11 in attesa revisione immagini Caputo
  { nome: 'Simone Tomasini', azienda: 'Trillo Parrucchieri', fase: 2 },
  { nome: 'Gabriele Cascone', azienda: 'Studio di Architettura', fase: 2 },
  { nome: 'Agostino Romano', azienda: 'Romano SPA (Food truck)', fase: 2 },
  { nome: 'Stefano Lazzarini', azienda: 'Cartaria Biellese SRL', fase: 2 },
  { nome: 'Michele Brioni', azienda: '3B Leisure & Style SRL', fase: 2 },
  { nome: 'Davide Ghelardi', azienda: 'Ristora SAS', fase: 2 },
  { nome: 'Giuseppe Di Guida', azienda: 'Gruppo EGS SRL', fase: 2 },
  { nome: 'Filippo Griggio', azienda: 'Car For Life SRL', fase: 2 },
  { nome: 'Samuele Turcato', azienda: 'Costruzioni Venete SRL', fase: 2 },
  { nome: 'Nicola Angius', azienda: 'Aquamea SRL', fase: 2 },
  { nome: 'Rudy Luxardo', azienda: 'Sole 1936 SRL', fase: 2 },
  // 2 in revisione Grippo
  { nome: 'Daniele Sciannimanico', azienda: 'Scianni SRL', fase: 3, nota: 'chiude oggi' },
  { nome: 'Giovanni Mazzamati', azienda: '80 Fame SRL', fase: 3, nota: 'chiude domani' },
  // 9 in grafica
  { nome: 'Claudio Virdis', azienda: 'Gruppoconsilia SRL', fase: 4 },
  { nome: 'Davide Raimondi', azienda: 'DR Fasciaterapeuta STP', fase: 4 },
  { nome: 'Emanuele Soffiotto', azienda: "La Società dell'Allegria SRL", fase: 4 },
  { nome: 'Francesco Surace', azienda: 'SF Dental SRL', fase: 4 },
  { nome: 'Gaetano Rodittis', azienda: 'CTA SRL', fase: 4 },
  { nome: 'Marco Giaferri', azienda: 'AGMA SRL', fase: 4 },
  { nome: 'Marco Ruggeri', azienda: 'Privilege SRL', fase: 4 },
  { nome: 'Matteo Zurlo', azienda: 'MB SRL', fase: 4 },
  { nome: 'Michela Sartori', azienda: 'Il Giocabosco', fase: 4 },
]

type Riga = { c: Cliente; consegna: Date; consegnaImg?: Date }

function calcola(): Riga[] {
  const lanes = new Array(N_COPY).fill(0)
  return CLIENTI.map((c) => {
    if (c.fase === 1) {
      // scrittura: 4 copy in parallelo, 4h a report
      let li = 0
      for (let l = 1; l < lanes.length; l++) if (lanes[l] < lanes[li]) li = l
      lanes[li] += SCRITTURA
      const ggScritto = ceilDay(lanes[li])                 // quando è pronto e consegnato all'agente immagini
      const consegnaImg = workdayAdd(EROG_OGGI, ggScritto)
      // da lì: immagini + testo + grafica (tutto agente) = 152' < 1 giorno
      const consegna = workdayAdd(EROG_OGGI, ggScritto + ceilDay(IMMAGINI + GRIPPO + GRAFICA))
      return { c, consegna, consegnaImg }
    }
    if (c.fase === 2) {
      // resta: immagini + testo + grafica (tutto agente) = 152' → 1 giorno
      return { c, consegna: workdayAdd(EROG_OGGI, ceilDay(IMMAGINI + GRIPPO + GRAFICA)) }
    }
    if (c.fase === 3) {
      // Grippo umano in chiusura (oggi=0 / domani=1), poi grafica agente
      const ggGrippo = c.nota === 'chiude domani' ? 1 : 0
      return { c, consegna: workdayAdd(EROG_OGGI, ggGrippo + ceilDay(GRAFICA)) }
    }
    // fase 4: resta solo la grafica (agente + revisione Valentino) = 32' → 1 giorno
    return { c, consegna: workdayAdd(EROG_OGGI, ceilDay(GRAFICA)) }
  }).sort((a, b) => a.consegna.getTime() - b.consegna.getTime())
}

const LARGHEZZA = 260

function SegmentiFase({ fase }: { fase: Fase }) {
  return (
    <div className="mt-1 flex items-center gap-1">
      {([1, 2, 3, 4] as Fase[]).map((n) => {
        const f = FASE[n]
        const cls = n === fase ? f.barra : n < fase ? f.done : 'bg-inchiostro/[0.07]'
        return <div key={n} className={`h-1.5 flex-1 rounded-full ${cls}`} />
      })}
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
    <div className="grid border-b border-linea bg-inchiostro/[0.03]" style={{ gridTemplateColumns: `${LARGHEZZA}px 1fr` }}>
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

function PassoCard({ n, titolo, chi, tempo, sub }: { n: string; titolo: string; chi: string; tempo: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-linea bg-carta p-4 shadow-sm">
      <p className="text-[10.5px] font-bold uppercase tracking-wide text-inchiostro/45">{n} · {titolo}</p>
      <p className="font-display mt-1 text-2xl font-bold tracking-tight text-inchiostro">{tempo}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-inchiostro/60">{chi}</p>
      <p className="mt-1 text-[11px] leading-snug text-inchiostro/45">{sub}</p>
    </div>
  )
}

export default function PrevisioneAgentica() {
  const righe = calcola()
  const perFase = [1, 2, 3, 4].map((f) => CLIENTI.filter((c) => c.fase === f).length)
  const maxDate = righe.reduce((m, x) => (x.consegna > m ? x.consegna : m), EROG_OGGI)
  const maxDays = Math.max(1, Math.round((maxDate.getTime() - EROG_OGGI.getTime()) / GIORNO_MS))
  const ultimo = righe[righe.length - 1]?.consegna
  const scrittura = righe.filter((r) => r.c.fase === 1)

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Erogazione con l&apos;agente: quando consegniamo</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              I {CLIENTI.length} clienti in erogazione oggi. La scrittura resta ai copy; da lì in poi immagini, testo e grafica le fa l&apos;agente con controllo umano. Ordinati per data di consegna.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/previsione-umana" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">← Pagina Umano</Link>
            <Link href="/amministrazione/quadro-aziendale" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">Quadro Aziendale</Link>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((f) => (
            <div key={f} className="rounded-2xl border border-linea bg-carta p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">{FASE[f as Fase].label}</p>
              <p className={`font-display mt-1 text-3xl font-bold ${FASE[f as Fase].testo}`}>{perFase[f - 1]}</p>
              <p className="mt-1 text-[11px] text-inchiostro/50">clienti in questa fase</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">La pipeline — tempo per report</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <PassoCard n="1" titolo="Scrittura" tempo="4h" chi={`${N_COPY} copy in parallelo`} sub="unico passaggio ancora umano, 4h a report" />
            <PassoCard n="2" titolo="Immagini" tempo={`${IMMAGINI}min`} chi="agente + Caputo" sub={`agente inserisce diagrammi e tabelle (${AG_IMMAGINI}') + revisione Caputo (${REV_IMMAGINI}')`} />
            <PassoCard n="3" titolo="Revisione testo" tempo={`${GRIPPO}min`} chi="agente + Grippo/Tabita" sub={`agente revisiona (${AG_TESTO}') + controllo umano (${REV_TESTO}')`} />
            <PassoCard n="4" titolo="Grafica" tempo={`${GRAFICA}min`} chi="agente + Valentino" sub={`agente impagina (${AG_GRAFICA}') + revisione Valentino (${REV_GRAFICA}')`} />
          </div>
          <p className="mt-2 rounded-xl border border-linea bg-carta p-3 text-xs text-inchiostro/60">
            Dopo la scrittura, l&apos;agente attraversa immagini + testo + grafica in <b className="text-inchiostro">{IMMAGINI + GRIPPO + GRAFICA} minuti</b> totali — meno di una giornata. Il collo di bottiglia resta la sola scrittura: {N_COPY} copy a 4h l&apos;uno smaltiscono i {perFase[0]} da scrivere in circa 2 giornate lavorative.
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">I {perFase[0]} ancora da scrivere — quando passano all&apos;agente immagini</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {scrittura.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-xl border border-linea bg-carta px-3 py-2 text-xs">
                <span className="min-w-0 truncate font-semibold text-inchiostro">{r.c.nome}<span className="font-normal text-inchiostro/45"> · {r.c.azienda}</span></span>
                <span className="shrink-0 text-right text-inchiostro/70">
                  <span className="text-amber-700">→ agente {fmtData(r.consegnaImg!)}</span>
                  <b className="ml-2 text-petrolio-scuro">consegna {fmtData(r.consegna)}</b>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-linea bg-petrolio/10 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Ultimo consegnato</p>
            <p className="font-display mt-1 text-3xl font-bold tracking-tight text-petrolio-scuro">{ultimo ? fmtData(ultimo) : '—'}</p>
            <p className="mt-1 text-[11px] text-inchiostro/50">tutti i {CLIENTI.length} in erogazione, con l&apos;agente attivo</p>
          </div>
          <div className="rounded-2xl border border-linea bg-carta p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Pronti già domani</p>
            <p className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">{righe.filter((r) => Math.round((r.consegna.getTime() - EROG_OGGI.getTime()) / GIORNO_MS) <= 1).length}</p>
            <p className="mt-1 text-[11px] text-inchiostro/50">immagini, testo e grafica già fatti dall&apos;agente</p>
          </div>
          <div className="rounded-2xl border border-linea bg-carta p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Collo di bottiglia</p>
            <p className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">scrittura</p>
            <p className="mt-1 text-[11px] text-inchiostro/50">l&apos;unico passaggio ancora umano</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-display text-xl font-bold tracking-tight text-inchiostro">Quando consegniamo, cliente per cliente</h3>
          <p className="text-[11px] text-inchiostro/45">In alto chi esce prima. Colore = fase in cui si trova oggi.</p>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
            <div className="min-w-[760px]">
              <Assi maxDays={maxDays} />
              {righe.map((r, i) => {
                const giorni = Math.round((r.consegna.getTime() - EROG_OGGI.getTime()) / GIORNO_MS)
                const endPct = Math.max((giorni / maxDays) * 100, 1.5)
                const f = FASE[r.c.fase]
                const labLeft = endPct > 74
                return (
                  <div key={i} className={`grid border-b border-linea/70 last:border-b-0 ${i % 2 === 0 ? 'bg-inchiostro/[0.02]' : ''}`}
                       style={{ gridTemplateColumns: `${LARGHEZZA}px 1fr` }}>
                    <div className="border-r border-linea px-3 py-2">
                      <p className="truncate text-[12.5px] font-bold text-inchiostro">{r.c.nome}</p>
                      <p className="truncate text-[10.5px] text-inchiostro/45">{r.c.azienda} · {f.label}{r.c.nota ? ` (${r.c.nota})` : ''}</p>
                      <SegmentiFase fase={r.c.fase} />
                    </div>
                    <div className="relative h-11">
                      <div className={`absolute top-1/2 h-[11px] -translate-y-1/2 rounded-full ${f.barra}`} style={{ left: 0, width: `${endPct}%` }} />
                      <div className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-carta px-1 text-[10.5px] font-bold tabular-nums ${f.testo}`}
                           style={labLeft ? { right: `${100 - endPct}%` } : { left: `${endPct}%`, paddingLeft: 6 }}>
                        {fmtData(r.consegna)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-linea bg-carta p-4 text-xs leading-relaxed text-inchiostro/65">
          <p><b className="text-inchiostro">Come sono calcolate le date.</b> Oggi = {fmtData(EROG_OGGI)}. La scrittura è fatta da {N_COPY} copy in parallelo, 4h a report: i primi {N_COPY} sono pronti dopo 1 giornata lavorativa, gli altri dopo 2. Appena scritto, il report passa all&apos;agente immagini; da lì immagini ({IMMAGINI}&apos;) + testo ({GRIPPO}&apos;) + grafica ({GRAFICA}&apos;) si concludono nella stessa giornata. Chi è già in immagini/grafica salta i passaggi che ha superato; i 2 in revisione Grippo la chiudono oggi e domani (lavoro umano in corso, non lo tocchiamo), poi solo grafica.</p>
          <p className="mt-2"><b className="text-inchiostro">Nota su Imbriano.</b> L&apos;ho tolto dalla scrittura come indicato (&quot;andato in revisione&quot;). I tuoi conti — 11 in immagini + 2 in Grippo — sono già pieni e coerenti (i 2 in Grippo sono Sciannimanico e Mazzamati, gli unici non nella lista immagini), quindi Imbriano non rientra in questi 32: dimmi tu in quale fase metterlo di preciso e lo aggiungo.</p>
        </div>
      </div>
    </div>
  )
}
