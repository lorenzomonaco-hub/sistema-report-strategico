// ─── Tipi condivisi del Sistema Report Strategico ───

export type FaseId =
  | 'vendita'
  | 'raccolta-documenti'
  | 'generazione'
  | 'revisione'
  | 'visual'
  | 'revisione-diagrammi'
  | 'checkpoint-copy'
  | 'impaginazione'
  | 'revisione-impaginazione'
  | 'approvazione-finale'
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
  | 'report-af'
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
  /** per gli AssessFirst: quale dei 4 (SWIPE | DRIVE | BRAIN | Comportamenti) */
  sottotipo?: string
  /** id del file REALE nello storage del blocco dati (persiste fino alla 4a) */
  fileId?: string
  /** dimensione in byte del file caricato */
  dimensione?: number
  /** contenuto visualizzabile del documento (demo/legacy) */
  contenuto?: string
}

/** I 4 documenti AssessFirst che il venditore carica per ogni persona. */
export const ASSESSFIRST_TIPI = ['SWIPE', 'DRIVE', 'BRAIN', 'Comportamenti chiave'] as const
export type AssessFirstTipo = (typeof ASSESSFIRST_TIPI)[number]

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

/** Qualifica della persona che fa il test AssessFirst: decide il registro del report 4a. */
export type Qualifica = 'titolare' | 'socio' | 'dipendente'

/** I ruoli selezionabili dal tutor (menù a tendina). Estendibile: Lorenzo ne
 *  aggiungerà altri. «Altro» abilita un campo libero. */
export const RUOLI = ['Imprenditore', 'Socio', 'Venditore', 'Marketing', 'Segretaria', 'Altro'] as const
export type Ruolo = (typeof RUOLI)[number]

/** Dal ruolo deriviamo la qualifica che serve al 4a (casi a/b/c):
 *  Imprenditore = titolare, Socio = socio, tutti gli altri = dipendente. */
export function qualificaDaRuolo(ruolo: string): Qualifica {
  const r = (ruolo || '').trim().toLowerCase()
  if (r === 'imprenditore') return 'titolare'
  if (r === 'socio') return 'socio'
  return 'dipendente'
}

/** Persona registrata dal tutor alla vendita: da qui il 4a deriva tutto in automatico. */
export interface PersonaAF {
  /** nome e cognome ESATTI (finiscono nell'intestazione del report) */
  nome: string
  /** email personale della persona */
  email: string
  qualifica: Qualifica
  /** ruolo operativo scelto dal menù (o testo libero se «Altro») */
  ruolo: string
}

/** Regola di indirizzo del report AF (casi a/b/c del prompt), derivata dall'anagrafica:
 *  a = la persona è titolare o socio (report intestato a lei);
 *  b = dipendente, un solo vertice (report al titolare);
 *  c = dipendente, più vertici (report a tutte le figure, «voi»). */
export function relazioneAF(
  pratica: { dipendenti: PersonaAF[]; cliente: string },
  persona: PersonaAF
): { caso: 'a' | 'b' | 'c'; destinatario: string } {
  if (persona.qualifica !== 'dipendente') return { caso: 'a', destinatario: persona.nome }
  const vertici = pratica.dipendenti.filter((p) => p.qualifica !== 'dipendente')
  if (vertici.length <= 1) return { caso: 'b', destinatario: vertici[0]?.nome ?? pratica.cliente }
  return { caso: 'c', destinatario: vertici.map((v) => v.nome).join(', ') }
}

/** Stato del passaggio AUTONOMO 4a: report AssessFirst per dipendente + email al tutor.
 *  Corre in parallelo alla revisione; Irene lo supervisiona. */
export interface StatoReportAF {
  stato: 'in_attesa' | 'generati' | 'email_inviata' | 'errore'
  dataOra?: string
  dettaglio?: string
}

/** Messaggio della chat dedicata del checkpoint copy (step 8). */
export interface MessaggioChat {
  autore: 'copy' | 'agente'
  testo: string
  dataOra: string
}

export interface Pratica {
  id: string
  azienda: string
  cliente: string
  email: string
  tutor: string
  /** persone (titolari, soci, dipendenti) che fanno il test AssessFirst */
  dipendenti: PersonaAF[]
  /** scelto dal sistema di generazione (Christian); null = non ancora determinato */
  tipoLavoro: TipoLavoro | null
  faseCorrente: FaseId
  dataCreazione: string
  allegati: DocumentoAllegato[]
  versioni: VersioneDocumento[]
  storico: VoceStorico[]
  /** step autonomo 4a (parallelo alla revisione) */
  reportAF?: StatoReportAF
  /** chat del checkpoint copy */
  chatCopy?: MessaggioChat[]
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
  /** Posizione nel silo di OGNI cliente della pipeline Consulenze Frank
   *  (slug → SiloId): i 34 ufficiali + i clienti nuovi registrati in area
   *  commerciale. Fonte condivisa per board /erogazione, Gantt e vista tutor.
   *  Opzionale per retro-compatibilità con stati salvati prima. */
  siloClienti?: Record<string, string>
  /** Flag di migrazione una-tantum: quando manca (stati vecchi), le pratiche e
   *  gli apprendimenti di DEMO vengono ripuliti al caricamento. I clienti reali
   *  vengono creati dopo, con il flag già a true, quindi non vengono toccati. */
  seedPulito?: boolean
}
