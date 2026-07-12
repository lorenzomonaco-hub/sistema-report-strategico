'use client'

// ─── Quadro Amministrativo ───
// Gantt costruito sull'anatomia classica dei project manager (TeamGantt,
// Asana, ProjectManager, Wrike): tabella dei progetti a SINISTRA e timeline a
// DESTRA sulle stesse righe; asse temporale in alto con griglia verticale;
// UNA barra per riga (avanzamento = riempimento più scuro della stessa
// tinta); milestone a rombo = consegna promessa; linea «Oggi»; colori SOLO di
// stato (verde-petrolio in linea, rosso in ritardo). Ordinamento richiesto da
// Lorenzo: consegna più vicina in alto.

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CHIAVE_TOKEN_DATI } from '@/lib/datiblocco'
import { FASI, faseById } from '@/lib/fasi'
import { calcolaGantt, DURATE_STANDARD, GanttPratica, leggiDurate, salvaDurate } from '@/lib/gantt'
import { useApp } from '@/lib/store'

const GIORNO_MS = 86_400_000

const dataBreve = (ms: number) =>
  new Date(ms).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })

const LARGHEZZA_TABELLA = 300 // px della colonna-tabella a sinistra

function IndicatoreSync({ stato }: { stato: 'in-corso' | 'online' | 'offline' }) {
  const stile = {
    'in-corso': ['bg-amber-400', 'collegamento…'],
    online: ['bg-green-500', 'archivio condiviso collegato'],
    offline: ['bg-rose-500', 'solo questo browser (archivio non raggiungibile)'],
  }[stato]
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-linea bg-carta px-3 py-1 text-xs text-inchiostro/60">
      <span className={`h-2 w-2 rounded-full ${stile[0]}`} />
      {stile[1]}
    </span>
  )
}

/** La riga del Gantt: cella-tabella a sinistra + barra sulla timeline a destra. */
function RigaGantt({ g, pct }: { g: GanttPratica; pct: (ms: number) => number }) {
  const fase = faseById(g.pratica.faseCorrente)
  const inizio = g.tratti[0]?.inizio ?? Date.parse(g.pratica.dataCreazione)
  const tardi = g.giorniRitardo > 0
  const sinistra = pct(inizio)
  const destra = pct(g.consegnaPrevista)
  const promessa = pct(g.consegnaOriginale)
  const larghezza = Math.max(destra - sinistra, 0.8)
  // il riempimento avanzamento occupa il tratto già percorso della barra
  const percorso = FASI.slice(0, FASI.findIndex((f) => f.id === g.pratica.faseCorrente))
  const tintaBarra = g.completata ? 'bg-green-600/25' : tardi ? 'bg-rose-500/20' : 'bg-petrolio/20'
  const tintaPieno = g.completata ? 'bg-green-600' : tardi ? 'bg-rose-600' : 'bg-petrolio'

  return (
    <div className="grid border-b border-linea/70 last:border-b-0 hover:bg-inchiostro/[0.025]"
         style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
      {/* tabella: chi è, dove sta, quando consegna */}
      <div className="border-r border-linea px-3 py-2.5">
        <div className="flex items-baseline gap-2">
          <span className="font-display truncate text-sm font-bold tracking-tight text-inchiostro">
            {g.pratica.azienda}
          </span>
          <span className="shrink-0 text-[11px] font-bold text-inchiostro/50">{g.percento}%</span>
        </div>
        <div className="mt-0.5 truncate text-[11px] text-inchiostro/45">
          {g.pratica.cliente} · {g.pratica.tutor}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${fase.badge}`}>{fase.label}</span>
          {g.completata ? (
            <span className="text-[11px] font-semibold text-green-700">consegnato</span>
          ) : (
            <span className={`text-[11px] ${tardi ? 'font-semibold text-rose-700' : 'text-inchiostro/55'}`}>
              consegna {dataBreve(g.consegnaPrevista)}{tardi ? ` · +${g.giorniRitardo} gg` : ''}
            </span>
          )}
          {g.faseInRitardo && !g.completata && (
            <span className="text-[10px] font-semibold text-amber-700">ferma da {g.giorniInFase} gg</span>
          )}
        </div>
      </div>

      {/* timeline: UNA barra, riempimento = avanzamento, rombo = consegna promessa */}
      <div className="relative h-full min-h-[62px]"
           title={`${g.pratica.azienda} — ${g.percento}% · fase: ${fase.label}` +
                  `\nAvvio ${dataBreve(inizio)} → consegna prevista ${dataBreve(g.consegnaPrevista)}` +
                  `\nConsegna promessa ${dataBreve(g.consegnaOriginale)}${tardi ? ` (sforata di ${g.giorniRitardo} gg)` : ''}` +
                  (percorso.length ? `\nFasi percorse: ${percorso.map((f) => f.label).join(' → ')}` : '')}>
        <div className={`absolute top-1/2 h-4 -translate-y-1/2 rounded-full ${tintaBarra}`}
             style={{ left: `${sinistra}%`, width: `${larghezza}%` }}>
          <div className={`h-full rounded-full ${tintaPieno}`} style={{ width: `${g.percento}%` }} />
        </div>
        {/* rombo: la consegna promessa alla creazione */}
        {!g.completata && (
          <div className="absolute top-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-carta bg-inchiostro"
               style={{ left: `${promessa}%` }} />
        )}
      </div>
    </div>
  )
}

export default function Amministrazione() {
  const { state, pronto, sincronizzazione, cronologia } = useApp()
  const [durate, setDurate] = useState(DURATE_STANDARD)
  const [pannelloDurate, setPannelloDurate] = useState(false)
  const [filtroTutor, setFiltroTutor] = useState('')
  const [mostraCompletate, setMostraCompletate] = useState(false)
  const [token, setToken] = useState('')
  const adesso = Date.now()

  useEffect(() => {
    setDurate(leggiDurate())
    setToken(localStorage.getItem(CHIAVE_TOKEN_DATI) ?? '')
  }, [])

  const tutorDisponibili = useMemo(
    () => Array.from(new Set(state.pratiche.map((p) => p.tutor))).sort(),
    [state.pratiche]
  )

  const gantt = useMemo(() => {
    const filtrate = state.pratiche.filter((p) => !filtroTutor || p.tutor === filtroTutor)
    return filtrate
      .map((p) => calcolaGantt(p, cronologia, durate, adesso))
      // regola di Lorenzo (e dei PM): chi consegna prima sta in alto
      .sort((a, b) => a.consegnaPrevista - b.consegnaPrevista)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- adesso volutamente fuori dalle dipendenze
  }, [state.pratiche, cronologia, durate, filtroTutor])

  const attive = gantt.filter((g) => !g.completata)
  const completate = gantt.filter((g) => g.completata)
  const inRitardo = attive.filter((g) => g.giorniRitardo > 0)

  // finestra temporale: dal primo avvio alla consegna più lontana, con respiro
  const daListe = attive.length ? attive : gantt
  const da = daListe.length
    ? Math.min(...daListe.map((g) => g.tratti[0]?.inizio ?? adesso), adesso) - GIORNO_MS * 2
    : adesso - GIORNO_MS * 7
  const a = daListe.length
    ? Math.max(...daListe.map((g) => g.consegnaPrevista), adesso) + GIORNO_MS * 3
    : adesso + GIORNO_MS * 7
  const ampiezza = Math.max(a - da, GIORNO_MS * 7)
  const pct = (ms: number) => Math.max(0, Math.min(100, ((ms - da) / ampiezza) * 100))

  // griglia: tacche settimanali + etichette dei mesi
  const settimane: number[] = []
  for (let t = Math.ceil(da / (GIORNO_MS * 7)) * GIORNO_MS * 7; t < a; t += GIORNO_MS * 7) settimane.push(t)
  const mesi: { inizio: number; label: string }[] = []
  {
    const d = new Date(da)
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    while (d.getTime() < a) {
      mesi.push({ inizio: d.getTime(), label: d.toLocaleDateString('it-IT', { month: 'long', year: undefined }) })
      d.setMonth(d.getMonth() + 1)
    }
  }

  // distribuzione per fase (solo attive)
  const perFase = FASI.filter((f) => f.id !== 'completata').map((f) => ({
    fase: f,
    conta: attive.filter((g) => g.pratica.faseCorrente === f.id).length,
  }))

  if (!pronto) return null

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">
              Quadro Amministrativo
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <IndicatoreSync stato={sincronizzazione} />
            <Link href="/" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Home
            </Link>
          </div>
        </header>

        {sincronizzazione === 'offline' && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">Archivio condiviso non collegato</p>
            <p className="mt-1 text-xs">
              Stai vedendo solo i dati di questo browser. Inserisci il token di blocco (lo stesso dei banchi del
              Laboratorio) e ricollega:
            </p>
            <div className="mt-2 flex gap-2">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="token di blocco"
                className="w-64 rounded-lg border border-amber-300 bg-white px-2 py-1 text-xs focus:outline-none"
              />
              <button
                onClick={() => { localStorage.setItem(CHIAVE_TOKEN_DATI, token.trim()); location.reload() }}
                className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
              >
                Salva e ricollega
              </button>
            </div>
          </div>
        )}

        {/* Riepilogo cumulativo */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['In lavorazione', String(attive.length), 'text-inchiostro'],
            ['In ritardo', String(inRitardo.length), inRitardo.length ? 'text-rose-700' : 'text-inchiostro'],
            ['Ferme oltre il previsto', String(attive.filter((g) => g.faseInRitardo).length), 'text-amber-700'],
            ['Consegnate', String(completate.length), 'text-green-700'],
          ].map(([label, valore, colore]) => (
            <div key={label} className="rounded-2xl border border-linea bg-carta p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">{label}</p>
              <p className={`font-display mt-1 text-3xl font-bold tracking-tight ${colore}`}>{valore}</p>
            </div>
          ))}
        </section>

        {/* Distribuzione per fase */}
        <section className="mt-4 rounded-2xl border border-linea bg-carta p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Dove sono adesso</h2>
          <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-inchiostro/5">
            {perFase.filter((x) => x.conta > 0).map((x) => (
              <div
                key={x.fase.id}
                className={x.fase.dot}
                style={{ width: `${(x.conta / Math.max(1, attive.length)) * 100}%` }}
                title={`${x.fase.label}: ${x.conta}`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {perFase.filter((x) => x.conta > 0).map((x) => (
              <span key={x.fase.id} className="inline-flex items-center gap-1.5 text-xs text-inchiostro/60">
                <span className={`h-2 w-2 rounded-full ${x.fase.dot}`} />
                {x.fase.label} <span className="font-bold text-inchiostro">{x.conta}</span>
              </span>
            ))}
            {attive.length === 0 && <span className="text-xs text-inchiostro/40">Nessuna pratica in lavorazione</span>}
          </div>
        </section>

        {/* Gantt */}
        <section className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight text-inchiostro">Gantt della pipeline</h2>
            <select
              value={filtroTutor}
              onChange={(e) => setFiltroTutor(e.target.value)}
              className="rounded-lg border border-linea bg-carta px-2 py-1 text-xs focus:border-petrolio focus:outline-none"
            >
              <option value="">Tutti i tutor</option>
              {tutorDisponibili.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={() => setPannelloDurate(!pannelloDurate)}
              className="ml-auto rounded-lg border border-linea bg-carta px-3 py-1 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro"
            >
              ⚙ Durate previste per fase
            </button>
          </div>

          {/* legenda */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-inchiostro/55">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-6 rounded-full bg-petrolio" /> avanzamento
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-6 rounded-full bg-petrolio/20" /> lavoro previsto
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-6 rounded-full bg-rose-500/30" /> in ritardo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rotate-45 bg-inchiostro" /> consegna promessa
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-0.5 bg-ambra" /> oggi
            </span>
            <span className="ml-auto">consegna più vicina in alto</span>
          </div>

          {pannelloDurate && (
            <div className="mt-3 rounded-2xl border border-linea bg-carta p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {FASI.filter((f) => f.id !== 'completata').map((f) => (
                  <label key={f.id} className="text-xs text-inchiostro/60">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${f.dot}`} />
                      {f.label}
                    </span>
                    <span className="mt-1 flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={durate[f.id]}
                        onChange={(e) => setDurate({ ...durate, [f.id]: Number(e.target.value) })}
                        className="w-16 rounded-lg border border-linea bg-carta px-2 py-1 text-xs focus:border-petrolio focus:outline-none"
                      />
                      giorni
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-inchiostro/45">
                Prima stima: le tariamo insieme quando il processo è a regime.
              </p>
              <button
                onClick={() => { salvaDurate(durate); setPannelloDurate(false) }}
                className="mt-2 rounded-lg bg-petrolio px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                Salva durate
              </button>
            </div>
          )}

          {/* il grafico: tabella a sinistra, timeline a destra, griglia condivisa */}
          <div className="mt-3 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
            <div className="min-w-[880px]">
              {/* intestazione: mesi + settimane */}
              <div className="grid border-b border-linea bg-inchiostro/[0.03]"
                   style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
                <div className="flex items-end border-r border-linea px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/40">
                  Progetto · fase · consegna
                </div>
                <div className="relative h-11">
                  {mesi.map((m) => (
                    <span key={m.inizio}
                          className="absolute top-1 text-[10px] font-bold uppercase tracking-wider text-inchiostro/50"
                          style={{ left: `${Math.max(pct(m.inizio), 0.4)}%` }}>
                      {m.label}
                    </span>
                  ))}
                  {settimane.map((t) => (
                    <span key={t} className="absolute bottom-0.5 -translate-x-1/2 text-[10px] text-inchiostro/40"
                          style={{ left: `${pct(t)}%` }}>
                      {new Date(t).getDate()}
                    </span>
                  ))}
                  {/* etichetta Oggi nell'intestazione */}
                  <span className="absolute top-1 -translate-x-1/2 rounded bg-ambra px-1 py-px text-[9px] font-bold uppercase text-white"
                        style={{ left: `${pct(adesso)}%` }}>
                    oggi
                  </span>
                </div>
              </div>

              {/* corpo: griglia verticale + linea oggi dietro le righe */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 grid"
                     style={{ gridTemplateColumns: `${LARGHEZZA_TABELLA}px 1fr` }}>
                  <div />
                  <div className="relative">
                    {settimane.map((t) => (
                      <div key={t} className="absolute top-0 bottom-0 w-px bg-inchiostro/[0.06]"
                           style={{ left: `${pct(t)}%` }} />
                    ))}
                    {mesi.map((m) => (
                      <div key={m.inizio} className="absolute top-0 bottom-0 w-px bg-inchiostro/[0.14]"
                           style={{ left: `${pct(m.inizio)}%` }} />
                    ))}
                    <div className="absolute top-0 bottom-0 z-10 w-0.5 bg-ambra" style={{ left: `${pct(adesso)}%` }} />
                  </div>
                </div>

                {attive.map((g) => (
                  <RigaGantt key={g.pratica.id} g={g} pct={pct} />
                ))}
                {attive.length === 0 && (
                  <p className="p-8 text-center text-sm text-inchiostro/40">
                    Nessuna pratica in lavorazione{filtroTutor ? ` per ${filtroTutor}` : ''}.
                  </p>
                )}
              </div>
            </div>
          </div>

          {completate.length > 0 && (
            <div className="mt-5">
              <button
                onClick={() => setMostraCompletate(!mostraCompletate)}
                className="text-xs font-semibold text-inchiostro/50 hover:text-inchiostro"
              >
                {mostraCompletate ? '▾' : '▸'} Consegnate ({completate.length})
              </button>
              {mostraCompletate && (
                <div className="mt-2 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
                  <div className="min-w-[880px]">
                    {completate.map((g) => (
                      <RigaGantt key={g.pratica.id} g={g} pct={pct} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
