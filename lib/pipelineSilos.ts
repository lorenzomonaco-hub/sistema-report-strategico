// ─── Pipeline a silos (compartimenti stagni) — definizione ───
// I passaggi reali del progetto Consulenze Frank modellati come silos a
// compartimento stagno: un cliente sta in UN silo alla volta e avanza al
// successivo quando quel silo ha finito.
//
// Lo STATO "in quale silo è ogni cliente" NON vive più qui: è nel backend
// condiviso (AppState.siloClienti in lib/store), così board /erogazione, Gantt
// Consulenze Frank e vista tutor leggono e scrivono la stessa fonte dati e i
// clienti nuovi registrati in area commerciale compaiono ovunque.
//
// Step 0 = "documenti": la vendita è registrata ma mancano i documenti (li
// carica Elisa). Quando i documenti sono completi il cliente passa a "copy".

import { CONSULENZE_FRANK, FaseFrank, slugFrank } from './consulenzeFrank'

export type SiloId = 'bloccato' | 'documenti' | 'copy' | 'jelo' | 'lavorazione' | 'valentino' | 'consegnato'

export type Silo = {
  id: SiloId
  ordine: number
  label: string
  owner: string
  spec: string          // la specifica del compartimento stagno (cosa fa, cosa entra/esce)
  soloBranding?: boolean // il silo Jelo riguarda solo i progetti di branding
  colore: { pieno: string; track: string; testo: string; punto: string }
}

// Step 0 (grigio, pre-pipeline) → scala rosso → verde lungo il flusso.
// NB: Grippo (testo) e Caputo (immagini) sono uniti in un unico passaggio
// «Revisione e grafici» (sarà un solo agente, più lungo). Irene NON è più nella
// pipeline: ha un'area dedicata (/erogazione/irene) per i report AssessFirst.
export const SILOS: Silo[] = [
  { id: 'bloccato', ordine: -1, label: 'Bloccati', owner: 'Fuori dal flusso',
    spec: 'Clienti fermi per un problema (blocco in azienda, cambio modello di business, ecc.). Carlo annota la motivazione e fissa una data di reminder per il follow-up.',
    colore: { pieno: 'bg-zinc-500', track: 'bg-zinc-500/15', testo: 'text-zinc-600', punto: 'bg-zinc-500' } },
  { id: 'documenti', ordine: 0, label: 'Documenti (step 0)', owner: 'Elisa',
    spec: 'La vendita è registrata dal tutor ma mancano i documenti. Elisa carica questionario, trascrizione e i 4 AssessFirst per persona. Quando è tutto presente, il cliente passa al Copy.',
    colore: { pieno: 'bg-slate-400', track: 'bg-slate-400/15', testo: 'text-slate-600', punto: 'bg-slate-400' } },
  { id: 'copy', ordine: 1, label: 'Creazione copy', owner: 'Copy (Carlo / Paolo / Luigi)',
    spec: 'Scrive il piano marketing o branding a partire dal questionario. Esce: bozza testo completa.',
    colore: { pieno: 'bg-red-500', track: 'bg-red-500/15', testo: 'text-red-700', punto: 'bg-red-500' } },
  { id: 'jelo', ordine: 2, label: 'Revisione avvocato Jelo', owner: 'Avv. Jelo', soloBranding: true,
    spec: 'Solo per i progetti di branding: verifica legale del marchio (~3 giorni lavorativi). Esce: ok legale.',
    colore: { pieno: 'bg-orange-500', track: 'bg-orange-500/15', testo: 'text-orange-700', punto: 'bg-orange-500' } },
  { id: 'lavorazione', ordine: 3, label: 'Revisione e grafici', owner: 'Agente AI (testo + grafici)',
    spec: 'Un unico passaggio: revisione del testo e inserimento di diagrammi, tabelle e immagini. Entra: bozza copy. Esce: documento revisionato e con la parte visiva.',
    colore: { pieno: 'bg-amber-500', track: 'bg-amber-500/15', testo: 'text-amber-700', punto: 'bg-amber-500' } },
  { id: 'valentino', ordine: 4, label: 'Grafica finale', owner: 'Agente AI Valentino',
    spec: 'Impaginazione e grafica finale. Entra: documento revisionato con immagini. Esce: report impaginato.',
    colore: { pieno: 'bg-green-500', track: 'bg-green-500/15', testo: 'text-green-700', punto: 'bg-green-600' } },
  { id: 'consegnato', ordine: 5, label: 'Consegnato', owner: 'Delivery',
    spec: 'Report consegnato al cliente. Prossimo passaggio: consulenza con Frank.',
    colore: { pieno: 'bg-green-700', track: 'bg-green-700/15', testo: 'text-green-800', punto: 'bg-green-700' } },
]

/** Normalizza valori di silo salvati con il vecchio modello (grippo/caputo/irene). */
export function normalizzaSilo(id: string): SiloId {
  if (id === 'grippo' || id === 'caputo') return 'lavorazione'
  if (id === 'irene') return 'valentino'
  return (SILOS.some((s) => s.id === id) ? id : 'documenti') as SiloId
}

export const siloById = (id: SiloId): Silo => SILOS.find((s) => s.id === id)!
export const siloSuccessivo = (id: SiloId): SiloId | null => {
  const s = siloById(id); const next = SILOS.find((x) => x.ordine === s.ordine + 1); return next ? next.id : null
}
export const siloPrecedente = (id: SiloId): SiloId | null => {
  const s = siloById(id); const prev = SILOS.find((x) => x.ordine === s.ordine - 1); return prev ? prev.id : null
}

// La fase del Gantt (1..6) mappa sui silos di produzione. Lo step 0 "documenti"
// e il silo "irene" (AssessFirst) non hanno una fase nel Gantt storico dei 34.
const FASE_TO_SILO: Record<FaseFrank, SiloId> = {
  1: 'copy', 2: 'jelo', 3: 'lavorazione', 4: 'lavorazione', 5: 'valentino', 6: 'consegnato',
}
export const SILO_TO_FASE: Record<SiloId, FaseFrank> = {
  bloccato: 1, documenti: 1, copy: 1, jelo: 2, lavorazione: 3, valentino: 5, consegnato: 6,
}

/** È uno step di produzione con una fase 1..6 nel Gantt storico? (documenti = no) */
export const siloHaFase = (id: SiloId): boolean => id !== 'documenti'

export type MappaSilos = Record<string, SiloId> // slug cliente → silo

/** Posizione di partenza dei 34 clienti ufficiali (dal loro fase nel piano). */
export function siloSeed(): MappaSilos {
  const m: MappaSilos = {}
  for (const r of CONSULENZE_FRANK) m[slugFrank(r.cliente)] = FASE_TO_SILO[r.fase]
  return m
}
