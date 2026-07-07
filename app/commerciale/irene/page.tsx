'use client'

// ─── Area Commerciale — Irene ───
// Irene riceve i blocchi cliente confermati dal tutor: scarica questionario e
// trascrizione, carica gli AssessFirst dei dipendenti, verifica la cartella,
// genera il report del team col prompt dedicato, lo ricontrolla e — quando il
// blocco è completo — lo invia a Erogazione Copy (Carlo viene notificato).

import { useEffect, useRef, useState } from 'react'
import { useApp, contaNotifiche } from '@/lib/store'
import { indiceFase, statoCartella, statoCommerciale } from '@/lib/fasi'
import { DocumentoAllegato, Pratica } from '@/lib/types'
import RoleShell from '@/components/RoleShell'
import EmptyState from '@/components/EmptyState'

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

const assessFirstCaricato = (p: Pratica, dipendente: string) =>
  p.allegati.some((a) => a.tipo === 'assessfirst' && a.dipendente === dipendente)

const tuttiAssessFirstPresenti = (p: Pratica) =>
  p.dipendenti.length > 0 && p.dipendenti.every((d) => assessFirstCaricato(p, d))

const reportDelTeam = (p: Pratica) => p.allegati.find((a) => a.tipo === 'report-irene')

/** Cerchietto numerato di un passo del percorso (verde con spunta quando è fatto). */
function NumeroPasso({ numero, fatto }: { numero: number; fatto: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        fatto ? 'bg-green-100 text-green-700' : 'bg-violet-100 text-violet-700'
      }`}
    >
      {fatto ? '✓' : numero}
    </span>
  )
}

/** Un passo numerato: cerchietto + titolo + contenuto. */
function Passo({
  numero,
  fatto,
  titolo,
  children,
}: {
  numero: number
  fatto: boolean
  titolo: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-3">
      <NumeroPasso numero={numero} fatto={fatto} />
      <div className="min-w-0 flex-1 pt-0.5">
        <h4 className="text-sm font-semibold text-inchiostro">{titolo}</h4>
        <div className="mt-2">{children}</div>
      </div>
    </li>
  )
}

/** Documento del tutor (questionario o trascrizione) con anteprima espandibile. */
function DocumentoTutor({ documento }: { documento: DocumentoAllegato }) {
  const [aperto, setAperto] = useState(false)
  return (
    <div className="rounded-xl border border-linea bg-carta">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-inchiostro">{documento.nome}</p>
          <p className="truncate text-xs text-inchiostro/40">
            Caricato da {documento.caricatoDa} il {dataIt(documento.dataCaricamento)}
          </p>
        </div>
        <button
          onClick={() => setAperto((v) => !v)}
          className="shrink-0 rounded-lg border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-petrolio transition hover:border-petrolio/40"
        >
          {aperto ? '▲ Chiudi' : '⬇ Scarica'}
        </button>
      </div>
      {aperto && (
        <div className="border-t border-linea px-3 py-2.5">
          <p className="max-h-56 overflow-y-auto rounded-lg bg-inchiostro/[0.03] p-3 text-xs leading-5 whitespace-pre-wrap text-inchiostro/70">
            {documento.contenuto ?? 'Contenuto non disponibile.'}
          </p>
          <p className="mt-1.5 text-xs text-inchiostro/40">download simulato — nel prototipo il documento si apre qui</p>
        </div>
      )}
    </div>
  )
}

/** Card-percorso di un blocco cliente in fase "report-irene": i sei passi di Irene. */
function BloccoCliente({ pratica, onInviato }: { pratica: Pratica; onInviato: (azienda: string) => void }) {
  const { caricaAssessFirst, generaReportIrene, aggiornaReportIrene, passaAErogazione } = useApp()

  // selezione dei dipendenti senza AssessFirst (default: tutti selezionati)
  const [selezione, setSelezione] = useState<Record<string, boolean>>({})
  // passo della generazione simulata: null = ferma, 0/1 = messaggio in corso
  const [passoGenerazione, setPassoGenerazione] = useState<number | null>(null)
  const [anteprimaAperta, setAnteprimaAperta] = useState(false)
  const [modificaAperta, setModificaAperta] = useState(false)
  const [testoModifica, setTestoModifica] = useState('')
  const [modificheSalvate, setModificheSalvate] = useState(false)

  // id dei setTimeout attivi, ripuliti allo smontaggio
  const timeoutRef = useRef<number[]>([])
  useEffect(() => {
    const timeouts = timeoutRef.current
    return () => timeouts.forEach((t) => window.clearTimeout(t))
  }, [])

  const documentiTutor = pratica.allegati.filter((a) => a.tipo === 'questionario' || a.tipo === 'trascrizione')
  const mancanti = pratica.dipendenti.filter((d) => !assessFirstCaricato(pratica, d))
  const selezionati = mancanti.filter((d) => selezione[d] !== false)
  const testCompleti = tuttiAssessFirstPresenti(pratica)
  const report = reportDelTeam(pratica)
  const cartella = statoCartella(pratica)
  const generazioneInCorso = passoGenerazione !== null

  const avviaGenerazione = () => {
    setPassoGenerazione(0)
    timeoutRef.current.push(
      window.setTimeout(() => setPassoGenerazione(1), 1000),
      window.setTimeout(() => {
        generaReportIrene(pratica.id)
        setPassoGenerazione(null)
      }, 2100)
    )
  }

  const apriModifica = () => {
    setTestoModifica(report?.contenuto ?? '')
    setModificaAperta(true)
    setModificheSalvate(false)
  }

  const salvaModifiche = () => {
    aggiornaReportIrene(pratica.id, testoModifica)
    setModificaAperta(false)
    setModificheSalvate(true)
  }

  return (
    <article className="rounded-2xl border border-linea bg-carta p-5 shadow-sm">
      {/* Intestazione del blocco */}
      <div className="flex items-start justify-between gap-4 border-b border-linea pb-4">
        <div className="min-w-0">
          <h3 className="font-display truncate text-lg font-bold tracking-tight text-inchiostro">{pratica.azienda}</h3>
          <p className="truncate text-sm text-inchiostro/50">
            {pratica.cliente} · {pratica.email}
          </p>
          <p className="mt-1 text-xs text-inchiostro/40">
            Confermato dal tutor {pratica.tutor} · creato il {dataIt(pratica.dataCreazione)} · {pratica.dipendenti.length}{' '}
            dipendenti da valutare
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          Preparazione Irene
        </span>
      </div>

      <ol className="mt-5 space-y-6">
        {/* 1. Documenti del tutor */}
        <Passo numero={1} fatto={documentiTutor.length > 0} titolo="Scarica i documenti del tutor">
          {documentiTutor.length === 0 ? (
            <p className="rounded-lg bg-inchiostro/[0.03] px-3 py-2 text-xs text-inchiostro/50">
              Nessun documento del tutor presente nel blocco cliente.
            </p>
          ) : (
            <div className="space-y-2">
              {documentiTutor.map((d) => (
                <DocumentoTutor key={d.id} documento={d} />
              ))}
            </div>
          )}
        </Passo>

        {/* 2. AssessFirst */}
        <Passo numero={2} fatto={testCompleti} titolo="Carica gli AssessFirst nel blocco cliente">
          <ul className="space-y-1.5">
            {pratica.dipendenti.map((d) => {
              const caricato = assessFirstCaricato(pratica, d)
              return (
                <li
                  key={d}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                    caricato ? 'border-green-200 bg-green-50' : 'border-linea bg-carta'
                  }`}
                >
                  {caricato ? (
                    <>
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                          ✓
                        </span>
                        <span className="truncate text-sm text-inchiostro">{d}</span>
                      </span>
                      <span className="shrink-0 text-xs font-medium text-green-700">caricato</span>
                    </>
                  ) : (
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selezione[d] !== false}
                        onChange={() => setSelezione((prev) => ({ ...prev, [d]: !(prev[d] !== false) }))}
                        className="h-4 w-4 shrink-0 accent-[#0d5c63]"
                      />
                      <span className="truncate text-sm text-inchiostro">{d}</span>
                      <span className="ml-auto shrink-0 text-xs text-inchiostro/40">da caricare</span>
                    </label>
                  )}
                </li>
              )
            })}
          </ul>
          {testCompleti ? (
            <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
              ✓ Tutti gli AssessFirst sono nel blocco cliente.
            </p>
          ) : (
            <button
              onClick={() => caricaAssessFirst(pratica.id, selezionati)}
              disabled={selezionati.length === 0}
              className="mt-2.5 rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro disabled:cursor-not-allowed disabled:opacity-40"
            >
              Carica AssessFirst selezionati ({selezionati.length})
            </button>
          )}
        </Passo>

        {/* 3. Verifica */}
        <Passo numero={3} fatto={cartella.completa} titolo="Verifica le informazioni">
          <ul className="space-y-1.5">
            {cartella.voci.map((v) => (
              <li
                key={v.chiave}
                className="flex items-center justify-between gap-3 rounded-lg border border-linea bg-carta px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {v.fatto ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                      ✓
                    </span>
                  ) : (
                    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-linea bg-carta" />
                  )}
                  <span className={`truncate text-sm ${v.fatto ? 'text-inchiostro' : 'text-inchiostro/50'}`}>{v.label}</span>
                </span>
                <span className="shrink-0 rounded-full bg-inchiostro/5 px-2 py-0.5 text-xs font-medium text-inchiostro/50">
                  {v.responsabile === 'Irene' ? 'Irene (tu)' : v.responsabile}
                </span>
              </li>
            ))}
          </ul>
        </Passo>

        {/* 4. Generazione col prompt */}
        <Passo numero={4} fatto={Boolean(report)} titolo="Genera il report col prompt">
          {report ? (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
              ✓ Report AssessFirst del team generato: lo trovi al passo successivo.
            </p>
          ) : generazioneInCorso ? (
            <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
                <p className="text-sm font-medium text-violet-800">
                  {passoGenerazione === 0 ? 'Inserimento dei test nella chat…' : 'Generazione della sintesi del team…'}
                </p>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-violet-100">
                <div
                  className={`h-full rounded-full bg-violet-500 transition-all duration-1000 ${
                    passoGenerazione === 0 ? 'w-1/3' : 'w-11/12'
                  }`}
                />
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={avviaGenerazione}
                disabled={!testCompleti}
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ✨ Genera il report col prompt
              </button>
              {!testCompleti && (
                <p className="mt-1.5 text-xs text-inchiostro/40">
                  Si attiva quando tutti gli AssessFirst sono nel blocco cliente.
                </p>
              )}
            </>
          )}
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800">
            ⚡ Questo passaggio verrà automatizzato dalla piattaforma
          </p>
        </Passo>

        {/* 5. Ricontrollo */}
        <Passo numero={5} fatto={Boolean(report)} titolo="Ricontrolla e sistema">
          {!report ? (
            <p className="rounded-lg bg-inchiostro/[0.03] px-3 py-2 text-xs text-inchiostro/50">
              Il report comparirà qui dopo la generazione.
            </p>
          ) : modificaAperta ? (
            <div className="space-y-2">
              <textarea
                value={testoModifica}
                onChange={(e) => setTestoModifica(e.target.value)}
                className="h-64 w-full rounded-xl border border-linea bg-carta p-3 font-mono text-xs leading-5 text-inchiostro focus:border-petrolio/40 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={salvaModifiche}
                  className="rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro"
                >
                  Salva le modifiche
                </button>
                <button
                  onClick={() => setModificaAperta(false)}
                  className="rounded-xl border border-linea bg-carta px-4 py-2.5 text-sm font-semibold text-inchiostro/60 transition hover:border-petrolio/40"
                >
                  Annulla
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setAnteprimaAperta((v) => !v)}
                  className="rounded-lg border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-petrolio transition hover:border-petrolio/40"
                >
                  {anteprimaAperta ? '▲ Nascondi anteprima' : `▼ Anteprima: ${report.nome}`}
                </button>
                <button
                  onClick={apriModifica}
                  className="rounded-lg border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-petrolio transition hover:border-petrolio/40"
                >
                  ✎ Modifica il report
                </button>
              </div>
              {modificheSalvate && (
                <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                  ✓ Modifiche salvate nel blocco cliente.
                </p>
              )}
              {anteprimaAperta && (
                <p className="max-h-56 overflow-y-auto rounded-lg bg-inchiostro/[0.03] p-3 text-xs leading-5 whitespace-pre-wrap text-inchiostro/70">
                  {report.contenuto}
                </p>
              )}
            </div>
          )}
        </Passo>

        {/* 6. Invio a Erogazione Copy */}
        <Passo numero={6} fatto={false} titolo="Invia a Erogazione Copy">
          <button
            onClick={() => {
              passaAErogazione(pratica.id)
              onInviato(pratica.azienda)
            }}
            disabled={!cartella.completa}
            className="w-full rounded-xl bg-ambra px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ✓ Completo — invia a Erogazione Copy
          </button>
          {!cartella.completa && (
            <p className="mt-1.5 text-xs text-inchiostro/40">
              Si attiva quando tutte le voci della verifica al passo 3 sono complete.
            </p>
          )}
        </Passo>
      </ol>
    </article>
  )
}

export default function PaginaIrene() {
  const { state } = useApp()
  // azienda dell'ultimo blocco inviato, per la conferma verde
  const [aziendaInviata, setAziendaInviata] = useState<string | null>(null)

  const daPreparare = state.pratiche.filter((p) => p.faseCorrente === 'report-irene')
  const inviate = state.pratiche.filter((p) => indiceFase(p.faseCorrente) >= indiceFase('generazione'))

  return (
    <RoleShell
      ruolo="Irene"
      colore="bg-violet-500"
      sottotitolo="AssessFirst, report del team e invio a Erogazione Copy"
      notifiche={contaNotifiche(state, 'irene')}
    >
      <div className="space-y-8">
        {/* Banner di notifica: blocchi confermati dal tutor */}
        {daPreparare.length > 0 && (
          <div className="anima anima-1 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ambra text-sm font-bold text-white">
              {daPreparare.length}
            </span>
            <p className="text-sm font-semibold text-amber-900">
              {daPreparare.length === 1
                ? 'Il tutor ha confermato 1 blocco cliente: è pronto per te.'
                : `Il tutor ha confermato ${daPreparare.length} blocchi cliente: sono pronti per te.`}
            </p>
          </div>
        )}

        {/* Conferma verde dopo l'invio */}
        {aziendaInviata && (
          <div className="anima anima-1 flex items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
            <p className="text-sm font-semibold text-green-800">
              ✓ <strong>{aziendaInviata}</strong>: blocco cliente inviato — Carlo è stato notificato.
            </p>
            <button
              onClick={() => setAziendaInviata(null)}
              className="shrink-0 text-xs font-medium text-green-700 transition hover:text-green-900"
            >
              Chiudi
            </button>
          </div>
        )}

        {/* Blocchi cliente da preparare */}
        <section className="anima anima-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight text-inchiostro">Blocchi cliente da preparare</h2>
            <span className="text-xs text-inchiostro/40">{daPreparare.length} in lavorazione</span>
          </div>
          <div className="mt-4 space-y-5">
            {daPreparare.length === 0 ? (
              <EmptyState
                titolo="Nessun blocco cliente da preparare"
                sottotitolo="Quando il tutor conferma che i dati di una vendita sono completi, il blocco comparirà qui."
                icona="🗂️"
              />
            ) : (
              daPreparare.map((p) => <BloccoCliente key={p.id} pratica={p} onInviato={setAziendaInviata} />)
            )}
          </div>
        </section>

        {/* Inviate a Erogazione Copy */}
        <section className="anima anima-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight text-inchiostro">Inviate a Erogazione Copy</h2>
            <span className="text-xs text-inchiostro/40">{inviate.length} blocchi</span>
          </div>
          <div className="mt-4 space-y-3">
            {inviate.length === 0 ? (
              <EmptyState
                titolo="Nessun blocco inviato"
                sottotitolo="I blocchi cliente completati e inviati a Erogazione Copy compariranno qui."
                icona="📦"
              />
            ) : (
              inviate.map((p) => {
                const stato = statoCommerciale(p.faseCorrente)
                return (
                  <article
                    key={p.id}
                    className="card-sollevabile flex items-center justify-between gap-4 rounded-2xl border border-linea bg-carta px-5 py-3.5 shadow-sm"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-inchiostro">{p.azienda}</h3>
                      <p className="truncate text-xs text-inchiostro/50">
                        {p.cliente} · creato il {dataIt(p.dataCreazione)} · {p.dipendenti.length} dipendenti
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${stato.badge}`}>
                      {stato.label}
                    </span>
                  </article>
                )
              })
            )}
          </div>
        </section>
      </div>
    </RoleShell>
  )
}
