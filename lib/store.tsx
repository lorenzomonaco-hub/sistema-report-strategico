'use client'

// ─── Store globale del Sistema Report Strategico (client-side, persistito in localStorage) ───
// Il backend non esiste ancora: questo store simula tutto il comportamento della piattaforma.

import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { AppState, Apprendimento, FaseId, Pratica, TipoLavoro, VersioneDocumento } from './types'
import { documentiTutorPronti, faseById, faseSuccessiva, statoCartella } from './fasi'
import { batteriaIdPerTipo, batteriaPerTipo, ETICHETTA_TIPO } from './batterie'
import {
  ASSESSFIRST_MOCK,
  DOC_UNIFICATO_MOCK,
  QUESTIONARIO_MOCK,
  REPORT_AI_MOCK,
  REPORT_IRENE_MOCK,
  REPORT_VISUAL_MOCK,
  SEED_STATE,
  TRASCRIZIONE_MOCK,
} from './mock'

// v3: area commerciale a due persone (Tutor + Irene) con fase dedicata report-irene
const STORAGE_KEY = 'sistema-report-strategico-v3'

// Quando un revisore modifica un documento nella fase X, l'apprendimento
// migliora i passaggi PRECEDENTI (chi ha prodotto il documento che è stato corretto).
// Per le revisioni sul report generato, la batteria target dipende dal tipo di lavoro della pratica.
function targetApprendimento(pratica: Pratica): { id: string; nome: string } {
  switch (pratica.faseCorrente) {
    case 'revisione-carlo':
    case 'revisione-1': {
      const id = batteriaIdPerTipo(pratica.tipoLavoro)
      return id === 'batteria-branding'
        ? { id, nome: 'Batteria Branding — Piano Marketing (21 prompt)' }
        : { id, nome: 'Batteria Consulenza — Report Strategico (20 prompt)' }
    }
    case 'revisione-2':
      return { id: 'revisore-1', nome: 'Revisore 1 — Editor Metodo (5 Fasi)' }
    case 'leggibilita':
      return { id: 'agente-visual', nome: 'Agente Visual — Tabelle e Diagrammi' }
    case 'grafica':
      return { id: 'revisore-leggibilita', nome: 'Revisore Leggibilità' }
    default:
      return { id: batteriaIdPerTipo(pratica.tipoLavoro), nome: 'Batteria di Generazione' }
  }
}

type Azione =
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'RESET' }
  | { type: 'CREA_PRATICA'; azienda: string; cliente: string; email: string; dipendenti: string[] }
  | { type: 'INVIA_ASSESSMENT'; praticaId: string }
  | { type: 'CARICA_QUESTIONARIO_TRASCRIZIONE'; praticaId: string }
  | { type: 'CONFERMA_DOCUMENTI'; praticaId: string }
  | { type: 'CARICA_ASSESSFIRST'; praticaId: string; dipendenti: string[] }
  | { type: 'GENERA_REPORT_IRENE'; praticaId: string }
  | { type: 'AGGIORNA_REPORT_IRENE'; praticaId: string; contenuto: string }
  | { type: 'PASSA_A_EROGAZIONE'; praticaId: string }
  | { type: 'IMPOSTA_TIPO_LAVORO'; praticaId: string; tipo: TipoLavoro }
  | { type: 'SPOSTA_FASE'; praticaId: string; nuovaFase: FaseId; autore: string }
  | { type: 'UNISCI_DOCUMENTI'; praticaId: string }
  | { type: 'GENERA_REPORT'; praticaId: string }
  | { type: 'ACCETTA_DOCUMENTO'; praticaId: string; autore: string }
  | { type: 'SALVA_REVISIONE'; praticaId: string; autore: string; testoDopo: string; note: string }
  | { type: 'RIMANDA_INDIETRO'; praticaId: string; autore: string; motivo: string }
  | { type: 'COMPLETA_VISUAL'; praticaId: string }
  | { type: 'APPROVA_APPRENDIMENTO'; apprendimentoId: string }
  | { type: 'SCARTA_APPRENDIMENTO'; apprendimentoId: string }

const uid = () => Math.random().toString(36).slice(2, 10)
const ora = () => new Date().toISOString()

const aggiornaPratica = (state: AppState, praticaId: string, fn: (p: Pratica) => Pratica): AppState => ({
  ...state,
  pratiche: state.pratiche.map((p) => (p.id === praticaId ? fn(p) : p)),
})

const ultimaVersione = (p: Pratica): VersioneDocumento | undefined => p.versioni[p.versioni.length - 1]

function reducer(state: AppState, azione: Azione): AppState {
  switch (azione.type) {
    case 'HYDRATE':
      return azione.payload

    case 'RESET':
      return SEED_STATE

    case 'CREA_PRATICA': {
      const nuova: Pratica = {
        id: `pr-${uid()}`,
        azienda: azione.azienda,
        cliente: azione.cliente,
        email: azione.email,
        tutor: 'Giulia T.',
        dipendenti: azione.dipendenti,
        tipoLavoro: null,
        faseCorrente: 'vendita',
        dataCreazione: ora(),
        allegati: [],
        versioni: [],
        storico: [{ fase: 'vendita', azione: 'Vendita registrata dal tutor', autore: 'Giulia T. (Tutor)', dataOra: ora() }],
      }
      return { ...state, pratiche: [nuova, ...state.pratiche] }
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

    case 'CONFERMA_DOCUMENTI': {
      const pratica = state.pratiche.find((p) => p.id === azione.praticaId)
      if (!pratica || !documentiTutorPronti(pratica)) return state
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        faseCorrente: 'report-irene',
        storico: [
          ...p.storico,
          { fase: 'raccolta-documenti', azione: 'Il tutor ha confermato che tutti i dati sono presenti — Irene notificata', autore: 'Giulia T. (Tutor)', dataOra: ora() },
        ],
      }))
    }

    case 'CARICA_QUESTIONARIO_TRASCRIZIONE':
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        allegati: [
          ...p.allegati.filter((a) => a.tipo !== 'questionario' && a.tipo !== 'trascrizione'),
          { id: `al-${uid()}`, nome: 'Questionario compilato.pdf', tipo: 'questionario', caricatoDa: 'Giulia T. (Tutor)', dataCaricamento: ora(), contenuto: QUESTIONARIO_MOCK },
          { id: `al-${uid()}`, nome: 'Trascrizione analisi.pdf', tipo: 'trascrizione', caricatoDa: 'Giulia T. (Tutor)', dataCaricamento: ora(), contenuto: TRASCRIZIONE_MOCK },
        ],
        storico: [...p.storico, { fase: 'raccolta-documenti', azione: 'Questionario e trascrizione caricati', autore: 'Giulia T. (Tutor)', dataOra: ora() }],
      }))

    case 'CARICA_ASSESSFIRST':
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        allegati: [
          ...p.allegati,
          ...azione.dipendenti
            .filter((d) => !p.allegati.some((a) => a.tipo === 'assessfirst' && a.dipendente === d))
            .map((d) => ({
              id: `al-${uid()}`,
              nome: `AssessFirst - ${d}.pdf`,
              tipo: 'assessfirst' as const,
              caricatoDa: 'Irene',
              dataCaricamento: ora(),
              dipendente: d,
              contenuto: ASSESSFIRST_MOCK(d),
            })),
        ],
        storico: [
          ...p.storico,
          { fase: 'report-irene', azione: `AssessFirst caricati nel blocco cliente (${azione.dipendenti.length} dipendenti)`, autore: 'Irene', dataOra: ora() },
        ],
      }))

    case 'GENERA_REPORT_IRENE':
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        allegati: [
          ...p.allegati.filter((a) => a.tipo !== 'report-irene'),
          { id: `al-${uid()}`, nome: 'Report AssessFirst del team.pdf', tipo: 'report-irene', caricatoDa: 'Irene', dataCaricamento: ora(), contenuto: REPORT_IRENE_MOCK },
        ],
        storico: [
          ...p.storico,
          { fase: 'report-irene', azione: 'Report AssessFirst del team generato con il prompt dedicato', autore: 'Irene', dataOra: ora() },
        ],
      }))

    case 'AGGIORNA_REPORT_IRENE':
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        allegati: p.allegati.map((a) => (a.tipo === 'report-irene' ? { ...a, contenuto: azione.contenuto } : a)),
        storico: [
          ...p.storico,
          { fase: 'report-irene', azione: 'Report AssessFirst ricontrollato e sistemato', autore: 'Irene', dataOra: ora() },
        ],
      }))

    case 'PASSA_A_EROGAZIONE': {
      const pratica = state.pratiche.find((p) => p.id === azione.praticaId)
      if (!pratica || !statoCartella(pratica).completa) return state
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        faseCorrente: 'generazione',
        storico: [
          ...p.storico,
          { fase: 'report-irene', azione: 'Blocco cliente completo — inviato a Erogazione Copy (Carlo notificato)', autore: 'Irene', dataOra: ora() },
        ],
      }))
    }

    case 'IMPOSTA_TIPO_LAVORO':
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        tipoLavoro: azione.tipo,
        storico: [
          ...p.storico,
          {
            fase: p.faseCorrente,
            azione: `Tipo di lavoro impostato: ${ETICHETTA_TIPO[azione.tipo].label} — la batteria di prompt si è aggiornata automaticamente`,
            autore: 'Carlo',
            dataOra: ora(),
          },
        ],
      }))

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

    case 'UNISCI_DOCUMENTI':
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        versioni: [
          ...p.versioni,
          { id: `v-${uid()}`, fase: 'generazione', autore: 'Carlo', dataOra: ora(), contenuto: DOC_UNIFICATO_MOCK, tipo: 'umano', etichetta: 'Documento unificato' },
        ],
        storico: [...p.storico, { fase: 'generazione', azione: 'Documenti unificati in un documento unico', autore: 'Carlo', dataOra: ora() }],
      }))

    case 'GENERA_REPORT':
      return aggiornaPratica(state, azione.praticaId, (p) => {
        const etichettaBatteria = p.tipoLavoro
          ? `batteria ${ETICHETTA_TIPO[p.tipoLavoro].label} (${batteriaPerTipo(p.tipoLavoro).length} prompt)`
          : 'batteria di prompt'
        return {
          ...p,
          faseCorrente: 'revisione-carlo',
          versioni: [
            ...p.versioni,
            { id: `v-${uid()}`, fase: 'generazione', autore: `Sistema (${etichettaBatteria})`, dataOra: ora(), contenuto: REPORT_AI_MOCK, tipo: 'ai', etichetta: "Report generato dall'AI" },
          ],
          storico: [...p.storico, { fase: 'generazione', azione: `Report generato con la ${etichettaBatteria}`, autore: 'Sistema', dataOra: ora() }],
        }
      })

    case 'ACCETTA_DOCUMENTO': {
      const pratica = state.pratiche.find((p) => p.id === azione.praticaId)
      if (!pratica) return state
      const prossima = faseSuccessiva(pratica.faseCorrente)
      if (!prossima) return state
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        faseCorrente: prossima,
        storico: [...p.storico, { fase: p.faseCorrente, azione: 'Documento accettato', autore: azione.autore, dataOra: ora() }],
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

    case 'RIMANDA_INDIETRO':
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        faseCorrente: 'revisione-1',
        storico: [...p.storico, { fase: p.faseCorrente, azione: `Rimandato al Revisore 1: ${azione.motivo}`, autore: azione.autore, dataOra: ora() }],
      }))

    case 'COMPLETA_VISUAL':
      return aggiornaPratica(state, azione.praticaId, (p) => ({
        ...p,
        faseCorrente: 'leggibilita',
        versioni: [
          ...p.versioni,
          { id: `v-${uid()}`, fase: 'visual', autore: 'Agente Visual', dataOra: ora(), contenuto: REPORT_VISUAL_MOCK, tipo: 'ai', etichetta: 'Report con elementi visual' },
        ],
        storico: [...p.storico, { fase: 'visual', azione: 'Elementi visual inseriti automaticamente', autore: 'Agente Visual', dataOra: ora() }],
      }))

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

    default:
      return state
  }
}

// ─── Context ───

interface StoreContextValue {
  state: AppState
  /** true dopo che lo stato salvato è stato ripristinato da localStorage */
  pronto: boolean
  creaPratica: (dati: { azienda: string; cliente: string; email: string; dipendenti: string[] }) => void
  inviaAssessment: (praticaId: string) => void
  caricaQuestionarioTrascrizione: (praticaId: string) => void
  confermaDocumenti: (praticaId: string) => void
  caricaAssessFirst: (praticaId: string, dipendenti: string[]) => void
  generaReportIrene: (praticaId: string) => void
  aggiornaReportIrene: (praticaId: string, contenuto: string) => void
  passaAErogazione: (praticaId: string) => void
  impostaTipoLavoro: (praticaId: string, tipo: TipoLavoro) => void
  spostaFase: (praticaId: string, nuovaFase: FaseId, autore: string) => void
  unisciDocumenti: (praticaId: string) => void
  generaReport: (praticaId: string) => void
  accettaDocumento: (praticaId: string, autore: string) => void
  salvaRevisione: (praticaId: string, dati: { autore: string; testoDopo: string; note: string }) => void
  rimandaIndietro: (praticaId: string, autore: string, motivo: string) => void
  completaVisual: (praticaId: string) => void
  approvaApprendimento: (apprendimentoId: string) => void
  scartaApprendimento: (apprendimentoId: string) => void
  resetDemo: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, SEED_STATE)
  const [pronto, setPronto] = React.useState(false)
  const idratato = useRef(false)

  useEffect(() => {
    try {
      const salvato = localStorage.getItem(STORAGE_KEY)
      if (salvato) dispatch({ type: 'HYDRATE', payload: JSON.parse(salvato) as AppState })
    } catch {
      // stato corrotto: si riparte dal seed
    }
    idratato.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- idratazione intenzionale una-tantum da localStorage
    setPronto(true)
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
  }, [state])

  const value: StoreContextValue = {
    state,
    pronto,
    creaPratica: (dati) => dispatch({ type: 'CREA_PRATICA', ...dati }),
    inviaAssessment: (praticaId) => dispatch({ type: 'INVIA_ASSESSMENT', praticaId }),
    caricaQuestionarioTrascrizione: (praticaId) => dispatch({ type: 'CARICA_QUESTIONARIO_TRASCRIZIONE', praticaId }),
    confermaDocumenti: (praticaId) => dispatch({ type: 'CONFERMA_DOCUMENTI', praticaId }),
    caricaAssessFirst: (praticaId, dipendenti) => dispatch({ type: 'CARICA_ASSESSFIRST', praticaId, dipendenti }),
    generaReportIrene: (praticaId) => dispatch({ type: 'GENERA_REPORT_IRENE', praticaId }),
    aggiornaReportIrene: (praticaId, contenuto) => dispatch({ type: 'AGGIORNA_REPORT_IRENE', praticaId, contenuto }),
    passaAErogazione: (praticaId) => dispatch({ type: 'PASSA_A_EROGAZIONE', praticaId }),
    impostaTipoLavoro: (praticaId, tipo) => dispatch({ type: 'IMPOSTA_TIPO_LAVORO', praticaId, tipo }),
    spostaFase: (praticaId, nuovaFase, autore) => dispatch({ type: 'SPOSTA_FASE', praticaId, nuovaFase, autore }),
    unisciDocumenti: (praticaId) => dispatch({ type: 'UNISCI_DOCUMENTI', praticaId }),
    generaReport: (praticaId) => dispatch({ type: 'GENERA_REPORT', praticaId }),
    accettaDocumento: (praticaId, autore) => dispatch({ type: 'ACCETTA_DOCUMENTO', praticaId, autore }),
    salvaRevisione: (praticaId, dati) => dispatch({ type: 'SALVA_REVISIONE', praticaId, ...dati }),
    rimandaIndietro: (praticaId, autore, motivo) => dispatch({ type: 'RIMANDA_INDIETRO', praticaId, autore, motivo }),
    completaVisual: (praticaId) => dispatch({ type: 'COMPLETA_VISUAL', praticaId }),
    approvaApprendimento: (apprendimentoId) => dispatch({ type: 'APPROVA_APPRENDIMENTO', apprendimentoId }),
    scartaApprendimento: (apprendimentoId) => dispatch({ type: 'SCARTA_APPRENDIMENTO', apprendimentoId }),
    resetDemo: () => dispatch({ type: 'RESET' }),
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
      // vendite da inviare + cartelle in raccolta documenti
      return inFase(['vendita', 'raccolta-documenti'])
    case 'irene':
      // blocchi cliente confermati dal tutor, in attesa della sua preparazione
      return inFase(['report-irene'])
    case 'erogazione':
      return inFase(['generazione', 'revisione-carlo', 'revisione-1', 'revisione-2', 'visual', 'leggibilita', 'grafica'])
    case 'carlo':
      return inFase(['generazione', 'revisione-carlo']) + state.apprendimenti.filter((a) => a.stato === 'in_attesa').length
    default:
      return 0
  }
}
