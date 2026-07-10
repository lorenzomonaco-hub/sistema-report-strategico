'use client'

// ─── Scheda progetto (Erogazione Copy) ───
// Pagina stile Notion: tutto il lavoro su una pratica avviene qui.
// A sinistra la lavorazione della fase corrente, a destra la cartella cliente
// sempre visibile (durante le call il Team Copy deve vedere subito tutti i documenti).

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useApp, contaNotifiche } from '@/lib/store'
import { faseById, indiceFase, statoCartella } from '@/lib/fasi'
import { batteriaPerTipo, ETICHETTA_TIPO } from '@/lib/batterie'
import {
  CHIAVE_TOKEN_WORKER,
  ETICHETTA_CHECK,
  ETICHETTA_PASSO,
  StatoJobGrafica,
  creaJobGrafica,
  leggiControlloGrafica,
  meseCorrente,
  scaricaPdfGrafica,
  statoJobGrafica,
} from '@/lib/grafica'
import { DocumentoAllegato, FaseId, Pratica, TipoDocumento, TipoLavoro } from '@/lib/types'
import RoleShell from '@/components/RoleShell'
import StatusBadge from '@/components/StatusBadge'
import PipelineStepper from '@/components/PipelineStepper'
import ReviewPanel from '@/components/ReviewPanel'
import EmptyState from '@/components/EmptyState'

// ─── Helper di formattazione date ───

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

const dataOraIt = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome',
  })

// ─── Cartella cliente (colonna destra) ───

const ORDINE_TIPI: TipoDocumento[] = ['questionario', 'trascrizione', 'assessfirst', 'report-af', 'unificato', 'report']

const ICONE: Record<TipoDocumento, string> = {
  questionario: '📋',
  trascrizione: '🎙',
  assessfirst: '👤',
  'report-af': '📊',
  unificato: '📄',
  report: '📑',
}

function etichettaDocumento(a: DocumentoAllegato): string {
  switch (a.tipo) {
    case 'questionario':
      return 'Questionario'
    case 'trascrizione':
      return 'Trascrizione analisi'
    case 'assessfirst':
      return `AssessFirst — ${a.dipendente ?? a.nome}`
    case 'report-af':
      return `Report AssessFirst — ${a.dipendente ?? a.nome}`
    case 'unificato':
      return 'Documento unificato'
    case 'report':
      return 'Report strategico'
    default:
      return a.nome
  }
}

interface VoceCartella {
  id: string
  icona: string
  etichetta: string
  caricatoDa: string
  data: string
  contenuto?: string
}

function CartellaCliente({ pratica }: { pratica: Pratica }) {
  const [docApertoId, setDocApertoId] = useState<string | null>(null)

  const allegatiOrdinati = [...pratica.allegati].sort(
    (a, b) => ORDINE_TIPI.indexOf(a.tipo) - ORDINE_TIPI.indexOf(b.tipo)
  )

  const voci: VoceCartella[] = allegatiOrdinati.map((a) => ({
    id: a.id,
    icona: ICONE[a.tipo],
    etichetta: etichettaDocumento(a),
    caricatoDa: a.caricatoDa,
    data: a.dataCaricamento,
    contenuto: a.contenuto,
  }))

  // Il documento unificato prodotto dal Team Copy vive tra le versioni: va mostrato
  // in cartella perché durante le call serve avere tutto sotto mano.
  const unificato = pratica.versioni.find((v) => v.etichetta === 'Documento unificato')
  if (unificato && !pratica.allegati.some((a) => a.tipo === 'unificato')) {
    voci.push({
      id: unificato.id,
      icona: ICONE.unificato,
      etichetta: 'Documento unificato',
      caricatoDa: unificato.autore,
      data: unificato.dataOra,
      contenuto: unificato.contenuto,
    })
  }

  return (
    <aside className="anima anima-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto">
      <div className="rounded-2xl border border-linea bg-carta p-5 shadow-sm">
        <h3 className="font-display flex items-center gap-2 text-lg font-bold tracking-tight text-inchiostro">
          📁 Cartella cliente
        </h3>
        <p className="mt-1 text-xs text-inchiostro/40">
          Tutti i documenti del cliente, sempre a portata di mano anche durante le call.
        </p>

        {voci.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-linea bg-inchiostro/[0.03] px-3 py-4 text-center text-xs text-inchiostro/40">
            Nessun documento ancora presente in cartella.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {voci.map((voce) => {
              const aperto = docApertoId === voce.id
              return (
                <li key={voce.id} className={`rounded-xl border ${aperto ? 'border-petrolio/40' : 'border-linea/70'}`}>
                  <button
                    onClick={() => setDocApertoId(aperto ? null : voce.id)}
                    className="w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-inchiostro/[0.03]"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-base leading-5">{voce.icona}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-inchiostro/80">{voce.etichetta}</p>
                        <p className="mt-0.5 text-xs text-inchiostro/40">
                          {voce.caricatoDa} · {dataIt(voce.data)}
                        </p>
                      </div>
                      <span className="text-xs text-inchiostro/30">{aperto ? '▲' : '▼'}</span>
                    </div>
                  </button>
                  {aperto && (
                    <div className="border-t border-linea p-2">
                      <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl bg-inchiostro/[0.04] p-3 text-xs leading-5 text-inchiostro/70">
                        {voce.contenuto ?? 'Anteprima non disponibile per questo documento.'}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}

// ─── Step autonomi: nessuna azione umana, solo avanzamento della pipeline ───

const DESCRIZIONE_STEP: Partial<Record<FaseId, { titolo: string; punti: string[] }>> = {
  generazione: {
    titolo: 'Generazione — sistema di Christian',
    punti: [
      'Il sistema determina il tipo di lavoro (Consulenza / Branding) e genera il documento con la batteria di prompt.',
      'In parallelo parte lo step 4a: un report AssessFirst per ogni dipendente + email al tutor (Irene supervisiona).',
    ],
  },
  revisione: {
    titolo: 'Revisione — sistema di Christian',
    punti: ['Il revisore integrato dal GitHub di Christian revisiona il documento generato e lo passa avanti.'],
  },
  visual: {
    titolo: 'Diagrammi e tabelle — Agente Visual',
    punti: ['L\'agente inserisce tabelle, diagrammi e grafici (17 famiglie) dove migliorano la comprensione.'],
  },
  'revisione-diagrammi': {
    titolo: 'Revisione diagrammi — loop automatico',
    punti: [
      'Il revisore controlla ogni diagramma e RIMANDA al Visual finché non è perfetto.',
      'Ogni rimando produce una lezione: il sistema impara da solo (registro apprendimenti).',
    ],
  },
  impaginazione: {
    titolo: 'Impaginazione — motore fase 8',
    punti: ['Il worker su Railway impagina il documento nel modello grafico e produce il PDF.'],
  },
  'revisione-impaginazione': {
    titolo: 'Revisione impaginazione',
    punti: ['Il revisore confronta il PDF con tutta la knowledge base a caccia di discrepanze.'],
  },
}

function PannelloStepAutonomo({ pratica }: { pratica: Pratica }) {
  const { avanzaStepAutonomo } = useApp()
  const info = DESCRIZIONE_STEP[pratica.faseCorrente]
  if (!info) return null
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-linea bg-carta p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            🤖 Step autonomo
          </span>
        </div>
        <h3 className="font-display mt-2 text-lg font-bold tracking-tight text-inchiostro">{info.titolo}</h3>
        <ul className="mt-2 space-y-1.5">
          {info.punti.map((punto, i) => (
            <li key={i} className="text-sm leading-6 text-inchiostro/60">
              • {punto}
            </li>
          ))}
        </ul>
        <button
          onClick={() => avanzaStepAutonomo(pratica.id)}
          className="mt-4 rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-petrolio-scuro"
        >
          ▶ Simula il completamento dello step
        </button>
        <p className="mt-3 rounded-xl bg-inchiostro/[0.04] px-3 py-2 text-xs text-inchiostro/45">
          Nel sistema reale questo passaggio parte e si completa da solo, senza alcun clic: il bottone serve solo a
          provare il flusso finché il backend non è collegato.
        </p>
      </div>
    </div>
  )
}

// ─── Chat dedicata del checkpoint copy ───

function ChatCopy({ pratica }: { pratica: Pratica }) {
  const { inviaChatCopy } = useApp()
  const [testo, setTesto] = useState('')
  const messaggi = pratica.chatCopy ?? []

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <h4 className="font-display text-sm font-bold tracking-tight text-amber-900">💬 Chat delle modifiche</h4>
      <p className="mt-0.5 text-xs text-amber-800/70">
        Scrivi cosa va cambiato: l&apos;agente applica le modifiche e ripresenta il documento.
      </p>
      {messaggi.length > 0 && (
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
          {messaggi.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                m.autore === 'copy'
                  ? 'ml-auto bg-amber-200/70 text-amber-900'
                  : 'bg-white text-inchiostro/80 shadow-sm'
              }`}
            >
              {m.testo}
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <input
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && testo.trim()) {
              inviaChatCopy(pratica.id, testo)
              setTesto('')
            }
          }}
          placeholder="Es. accorcia l\'introduzione del capitolo 2…"
          className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
        />
        <button
          onClick={() => {
            if (testo.trim()) {
              inviaChatCopy(pratica.id, testo)
              setTesto('')
            }
          }}
          disabled={!testo.trim()}
          className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Invia
        </button>
      </div>
    </div>
  )
}

// ─── Fase "impaginazione": worker Railway (fase 8) ───

const VERDETTO_STILE: Record<string, string> = {
  APPROVATO: 'border-green-200 bg-green-50 text-green-800',
  RIMANDATO: 'border-rose-200 bg-rose-50 text-rose-800',
  DA_CONTROLLARE_A_MANO: 'border-amber-200 bg-amber-50 text-amber-800',
}

function PannelloGrafica({ pratica }: { pratica: Pratica }) {
  const chiaveJob = `grafica-job-${pratica.id}`
  const [token, setToken] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [cliente, setCliente] = useState(pratica.cliente)
  const [tipo, setTipo] = useState(pratica.tipoLavoro === 'branding' ? 'Piano Marketing' : 'Report Strategico')
  const [dataReport, setDataReport] = useState(meseCorrente())
  const [jobId, setJobId] = useState<string | null>(null)
  const [stato, setStato] = useState<StatoJobGrafica | null>(null)
  const [errore, setErrore] = useState('')
  const [avvioInCorso, setAvvioInCorso] = useState(false)
  const [controllo, setControllo] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura iniziale da localStorage
    setToken(localStorage.getItem(CHIAVE_TOKEN_WORKER) ?? '')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ripresa job in corso
    setJobId(localStorage.getItem(chiaveJob))
  }, [chiaveJob])

  const salvaToken = (v: string) => {
    setToken(v)
    localStorage.setItem(CHIAVE_TOKEN_WORKER, v)
  }

  const finale = stato?.fase === 'completato' || stato?.fase === 'errore'

  useEffect(() => {
    if (!jobId || !token) return
    let fermo = false
    const aggiorna = async () => {
      try {
        const s = await statoJobGrafica(token, jobId)
        if (!fermo) setStato(s)
        if (s.fase === 'completato' || s.fase === 'errore') return true
      } catch (e) {
        if (!fermo) setErrore(e instanceof Error ? e.message : 'errore di collegamento')
        return true
      }
      return false
    }
    aggiorna()
    const intervallo = window.setInterval(async () => {
      if (await aggiorna()) window.clearInterval(intervallo)
    }, 5000)
    return () => {
      fermo = true
      window.clearInterval(intervallo)
    }
  }, [jobId, token])

  const avvia = async () => {
    if (!file || !token) return
    setErrore('')
    setAvvioInCorso(true)
    try {
      const id = await creaJobGrafica({ token, file, cliente, tipo, data: dataReport })
      localStorage.setItem(chiaveJob, id)
      setStato(null)
      setControllo('')
      setJobId(id)
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'avvio fallito')
    } finally {
      setAvvioInCorso(false)
    }
  }

  const azzera = () => {
    localStorage.removeItem(chiaveJob)
    setJobId(null)
    setStato(null)
    setControllo('')
    setErrore('')
  }

  const mostraControllo = async () => {
    if (!jobId || !token) return
    try {
      setControllo(await leggiControlloGrafica(token, jobId))
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'report non disponibile')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">
        Impaginazione automatica — Compartimento n°8
      </h3>

      {/* Collegamento */}
      <div className="rounded-2xl border border-linea bg-carta p-5 shadow-sm">
        <label className="mb-1 block text-xs font-medium text-inchiostro/60">Token del motore di impaginazione</label>
        <input
          type="password"
          value={token}
          onChange={(e) => salvaToken(e.target.value)}
          placeholder="incolla il WORKER_TOKEN (Railway → worker-grafica → Variables)"
          className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none"
        />
        <p className="mt-1.5 text-xs text-inchiostro/40">
          Resta solo in questo browser e viaggia esclusivamente verso il worker su Railway.
        </p>
      </div>

      {/* Avvio */}
      {!jobId && (
        <div className="rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <p className="text-sm text-inchiostro/60">
            Carica il PDF operativo del cliente: il server esegue l&apos;intera procedura di impaginazione
            (modello Macheda) con i controlli automatici e il controllo visivo agentico.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Cliente (Cognome Nome)</label>
              <input value={cliente} onChange={(e) => setCliente(e.target.value)}
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Tipo consulenza</label>
              <input value={tipo} onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Data (AAAA-MM)</label>
              <input value={dataReport} onChange={(e) => setDataReport(e.target.value)}
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none" />
            </div>
          </div>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-3 block w-full text-sm text-inchiostro/60 file:mr-3 file:rounded-xl file:border-0 file:bg-petrolio file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-petrolio-scuro"
          />
          <button
            onClick={avvia}
            disabled={!token || !file || avvioInCorso}
            className="mt-4 w-full rounded-xl bg-ambra px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {avvioInCorso ? 'Invio al server…' : '🚀 Avvia graficazione sul server'}
          </button>
        </div>
      )}

      {/* Lavorazione */}
      {jobId && (
        <div className="rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-display text-base font-bold tracking-tight text-inchiostro">
              Lavorazione sul server {!finale && <span className="ml-2 inline-block animate-pulse text-ambra">●</span>}
            </h4>
            <button onClick={azzera} className="text-xs font-medium text-inchiostro/40 transition hover:text-petrolio">
              Nuovo job
            </button>
          </div>
          <ul className="mt-3 space-y-1.5">
            {(stato?.passi ?? []).map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-inchiostro/70">
                <span className="text-green-600">✓</span>
                {ETICHETTA_PASSO[p.passo] ?? p.passo}
                <span className="ml-auto text-xs text-inchiostro/35">{p.ora.slice(11, 19)}</span>
              </li>
            ))}
            {!finale && stato && (
              <li className="flex items-center gap-2 text-sm text-inchiostro/40">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-ambra border-t-transparent" />
                {ETICHETTA_PASSO[stato.fase] ?? stato.fase}…
              </li>
            )}
          </ul>

          {stato?.qa && (
            <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {Object.entries(stato.qa.esiti).map(([k, ok]) => (
                <div key={k} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${ok ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                  {ok ? '✓' : '✗'} {ETICHETTA_CHECK[k] ?? k}
                </div>
              ))}
            </div>
          )}

          {stato?.fase === 'errore' && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <strong>Errore del server:</strong> {stato.errore}
            </div>
          )}

          {stato?.verdetto && (
            <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${VERDETTO_STILE[stato.verdetto] ?? 'border-linea bg-carta'}`}>
              <strong>Verdetto: {stato.verdetto.replaceAll('_', ' ')}</strong>
              {stato.pagine ? ` — ${stato.pagine} pagine` : ''}
              {stato.verdetto === 'DA_CONTROLLARE_A_MANO' && (
                <p className="mt-1 text-xs opacity-80">
                  Il controllo visivo agentico è stato saltato (chiave API non configurata sul worker): i check
                  automatici sono passati, ma serve un&apos;occhiata umana in più.
                </p>
              )}
              {(stato.controllo_visivo?.problemi ?? []).slice(0, 6).map((p, i) => (
                <p key={i} className="mt-1 text-xs opacity-80">{p}</p>
              ))}
            </div>
          )}

          {stato?.fase === 'completato' && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => scaricaPdfGrafica(token, jobId, stato.pdf ?? 'report.pdf').catch((e) => setErrore(String(e)))}
                className="flex-1 rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro"
              >
                ⬇ Scarica il PDF impaginato
              </button>
              <button
                onClick={mostraControllo}
                className="flex-1 rounded-xl border border-linea bg-carta px-4 py-2.5 text-sm font-medium text-inchiostro/70 transition hover:border-petrolio/40 hover:text-petrolio"
              >
                📋 Report del controllo visivo
              </button>
            </div>
          )}

          {controllo && (
            <pre className="mt-3 max-h-80 overflow-y-auto rounded-xl bg-linea/30 p-4 text-xs leading-5 whitespace-pre-wrap text-inchiostro/80">
              {controllo}
            </pre>
          )}
        </div>
      )}

      {errore && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{errore}</div>
      )}

      <ReviewPanel praticaId={pratica.id} autore="Collega Grafica" />
    </div>
  )
}

// ─── Colonna sinistra: lavorazione in base alla fase corrente ───

function Lavorazione({ pratica }: { pratica: Pratica }) {
  const fase = pratica.faseCorrente

  // Fasi ancora in area commerciale: qui si guarda soltanto.
  if (fase === 'vendita' || fase === 'raccolta-documenti') {
    const cartella = statoCartella(pratica)
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          Questo progetto è ancora in <strong>area commerciale</strong>: la pipeline automatica parte quando il tutor
          preme «Cliente pronto».
        </div>
        <div className="rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">Stato della cartella cliente</h3>
          <ul className="mt-3 space-y-2">
            {cartella.voci.map((v) => (
              <li key={v.chiave} className="flex items-center justify-between gap-3 text-sm">
                <span className={`flex items-center gap-2 ${v.fatto ? 'text-inchiostro/80' : 'text-inchiostro/40'}`}>
                  {v.fatto ? <span className="text-green-600">✓</span> : <span className="text-inchiostro/25">○</span>}
                  {v.label}
                </span>
                <span className="shrink-0 text-xs text-inchiostro/40">{v.responsabile}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  // Step autonomi: pannello unico con descrizione + simulazione
  if (fase === 'generazione' || fase === 'revisione' || fase === 'visual' || fase === 'revisione-diagrammi' || fase === 'revisione-impaginazione') {
    return <PannelloStepAutonomo pratica={pratica} />
  }

  if (fase === 'checkpoint-copy') {
    return (
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">Checkpoint del Copy</h3>
        <ChatCopy pratica={pratica} />
        <ReviewPanel praticaId={pratica.id} autore="Copy" />
      </div>
    )
  }

  if (fase === 'impaginazione') {
    return <PannelloGrafica pratica={pratica} />
  }

  if (fase === 'approvazione-finale') {
    return (
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">Approvazione finale</h3>
        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          Ultimo passaggio umano: con «Accetta documento» il progetto si chiude e parte l&apos;email al tutor col PDF
          da girare al cliente.
        </div>
        <ReviewPanel praticaId={pratica.id} autore="Copy" />
      </div>
    )
  }

  // completata
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        🎉 <strong>PDF consegnato al tutor via email.</strong> Il progetto è completato: il documento resta
        consultabile in sola lettura.
      </div>
      <ReviewPanel praticaId={pratica.id} autore="Copy" />
    </div>
  )
}

// ─── Timeline dello storico (larghezza piena) ───

function TimelineStorico({ pratica }: { pratica: Pratica }) {
  return (
    <section className="anima anima-4 mt-10">
      <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">Storico attività</h3>
      <div className="mt-3 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
        {pratica.storico.length === 0 ? (
          <p className="text-sm text-inchiostro/40">Nessuna attività registrata.</p>
        ) : (
          <ol>
            {pratica.storico.map((voce, i) => (
              <li key={`${voce.dataOra}-${i}`} className="relative flex gap-3 pb-5 last:pb-0">
                {i < pratica.storico.length - 1 && (
                  <span className="absolute top-3 left-[5px] h-full w-px bg-linea" />
                )}
                <span className={`relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${faseById(voce.fase).dot}`} />
                <div className="min-w-0">
                  <p className="text-sm text-inchiostro/80">{voce.azione}</p>
                  <p className="mt-0.5 text-xs text-inchiostro/40">
                    {voce.autore} · {dataOraIt(voce.dataOra)} · fase: {faseById(voce.fase).label}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

// ─── Pagina ───

export default function PaginaProgettoErogazione() {
  return (
    <Suspense
      fallback={<p className="py-12 text-center text-sm text-inchiostro/40">Caricamento della scheda progetto…</p>}
    >
      <SchedaProgetto />
    </Suspense>
  )
}

function SchedaProgetto() {
  // Pagina statica (export): l'id del progetto arriva come parametro query ?id=...
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''
  const { state, pronto } = useApp()

  const notifiche = contaNotifiche(state, 'erogazione')
  const pratica = state.pratiche.find((p) => p.id === id)

  // Banner di conferma quando la fase cambia mentre la scheda è aperta
  // (es. dopo "Accetta documento" il pannello cambia: senza questo banner
  // l'utente non avrebbe alcuna conferma esplicita dell'avanzamento).
  const [avanzamento, setAvanzamento] = useState<{ da: FaseId; a: FaseId } | null>(null)
  const fasePrecedente = useRef<FaseId | null>(null)
  const faseCorrente = pratica?.faseCorrente ?? null
  useEffect(() => {
    if (faseCorrente && fasePrecedente.current && fasePrecedente.current !== faseCorrente) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- notifica intenzionale del cambio fase
      setAvanzamento({ da: fasePrecedente.current, a: faseCorrente })
    }
    fasePrecedente.current = faseCorrente
  }, [faseCorrente])

  // Prima dell'idratazione da localStorage non si può dire se la pratica esista.
  if (!pronto) {
    return (
      <RoleShell ruolo="Erogazione Copy" colore="bg-emerald-500" sottotitolo="Scheda progetto" notifiche={notifiche}>
        <p className="py-12 text-center text-sm text-inchiostro/40">Caricamento della scheda progetto…</p>
      </RoleShell>
    )
  }

  if (!pratica) {
    return (
      <RoleShell ruolo="Erogazione Copy" colore="bg-emerald-500" sottotitolo="Scheda progetto" notifiche={notifiche}>
        <EmptyState
          titolo="Pratica non trovata"
          sottotitolo="Il progetto che stai cercando non esiste o è stato rimosso."
          icona="🔍"
        />
        <div className="mt-4 text-center">
          <Link
            href="/erogazione"
            className="inline-block rounded-xl border border-linea bg-carta px-4 py-2 text-sm font-medium text-inchiostro/70 transition hover:border-petrolio/40 hover:text-petrolio"
          >
            ← Torna alla board
          </Link>
        </div>
      </RoleShell>
    )
  }

  return (
    <RoleShell ruolo="Erogazione Copy" colore="bg-emerald-500" sottotitolo="Scheda progetto" notifiche={notifiche}>
      {/* Intestazione progetto */}
      <div className="anima anima-1 mb-8">
        <Link href="/erogazione" className="text-sm text-inchiostro/40 transition hover:text-petrolio">
          ← Torna alla board
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-3xl font-bold tracking-tight text-inchiostro">{pratica.azienda}</h2>
          <StatusBadge fase={pratica.faseCorrente} />
          {pratica.tipoLavoro && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ETICHETTA_TIPO[pratica.tipoLavoro].badge}`}
            >
              {ETICHETTA_TIPO[pratica.tipoLavoro].label}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-inchiostro/50">
          {pratica.cliente} · {pratica.email}
        </p>
        <div className="mt-5">
          <PipelineStepper faseCorrente={pratica.faseCorrente} />
        </div>
      </div>

      {/* Conferma del cambio fase avvenuto in questa scheda */}
      {avanzamento && (
        <div
          className={`anima mb-6 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 ${
            indiceFase(avanzamento.a) > indiceFase(avanzamento.da)
              ? 'border-green-200 bg-green-50'
              : 'border-rose-200 bg-rose-50'
          }`}
        >
          {indiceFase(avanzamento.a) > indiceFase(avanzamento.da) ? (
            <p className="text-sm text-green-800">
              ✓ <strong>Documento accettato.</strong> Il progetto è passato da {faseById(avanzamento.da).label} a{' '}
              <strong>{faseById(avanzamento.a).label}</strong> ({faseById(avanzamento.a).owner}).
            </p>
          ) : (
            <p className="text-sm text-rose-800">
              ⟲ Il progetto è stato riportato da {faseById(avanzamento.da).label} a{' '}
              <strong>{faseById(avanzamento.a).label}</strong> ({faseById(avanzamento.a).owner}).
            </p>
          )}
          <button
            onClick={() => setAvanzamento(null)}
            className="shrink-0 text-xs text-inchiostro/40 transition hover:text-inchiostro/70"
            aria-label="Chiudi conferma"
          >
            ✕
          </button>
        </div>
      )}

      {/* Lavorazione + cartella cliente */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="anima anima-2 lg:col-span-2">
          <Lavorazione pratica={pratica} />
        </div>
        <CartellaCliente pratica={pratica} />
      </div>

      <TimelineStorico pratica={pratica} />
    </RoleShell>
  )
}
