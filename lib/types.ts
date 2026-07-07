// ─── Tipi condivisi del Sistema Report Strategico ───

export type FaseId =
  | 'vendita'
  | 'raccolta-documenti'
  | 'generazione'
  | 'revisione-carlo'
  | 'revisione-1'
  | 'revisione-2'
  | 'visual'
  | 'leggibilita'
  | 'grafica'
  | 'completata'

export interface Fase {
  id: FaseId
  label: string
  owner: string
  descrizione: string
  /** classi Tailwind complete per il badge, es. "bg-sky-100 text-sky-800" */
  badge: string
  /** classe Tailwind completa per il pallino, es. "bg-sky-500" */
  dot: string
}

export type TipoDocumento =
  | 'questionario'
  | 'trascrizione'
  | 'assessfirst'
  | 'report-irene'
  | 'unificato'
  | 'report'

export interface DocumentoAllegato {
  id: string
  nome: string
  tipo: TipoDocumento
  caricatoDa: string
  dataCaricamento: string
  /** per gli AssessFirst: il dipendente a cui si riferisce il test */
  dipendente?: string
  /** contenuto visualizzabile del documento (demo) */
  contenuto?: string
}

export interface VersioneDocumento {
  id: string
  fase: FaseId
  autore: string
  dataOra: string
  contenuto: string
  tipo: 'ai' | 'umano'
  etichetta: string
}

export interface VoceStorico {
  fase: FaseId
  azione: string
  autore: string
  dataOra: string
}

/** Tipo di lavoro: determina quale batteria di prompt viene usata dalla generazione. */
export type TipoLavoro = 'branding' | 'consulenza'

export interface Pratica {
  id: string
  azienda: string
  cliente: string
  email: string
  venditore: string
  tutor: string
  /** dipendenti del cliente per cui servono gli AssessFirst */
  dipendenti: string[]
  /** scelto da Carlo quando la cartella arriva in Erogazione Copy; null = da scegliere */
  tipoLavoro: TipoLavoro | null
  faseCorrente: FaseId
  dataCreazione: string
  allegati: DocumentoAllegato[]
  versioni: VersioneDocumento[]
  storico: VoceStorico[]
}

export interface Apprendimento {
  id: string
  praticaId: string
  praticaNome: string
  fase: FaseId
  dataOra: string
  autoreRevisione: string
  /** cosa il sistema ha imparato dalla revisione */
  lezione: string
  /** id del PromptTemplate che verrebbe migliorato */
  promptTargetId: string
  promptTargetNome: string
  /** proposta di miglioramento del prompt */
  miglioramentoProposto: string
  testoPrima: string
  testoDopo: string
  note: string
  stato: 'in_attesa' | 'approvato' | 'scartato'
}

export interface VoceChangelog {
  versione: string
  data: string
  descrizione: string
}

export interface PromptTemplate {
  id: string
  nome: string
  faseUso: string
  versione: string
  ultimaModifica: string
  changelog: VoceChangelog[]
}

export interface AppState {
  pratiche: Pratica[]
  apprendimenti: Apprendimento[]
  prompts: PromptTemplate[]
}
