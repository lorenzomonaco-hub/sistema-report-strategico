'use client'

// ─── Centro Apprendimento — il cuore del sistema che si auto-migliora ───
// Ogni revisione umana genera una proposta di miglioramento dei prompt.
// Nulla diventa attivo senza l'approvazione esplicita di Carlo.

import { useState } from 'react'
import { useApp } from '@/lib/store'
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
  { icona: '✅', titolo: 'Approvazione di Carlo', dettaglio: 'Il prompt viene aggiornato e versionato' },
]

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
      sottotitolo="Ogni revisione umana migliora i prompt — nulla diventa attivo senza l'approvazione di Carlo"
      notifiche={inAttesa.length}
    >
      <div className="space-y-8">
        {/* 1. Banner esplicativo del ciclo di apprendimento */}
        <section className="rounded-xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-purple-900">🧠 Come funziona il ciclo di apprendimento</h2>
          <div className="mt-4 overflow-x-auto pb-1">
            <div className="flex min-w-max items-stretch gap-0">
              {PASSI_CICLO.map((passo, i) => (
                <div key={passo.titolo} className="flex items-center">
                  {i > 0 && <div className="mx-2 text-lg text-purple-300">→</div>}
                  <div className="flex w-44 flex-col rounded-lg border border-purple-200 bg-white px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{passo.icona}</span>
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                        {i + 1}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-800">{passo.titolo}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{passo.dettaglio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-purple-700">
            Dopo l&apos;approvazione, il prompt interessato viene aggiornato e la modifica registrata nel changelog con una nuova versione.
          </p>
        </section>

        {/* 2. Riga statistiche */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">In attesa</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{inAttesa.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Approvati</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{approvati.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Scartati</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{scartati.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Prompt attivi</p>
            <p className="mt-1 text-2xl font-bold text-purple-600">{state.prompts.length}</p>
          </div>
        </section>

        {/* 3. Proposte in attesa di approvazione */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">Proposte in attesa di approvazione</h2>
            {inAttesa.length > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-800">
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
              <article key={a.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Intestazione */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
                  <h3 className="font-semibold text-slate-900">{a.praticaNome}</h3>
                  <StatusBadge fase={a.fase} />
                  <span className="text-xs text-slate-500">
                    Revisione di <span className="font-medium text-slate-700">{a.autoreRevisione}</span> · {dataOraIt(a.dataOra)}
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  {/* Lezione appresa */}
                  <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">💡 Lezione appresa</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{a.lezione}</p>
                    {a.note && (
                      <p className="mt-2 text-xs text-slate-500">
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
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">🎯 Prompt da migliorare</p>
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                        {a.promptTargetNome}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{a.miglioramentoProposto}</p>
                  </div>

                  {/* Azioni */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => approvaApprendimento(a.id)}
                      className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                    >
                      ✓ Approva miglioramento
                      <span className="block text-xs font-normal opacity-80">aggiorna versione e changelog del prompt</span>
                    </button>
                    <button
                      onClick={() => scartaApprendimento(a.id)}
                      className="flex-1 rounded-lg border-2 border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
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
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Registro Prompt</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {state.prompts.map((prompt) => (
              <article key={prompt.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">{prompt.nome}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Fase d&apos;uso: {prompt.faseUso}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
                    {prompt.versione}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">Ultima modifica: {dataOraIt(prompt.ultimaModifica)}</p>

                {/* Changelog come mini-timeline verticale */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Changelog</p>
                  <ol className="mt-3 space-y-0">
                    {[...prompt.changelog].reverse().map((voce, i, arr) => (
                      <li key={`${voce.versione}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                        {i < arr.length - 1 && <span className="absolute left-[5px] top-3 h-full w-px bg-slate-200" />}
                        <span className="relative mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-purple-400 bg-white" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700">
                            {voce.versione} <span className="font-normal text-slate-400">· {dataIt(voce.data)}</span>
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-slate-500">{voce.descrizione}</p>
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
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <button
            onClick={() => setStoricoAperto(!storicoAperto)}
            className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-slate-50"
          >
            <span className="flex items-center gap-2 font-semibold text-slate-900">
              🗂️ Storico decisioni
              <span className="text-xs font-normal text-slate-400">
                ({approvati.length} approvati · {scartati.length} scartati)
              </span>
            </span>
            <span className="text-sm text-slate-500">{storicoAperto ? '▲ Chiudi' : '▼ Apri'}</span>
          </button>

          {storicoAperto && (
            <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-5">
              {decisi.length === 0 ? (
                <p className="text-sm text-slate-500">Nessuna decisione presa finora.</p>
              ) : (
                decisi.map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
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
                      <span className="text-sm font-medium text-slate-800">{a.praticaNome}</span>
                      <StatusBadge fase={a.fase} />
                      <span className="text-xs text-slate-500">
                        {a.autoreRevisione} · {dataOraIt(a.dataOra)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Prompt interessato: <span className="font-medium text-slate-700">{a.promptTargetNome}</span>
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{a.lezione}</p>
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
