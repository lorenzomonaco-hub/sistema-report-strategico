'use client'

// ─── Area Commerciale — Tutor ───
// Nuovo flusso a due persone: il Tutor registra la vendita, invia assessment e
// questionario al cliente, carica questionario e trascrizione e — quando tutto
// è presente — conferma i dati: la pratica Cliente pronto, che viene notificata.
// Dalle fasi successive in poi il Tutor vede solo i macro-stati commerciali,
// così può aggiornare il cliente senza entrare nella pipeline del team copy.

import { useState } from 'react'
import { useApp, contaNotifiche } from '@/lib/store'
import { documentiTutorPronti, indiceFase, statoCartella, statoCommerciale } from '@/lib/fasi'
import RoleShell from '@/components/RoleShell'
import PraticaCard from '@/components/PraticaCard'
import EmptyState from '@/components/EmptyState'
import { PersonaAF, Pratica, relazioneAF } from '@/lib/types'

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

const classiInput =
  'w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm text-inchiostro placeholder:text-inchiostro/35 transition focus:border-petrolio focus:outline-none focus:ring-2 focus:ring-petrolio/15'

/** Banner di conferma con chiusura manuale. */
function BannerConferma({ testo, onChiudi }: { testo: React.ReactNode; onChiudi: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
      <p className="text-sm text-green-800">{testo}</p>
      <button
        onClick={onChiudi}
        aria-label="Chiudi avviso"
        className="shrink-0 text-green-700/60 transition hover:text-green-800"
      >
        ✕
      </button>
    </div>
  )
}

/** Intestazione di sezione con conteggio. */
function TitoloSezione({ titolo, conteggio }: { titolo: string; conteggio?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="font-display text-xl font-bold tracking-tight text-inchiostro">{titolo}</h2>
      {conteggio && <span className="shrink-0 text-xs text-inchiostro/40">{conteggio}</span>}
    </div>
  )
}

/** Form inline di registrazione di una nuova vendita. */
function FormNuovaVendita({ onChiudi, onCreata }: { onChiudi: () => void; onCreata: (azienda: string) => void }) {
  const { creaPratica } = useApp()
  const [azienda, setAzienda] = useState('')
  const [cliente, setCliente] = useState('')
  const [email, setEmail] = useState('')
  const [dipendenti, setDipendenti] = useState<PersonaAF[]>([])
  const [nuovoNome, setNuovoNome] = useState('')
  const [nuovaQualifica, setNuovaQualifica] = useState<PersonaAF['qualifica']>('dipendente')
  const [nuovoRuolo, setNuovoRuolo] = useState('')
  const [errore, setErrore] = useState<string | null>(null)

  const aggiungiDipendente = () => {
    const nome = nuovoNome.trim()
    const ruolo = nuovoRuolo.trim()
    if (!nome) return
    if (!ruolo) {
      setErrore('Indica anche il ruolo operativo (serve al report AssessFirst).')
      return
    }
    if (dipendenti.some((d) => d.nome.toLowerCase() === nome.toLowerCase())) {
      setErrore('Questa persona è già in elenco.')
      return
    }
    setDipendenti([...dipendenti, { nome, qualifica: nuovaQualifica, ruolo }])
    setNuovoNome('')
    setNuovoRuolo('')
    setNuovaQualifica('dipendente')
    setErrore(null)
  }

  const registra = () => {
    if (!azienda.trim() || !cliente.trim() || !email.trim()) {
      setErrore('Azienda, cliente ed email sono obbligatori.')
      return
    }
    if (!email.includes('@')) {
      setErrore('Inserisci un indirizzo email valido.')
      return
    }
    if (dipendenti.length < 1) {
      setErrore('Aggiungi almeno una persona da valutare con AssessFirst.')
      return
    }
    creaPratica({ azienda: azienda.trim(), cliente: cliente.trim(), email: email.trim(), dipendenti })
    onCreata(azienda.trim())
    onChiudi()
  }

  return (
    <div className="card-sollevabile rounded-2xl border border-linea bg-carta p-5 shadow-sm">
      <h3 className="font-display font-bold tracking-tight text-inchiostro">Registra una nuova vendita</h3>
      <p className="mt-0.5 text-xs text-inchiostro/50">
        La pratica nasce nella fase «Vendita»: subito dopo potrai inviare assessment e questionario al cliente.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="nv-azienda" className="mb-1 block text-xs font-semibold text-inchiostro/60">
            Azienda *
          </label>
          <input
            id="nv-azienda"
            value={azienda}
            onChange={(e) => setAzienda(e.target.value)}
            placeholder="Es. Rossi S.r.l."
            className={classiInput}
          />
        </div>
        <div>
          <label htmlFor="nv-cliente" className="mb-1 block text-xs font-semibold text-inchiostro/60">
            Cliente *
          </label>
          <input
            id="nv-cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Nome e cognome del referente"
            className={classiInput}
          />
        </div>
        <div>
          <label htmlFor="nv-email" className="mb-1 block text-xs font-semibold text-inchiostro/60">
            Email *
          </label>
          <input
            id="nv-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@azienda.it"
            className={classiInput}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="nv-dipendente" className="mb-1 block text-xs font-semibold text-inchiostro/60">
          Persone da valutare con AssessFirst * (almeno una) — nomi ESATTI: finiscono sui report
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="nv-dipendente"
            value={nuovoNome}
            onChange={(e) => setNuovoNome(e.target.value)}
            placeholder="Nome e cognome"
            className={`${classiInput} min-w-40 flex-1`}
          />
          <select
            value={nuovaQualifica}
            onChange={(e) => setNuovaQualifica(e.target.value as PersonaAF['qualifica'])}
            aria-label="Qualifica"
            className={`${classiInput} w-36 shrink-0`}
          >
            <option value="titolare">Titolare</option>
            <option value="socio">Socio</option>
            <option value="dipendente">Dipendente</option>
          </select>
          <input
            value={nuovoRuolo}
            onChange={(e) => setNuovoRuolo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                aggiungiDipendente()
              }
            }}
            placeholder="Ruolo operativo (es. Venditore)"
            className={`${classiInput} min-w-44 flex-1`}
          />
          <button
            onClick={aggiungiDipendente}
            className="shrink-0 rounded-xl border border-linea bg-carta px-4 py-2.5 text-sm font-semibold text-inchiostro/70 transition hover:border-petrolio/40 hover:text-petrolio"
          >
            Aggiungi
          </button>
        </div>
        {dipendenti.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {dipendenti.map((d) => {
              const rel = relazioneAF({ dipendenti, cliente: cliente || '—' }, d)
              return (
                <li
                  key={d.nome}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm text-indigo-900"
                >
                  <span className="font-semibold">{d.nome}</span>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium capitalize text-indigo-700">
                    {d.qualifica}
                  </span>
                  <span className="text-indigo-800/70">{d.ruolo}</span>
                  <span className="ml-auto text-xs text-indigo-500">
                    report AF: caso {rel.caso} → {rel.destinatario}
                  </span>
                  <button
                    onClick={() => setDipendenti(dipendenti.filter((x) => x.nome !== d.nome))}
                    aria-label={`Rimuovi ${d.nome}`}
                    className="text-indigo-400 transition hover:text-indigo-700"
                  >
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {errore && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{errore}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={registra}
          className="rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro"
        >
          Registra la vendita
        </button>
        <button
          onClick={onChiudi}
          className="rounded-xl border border-linea bg-carta px-4 py-2.5 text-sm font-semibold text-inchiostro/60 transition hover:border-petrolio/40 hover:text-petrolio"
        >
          Annulla
        </button>
      </div>
    </div>
  )
}

/** Card di una vendita registrata, in attesa dell'invio al cliente. */
function CartaVendita({ pratica, onInviata }: { pratica: Pratica; onInviata: (azienda: string) => void }) {
  const { inviaAssessment } = useApp()

  return (
    <div className="card-sollevabile rounded-2xl border border-linea bg-carta p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-display font-bold tracking-tight text-inchiostro">{pratica.azienda}</h3>
          <p className="truncate text-sm text-inchiostro/50">
            {pratica.cliente} · {pratica.email}
          </p>
          <p className="mt-1 text-xs text-inchiostro/40">
            Vendita registrata il {dataIt(pratica.dataCreazione)} · {pratica.dipendenti.length}{' '}
            {pratica.dipendenti.length === 1 ? 'dipendente da valutare' : 'dipendenti da valutare'}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          Da inviare
        </span>
      </div>
      <button
        onClick={() => {
          inviaAssessment(pratica.id)
          onInviata(pratica.azienda)
        }}
        className="mt-4 w-full rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro"
      >
        Invia assessment + questionario
      </button>
    </div>
  )
}

/** Card di raccolta documenti: nel flusso v2 il tutor carica TUTTO
 *  (questionario, trascrizione e AssessFirst) e preme «Cliente pronto». */
function CartaRaccolta({ pratica, onConfermata }: { pratica: Pratica; onConfermata: (azienda: string) => void }) {
  const { caricaQuestionarioTrascrizione, caricaAssessFirst, clientePronto } = useApp()
  const vociTutor = statoCartella(pratica).voci
  const pronti = documentiTutorPronti(pratica)
  const afMancanti = pratica.dipendenti.filter(
    (d) => !pratica.allegati.some((a) => a.tipo === 'assessfirst' && a.dipendente === d.nome)
  )

  return (
    <div className="card-sollevabile rounded-2xl border border-linea bg-carta p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-display font-bold tracking-tight text-inchiostro">{pratica.azienda}</h3>
          <p className="truncate text-sm text-inchiostro/50">
            {pratica.cliente} · {pratica.email}
          </p>
          <p className="mt-1 text-xs text-inchiostro/40">
            Assessment inviato · {pratica.dipendenti.length}{' '}
            {pratica.dipendenti.length === 1 ? 'dipendente da valutare' : 'dipendenti da valutare'}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          Raccolta documenti
        </span>
      </div>

      {/* Le due voci a carico del Tutor */}
      <ul className="mt-4 space-y-1.5">
        {vociTutor.map((v) => (
          <li
            key={v.chiave}
            className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
              v.fatto ? 'border-green-200 bg-green-50/60' : 'border-indigo-100 bg-indigo-50/60'
            }`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              {v.fatto ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                  ✓
                </span>
              ) : (
                <span className="h-5 w-5 shrink-0 rounded-full border-2 border-indigo-200 bg-carta" />
              )}
              <span className={`truncate text-sm ${v.fatto ? 'text-green-800' : 'font-medium text-indigo-900'}`}>
                {v.label}
              </span>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                v.fatto ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {v.fatto ? 'Caricato' : 'Da caricare'}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2">
        {!pratica.allegati.some((a) => a.tipo === 'questionario') && (
          <button
            onClick={() => caricaQuestionarioTrascrizione(pratica.id)}
            className="w-full rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro"
          >
            Carica questionario + trascrizione
          </button>
        )}
        {afMancanti.length > 0 && (
          <button
            onClick={() => caricaAssessFirst(pratica.id, afMancanti.map((d) => d.nome))}
            className="w-full rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro"
          >
            Carica AssessFirst ({afMancanti.length} {afMancanti.length === 1 ? 'dipendente' : 'dipendenti'})
          </button>
        )}
        <button
          onClick={() => {
            clientePronto(pratica.id)
            onConfermata(pratica.azienda)
          }}
          disabled={!pronti}
          className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            pronti
              ? 'bg-ambra text-white hover:bg-amber-700'
              : 'cursor-not-allowed border border-linea bg-carta text-inchiostro/30'
          }`}
        >
          🚀 Cliente pronto — avvia la pipeline automatica
        </button>
        {!pronti && (
          <p className="text-xs text-inchiostro/40">
            Il bottone si attiva quando questionario, trascrizione e tutti gli AssessFirst sono caricati.
          </p>
        )}
      </div>
    </div>
  )
}

export default function PaginaTutor() {
  const { state } = useApp()
  const [formAperto, setFormAperto] = useState(false)
  const [aziendaCreata, setAziendaCreata] = useState<string | null>(null)
  const [aziendaInviata, setAziendaInviata] = useState<string | null>(null)
  const [aziendaConfermata, setAziendaConfermata] = useState<string | null>(null)

  const daInviare = state.pratiche.filter((p) => p.faseCorrente === 'vendita')
  const inRaccolta = state.pratiche.filter((p) => p.faseCorrente === 'raccolta-documenti')
  const inLavorazione = state.pratiche.filter((p) => indiceFase(p.faseCorrente) >= indiceFase('generazione'))

  return (
    <RoleShell
      ruolo="Tutor"
      colore="bg-indigo-500"
      sottotitolo="Vendita, documenti del cliente e avvio della pipeline automatica"
      notifiche={contaNotifiche(state, 'tutor')}
    >
      <div className="space-y-10">
        {/* 1. Nuova vendita */}
        <section className="anima anima-1">
          <TitoloSezione titolo="Nuova vendita" />
          <p className="mt-1 text-xs text-inchiostro/45">
            Registra la vendita con i dati del cliente e i dipendenti da valutare con AssessFirst.
          </p>
          <div className="mt-3 space-y-3">
            {aziendaCreata && (
              <BannerConferma
                testo={
                  <>
                    Vendita registrata per <strong>{aziendaCreata}</strong>: ora invia assessment e questionario al
                    cliente dalla sezione qui sotto.
                  </>
                }
                onChiudi={() => setAziendaCreata(null)}
              />
            )}
            {formAperto ? (
              <FormNuovaVendita onChiudi={() => setFormAperto(false)} onCreata={setAziendaCreata} />
            ) : (
              <button
                onClick={() => {
                  setFormAperto(true)
                  setAziendaCreata(null)
                }}
                className="rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro"
              >
                + Registra una vendita
              </button>
            )}
          </div>
        </section>

        {/* 2. Da inviare al cliente */}
        <section className="anima anima-2">
          <TitoloSezione titolo="Da inviare al cliente" conteggio={`${daInviare.length} in attesa di invio`} />
          <p className="mt-1 text-xs text-inchiostro/45">
            Vendite registrate: invia al cliente il collegamento all&rsquo;assessment e il questionario.
          </p>
          <div className="mt-3 space-y-4">
            {aziendaInviata && (
              <BannerConferma
                testo={
                  <>
                    ✓ Assessment e questionario inviati al cliente di <strong>{aziendaInviata}</strong>: la pratica è
                    passata alla raccolta documenti.
                  </>
                }
                onChiudi={() => setAziendaInviata(null)}
              />
            )}
            {daInviare.length === 0 ? (
              <EmptyState
                titolo="Nessuna vendita da inviare"
                sottotitolo="Registra una nuova vendita: la troverai qui, pronta per l'invio al cliente."
                icona="📮"
              />
            ) : (
              daInviare.map((p) => <CartaVendita key={p.id} pratica={p} onInviata={setAziendaInviata} />)
            )}
          </div>
        </section>

        {/* 3. Raccolta documenti */}
        <section className="anima anima-3">
          <TitoloSezione titolo="Raccolta documenti" conteggio={`${inRaccolta.length} in raccolta`} />
          <p className="mt-1 text-xs text-inchiostro/45">
            Carica questionario e trascrizione: quando tutto è presente, conferma e la pratica Cliente pronto.
          </p>
          <div className="mt-3 space-y-4">
            {aziendaConfermata && (
              <BannerConferma
                testo={
                  <>
                    Irene è stata notificata: prenderà in carico il blocco cliente di{' '}
                    <strong>{aziendaConfermata}</strong>.
                  </>
                }
                onChiudi={() => setAziendaConfermata(null)}
              />
            )}
            {inRaccolta.length === 0 ? (
              <EmptyState
                titolo="Nessuna pratica in raccolta documenti"
                sottotitolo="Dopo l'invio di assessment e questionario, la pratica comparirà qui per il caricamento dei documenti."
                icona="📂"
              />
            ) : (
              inRaccolta.map((p) => <CartaRaccolta key={p.id} pratica={p} onConfermata={setAziendaConfermata} />)
            )}
          </div>
        </section>

        {/* 4. In lavorazione (sola lettura, macro-stati) */}
        <section className="anima anima-4">
          <TitoloSezione titolo="In lavorazione" conteggio={`${inLavorazione.length} pratiche`} />
          <p className="mt-1 text-xs text-inchiostro/45">
            Da qui in poi lavorano Irene e il team copy: questi macro-stati ti bastano per aggiornare il cliente.
          </p>
          <div className="mt-3 space-y-3">
            {inLavorazione.length === 0 ? (
              <EmptyState
                titolo="Nessuna pratica in lavorazione"
                sottotitolo="Le pratiche confermate per Irene e quelle nella pipeline del team copy compariranno qui."
                icona="🗂️"
              />
            ) : (
              inLavorazione.map((p) => {
                const stato = statoCommerciale(p.faseCorrente)
                return (
                  <PraticaCard
                    key={p.id}
                    pratica={p}
                    nascondiFase
                    azioni={
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${stato.badge}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                        {stato.label}
                      </span>
                    }
                  />
                )
              })
            )}
          </div>
        </section>
      </div>
    </RoleShell>
  )
}
