'use client'

// ─── Store globale del Sistema Report Strategico (client-side, persistito in localStorage) ───
// Il backend non esiste ancora: questo store simula il comportamento della
// pipeline v2 — ogni step autonomo qui è un'azione "simula avanzamento".

import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { AppState, Apprendimento, DocumentoAllegato, FaseId, PersonaAF, Pratica, VersioneDocumento, relazioneAF } from './types'
import { CronologiaFasi, leggiStatoCondiviso, scriviStatoCondiviso, tokenDati } from './datiblocco'
import { documentiTutorPronti, faseSuccessiva, faseById } from './fasi'
import { SiloId, siloPrecedente, siloSeed, siloSuccessivo } from './pipelineSilos'
import { batteriaIdPerTipo, batteriaPerTipo, ETICHETTA_TIPO } from './batterie'
import {
  REPORT_AI_MOCK,
  REPORT_IRENE_MOCK,
  REPORT_VISUAL_MOCK,
  SEED_STATE,
} from './mock'

// v4: pipeline v2 — eliminati i compartimenti 4/5, tutor carica tutto,
// report AF autonomo, revisione = sistema di Christian, chat del copy
const STORAGE_KEY = 'sistema-report-strategico-v5'

// Quando qualcuno corregge un documento nella fase X, l'apprendimento
// migliora il passaggio che ha PRODOTTO quel documento.
function targetApprendimento(pratica: Pratica): { id: string; nome: string } {
  switch (pratica.faseCorrente) {
    case 'revisione-diagrammi':
      return { id: 'agente-visual', nome: 'Agente Visual — Tabelle e Diagrammi' }
    case 'revisione-impaginazione':
    case 'approvazione-finale':
      return { id: 'specifica-impaginazione', nome: 'Specifica di impaginazione (fase 8)' }
    default: {
      const id = batteriaIdPerTipo(pratica.tipoLavoro)
      return id === 'batteria-branding'
        ? { id, nome: 'Batteria Branding — Piano Marketing (21 prompt)' }
        : { id, nome: 'Batteria Consulenza — Report Strategico (20 prompt)' }
    }
  }
}

type Azione =
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'RESET' }
  | { type: 'CREA_PRATICA'; azienda: string; cliente: string; email: string; dipendenti: PersonaAF[] }
  | { type: 'INVIA_ASSESSMENT'; praticaId: string }
  | { type: 'REGISTRA_ALLEGATO'; praticaId: string; allegato: DocumentoAllegato }
  | { type: 'RIMUOVI_ALLEGATO'; praticaId: string; allegatoId: string }
  | { type: 'MODIFICA_REPORT_AF'; praticaId: string; allegatoId: string; contenuto: string }
  | { type: 'CONFERMA_REPORT_AF'; praticaId: string }
  | { type: 'CLIENTE_PRONTO'; praticaId: string }
  | { type: 'AVANZA_STEP_AUTONOMO'; praticaId: string }
  | { type: 'INVIA_CHAT_COPY'; praticaId: string; testo: string }
  | { type: 'SPOSTA_FASE'; praticaId: string; nuovaFase: FaseId; autore: string }
  | { type: 'ACCETTA_DOCUMENTO'; praticaId: string; autore: string }
  | { type: 'SALVA_REVISIONE'; praticaId: string; autore: string; testoDopo: string; note: string }
  | { type: 'APPROVA_APPRENDIMENTO'; apprendimentoId: string }
  | { type: 'SCARTA_APPRENDIMENTO'; apprendimentoId: string }
  | { type: 'SPOSTA_SILO'; slug: string; silo: SiloId }
  | { type: 'AVANZA_SILO'; slug: string }
  | { type: 'INDIETREGGIA_SILO'; slug: string }
  | { type: 'RESET_SILOS' }

const uid = () => Math.random().toString(36).slice(2, 10)
const ora = () => new Date().toISOString()

/** Slug con cui un cliente NUOVO (Pratica) compare nella pipeline a silos /
 *  Gantt. I 34 ufficiali usano slugFrank(nome); i nuovi usano l'id della pratica. */
export const slugPratica = (praticaId: string): string => `p-${praticaId}`

/** Mappa silo completa e sicura: parte dal piano ufficiale dei 34 e vi
 *  sovrascrive lo stato salvato (che può mancare in stati vecchi). */
const mappaSilos = (state: AppState): Record<string, SiloId> => ({
  ...siloSeed(),
  ...((state.siloClienti as Record<string, SiloId>) ?? {}),
})

const aggiornaPratica = (state: AppState, praticaId: string, fn: (p: Pratica) => Pratica): AppState => ({
  ...state,
  pratiche: state.pratiche.map((p) => (p.id === praticaId ? fn(p) : p)),
})

const ultimaVersione = (p: Pratica): VersioneDocumento | undefined => p.versioni[p.versioni.length - 1]

/** Simula il completamento dello step autonomo della fase corrente. */
function avanzaStepAutonomo(p: Pratica): Pratica {
  const adesso = ora()
  switch (p.faseCorrente) {
    case 'generazione': {
      // il sistema di Christian sceglie il tipo e genera; in parallelo parte
      // lo step 4a: report AF per dipendente + email al tutor (Irene supervisiona)
      const tipo = p.tipoLavoro ?? 'consulenza'
      const etichettaBatteria = `batteria ${ETICHETTA_TIPO[tipo].label} (${batteriaPerTipo(tipo).length} prompt)`
      return {
        ...p,
        tipoLavoro: tipo,
        faseCorrente: 'revisione',
        versioni: [
          ...p.versioni,
          { id: `v-${uid()}`, fase: 'generazione', autore: 'Sistema di generazione (Christian)', dataOra: adesso, contenuto: REPORT_AI_MOCK, tipo: 'ai', etichetta: "Report generato dall'AI" },
        ],
        allegati: [
          ...p.allegati.filter((a) => a.tipo !== 'report-af'),
          ...p.dipendenti.map((d) => ({
            id: `al-${uid()}`,
            nome: `Report AssessFirst - ${d.nome} (caso ${relazioneAF(p, d).caso}).pdf`,
            tipo: 'report-af' as const,
            caricatoDa: 'Agente Report AF',
            dataCaricamento: adesso,
            dipendente: d.nome,
            contenuto: REPORT_IRENE_MOCK,
          })),
        ],
        reportAF: { stato: 'generati', dataOra: adesso, dettaglio: `${p.dipendenti.length} report pronti — in revisione da Irene` },
        storico: [
          ...p.storico,
          { fase: 'generazione', azione: `Tipo di lavoro determinato dal sistema: ${ETICHETTA_TIPO[tipo].label} — report generato con la ${etichettaBatteria}`, autore: 'Sistema (Christian)', dataOra: adesso },
          { fase: 'generazione', azione: `Report AssessFirst generati in simultanea per ${p.dipendenti.length} persone — in attesa della revisione di Irene`, autore: 'Agente Report AF', dataOra: adesso },
          { fase: 'generazione', azione: 'Email al tutor con report principale + report AssessFirst (simulata)', autore: 'Sistema', dataOra: adesso },
        ],
      }
    }
    case 'revisione':
      return {
        ...p,
        faseCorrente: 'visual',
        versioni: [
          ...p.versioni,
          { id: `v-${uid()}`, fase: 'revisione', autore: 'Revisore (sistema Christian)', dataOra: adesso, contenuto: ultimaVersione(p)?.contenuto ?? REPORT_AI_MOCK, tipo: 'ai', etichetta: 'Documento revisionato' },
        ],
        storico: [...p.storico, { fase: 'revisione', azione: 'Documento revisionato dal sistema integrato', autore: 'Revisore (Christian)', dataOra: adesso }],
      }
    case 'visual':
      return {
        ...p,
        faseCorrente: 'revisione-diagrammi',
        versioni: [
          ...p.versioni,
          { id: `v-${uid()}`, fase: 'visual', autore: 'Agente Visual', dataOra: adesso, contenuto: REPORT_VISUAL_MOCK, tipo: 'ai', etichetta: 'Report con diagrammi e tabelle' },
        ],
        storico: [...p.storico, { fase: 'visual', azione: 'Diagrammi, tabelle e grafici inseriti automaticamente', autore: 'Agente Visual', dataOra: adesso }],
      }
    case 'revisione-diagrammi':
      return {
        ...p,
        faseCorrente: 'checkpoint-copy',
        storico: [
          ...p.storico,
          { fase: 'revisione-diagrammi', azione: 'Loop automatico: 1 rimando al Visual, poi diagrammi approvati — lezione registrata per l\'apprendimento', autore: 'Revisore diagrammi', dataOra: adesso },
        ],
      }
    case 'impaginazione':
      return {
        ...p,
        faseCorrente: 'revisione-impaginazione',
        storico: [...p.storico, { fase: 'impaginazione', azione: 'PDF impaginato dal motore (fase 8 sul worker Railway)', autore: 'Motore impaginazione', dataOra: adesso }],
      }
    case 'revisione-impaginazione':
      return {
        ...p,
        faseCorrente: 'approvazione-finale',
        storico: [...p.storico, { fase: 'revisione-impaginazione', azione: 'Confronto con la knowledge base completato: nessuna discrepanza', autore: 'Revisore impaginazione', dataOra: adesso }],
      }
    default:
      return p
  }
}

function reducer(state: AppState, azione: Azione): AppState {
  switch (azione.type) {
    case 'HYDRATE':
      return azione.payload

    case 'RESET':
      return SEED_STATE

    case 'CREA_PRATICA': {
      const adesso = ora()
      const nuovoId = `pr-${uid()}`
      const nuova: Pratica = {
        id: nuovoId,
        azienda: azione.azienda,
        cliente: azione.cliente,
        email: azione.email,
        tutor: 'Giulia T.',
        dipendenti: azione.dipendenti,
        tipoLavoro: null,
        // La registrazione porta dritto alla raccolta documenti (fase 2):
        // il venditore carica subito i file, senza passaggi intermedi.
        faseCorrente: 'raccolta-documenti',
        dataCreazione: adesso,
        allegati: [],
        versioni: [],
        storico: [
          { fase: 'vendita', azione: 'Cliente registrato dal tutor (fase 1)', autore: 'Giulia T. (Tutor)', dataOra: adesso },
          { fase: 'raccolta-documenti', azione: 'In attesa dei documenti (questionario, trascrizione, AssessFirst)', autore: 'Sistema', dataOra: adesso },
        ],
      }
      // Il nuovo cliente entra nella pipeline a silos allo STEP 0 (documenti).
      return {
        ...state,
        pratiche: [nuova, ...state.pratiche],
        siloClienti: { ...mappaSilos(state), [slugPratica(nuovoId)]: 'documenti' },
      }
    }

    case 'INVIA_ASSESSMENT':
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        faseCorrente: 'raccolta-documenti',
        storico: [
          ...p.storico,
          { fase: 'vendita', azione: 'Assessment e questionario inviati al cliente', autore: 'Giulia T. (Tutor)', dataOra: ora() },
        ],
      }))

    case 'REGISTRA_ALLEGATO':
      // Registra il riferimento a un file REALE appena caricato nello storage.
      // Se esiste già un allegato dello stesso tipo/dipendente/sottotipo, lo
      // sostituisce (ri-caricamento): niente doppioni.
      return aggiornaPratica(state, azione.praticaId, (p) => {
        const a = azione.allegato
        const stesso = (x: DocumentoAllegato) =>
          x.tipo === a.tipo && (x.dipendente ?? '') === (a.dipendente ?? '') && (x.sottotipo ?? '') === (a.sottotipo ?? '')
        return {
          ...p,
          allegati: [...p.allegati.filter((x) => !stesso(x)), a],
          storico: [
            ...p.storico,
            { fase: p.faseCorrente, azione: `Caricato: ${a.nome}${a.dipendente ? ` (${a.dipendente})` : ''}`, autore: 'Venditore', dataOra: ora() },
          ],
        }
      })

    case 'RIMUOVI_ALLEGATO':
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        allegati: p.allegati.filter((x) => x.id !== azione.allegatoId),
      }))

    case 'MODIFICA_REPORT_AF':
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        allegati: p.allegati.map((a) =>
          a.id === azione.allegatoId ? { ...a, contenuto: azione.contenuto, caricatoDa: 'Irene (revisionato)' } : a
        ),
        storico: [
          ...p.storico,
          {
            fase: 'generazione',
            azione: `Report AssessFirst «${p.allegati.find((a) => a.id === azione.allegatoId)?.dipendente ?? ''}» corretto da Irene`,
            autore: 'Irene',
            dataOra: ora(),
          },
        ],
      }))

    case 'CONFERMA_REPORT_AF':
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        reportAF: {
          stato: 'email_inviata',
          dataOra: ora(),
          dettaglio: `ZIP inviato al tutor: report Word del passaggio 4 + ${p.allegati.filter((a) => a.tipo === 'report-af').length} report AssessFirst PDF`,
        },
        storico: [
          ...p.storico,
          {
            fase: 'generazione',
            azione: '📦 Irene ha confermato: ZIP (report Word + report AssessFirst) inviato all\'email del tutor — step 4a concluso',
            autore: 'Irene',
            dataOra: ora(),
          },
        ],
      }))

    case 'CLIENTE_PRONTO': {
      const pratica = state.pratiche.find((p) => p.id === azione.praticaId)
      if (!pratica || !documentiTutorPronti(pratica)) return state
      const avanzato = aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        faseCorrente: 'generazione',
        reportAF: { stato: 'in_attesa' },
        storico: [
          ...p.storico,
          { fase: 'raccolta-documenti', azione: '«Documenti completi» (Elisa) — dallo step 0 allo step 1: preso in carico dal Copy', autore: 'Elisa', dataOra: ora() },
        ],
      }))
      // Nella pipeline a silos: dallo step 0 (documenti) allo step 1 (copy).
      return { ...avanzato, siloClienti: { ...mappaSilos(state), [slugPratica(azione.praticaId)]: 'copy' } }
    }

    case 'AVANZA_STEP_AUTONOMO':
      return aggiornaPratica(state, azione.praticaId, avanzaStepAutonomo)

    case 'INVIA_CHAT_COPY': {
      const pratica = state.pratiche.find((p) => p.id === azione.praticaId)
      if (!pratica || !azione.testo.trim()) return state
      const adesso = ora()
      const precedente = ultimaVersione(pratica)
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        chatCopy: [
          ...(p.chatCopy ?? []),
          { autore: 'copy', testo: azione.testo.trim(), dataOra: adesso },
          { autore: 'agente', testo: 'Modifiche applicate al documento: trovi la nuova versione qui sopra. Se non è come la volevi, scrivimi cosa correggere.', dataOra: adesso },
        ],
        versioni: [
          ...p.versioni,
          { id: `v-${uid()}`, fase: p.faseCorrente, autore: 'Agente (da chat del copy)', dataOra: adesso, contenuto: `${precedente?.contenuto ?? ''}\n\n[Modifica richiesta dal copy in chat: "${azione.testo.trim()}" — applicata]`, tipo: 'ai', etichetta: 'Versione aggiornata dalla chat' },
        ],
        storico: [...p.storico, { fase: p.faseCorrente, azione: `Modifica richiesta in chat: "${azione.testo.trim().slice(0, 80)}"`, autore: 'Copy', dataOra: adesso }],
      }))
    }

    case 'SPOSTA_FASE': {
      const pratica = state.pratiche.find((p) => p.id === azione.praticaId)
      if (!pratica || pratica.faseCorrente === azione.nuovaFase) return state
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        faseCorrente: azione.nuovaFase,
        storico: [
          ...p.storico,
          { fase: azione.nuovaFase, azione: `Spostata manualmente nella colonna "${faseById(azione.nuovaFase).label}" dalla board`, autore: azione.autore, dataOra: ora() },
        ],
      }))
    }

    case 'ACCETTA_DOCUMENTO': {
      const pratica = state.pratiche.find((p) => p.id === azione.praticaId)
      if (!pratica) return state
      const prossima = faseSuccessiva(pratica.faseCorrente)
      if (!prossima) return state
      const finale = pratica.faseCorrente === 'approvazione-finale'
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        faseCorrente: prossima,
        storico: [
          ...p.storico,
          { fase: p.faseCorrente, azione: finale ? 'Approvazione finale del copy' : 'Documento accettato', autore: azione.autore, dataOra: ora() },
          ...(finale
            ? [{ fase: prossima, azione: 'Email al tutor col PDF finale da girare al cliente (simulata)', autore: 'Sistema', dataOra: ora() }]
            : []),
        ],
      }))
    }

    case 'SALVA_REVISIONE': {
      const pratica = state.pratiche.find((p) => p.id === azione.praticaId)
      if (!pratica) return state
      const precedente = ultimaVersione(pratica)
      const target = targetApprendimento(pratica)

      const apprendimento: Apprendimento = {
        id: `ap-${uid()}`,
        praticaId: pratica.id,
        praticaNome: pratica.azienda,
        fase: pratica.faseCorrente,
        dataOra: ora(),
        autoreRevisione: azione.autore,
        lezione: azione.note
          ? `Dalla nota del revisore: "${azione.note}". Il sistema analizzerà la differenza tra le due versioni per estrarre la regola da applicare.`
          : 'Il sistema analizzerà la differenza tra le due versioni per estrarre la regola da applicare.',
        promptTargetId: target.id,
        promptTargetNome: target.nome,
        miglioramentoProposto: `Proposta (in attesa di analisi AI): integrare nel prompt "${target.nome}" la correzione emersa da questa revisione, così che l'errore non si ripresenti.`,
        testoPrima: precedente?.contenuto ?? '',
        testoDopo: azione.testoDopo,
        note: azione.note,
        stato: 'in_attesa',
      }

      const conVersione = aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        versioni: [
          ...p.versioni,
          { id: `v-${uid()}`, fase: p.faseCorrente, autore: azione.autore, dataOra: ora(), contenuto: azione.testoDopo, tipo: 'umano', etichetta: `Revisione di ${azione.autore}` },
        ],
        storico: [...p.storico, { fase: p.faseCorrente, azione: `Documento revisionato — apprendimento generato per "${target.nome}"`, autore: azione.autore, dataOra: ora() }],
      }))

      return { ...conVersione, apprendimenti: [apprendimento, ...conVersione.apprendimenti] }
    }

    case 'APPROVA_APPRENDIMENTO': {
      const app = state.apprendimenti.find((a) => a.id === azione.apprendimentoId)
      if (!app) return state
      return {
        ...state,
        apprendimenti: state.apprendimenti.map((a) => (a.id === azione.apprendimentoId ? { ...a, stato: 'approvato' } : a)),
        prompts: state.prompts.map((pr) => {
          if (pr.id !== app.promptTargetId) return pr
          const [maj, min] = pr.versione.replace('v', '').split('.').map(Number)
          const nuovaVersione = `v${maj}.${min + 1}`
          return {
            ...pr,
            versione: nuovaVersione,
            ultimaModifica: ora(),
            changelog: [...pr.changelog, { versione: nuovaVersione, data: ora().slice(0, 10), descrizione: `Da apprendimento ${app.id} (${app.praticaNome}): ${app.lezione}` }],
          }
        }),
      }
    }

    case 'SCARTA_APPRENDIMENTO':
      return {
        ...state,
        apprendimenti: state.apprendimenti.map((a) => (a.id === azione.apprendimentoId ? { ...a, stato: 'scartato' } : a)),
      }

    case 'SPOSTA_SILO':
      return { ...state, siloClienti: { ...mappaSilos(state), [azione.slug]: azione.silo } }

    case 'AVANZA_SILO': {
      const corr = mappaSilos(state)[azione.slug] ?? 'documenti'
      const next = siloSuccessivo(corr)
      return next ? { ...state, siloClienti: { ...mappaSilos(state), [azione.slug]: next } } : state
    }

    case 'INDIETREGGIA_SILO': {
      const corr = mappaSilos(state)[azione.slug] ?? 'documenti'
      const prev = siloPrecedente(corr)
      return prev ? { ...state, siloClienti: { ...mappaSilos(state), [azione.slug]: prev } } : state
    }

    case 'RESET_SILOS':
      // ripristina i 34 al piano ufficiale, mantiene i clienti nuovi dove sono
      return { ...state, siloClienti: { ...mappaSilos(state), ...siloSeed() } }

    default:
      return state
  }
}

// ─── Context ───

interface StoreContextValue {
  state: AppState
  /** true dopo che lo stato salvato è stato ripristinato da localStorage */
  pronto: boolean
  /** sincronizzazione con l'archivio condiviso (blocco dati su Railway) */
  sincronizzazione: 'in-corso' | 'online' | 'offline'
  /** timbri del server: praticaId → [{fase, dataOra}] — la base del Gantt reale */
  cronologia: CronologiaFasi
  creaPratica: (dati: { azienda: string; cliente: string; email: string; dipendenti: PersonaAF[] }) => void
  inviaAssessment: (praticaId: string) => void
  registraAllegato: (praticaId: string, allegato: DocumentoAllegato) => void
  rimuoviAllegato: (praticaId: string, allegatoId: string) => void
  modificaReportAF: (praticaId: string, allegatoId: string, contenuto: string) => void
  confermaReportAF: (praticaId: string) => void
  clientePronto: (praticaId: string) => void
  avanzaStepAutonomo: (praticaId: string) => void
  inviaChatCopy: (praticaId: string, testo: string) => void
  spostaFase: (praticaId: string, nuovaFase: FaseId, autore: string) => void
  accettaDocumento: (praticaId: string, autore: string) => void
  salvaRevisione: (praticaId: string, dati: { autore: string; testoDopo: string; note: string }) => void
  approvaApprendimento: (apprendimentoId: string) => void
  scartaApprendimento: (apprendimentoId: string) => void
  resetDemo: () => void
  /** stato condiviso della pipeline a silos: slug cliente → silo (34 + nuovi) */
  silos: Record<string, SiloId>
  spostaSilo: (slug: string, silo: SiloId) => void
  avanzaSilo: (slug: string) => void
  indietreggiaSilo: (slug: string) => void
  resetSilos: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, SEED_STATE)
  const [pronto, setPronto] = React.useState(false)
  const [sincronizzazione, setSincronizzazione] = React.useState<'in-corso' | 'online' | 'offline'>('in-corso')
  const [cronologia, setCronologia] = React.useState<CronologiaFasi>({})
  const idratato = useRef(false)
  // ─── Archivio condiviso: revisione nota, cambi arrivati DAL server (da non
  // rispedire), salvataggio in attesa ───
  const revisione = useRef<number | null>(null)
  const daServer = useRef(false)
  const attesaPush = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statoCorrente = useRef(state)
  statoCorrente.current = state

  useEffect(() => {
    let statoLocale: AppState | null = null
    try {
      const salvato = localStorage.getItem(STORAGE_KEY)
      if (salvato) {
        statoLocale = JSON.parse(salvato) as AppState
        dispatch({ type: 'HYDRATE', payload: statoLocale })
      }
    } catch {
      // stato corrotto: si riparte dal seed
    }
    idratato.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- idratazione intenzionale una-tantum da localStorage
    setPronto(true)

    // Poi l'archivio condiviso: se il blocco dati ha uno stato, VINCE lui
    // (è la pipeline di tutto il team); se è ancora vuoto, lo semina questo
    // browser. Senza token o senza rete si lavora in locale come prima.
    const token = tokenDati()
    if (!token) {
      setSincronizzazione('offline')
      return
    }
    leggiStatoCondiviso(token)
      .then((doc) => {
        if (doc.stato) {
          daServer.current = true
          dispatch({ type: 'HYDRATE', payload: doc.stato })
          revisione.current = doc.revisione
          setCronologia(doc.cronologia ?? {})
        } else {
          const semina = statoLocale ?? statoCorrente.current
          return scriviStatoCondiviso(token, semina, doc.revisione).then((r) => {
            revisione.current = r.revisione
            setCronologia(r.cronologia ?? {})
          })
        }
      })
      .then(() => setSincronizzazione('online'))
      .catch(() => setSincronizzazione('offline'))
  }, [])

  // Il primo run di questo effect avviene nello stesso commit dell'idratazione,
  // quando state è ancora il seed: va saltato per non sovrascrivere il salvataggio.
  const primoSalvataggio = useRef(true)
  useEffect(() => {
    if (!idratato.current) return
    if (primoSalvataggio.current) {
      primoSalvataggio.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // quota piena: ignora
    }
    // I cambi arrivati DAL server non vanno rispediti al server.
    if (daServer.current) {
      daServer.current = false
      return
    }
    const token = tokenDati()
    if (!token) return
    if (attesaPush.current) clearTimeout(attesaPush.current)
    attesaPush.current = setTimeout(() => {
      attesaPush.current = null
      scriviStatoCondiviso(token, statoCorrente.current, revisione.current)
        .then((r) => {
          revisione.current = r.revisione
          setCronologia(r.cronologia ?? {})
          setSincronizzazione('online')
        })
        .catch(() => setSincronizzazione('offline'))
    }, 1200)
  }, [state])

  // Ogni 25s: se qualcun altro ha aggiornato la pipeline, la si riprende.
  useEffect(() => {
    const intervallo = setInterval(() => {
      const token = tokenDati()
      if (!token || document.hidden || attesaPush.current) return
      leggiStatoCondiviso(token)
        .then((doc) => {
          setSincronizzazione('online')
          if (doc.stato && revisione.current !== null && doc.revisione !== revisione.current) {
            daServer.current = true
            dispatch({ type: 'HYDRATE', payload: doc.stato })
            revisione.current = doc.revisione
            setCronologia(doc.cronologia ?? {})
          }
        })
        .catch(() => setSincronizzazione('offline'))
    }, 25_000)
    return () => clearInterval(intervallo)
  }, [])

  const value: StoreContextValue = {
    state,
    pronto,
    sincronizzazione,
    cronologia,
    creaPratica: (dati) => dispatch({ type: 'CREA_PRATICA', ...dati }),
    inviaAssessment: (praticaId) => dispatch({ type: 'INVIA_ASSESSMENT', praticaId }),
    registraAllegato: (praticaId, allegato) => dispatch({ type: 'REGISTRA_ALLEGATO', praticaId, allegato }),
    rimuoviAllegato: (praticaId, allegatoId) => dispatch({ type: 'RIMUOVI_ALLEGATO', praticaId, allegatoId }),
    modificaReportAF: (praticaId, allegatoId, contenuto) => dispatch({ type: 'MODIFICA_REPORT_AF', praticaId, allegatoId, contenuto }),
    confermaReportAF: (praticaId) => dispatch({ type: 'CONFERMA_REPORT_AF', praticaId }),
    clientePronto: (praticaId) => dispatch({ type: 'CLIENTE_PRONTO', praticaId }),
    avanzaStepAutonomo: (praticaId) => dispatch({ type: 'AVANZA_STEP_AUTONOMO', praticaId }),
    inviaChatCopy: (praticaId, testo) => dispatch({ type: 'INVIA_CHAT_COPY', praticaId, testo }),
    spostaFase: (praticaId, nuovaFase, autore) => dispatch({ type: 'SPOSTA_FASE', praticaId, nuovaFase, autore }),
    accettaDocumento: (praticaId, autore) => dispatch({ type: 'ACCETTA_DOCUMENTO', praticaId, autore }),
    salvaRevisione: (praticaId, dati) => dispatch({ type: 'SALVA_REVISIONE', praticaId, ...dati }),
    approvaApprendimento: (apprendimentoId) => dispatch({ type: 'APPROVA_APPRENDIMENTO', apprendimentoId }),
    scartaApprendimento: (apprendimentoId) => dispatch({ type: 'SCARTA_APPRENDIMENTO', apprendimentoId }),
    resetDemo: () => dispatch({ type: 'RESET' }),
    silos: mappaSilos(state),
    spostaSilo: (slug, silo) => dispatch({ type: 'SPOSTA_SILO', slug, silo }),
    avanzaSilo: (slug) => dispatch({ type: 'AVANZA_SILO', slug }),
    indietreggiaSilo: (slug) => dispatch({ type: 'INDIETREGGIA_SILO', slug }),
    resetSilos: () => dispatch({ type: 'RESET_SILOS' }),
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useApp(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useApp deve essere usato dentro <AppProvider>')
  return ctx
}

/** Conteggio notifiche per ruolo (badge in testata). */
export function contaNotifiche(state: AppState, ruolo: string): number {
  const inFase = (fasi: FaseId[]) => state.pratiche.filter((p) => fasi.includes(p.faseCorrente)).length
  switch (ruolo) {
    case 'tutor':
      // vendite da completare + cartelle in raccolta documenti
      return inFase(['vendita', 'raccolta-documenti'])
    case 'elisa':
      // clienti allo step 0 per cui Elisa deve caricare i documenti
      return inFase(['vendita', 'raccolta-documenti'])
    case 'irene':
      // supervisione step 4a: generazioni in corso + report AF con problemi
      return (
        inFase(['generazione']) +
        state.pratiche.filter((p) => p.reportAF && (p.reportAF.stato === 'generati' || p.reportAF.stato === 'errore')).length
      )
    case 'erogazione':
      return inFase(['generazione', 'revisione', 'visual', 'revisione-diagrammi', 'checkpoint-copy', 'impaginazione', 'revisione-impaginazione', 'approvazione-finale'])
    case 'copy':
      return inFase(['checkpoint-copy', 'approvazione-finale']) + state.apprendimenti.filter((a) => a.stato === 'in_attesa').length
    default:
      return 0
  }
}
