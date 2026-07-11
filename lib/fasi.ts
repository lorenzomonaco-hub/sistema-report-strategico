import { Fase, FaseId, Pratica } from './types'

/** Le 11 fasi della pipeline v2, in ordine.
 *  Tocchi umani: Tutor (1-2), Copy (checkpoint-copy e approvazione-finale).
 *  Tutto il resto è autonomo; il report AF (step 4a) corre in parallelo
 *  alla revisione ed è tracciato in pratica.reportAF. */
export const FASI: Fase[] = [
  { id: 'vendita', label: 'Vendita', owner: 'Tutor', descrizione: 'Il tutor registra la vendita — parte l\'email di notifica a tutor e Irene', badge: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500' },
  { id: 'raccolta-documenti', label: 'Raccolta documenti', owner: 'Tutor', descrizione: 'Il tutor carica AssessFirst, questionario e trascrizione, poi clicca «Cliente pronto»', badge: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500' },
  { id: 'generazione', label: 'Generazione', owner: 'Sistema (Christian)', descrizione: 'Il sistema di generazione sceglie il tipo di lavoro e produce i documenti', badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  { id: 'revisione', label: 'Revisione', owner: 'Sistema (Christian)', descrizione: 'Il revisore integrato dal sistema di Christian revisiona il documento', badge: 'bg-teal-100 text-teal-800', dot: 'bg-teal-500' },
  { id: 'visual', label: 'Diagrammi', owner: 'Agente Visual', descrizione: 'Inserimento automatico di tabelle, diagrammi e grafici', badge: 'bg-cyan-100 text-cyan-800', dot: 'bg-cyan-500' },
  { id: 'revisione-diagrammi', label: 'Revisione diagrammi', owner: 'Agente (loop)', descrizione: 'Rimanda al Visual in loop automatico finché i diagrammi non sono perfetti — e impara dai rimandi', badge: 'bg-violet-100 text-violet-800', dot: 'bg-violet-500' },
  { id: 'checkpoint-copy', label: 'Checkpoint Copy', owner: 'Copy', descrizione: 'Il copy accetta, oppure chiede le modifiche nella chat dedicata', badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  { id: 'impaginazione', label: 'Impaginazione', owner: 'Sistema (fase 8)', descrizione: 'Il motore di impaginazione produce il PDF nel modello grafico', badge: 'bg-stone-200 text-stone-800', dot: 'bg-stone-500' },
  { id: 'revisione-impaginazione', label: 'Revisione impaginazione', owner: 'Agente', descrizione: 'Confronto con tutta la knowledge base a caccia di discrepanze', badge: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500' },
  { id: 'approvazione-finale', label: 'Approvazione finale', owner: 'Copy', descrizione: 'Approvazione manuale — poi email al tutor col PDF da girare al cliente', badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  { id: 'completata', label: 'Completato', owner: '—', descrizione: 'PDF consegnato al tutor via email', badge: 'bg-green-100 text-green-800', dot: 'bg-green-600' },
]

/** Le colonne della board di Erogazione Copy (dalla presa in carico alla consegna). */
export const FASI_EROGAZIONE: Fase[] = FASI.filter((f) =>
  ['generazione', 'revisione', 'visual', 'revisione-diagrammi', 'checkpoint-copy', 'impaginazione', 'revisione-impaginazione', 'approvazione-finale', 'completata'].includes(f.id)
)

export const faseById = (id: FaseId): Fase => FASI.find((f) => f.id === id)!

export const indiceFase = (id: FaseId): number => FASI.findIndex((f) => f.id === id)

export const faseSuccessiva = (id: FaseId): FaseId | null => {
  const i = indiceFase(id)
  return i >= 0 && i < FASI.length - 1 ? FASI[i + 1].id : null
}

/** Fasi in cui il documento avanza da solo (nessun bottone umano). */
export const FASI_AUTONOME: FaseId[] = ['generazione', 'revisione', 'visual', 'revisione-diagrammi', 'impaginazione', 'revisione-impaginazione']

/** Macro-stati semplificati per l'area commerciale. */
export const statoCommerciale = (id: FaseId): { label: string; badge: string } => {
  if (id === 'vendita') return { label: 'Da completare', badge: 'bg-sky-100 text-sky-800' }
  if (id === 'raccolta-documenti') return { label: 'Raccolta documenti', badge: 'bg-indigo-100 text-indigo-800' }
  if (id === 'completata') return { label: 'Report consegnato', badge: 'bg-green-100 text-green-800' }
  return { label: 'In lavorazione automatica', badge: 'bg-emerald-100 text-emerald-800' }
}

/** Stato della cartella cliente: cosa c'è e cosa manca per «Cliente pronto».
 *  Nel flusso v2 carica TUTTO il tutor (anche gli AssessFirst). */
export function statoCartella(p: Pratica) {
  const ha = (tipo: string) => p.allegati.some((a) => a.tipo === tipo)
  const assessFatti = p.dipendenti.filter((d) => p.allegati.some((a) => a.tipo === 'assessfirst' && a.dipendente === d.nome))
  const voci = [
    { chiave: 'questionario', label: 'Questionario compilato', responsabile: 'Tutor', fatto: ha('questionario') },
    { chiave: 'trascrizione', label: 'Trascrizione analisi', responsabile: 'Tutor', fatto: ha('trascrizione') },
    {
      chiave: 'assessfirst',
      label: `AssessFirst dipendenti (${assessFatti.length}/${p.dipendenti.length})`,
      responsabile: 'Tutor',
      fatto: p.dipendenti.length > 0 && assessFatti.length === p.dipendenti.length,
    },
  ]
  return { voci, completa: voci.every((v) => v.fatto) }
}

/** true se il tutor ha caricato tutto (condizione per «Cliente pronto»). */
export const documentiTutorPronti = (p: Pratica): boolean => statoCartella(p).completa
