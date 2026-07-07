'use client'

// ─── Area Commerciale — Elisa ───
// Carica gli AssessFirst dei dipendenti del cliente e, quando la cartella è completa,
// è LA SOLA a poter passare la pratica a Erogazione Copy.

import { useState } from 'react'
import { useApp, contaNotifiche } from '@/lib/store'
import { indiceFase, statoCartella, statoPerVenditore } from '@/lib/fasi'
import { Pratica } from '@/lib/types'
import RoleShell from '@/components/RoleShell'
import PraticaCard from '@/components/PraticaCard'
import EmptyState from '@/components/EmptyState'

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

const haTest = (p: Pratica, dipendente: string) =>
  p.allegati.some((a) => a.tipo === 'assessfirst' && a.dipendente === dipendente)

export default function PaginaElisa() {
  const { state, caricaAssessFirst, passaAErogazione } = useApp()
  // dipendenti deselezionati manualmente, per pratica (quelli senza test sono selezionati di default)
  const [esclusi, setEsclusi] = useState<Record<string, string[]>>({})
  // azienda appena consegnata a Erogazione Copy (per il banner di conferma)
  const [consegnata, setConsegnata] = useState<string | null>(null)

  const inRaccolta = state.pratiche.filter((p) => p.faseCorrente === 'raccolta-documenti')
  const consegnate = state.pratiche.filter((p) => indiceFase(p.faseCorrente) >= indiceFase('generazione'))

  const toggleDipendente = (praticaId: string, nome: string) =>
    setEsclusi((prev) => {
      const attuali = prev[praticaId] ?? []
      return {
        ...prev,
        [praticaId]: attuali.includes(nome) ? attuali.filter((n) => n !== nome) : [...attuali, nome],
      }
    })

  return (
    <RoleShell
      ruolo="Elisa"
      colore="bg-fuchsia-500"
      sottotitolo="AssessFirst dei dipendenti e passaggio a Erogazione Copy"
      notifiche={contaNotifiche(state, 'elisa')}
    >
      <div className="space-y-8">
        {/* Banner di conferma consegna */}
        {consegnata && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-green-300 bg-green-50 px-5 py-4 shadow-sm">
            <div>
              <p className="font-semibold text-green-800">✓ Cartella consegnata — Carlo è stato notificato</p>
              <p className="mt-0.5 text-sm text-green-700">
                La pratica di <strong>{consegnata}</strong> è passata a Erogazione Copy: la trovi qui sotto tra le
                cartelle consegnate.
              </p>
            </div>
            <button
              onClick={() => setConsegnata(null)}
              className="shrink-0 rounded-md px-2 py-1 text-sm text-green-700 transition hover:bg-green-100"
              aria-label="Chiudi avviso"
            >
              ✕
            </button>
          </div>
        )}

        {/* Cartelle da completare */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">Cartelle in raccolta documenti</h2>
            {inRaccolta.length > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-fuchsia-100 px-1.5 text-xs font-bold text-fuchsia-800">
                {inRaccolta.length}
              </span>
            )}
          </div>

          {inRaccolta.length === 0 ? (
            <EmptyState
              titolo="Nessuna cartella da completare"
              sottotitolo="Quando il venditore invia l'assessment a un nuovo cliente, la cartella comparirà qui."
              icona="🗂️"
            />
          ) : (
            inRaccolta.map((p) => {
              const cartella = statoCartella(p)
              const caricati = p.dipendenti.filter((d) => haTest(p, d))
              const mancanti = p.dipendenti.filter((d) => !haTest(p, d))
              const selezionati = mancanti.filter((d) => !(esclusi[p.id] ?? []).includes(d))

              return (
                <article key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  {/* Intestazione pratica */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900">{p.azienda}</h3>
                      <p className="truncate text-sm text-slate-500">
                        {p.cliente} · {p.email}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Creata il {dataIt(p.dataCreazione)} · Tutor: {p.tutor}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-full bg-fuchsia-100 px-2.5 py-0.5 text-xs font-medium text-fuchsia-800">
                      AssessFirst: {caricati.length}/{p.dipendenti.length}
                    </span>
                  </div>

                  {/* Elenco dipendenti con stato del test */}
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dipendenti del cliente
                    </h4>
                    <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
                      {p.dipendenti.map((d) =>
                        haTest(p, d) ? (
                          <li key={d} className="flex items-center justify-between bg-white px-3 py-2 text-sm">
                            <span className="text-slate-700">{d}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              ✓ caricato
                            </span>
                          </li>
                        ) : (
                          <li key={d} className="bg-white">
                            <label className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition hover:bg-fuchsia-50">
                              <span className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={!(esclusi[p.id] ?? []).includes(d)}
                                  onChange={() => toggleDipendente(p.id, d)}
                                  className="h-4 w-4 rounded border-slate-300 accent-fuchsia-600"
                                />
                                <span className="text-slate-700">{d}</span>
                              </span>
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                da caricare
                              </span>
                            </label>
                          </li>
                        )
                      )}
                    </ul>

                    {mancanti.length > 0 && (
                      <button
                        onClick={() => {
                          caricaAssessFirst(p.id, selezionati)
                          setEsclusi((prev) => ({ ...prev, [p.id]: [] }))
                        }}
                        disabled={selezionati.length === 0}
                        className="mt-3 w-full rounded-lg bg-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-fuchsia-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        ⬆ Carica AssessFirst selezionati ({selezionati.length})
                      </button>
                    )}
                  </div>

                  {/* Checklist completa della cartella (voci altrui in sola lettura) */}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Stato della cartella cliente
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {cartella.voci.map((v) => (
                        <li key={v.chiave} className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex items-center gap-2">
                            {v.fatto ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-300" />
                            )}
                            <span className={v.fatto ? 'text-slate-700' : 'text-slate-500'}>{v.label}</span>
                          </span>
                          <span className="shrink-0 text-xs text-slate-400">
                            {v.chiave === 'assessfirst' ? 'Elisa (tu)' : `${v.responsabile} · sola lettura`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Passaggio a Erogazione Copy — bottone riservato a Elisa */}
                  {cartella.completa ? (
                    <button
                      onClick={() => {
                        passaAErogazione(p.id)
                        setConsegnata(p.azienda)
                      }}
                      className="mt-5 w-full rounded-lg bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-green-700"
                    >
                      Passa a Erogazione Copy →
                      <span className="block text-xs font-normal opacity-80">
                        La cartella è completa: consegnala al team di produzione (solo tu puoi farlo)
                      </span>
                    </button>
                  ) : (
                    <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      ⏳ La cartella non è ancora completa: il passaggio a Erogazione Copy si sbloccherà quando tutte le
                      voci saranno spuntate.
                    </p>
                  )}
                </article>
              )
            })
          )}
        </section>

        {/* Cartelle consegnate a Erogazione Copy */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Consegnate</h2>
          {consegnate.length === 0 ? (
            <EmptyState
              titolo="Nessuna cartella consegnata"
              sottotitolo="Le cartelle passate a Erogazione Copy compariranno qui in sola lettura."
              icona="📦"
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {consegnate.map((p) => {
                const stato = statoPerVenditore(p.faseCorrente)
                return (
                  <PraticaCard
                    key={p.id}
                    pratica={p}
                    nascondiFase
                    azioni={
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stato.badge}`}>
                        {stato.label}
                      </span>
                    }
                  />
                )
              })}
            </div>
          )}
        </section>
      </div>
    </RoleShell>
  )
}
