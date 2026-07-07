'use client'

// ─── Area Commerciale — Irene ───
// Prende i test AssessFirst caricati da Elisa e li inserisce in una chat con un
// prompt dedicato: il "Report AssessFirst del team" che ne esce serve a Carlo
// per iniziare il lavoro. Passaggio destinato a essere automatizzato.

import { useEffect, useRef, useState } from 'react'
import { useApp, contaNotifiche } from '@/lib/store'
import { Pratica } from '@/lib/types'
import RoleShell from '@/components/RoleShell'
import EmptyState from '@/components/EmptyState'

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

const contaTestCaricati = (p: Pratica) =>
  p.dipendenti.filter((d) => p.allegati.some((a) => a.tipo === 'assessfirst' && a.dipendente === d)).length

const tuttiTestPresenti = (p: Pratica) => p.dipendenti.length > 0 && contaTestCaricati(p) === p.dipendenti.length

const reportIrene = (p: Pratica) => p.allegati.find((a) => a.tipo === 'report-irene')

/** Intestazione compatta di una pratica (azienda, cliente, data). */
function IntestazionePratica({ pratica }: { pratica: Pratica }) {
  return (
    <div className="min-w-0">
      <h3 className="truncate font-semibold text-slate-900">{pratica.azienda}</h3>
      <p className="truncate text-sm text-slate-500">
        {pratica.cliente} · {pratica.email}
      </p>
      <p className="mt-1 text-xs text-slate-400">Creata il {dataIt(pratica.dataCreazione)}</p>
    </div>
  )
}

export default function PaginaIrene() {
  const { state, generaReportIrene } = useApp()
  // praticaId -> passo della generazione simulata (0 o 1); assente = nessuna generazione in corso
  const [generazione, setGenerazione] = useState<Record<string, number>>({})
  // anteprime del report aperte, per pratica
  const [anteprime, setAnteprime] = useState<Record<string, boolean>>({})

  const inRaccolta = state.pratiche.filter((p) => p.faseCorrente === 'raccolta-documenti')
  const inAttesaTest = inRaccolta.filter((p) => !tuttiTestPresenti(p) && !reportIrene(p))
  const pronte = inRaccolta.filter((p) => tuttiTestPresenti(p) && !reportIrene(p))
  const generate = inRaccolta.filter((p) => Boolean(reportIrene(p)))

  // id dei timeout attivi, per ripulirli allo smontaggio
  const timeoutRef = useRef<number[]>([])
  useEffect(() => {
    const timeouts = timeoutRef.current
    return () => timeouts.forEach((t) => window.clearTimeout(t))
  }, [])

  const avviaGenerazione = (praticaId: string) => {
    setGenerazione((prev) => ({ ...prev, [praticaId]: 0 }))
    timeoutRef.current.push(
      window.setTimeout(() => {
        setGenerazione((prev) => (praticaId in prev ? { ...prev, [praticaId]: 1 } : prev))
      }, 1100),
      window.setTimeout(() => {
        generaReportIrene(praticaId)
        setGenerazione((prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => id !== praticaId)))
      }, 2200)
    )
  }

  return (
    <RoleShell
      ruolo="Irene"
      colore="bg-violet-500"
      sottotitolo="Report AssessFirst del team — generato con il prompt dedicato"
      notifiche={contaNotifiche(state, 'irene')}
    >
      <div className="space-y-8">
        {/* Box esplicativo del passaggio */}
        <section className="rounded-xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-violet-900">💬 Come nasce il Report AssessFirst del team</h2>
          <p className="mt-2 text-sm leading-6 text-violet-800">
            Irene prende i test AssessFirst dei dipendenti (caricati da Elisa) e li inserisce in una chat con un{' '}
            <strong>prompt dedicato</strong>. Il report che ne esce — la sintesi del team del cliente — entra nella
            cartella cliente e serve a Carlo per iniziare il lavoro sul report strategico.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            ⚡ Questo passaggio verrà automatizzato dalla piattaforma
          </p>
        </section>

        {inRaccolta.length === 0 ? (
          <EmptyState
            titolo="Nessuna cartella in raccolta documenti"
            sottotitolo="Quando una pratica entra in raccolta documenti, la troverai qui divisa per stato di avanzamento."
            icona="🗂️"
          />
        ) : (
          <>
            {/* a) In attesa dei test di Elisa */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">In attesa dei test di Elisa</h2>
                {inAttesaTest.length > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-800">
                    {inAttesaTest.length}
                  </span>
                )}
              </div>
              {inAttesaTest.length === 0 ? (
                <EmptyState
                  titolo="Nessuna pratica in attesa"
                  sottotitolo="Tutti gli AssessFirst necessari risultano caricati."
                  icona="⏳"
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {inAttesaTest.map((p) => (
                    <article key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <IntestazionePratica pratica={p} />
                        <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          {contaTestCaricati(p)}/{p.dipendenti.length} test caricati
                        </span>
                      </div>
                      <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        In attesa che Elisa carichi i test mancanti — nessuna attività richiesta a te per ora.
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* b) Pronte per il report */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">Pronte per il report</h2>
                {pronte.length > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-100 px-1.5 text-xs font-bold text-violet-800">
                    {pronte.length}
                  </span>
                )}
              </div>
              {pronte.length === 0 ? (
                <EmptyState
                  titolo="Nessuna pratica pronta per il report"
                  sottotitolo="Quando tutti gli AssessFirst di una pratica saranno caricati, comparirà qui."
                  icona="✨"
                />
              ) : (
                pronte.map((p) => {
                  const passo = generazione[p.id]
                  const inCorso = passo !== undefined
                  return (
                    <article key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <IntestazionePratica pratica={p} />
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          ✓ {contaTestCaricati(p)}/{p.dipendenti.length} test presenti
                        </span>
                      </div>

                      {inCorso ? (
                        <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
                            <p className="text-sm font-medium text-violet-800">
                              {passo === 0 ? 'Inserimento dei test nella chat…' : 'Generazione della sintesi del team…'}
                            </p>
                          </div>
                          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-violet-100">
                            <div
                              className={`h-full rounded-full bg-violet-500 transition-all duration-1000 ${
                                passo === 0 ? 'w-1/3' : 'w-11/12'
                              }`}
                            />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => avviaGenerazione(p.id)}
                          className="mt-4 w-full rounded-lg bg-violet-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-violet-700"
                        >
                          ✨ Genera report AssessFirst (prompt)
                          <span className="block text-xs font-normal opacity-80">
                            i test vengono inseriti nella chat con il prompt dedicato
                          </span>
                        </button>
                      )}
                    </article>
                  )
                })
              )}
            </section>

            {/* c) Report generato */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">Report generato ✓</h2>
                {generate.length > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-green-100 px-1.5 text-xs font-bold text-green-800">
                    {generate.length}
                  </span>
                )}
              </div>
              {generate.length === 0 ? (
                <EmptyState
                  titolo="Nessun report generato finora"
                  sottotitolo="I report AssessFirst del team già generati compariranno qui con l'anteprima."
                  icona="📄"
                />
              ) : (
                generate.map((p) => {
                  const report = reportIrene(p)
                  const aperta = anteprime[p.id] === true
                  return (
                    <article key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <IntestazionePratica pratica={p} />
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                          ✓ Report generato
                        </span>
                      </div>

                      {report && (
                        <div className="mt-3 border-t border-slate-100 pt-3">
                          <button
                            onClick={() => setAnteprime((prev) => ({ ...prev, [p.id]: !aperta }))}
                            className="text-sm font-medium text-violet-700 transition hover:text-violet-900"
                          >
                            {aperta ? '▲ Nascondi anteprima' : `▼ Anteprima: ${report.nome}`}
                          </button>
                          {aperta && (
                            <div className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                              {report.contenuto}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  )
                })
              )}
            </section>
          </>
        )}
      </div>
    </RoleShell>
  )
}
