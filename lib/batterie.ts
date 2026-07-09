import { TipoLavoro } from './types'

// ─── Batterie di prompt (dalla "Guida per Creazione Report Strategiche e Piani Marketing") ───
// La scelta Branding / Consulenza fatta dal Team Copy determina quali prompt vengono usati:
// la Fase 3.3 (funnel, richiede lo studio di "Dot Com Secrets") è SOLO per i Piani Marketing (Branding).

export interface PromptBatteria {
  codice: string
  titolo: string
  /** null = presente in entrambe le batterie */
  soloPer: TipoLavoro | null
}

export const BATTERIA: PromptBatteria[] = [
  { codice: 'START 0', titolo: 'Regole di scrittura — voce di Frank, zero consulenzese', soloPer: null },
  { codice: '0.1', titolo: 'Con chi stiamo parlando — recap del cliente', soloPer: null },
  { codice: '0.2', titolo: 'Analisi iniziale del questionario — aspettative e realismo', soloPer: null },
  { codice: '1', titolo: 'Piano di lavoro per fasi', soloPer: null },
  { codice: '1.2', titolo: 'Introduzione e chiusura — La Panoramica delle Fasi', soloPer: null },
  { codice: 'FASE 1', titolo: 'Diagnosi & Vincoli', soloPer: null },
  { codice: 'FASE 2', titolo: 'Analisi concorrenti & parole in testa', soloPer: null },
  { codice: 'FASE 2.1', titolo: 'Analisi concorrenti — approfondimento', soloPer: null },
  { codice: 'FASE 2.2', titolo: 'Individuazione del posizionamento', soloPer: null },
  { codice: 'FASE 2.3', titolo: 'Posizionamento — chiusura di fase', soloPer: null },
  { codice: 'FASE 3', titolo: 'Offerte & marketing a risposta diretta', soloPer: null },
  { codice: 'FASE 3.1', titolo: 'Offerte — sviluppo', soloPer: null },
  { codice: 'FASE 3.2', titolo: 'Sistema di acquisizione clienti', soloPer: null },
  { codice: 'FASE 3.3', titolo: 'Funnel pronto all\'uso (Dot Com Secrets)', soloPer: 'branding' },
  { codice: 'FASE 3.4', titolo: 'Chiusura fase 3', soloPer: null },
  { codice: 'FASE 4', titolo: 'Ruoli, procedure, standard', soloPer: null },
  { codice: 'FASE 4.1', titolo: 'Cappello conclusivo fase 4', soloPer: null },
  { codice: 'FASE 5', titolo: 'Ciclo dei vincoli (facoltativo)', soloPer: null },
  { codice: 'LETTERA INIZIALE', titolo: 'Lettera iniziale del report', soloPer: null },
  { codice: 'CAP. SUCCESSIVO', titolo: 'Dove sei oggi e dove ha senso puntare davvero', soloPer: null },
  { codice: 'LETTERA CONCLUSIVA', titolo: 'Dove sei arrivato e chi puoi diventare', soloPer: null },
]

/** I prompt effettivamente eseguiti per un tipo di lavoro. */
export const batteriaPerTipo = (tipo: TipoLavoro): PromptBatteria[] =>
  BATTERIA.filter((p) => p.soloPer === null || p.soloPer === tipo)

export const ETICHETTA_TIPO: Record<TipoLavoro, { label: string; descrizione: string; badge: string }> = {
  consulenza: {
    label: 'Consulenza',
    descrizione: 'Report Strategico (Mastermind) — diagnosi, posizionamento, offerte, organizzazione',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  branding: {
    label: 'Branding',
    descrizione: 'Piano Marketing — include la Fase 3.3: funnel pronto all\'uso (Dot Com Secrets)',
    badge: 'bg-blue-100 text-blue-800',
  },
}

/** Id del prompt-template della batteria in base al tipo di lavoro. */
export const batteriaIdPerTipo = (tipo: TipoLavoro | null): string =>
  tipo === 'branding' ? 'batteria-branding' : 'batteria-consulenza'
