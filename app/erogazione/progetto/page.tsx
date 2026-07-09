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

const ORDINE_TIPI: TipoDocumento[] = ['questionario', 'trascrizione', 'assessfirst', 'report-irene', 'unificato', 'report']

const ICONE: Record<TipoDocumento, string> = {
  questionario: '📋',
  trascrizione: '🎙',
  assessfirst: '👤',
  'report-irene': '📊',
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
    case 'report-irene':
      return 'Report AssessFirst del team'
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

// ─── Fase "generazione": scelta tipo di lavoro + unificazione + batteria prompt ───

function PannelloGenerazione({ pratica }: { pratica: Pratica }) {
  const { unisciDocumenti, generaReport, impostaTipoLavoro } = useApp()
  const [generando, setGenerando] = useState(false)
  const [promptN, setPromptN] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const unificato = pratica.versioni.find((v) => v.etichetta === 'Documento unificato')
  const tipo = pratica.tipoLavoro
  const batteria = tipo ? batteriaPerTipo(tipo) : null
  const totalePrompt = batteria?.length ?? 0

  const avviaGenerazione = () => {
    if (generando || !unificato || !batteria) return
    setGenerando(true)
    let n = 0
    timerRef.current = setInterval(() => {
      n += 1
      setPromptN(n)
      if (n >= batteria.length) {
        if (timerRef.current) clearInterval(timerRef.current)
        generaReport(pratica.id)
      }
    }, 2500 / batteria.length)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">
        Da lavorare — preparazione del report
      </h3>

      {/* Passo 1 — Tipo di lavoro (determina la batteria di prompt) */}
      <div className="rounded-2xl border border-linea bg-carta p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              tipo ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500 text-white'
            }`}
          >
            {tipo ? '✓' : '1'}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold tracking-tight text-inchiostro">Passo 1 — Che tipo di lavoro è?</h4>
            <p className="mt-1 text-sm text-inchiostro/50">
              La scelta aggiorna automaticamente la batteria di prompt usata per generare il documento.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(['consulenza', 'branding'] as TipoLavoro[]).map((t) => {
                const et = ETICHETTA_TIPO[t]
                const selezionato = tipo === t
                return (
                  <button
                    key={t}
                    onClick={() => !generando && impostaTipoLavoro(pratica.id, t)}
                    disabled={generando}
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      selezionato
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-linea bg-carta hover:border-petrolio/40 hover:bg-inchiostro/[0.02]'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-semibold text-inchiostro">
                      {selezionato ? '●' : '○'} {et.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-inchiostro/50">{et.descrizione}</span>
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${et.badge}`}>
                      Batteria: {batteriaPerTipo(t).length} prompt
                    </span>
                  </button>
                )
              })}
            </div>
            {!tipo && (
              <p className="mt-2 text-xs text-amber-600">
                ⚠ Scegli il tipo di lavoro prima di generare: le batterie usano prompt diversi.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Passo 2 */}
      <div className="rounded-2xl border border-linea bg-carta p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            2
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold tracking-tight text-inchiostro">Passo 2 — Unifica i documenti</h4>
            <p className="mt-1 text-sm text-inchiostro/50">
              Questionario, trascrizione, AssessFirst e report del team vengono uniti in un unico documento di lavoro.
            </p>
            {unificato ? (
              <div className="mt-3 space-y-3">
                <button
                  disabled
                  className="cursor-not-allowed rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-700"
                >
                  ✓ Documenti unificati
                </button>
                <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl bg-inchiostro/[0.04] p-3 text-xs leading-5 text-inchiostro/70">
                  {unificato.contenuto}
                </div>
              </div>
            ) : (
              <button
                onClick={() => unisciDocumenti(pratica.id)}
                className="mt-3 rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-petrolio-scuro"
              >
                Unifica i documenti
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Passo 3 — Generazione con la batteria del tipo scelto */}
      <div className="rounded-2xl border border-linea bg-carta p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              unificato && tipo ? 'bg-emerald-100 text-emerald-700' : 'bg-inchiostro/10 text-inchiostro/40'
            }`}
          >
            3
          </span>
          <div className="min-w-0 flex-1">
            <h4
              className={`font-display font-bold tracking-tight ${
                unificato && tipo ? 'text-inchiostro' : 'text-inchiostro/40'
              }`}
            >
              Passo 3 — Genera il documento
            </h4>
            <p className={`mt-1 text-sm ${unificato && tipo ? 'text-inchiostro/50' : 'text-inchiostro/40'}`}>
              {tipo
                ? `Batteria ${ETICHETTA_TIPO[tipo].label} (${totalePrompt} prompt): dalle regole di scrittura alle lettere finali${
                    tipo === 'branding' ? ', inclusa la Fase 3.3 — funnel (Dot Com Secrets)' : ''
                  }.`
                : 'La batteria di prompt elabora il documento unificato e produce la prima bozza.'}
            </p>

            {generando && batteria ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-emerald-700">
                  <span className="truncate">
                    {batteria[Math.min(promptN, totalePrompt) - 1]
                      ? `${batteria[Math.min(promptN, totalePrompt) - 1].codice} — ${batteria[Math.min(promptN, totalePrompt) - 1].titolo}`
                      : 'Generazione in corso…'}
                  </span>
                  <span className="shrink-0 pl-2">
                    {promptN}/{totalePrompt}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${(promptN / totalePrompt) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-inchiostro/40">
                  Al termine la pratica passerà automaticamente alla revisione del Team Copy.
                </p>
              </div>
            ) : (
              <button
                onClick={avviaGenerazione}
                disabled={!unificato || !tipo}
                className={`mt-3 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
                  unificato && tipo
                    ? 'bg-ambra text-white hover:bg-amber-700'
                    : 'cursor-not-allowed bg-inchiostro/10 text-inchiostro/35'
                }`}
              >
                {tipo
                  ? `Avvia generazione — Batteria ${ETICHETTA_TIPO[tipo].label} (${totalePrompt} prompt)`
                  : 'Avvia generazione'}
              </button>
            )}
            {!tipo && !generando && (
              <p className="mt-2 text-xs text-inchiostro/40">Scegli prima il tipo di lavoro (Passo 1).</p>
            )}
            {tipo && !unificato && !generando && (
              <p className="mt-2 text-xs text-inchiostro/40">Completa prima il Passo 2 per abilitare la generazione.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Fase "revisione-2": azioni extra per rimandare al Revisore 1 ───

function BoxRimandaIndietro({ praticaId }: { praticaId: string }) {
  const { rimandaIndietro } = useApp()
  const [formAperto, setFormAperto] = useState(false)
  const [motivo, setMotivo] = useState('')

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <p className="text-xs text-rose-700">
        💡 Promemoria: usa <strong>«Confronta versioni»</strong> nel riquadro del documento per controllare le
        modifiche fatte dal Revisore 1. Se il lavoro non è adeguato, rimandalo indietro con una motivazione.
      </p>
      {formAperto ? (
        <div className="mt-3 space-y-2">
          <label className="block text-xs font-medium text-rose-800">Motivo del rimando (obbligatorio)</label>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Es. la voce narrante non è uniforme nei capitoli 2 e 3…"
            className="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (motivo.trim()) rimandaIndietro(praticaId, 'Revisore 2', motivo.trim())
              }}
              disabled={!motivo.trim()}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                motivo.trim()
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'cursor-not-allowed bg-rose-200 text-rose-400'
              }`}
            >
              Conferma rimando
            </button>
            <button
              onClick={() => {
                setFormAperto(false)
                setMotivo('')
              }}
              className="rounded-xl border border-rose-300 px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-100"
            >
              Annulla
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setFormAperto(true)}
          className="mt-3 rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          ⟲ Rimanda al Revisore 1
        </button>
      )}
    </div>
  )
}

// ─── Fase "visual": agente automatico ───

function PannelloVisual({ pratica }: { pratica: Pratica }) {
  const { completaVisual } = useApp()
  const [passo, setPasso] = useState(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [])

  const avvia = () => {
    if (passo > 0) return
    setPasso(1)
    timersRef.current.push(setTimeout(() => setPasso(2), 1000))
    timersRef.current.push(setTimeout(() => completaVisual(pratica.id), 2000))
  }

  return (
    <div className="rounded-2xl border border-linea bg-carta p-5 shadow-sm">
      <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">
        🤖 Agente Visual — elaborazione automatica
      </h3>
      <p className="mt-1 text-sm text-inchiostro/50">
        L&rsquo;agente analizza il report e inserisce automaticamente tabelle e diagrammi dove migliorano la
        comprensione del testo. Al termine la pratica passa al controllo di leggibilità.
      </p>

      {passo === 0 ? (
        <button
          onClick={avvia}
          className="mt-4 rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-petrolio-scuro"
        >
          ▶ Esegui elaborazione visual
        </button>
      ) : (
        <div className="mt-4 space-y-2">
          <p className="flex items-center gap-2 text-sm text-cyan-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
            Analisi dei blocchi di testo e individuazione dei punti visual…
          </p>
          {passo >= 2 && (
            <p className="flex items-center gap-2 text-sm text-cyan-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
              Inserimento di tabelle e diagrammi nel documento…
            </p>
          )}
        </div>
      )}

      <p className="mt-4 rounded-xl bg-inchiostro/[0.04] px-3 py-2 text-xs text-inchiostro/45">
        Nota: nel sistema reale questa elaborazione partirà in automatico all&rsquo;arrivo della pratica in questa
        fase, senza bisogno di alcun clic.
      </p>
    </div>
  )
}

// ─── Fase "grafica": impaginazione automatica sul worker Railway ───

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

const PREFISSO_RIMANDO = 'Rimandato al Revisore 1'

const FASI_EDITORIALI = [
  { nome: 'Struttura', dettaglio: 'ordine dei capitoli e completezza dei contenuti' },
  { nome: 'Metodo', dettaglio: 'coerenza con il metodo e i riferimenti aziendali' },
  { nome: 'Voce', dettaglio: 'voce narrante e tono uniformi in tutto il report' },
  { nome: 'Chiarezza', dettaglio: 'frasi brevi, niente gergo, esempi concreti' },
  { nome: 'Forma', dettaglio: 'refusi, punteggiatura e formattazione finale' },
]

function Lavorazione({ pratica }: { pratica: Pratica }) {
  const fase = pratica.faseCorrente

  // Fasi ancora in area commerciale: qui si guarda soltanto.
  if (fase === 'vendita' || fase === 'raccolta-documenti' || fase === 'report-irene') {
    const cartella = statoCartella(pratica)
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          Questo progetto è ancora in <strong>area commerciale</strong>: la lavorazione in Erogazione Copy inizierà
          quando Irene invierà il blocco cliente completo.
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

  if (fase === 'generazione') {
    return <PannelloGenerazione pratica={pratica} />
  }

  if (fase === 'revisione-team-copy') {
    return (
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">Revisione del Team Copy</h3>
        <ReviewPanel praticaId={pratica.id} autore="Team Copy" />
      </div>
    )
  }

  if (fase === 'revisione-1') {
    const ultimaVoce = pratica.storico[pratica.storico.length - 1]
    const rimandato = !!ultimaVoce && ultimaVoce.azione.startsWith(PREFISSO_RIMANDO)
    const motivoRimando = rimandato ? ultimaVoce.azione.slice(PREFISSO_RIMANDO.length).replace(/^:\s*/, '') : ''
    return (
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">
          Revisione editoriale — Revisore 1
        </h3>
        {rimandato && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <strong>⟲ Rimandato indietro dal Revisore 2.</strong> Motivo: {motivoRimando || 'non specificato'}
          </div>
        )}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-800">Promemoria — le 5 fasi editoriali del Metodo:</p>
          <ol className="mt-1.5 space-y-0.5 text-xs text-amber-700">
            {FASI_EDITORIALI.map((f, i) => (
              <li key={f.nome}>
                {i + 1}. <strong>{f.nome}</strong> — {f.dettaglio}
              </li>
            ))}
          </ol>
        </div>
        <ReviewPanel praticaId={pratica.id} autore="Revisore 1" />
      </div>
    )
  }

  if (fase === 'revisione-2') {
    return (
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">Controllo qualità — Revisore 2</h3>
        <ReviewPanel praticaId={pratica.id} autore="Revisore 2" azioniExtra={<BoxRimandaIndietro praticaId={pratica.id} />} />
      </div>
    )
  }

  if (fase === 'visual') {
    return <PannelloVisual pratica={pratica} />
  }

  if (fase === 'leggibilita') {
    return (
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">Controllo di leggibilità</h3>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3">
          <p className="text-xs font-semibold text-violet-800">Criteri di verifica:</p>
          <ul className="mt-1.5 space-y-0.5 text-xs text-violet-700">
            <li>• I visual inseriti devono migliorare la comprensione del testo, non decorarlo.</li>
            <li>• Nessun blocco di testo deve superare le 5 righe consecutive.</li>
          </ul>
        </div>
        <ReviewPanel praticaId={pratica.id} autore="Revisore Leggibilità" />
      </div>
    )
  }

  if (fase === 'grafica') {
    return <PannelloGrafica pratica={pratica} />
  }

  // completata
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        🎉 <strong>Report consegnato al cliente.</strong> Il progetto è completato: il documento resta consultabile in
        sola lettura.
      </div>
      <ReviewPanel praticaId={pratica.id} autore="Erogazione Copy" />
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
