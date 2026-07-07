import { Fase, FaseId, Pratica } from './types'

/** Le 11 fasi della pipeline, in ordine. */
export const FASI: Fase[] = [
  { id: 'vendita', label: 'Vendita', owner: 'Tutor', descrizione: 'Il tutor registra la vendita e invia assessment e questionario al cliente', badge: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500' },
  { id: 'raccolta-documenti', label: 'Raccolta documenti', owner: 'Tutor', descrizione: 'Il tutor carica questionario e trascrizione e conferma quando tutto è presente', badge: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500' },
  { id: 'report-irene', label: 'Preparazione Irene', owner: 'Irene', descrizione: 'Irene carica gli AssessFirst, verifica la cartella e genera il report del team', badge: 'bg-violet-100 text-violet-800', dot: 'bg-violet-500' },
  { id: 'generazione', label: 'Da lavorare', owner: 'Carlo', descrizione: 'Cartella completa: scelta del tipo, unificazione e generazione report', badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  { id: 'revisione-carlo', label: 'Revisione Carlo', owner: 'Carlo', descrizione: 'Prima revisione umana del report generato', badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-600' },
  { id: 'revisione-1', label: 'Revisore 1', owner: 'Revisore 1', descrizione: 'Revisione editoriale — Editor Metodo (5 fasi)', badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  { id: 'revisione-2', label: 'Revisore 2', owner: 'Revisore 2', descrizione: 'Controllo qualità sul lavoro del Revisore 1', badge: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500' },
  { id: 'visual', label: 'Visual', owner: 'Sistema', descrizione: 'Inserimento automatico di tabelle e diagrammi', badge: 'bg-cyan-100 text-cyan-800', dot: 'bg-cyan-500' },
  { id: 'leggibilita', label: 'Leggibilità', owner: 'Revisore Leggibilità', descrizione: 'Verifica che i visual migliorino la comprensione', badge: 'bg-violet-100 text-violet-800', dot: 'bg-violet-500' },
  { id: 'grafica', label: 'Grafica', owner: 'Collega Grafica', descrizione: 'Impaginazione professionale finale', badge: 'bg-stone-200 text-stone-800', dot: 'bg-stone-500' },
  { id: 'completata', label: 'Completato', owner: '—', descrizione: 'Report consegnato al cliente', badge: 'bg-green-100 text-green-800', dot: 'bg-green-600' },
]

/** Le colonne della board di Erogazione Copy (dalla presa in carico alla consegna). */
export const FASI_EROGAZIONE: Fase[] = FASI.filter((f) =>
  ['generazione', 'revisione-carlo', 'revisione-1', 'revisione-2', 'visual', 'leggibilita', 'grafica', 'completata'].includes(f.id)
)

export const faseById = (id: FaseId): Fase => FASI.find((f) => f.id === id)!

export const indiceFase = (id: FaseId): number => FASI.findIndex((f) => f.id === id)

export const faseSuccessiva = (id: FaseId): FaseId | null => {
  const i = indiceFase(id)
  return i >= 0 && i < FASI.length - 1 ? FASI[i + 1].id : null
}

/** Macro-stati semplificati per l'area commerciale (dopo la consegna il team copy resta una scatola chiusa). */
export const statoCommerciale = (id: FaseId): { label: string; badge: string } => {
  if (id === 'vendita') return { label: 'Da inviare al cliente', badge: 'bg-sky-100 text-sky-800' }
  if (id === 'raccolta-documenti') return { label: 'Raccolta documenti', badge: 'bg-indigo-100 text-indigo-800' }
  if (id === 'report-irene') return { label: 'In preparazione da Irene', badge: 'bg-violet-100 text-violet-800' }
  if (id === 'completata') return { label: 'Report consegnato', badge: 'bg-green-100 text-green-800' }
  return { label: 'In lavorazione dal team copy', badge: 'bg-emerald-100 text-emerald-800' }
}

/** Stato della cartella cliente: cosa c'è e cosa manca prima del passaggio a Erogazione Copy. */
export function statoCartella(p: Pratica) {
  const ha = (tipo: string) => p.allegati.some((a) => a.tipo === tipo)
  const assessFatti = p.dipendenti.filter((d) => p.allegati.some((a) => a.tipo === 'assessfirst' && a.dipendente === d))
  const voci = [
    { chiave: 'questionario', label: 'Questionario compilato', responsabile: 'Tutor', fatto: ha('questionario') },
    { chiave: 'trascrizione', label: 'Trascrizione analisi', responsabile: 'Tutor', fatto: ha('trascrizione') },
    {
      chiave: 'assessfirst',
      label: `AssessFirst dipendenti (${assessFatti.length}/${p.dipendenti.length})`,
      responsabile: 'Irene',
      fatto: p.dipendenti.length > 0 && assessFatti.length === p.dipendenti.length,
    },
    { chiave: 'report-irene', label: 'Report AssessFirst (prompt)', responsabile: 'Irene', fatto: ha('report-irene') },
  ]
  return { voci, completa: voci.every((v) => v.fatto) }
}

/** true se il tutor ha già caricato le sue due voci (condizione per "Dati completi"). */
export const documentiTutorPronti = (p: Pratica): boolean =>
  p.allegati.some((a) => a.tipo === 'questionario') && p.allegati.some((a) => a.tipo === 'trascrizione')
