'use client'

// ─── Quadro Amministrativo ───
// Riepilogo cumulativo di TUTTI i clienti in pipeline + Gantt che si aggiorna
// da solo con l'avanzamento reale (timbri del blocco dati) e proietta la
// consegna prevista con le durate standard per fase (da tarare insieme).
// L'accesso è protetto da password dedicata (cancello nel server, non qui).

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CHIAVE_TOKEN_DATI } from '@/lib/datiblocco'
import { FASI, faseById } from '@/lib/fasi'
import { calcolaGantt, DURATE_STANDARD, GanttPratica, leggiDurate, salvaDurate } from '@/lib/gantt'
import { useApp } from '@/lib/store'

const GIORNO_MS = 86_400_000

const dataBreve = (ms: number) =>
  new Date(ms).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })

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

/** Una riga del Gantt: intestazione pratica + barra a tratti su asse temporale. */
function RigaGantt({ g, da, ampiezza, adesso }: { g: GanttPratica; da: number; ampiezza: number; adesso: number }) {
  const pct = (ms: number) => Math.max(0, Math.min(100, ((ms - da) / ampiezza) * 100))
  const fase = faseById(g.pratica.faseCorrente)
  return (
    <div className={`rounded-xl border p-3 ${g.giorniRitardo > 0 ? 'border-rose-300 bg-rose-50/40' : 'border-linea bg-carta'}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-display text-sm font-bold tracking-tight text-inchiostro">{g.pratica.azienda}</span>
        <span className="text-xs text-inchiostro/50">{g.pratica.cliente} · tutor {g.pratica.tutor}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${fase.badge}`}>{fase.label}</span>
        {g.faseInRitardo && !g.completata && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
            in questa fase da {g.giorniInFase} gg
          </span>
        )}
        <span className="ml-auto text-xs text-inchiostro/60">
          {g.completata ? (
            <span className="font-semibold text-green-700">consegnato</span>
          ) : g.giorniRitardo > 0 ? (
            <span className="font-semibold text-rose-700">
              consegna prevista {dataBreve(g.consegnaPrevista)} — {g.giorniRitardo} gg di ritardo
            </span>
          ) : (
            <>consegna prevista <span className="font-semibold text-inchiostro">{dataBreve(g.consegnaPrevista)}</span></>
          )}
        </span>
      </div>
      <div className="relative mt-2 h-6 overflow-hidden rounded-lg bg-inchiostro/5">
        {g.tratti.map((t, i) => (
          <div
            key={i}
            title={`${t.label}: ${dataBreve(t.inizio)} → ${dataBreve(t.fine)}${t.reale ? '' : ' (prevista)'}`}
            className={`absolute top-0.5 bottom-0.5 rounded ${t.dot} ${t.reale ? '' : 'opacity-30'} ${t.inCorso ? 'animate-pulse' : ''}`}
            style={{ left: `${pct(t.inizio)}%`, width: `${Math.max(0.6, pct(t.fine) - pct(t.inizio))}%` }}
          />
        ))}
        {/* linea di oggi */}
        <div className="absolute top-0 bottom-0 w-px bg-inchiostro/70" style={{ left: `${pct(adesso)}%` }} />
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
      .sort((a, b) => b.giorniRitardo - a.giorniRitardo || a.consegnaPrevista - b.consegnaPrevista)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- adesso volutamente fuori dalle dipendenze
  }, [state.pratiche, cronologia, durate, filtroTutor])

  const attive = gantt.filter((g) => !g.completata)
  const completate = gantt.filter((g) => g.completata)
  const inRitardo = attive.filter((g) => g.giorniRitardo > 0)

  // finestra temporale del Gantt: dal primo inizio alla consegna più lontana
  const daListe = attive.length ? attive : gantt
  const da = daListe.length
    ? Math.min(...daListe.map((g) => g.tratti[0]?.inizio ?? adesso), adesso) - GIORNO_MS
    : adesso - GIORNO_MS * 7
  const a = daListe.length
    ? Math.max(...daListe.map((g) => g.consegnaPrevista), adesso) + GIORNO_MS
    : adesso + GIORNO_MS * 7
  const ampiezza = Math.max(a - da, GIORNO_MS * 7)

  // tacche settimanali sull'asse
  const tacche: number[] = []
  for (let t = Math.ceil(da / (GIORNO_MS * 7)) * GIORNO_MS * 7; t < a; t += GIORNO_MS * 7) tacche.push(t)

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
          <p className="mt-1 text-xs text-inchiostro/40">
            Tratti pieni = percorso reale (timbri del server) · tratti tenui = previsione con le durate standard ·
            linea scura = oggi. Le durate sono una prima stima: le tariamo insieme quando il processo è a regime.
          </p>

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
              <button
                onClick={() => { salvaDurate(durate); setPannelloDurate(false) }}
                className="mt-3 rounded-lg bg-petrolio px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                Salva durate
              </button>
            </div>
          )}

          {/* asse temporale */}
          <div className="relative mt-4 h-5">
            {tacche.map((t) => (
              <span
                key={t}
                className="absolute -translate-x-1/2 text-[10px] text-inchiostro/40"
                style={{ left: `${((t - da) / ampiezza) * 100}%` }}
              >
                {dataBreve(t)}
              </span>
            ))}
          </div>

          <div className="mt-1 space-y-2">
            {attive.map((g) => (
              <RigaGantt key={g.pratica.id} g={g} da={da} ampiezza={ampiezza} adesso={adesso} />
            ))}
            {attive.length === 0 && (
              <p className="rounded-xl border border-linea bg-carta p-6 text-center text-sm text-inchiostro/40">
                Nessuna pratica in lavorazione{filtroTutor ? ` per ${filtroTutor}` : ''}.
              </p>
            )}
          </div>

          {completate.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setMostraCompletate(!mostraCompletate)}
                className="text-xs font-semibold text-inchiostro/50 hover:text-inchiostro"
              >
                {mostraCompletate ? '▾' : '▸'} Consegnate ({completate.length})
              </button>
              {mostraCompletate && (
                <div className="mt-2 space-y-2">
                  {completate.map((g) => (
                    <RigaGantt key={g.pratica.id} g={g} da={da} ampiezza={ampiezza} adesso={adesso} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
