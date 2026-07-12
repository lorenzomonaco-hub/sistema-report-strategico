'use client'

// ─── Centro Apprendimento — il cuore del sistema che si auto-migliora ───
// Ogni revisione umana genera una proposta di miglioramento dei prompt.
// Nulla diventa attivo senza l'approvazione esplicita del Team Copy.

import { useEffect, useState } from 'react'
import { useApp } from '@/lib/store'
import {
  CHIAVE_TOKEN_VISUAL,
  aggiungiLezioneVisual,
  cancellaLezioneOnline,
  leggiApprendimentoOnline,
  leggiLezioniOnline,
  listaApprendimentiOnline,
} from '@/lib/visualblocco'
import RoleShell from '@/components/RoleShell'
import StatusBadge from '@/components/StatusBadge'
import DiffView from '@/components/DiffView'
import EmptyState from '@/components/EmptyState'

const dataOraIt = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

const PASSI_CICLO = [
  { icona: '✍️', titolo: 'Revisione umana', dettaglio: 'Un revisore corregge il documento' },
  { icona: '🔍', titolo: 'Confronto prima/dopo', dettaglio: 'Il sistema analizza la differenza' },
  { icona: '💡', titolo: 'Lezione estratta', dettaglio: 'La correzione diventa una regola' },
  { icona: '📝', titolo: 'Proposta miglioramento prompt', dettaglio: 'Il prompt a monte viene rivisto' },
  { icona: '✅', titolo: 'Approvazione del Team Copy', dettaglio: 'Il prompt viene aggiornato e versionato' },
]

/** La MEMORIA ONLINE dell'Agente Visual: vive sul server del blocco (come la
 *  KB del progetto sales) e viene caricata da OGNI generazione. Da qui si
 *  consulta e si governa: una lezione sbagliata si elimina con un click. */
function MemoriaVisualOnline() {
  const [token, setToken] = useState('')
  const [lezioni, setLezioni] = useState<string[] | null>(null)
  const [report, setReport] = useState<string[] | null>(null)
  const [aperto, setAperto] = useState('')
  const [contenuto, setContenuto] = useState('')
  const [errore, setErrore] = useState('')
  const [nuovaLezione, setNuovaLezione] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- token condiviso dei blocchi
    setToken(localStorage.getItem(CHIAVE_TOKEN_VISUAL) ?? localStorage.getItem('worker-grafica-token') ?? '')
  }, [])

  const carica = (t: string) => {
    setErrore('')
    Promise.all([leggiLezioniOnline(t), listaApprendimentiOnline(t)])
      .then(([lez, rep]) => {
        setLezioni(lez)
        setReport(rep)
      })
      .catch((e) => setErrore(e instanceof Error ? e.message : 'collegamento fallito'))
  }

  useEffect(() => {
    if (token) carica(token)
  }, [token])

  return (
    <section className="anima anima-2 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold tracking-tight text-cyan-900">
            🧠 Memoria viva dell&apos;Agente Visual (online)
          </h2>
          <p className="mt-1 text-sm text-cyan-900/70">
            Vive sul server del blocco e viene caricata da <strong>ogni generazione</strong>. I report del
            revisore si accumulano qui a ogni giro del loop 6↔7 — per sempre.
          </p>
        </div>
        {!lezioni && (
          <input
            type="password"
            value={token}
            onChange={(e) => {
              setToken(e.target.value)
              localStorage.setItem(CHIAVE_TOKEN_VISUAL, e.target.value)
            }}
            placeholder="token dei blocchi"
            className="w-56 rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none"
          />
        )}
      </div>

      {errore && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{errore}</p>}

      {lezioni && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-inchiostro">Lezioni attive ({lezioni.length}) — caricate da ogni regia</h3>
          <div className="mt-2 flex gap-2">
            <input
              value={nuovaLezione}
              onChange={(e) => setNuovaLezione(e.target.value)}
              maxLength={500}
              placeholder="Aggiungi una regola tua, es. «Meno tabelle: preferisci sempre grafici e cards»"
              className="flex-1 rounded-xl border border-cyan-200 bg-carta px-3 py-2 text-xs focus:border-petrolio focus:outline-none"
            />
            <button
              disabled={nuovaLezione.trim().length < 10}
              onClick={() => {
                aggiungiLezioneVisual(token, nuovaLezione.trim())
                  .then(() => { setNuovaLezione(''); carica(token) })
                  .catch((e) => setErrore(String(e)))
              }}
              className="shrink-0 rounded-xl bg-cyan-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-30"
            >
              + Aggiungi
            </button>
          </div>
          <ul className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
            {lezioni.map((l, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl border border-cyan-100 bg-carta px-3 py-2 text-xs leading-5 text-inchiostro/80">
                <span className="flex-1">{l}</span>
                <button
                  onClick={() => {
                    if (!window.confirm('Eliminare questa lezione dalla memoria del Visual?')) return
                    cancellaLezioneOnline(token, i)
                      .then(() => carica(token))
                      .catch((e) => setErrore(String(e)))
                  }}
                  aria-label="Elimina lezione"
                  className="shrink-0 text-rose-400 transition hover:text-rose-700"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-inchiostro">Archivio report del revisore ({report.length})</h3>
          {report.length === 0 ? (
            <p className="mt-1 text-xs text-inchiostro/50">
              Ancora vuoto: si riempie a ogni giro del loop dalla prossima generazione.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {report.map((n) => (
                <button
                  key={n}
                  onClick={() =>
                    aperto === n
                      ? (setAperto(''), setContenuto(''))
                      : leggiApprendimentoOnline(token, n)
                          .then((c) => {
                            setAperto(n)
                            setContenuto(c)
                          })
                          .catch((e) => setErrore(String(e)))
                  }
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                    aperto === n
                      ? 'border-cyan-400 bg-cyan-100 text-cyan-900'
                      : 'border-linea bg-carta text-inchiostro/60 hover:border-petrolio/40 hover:text-petrolio'
                  }`}
                >
                  📋 {n.replace('.md', '')}
                </button>
              ))}
            </div>
          )}
          {contenuto && (
            <pre className="mt-3 max-h-80 overflow-y-auto rounded-xl bg-linea/30 p-4 text-xs leading-5 whitespace-pre-wrap text-inchiostro/80">
              {contenuto}
            </pre>
          )}
        </div>
      )}
    </section>
  )
}

export default function PaginaCentroApprendimento() {
  const { state, approvaApprendimento, scartaApprendimento } = useApp()
  const [diffAperti, setDiffAperti] = useState<Record<string, boolean>>({})
  const [storicoAperto, setStoricoAperto] = useState(false)

  const inAttesa = state.apprendimenti.filter((a) => a.stato === 'in_attesa')
  const approvati = state.apprendimenti.filter((a) => a.stato === 'approvato')
  const scartati = state.apprendimenti.filter((a) => a.stato === 'scartato')
  const decisi = state.apprendimenti.filter((a) => a.stato !== 'in_attesa')

  const toggleDiff = (id: string) => setDiffAperti((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <RoleShell
      ruolo="Centro Apprendimento"
      colore="bg-purple-600"
      sottotitolo="Ogni revisione umana migliora i prompt — nulla diventa attivo senza l'approvazione del Team Copy"
      notifiche={inAttesa.length}
    >
      <div className="space-y-8">
        {/* 1. Banner esplicativo del ciclo di apprendimento */}
        <section className="anima anima-1 rounded-2xl border border-purple-200 bg-purple-50/70 p-5 shadow-sm">
          <h2 className="font-display text-base font-bold tracking-tight text-purple-900">🧠 Come funziona il ciclo di apprendimento</h2>
          <div className="mt-4 overflow-x-auto pb-1">
            <div className="flex min-w-max items-stretch gap-0">
              {PASSI_CICLO.map((passo, i) => (
                <div key={passo.titolo} className="flex items-center">
                  {i > 0 && <div className="mx-2 text-lg text-purple-300">→</div>}
                  <div className="flex w-44 flex-col rounded-xl border border-purple-200 bg-carta px-3 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{passo.icona}</span>
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                        {i + 1}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-inchiostro">{passo.titolo}</p>
                    <p className="mt-0.5 text-xs text-inchiostro/50">{passo.dettaglio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-purple-700">
            Dopo l&apos;approvazione, il prompt interessato viene aggiornato e la modifica registrata nel changelog con una nuova versione.
          </p>
        </section>

        <MemoriaVisualOnline />

        {/* 2. Riga statistiche */}
        <section className="anima anima-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-linea bg-carta p-4 shadow-sm">
            <p className="text-xs font-medium text-inchiostro/50">In attesa</p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight text-ambra">{inAttesa.length}</p>
          </div>
          <div className="rounded-2xl border border-linea bg-carta p-4 shadow-sm">
            <p className="text-xs font-medium text-inchiostro/50">Approvati</p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight text-green-600">{approvati.length}</p>
          </div>
          <div className="rounded-2xl border border-linea bg-carta p-4 shadow-sm">
            <p className="text-xs font-medium text-inchiostro/50">Scartati</p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight text-red-600">{scartati.length}</p>
          </div>
          <div className="rounded-2xl border border-linea bg-carta p-4 shadow-sm">
            <p className="text-xs font-medium text-inchiostro/50">Prompt attivi</p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight text-purple-600">{state.prompts.length}</p>
          </div>
        </section>

        {/* 3. Proposte in attesa di approvazione */}
        <section className="anima anima-3 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">Proposte in attesa di approvazione</h2>
            {inAttesa.length > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ambra px-1.5 text-xs font-bold text-white">
                {inAttesa.length}
              </span>
            )}
          </div>

          {inAttesa.length === 0 ? (
            <EmptyState
              titolo="Nessuna proposta in attesa — il sistema è allineato"
              sottotitolo="Le prossime revisioni umane genereranno nuove proposte di miglioramento dei prompt."
              icona="🧠"
            />
          ) : (
            inAttesa.map((a) => (
              <article key={a.id} className="overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm">
                {/* Intestazione */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-linea bg-linea/30 px-5 py-3">
                  <h3 className="font-display font-bold tracking-tight text-inchiostro">{a.praticaNome}</h3>
                  <StatusBadge fase={a.fase} />
                  <span className="text-xs text-inchiostro/50">
                    Revisione di <span className="font-medium text-inchiostro/80">{a.autoreRevisione}</span> · {dataOraIt(a.dataOra)}
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  {/* Lezione appresa */}
                  <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">💡 Lezione appresa</p>
                    <p className="mt-1 text-sm leading-6 text-inchiostro/80">{a.lezione}</p>
                    {a.note && (
                      <p className="mt-2 text-xs text-inchiostro/50">
                        Nota del revisore: <span className="italic">&quot;{a.note}&quot;</span>
                      </p>
                    )}
                  </div>

                  {/* Confronto prima/dopo (collassabile) */}
                  <div>
                    <button
                      onClick={() => toggleDiff(a.id)}
                      className="text-sm font-medium text-purple-700 transition hover:text-purple-900"
                    >
                      {diffAperti[a.id] ? '▲ Nascondi confronto prima/dopo' : '▼ Mostra confronto prima/dopo'}
                    </button>
                    {diffAperti[a.id] && (
                      <div className="mt-3">
                        <DiffView prima={a.testoPrima} dopo={a.testoDopo} />
                      </div>
                    )}
                  </div>

                  {/* Prompt da migliorare */}
                  <div className="rounded-xl border border-linea bg-linea/20 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/60">🎯 Prompt da migliorare</p>
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                        {a.promptTargetNome}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-inchiostro/80">{a.miglioramentoProposto}</p>
                  </div>

                  {/* Azioni */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => approvaApprendimento(a.id)}
                      className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                    >
                      ✓ Approva miglioramento
                      <span className="block text-xs font-normal opacity-80">aggiorna versione e changelog del prompt</span>
                    </button>
                    <button
                      onClick={() => scartaApprendimento(a.id)}
                      className="flex-1 rounded-xl border-2 border-red-300 bg-carta px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      ✕ Scarta
                      <span className="block text-xs font-normal opacity-70">la proposta non modificherà i prompt</span>
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {/* 4. Registro Prompt */}
        <section className="anima anima-4 space-y-4">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">Registro Prompt</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {state.prompts.map((prompt) => (
              <article key={prompt.id} className="card-sollevabile rounded-2xl border border-linea bg-carta p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display font-bold tracking-tight text-inchiostro">{prompt.nome}</h3>
                    <p className="mt-0.5 text-xs text-inchiostro/50">Fase d&apos;uso: {prompt.faseUso}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
                    {prompt.versione}
                  </span>
                </div>
                <p className="mt-2 text-xs text-inchiostro/40">Ultima modifica: {dataOraIt(prompt.ultimaModifica)}</p>

                {/* Changelog come mini-timeline verticale */}
                <div className="mt-4 border-t border-linea pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/50">Changelog</p>
                  <ol className="mt-3 space-y-0">
                    {[...prompt.changelog].reverse().map((voce, i, arr) => (
                      <li key={`${voce.versione}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                        {i < arr.length - 1 && <span className="absolute left-[5px] top-3 h-full w-px bg-linea" />}
                        <span className="relative mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-purple-400 bg-carta" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-inchiostro/80">
                            {voce.versione} <span className="font-normal text-inchiostro/40">· {dataIt(voce.data)}</span>
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-inchiostro/50">{voce.descrizione}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 5. Storico decisioni (collassabile) */}
        <section className="anima anima-5 overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm">
          <button
            onClick={() => setStoricoAperto(!storicoAperto)}
            className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-linea/20"
          >
            <span className="flex items-center gap-2 font-display font-bold tracking-tight text-inchiostro">
              🗂️ Storico decisioni
              <span className="font-sans text-xs font-normal tracking-normal text-inchiostro/40">
                ({approvati.length} approvati · {scartati.length} scartati)
              </span>
            </span>
            <span className="text-sm text-inchiostro/50">{storicoAperto ? '▲ Chiudi' : '▼ Apri'}</span>
          </button>

          {storicoAperto && (
            <div className="space-y-3 border-t border-linea bg-linea/20 p-5">
              {decisi.length === 0 ? (
                <p className="text-sm text-inchiostro/50">Nessuna decisione presa finora.</p>
              ) : (
                decisi.map((a) => (
                  <div key={a.id} className="rounded-xl border border-linea bg-carta px-4 py-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      {a.stato === 'approvato' ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                          ✓ Approvato
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                          ✕ Scartato
                        </span>
                      )}
                      <span className="text-sm font-medium text-inchiostro/80">{a.praticaNome}</span>
                      <StatusBadge fase={a.fase} />
                      <span className="text-xs text-inchiostro/50">
                        {a.autoreRevisione} · {dataOraIt(a.dataOra)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-inchiostro/50">
                      Prompt interessato: <span className="font-medium text-inchiostro/80">{a.promptTargetNome}</span>
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-inchiostro/50">{a.lezione}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </RoleShell>
  )
}
