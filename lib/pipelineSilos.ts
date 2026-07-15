// ─── Pipeline a silos (compartimenti stagni) — stato vivo ───
// I 5 passaggi reali del progetto Consulenze Frank + il report AssessFirst di
// Irene, modellati come silos a compartimento stagno: un cliente sta in UN silo
// alla volta e avanza al successivo quando quel silo ha finito. Lo stato "in
// quale silo è ogni cliente" è vivo e persistito: la board /erogazione lo muove,
// il Gantt Consulenze Frank lo legge — stesso stato, si aggiornano insieme.
//
// Per ora l'avanzamento è manuale (spostamento sulla board). Gli agenti reali
// (Grippo/Caputo/Valentino) si agganceranno ai rispettivi silos rispettando il
// contratto dei blocchi già presente nel progetto (GET /health, POST /jobs, …).

import { useSyncExternalStore } from 'react'
import { CONSULENZE_FRANK, FaseFrank, slugFrank } from './consulenzeFrank'

export type SiloId = 'copy' | 'jelo' | 'grippo' | 'caputo' | 'valentino' | 'irene' | 'consegnato'

export type Silo = {
  id: SiloId
  ordine: number
  label: string
  owner: string
  spec: string          // la specifica del compartimento stagno (cosa fa, cosa entra/esce)
  soloBranding?: boolean // il silo Jelo riguarda solo i progetti di branding
  colore: { pieno: string; track: string; testo: string; punto: string }
}

// Scala rosso → verde lungo il flusso.
export const SILOS: Silo[] = [
  { id: 'copy', ordine: 1, label: 'Creazione copy', owner: 'Copy (Carlo / Paolo / Luigi)',
    spec: 'Scrive il piano marketing o branding a partire dal questionario. Esce: bozza testo completa.',
    colore: { pieno: 'bg-red-500', track: 'bg-red-500/15', testo: 'text-red-700', punto: 'bg-red-500' } },
  { id: 'jelo', ordine: 2, label: 'Revisione avvocato Jelo', owner: 'Avv. Jelo', soloBranding: true,
    spec: 'Solo per i progetti di branding: verifica legale del marchio (~3 giorni lavorativi). Esce: ok legale.',
    colore: { pieno: 'bg-orange-500', track: 'bg-orange-500/15', testo: 'text-orange-700', punto: 'bg-orange-500' } },
  { id: 'grippo', ordine: 3, label: 'Grippo — Testo', owner: 'Agente AI Grippo',
    spec: 'Revisione del testo. Entra: bozza copy. Esce: testo revisionato e approvato.',
    colore: { pieno: 'bg-amber-500', track: 'bg-amber-500/15', testo: 'text-amber-700', punto: 'bg-amber-500' } },
  { id: 'caputo', ordine: 4, label: 'Caputo — Immagini', owner: 'Agente AI Caputo',
    spec: 'Inserisce diagrammi, tabelle e immagini. Entra: testo revisionato. Esce: documento con la parte visiva.',
    colore: { pieno: 'bg-lime-500', track: 'bg-lime-500/15', testo: 'text-lime-700', punto: 'bg-lime-600' } },
  { id: 'valentino', ordine: 5, label: 'Valentino — Grafica', owner: 'Agente AI Valentino',
    spec: 'Impaginazione e grafica finale. Entra: documento con immagini. Esce: report impaginato.',
    colore: { pieno: 'bg-green-500', track: 'bg-green-500/15', testo: 'text-green-700', punto: 'bg-green-600' } },
  { id: 'irene', ordine: 6, label: 'Report Irene — AssessFirst', owner: 'Irene',
    spec: 'Report AssessFirst (uno per dipendente): Irene revisiona e approva, poi assembla lo ZIP per il tutor.',
    colore: { pieno: 'bg-emerald-600', track: 'bg-emerald-600/15', testo: 'text-emerald-700', punto: 'bg-emerald-600' } },
  { id: 'consegnato', ordine: 7, label: 'Consegnato', owner: 'Delivery',
    spec: 'Report consegnato al cliente. Prossimo passaggio: consulenza con Frank.',
    colore: { pieno: 'bg-green-700', track: 'bg-green-700/15', testo: 'text-green-800', punto: 'bg-green-700' } },
]

export const siloById = (id: SiloId): Silo => SILOS.find((s) => s.id === id)!
export const siloSuccessivo = (id: SiloId): SiloId | null => {
  const s = siloById(id); const next = SILOS.find((x) => x.ordine === s.ordine + 1); return next ? next.id : null
}
export const siloPrecedente = (id: SiloId): SiloId | null => {
  const s = siloById(id); const prev = SILOS.find((x) => x.ordine === s.ordine - 1); return prev ? prev.id : null
}

// La fase del Gantt (1..6) mappa sui silos. Il silo "irene" (AssessFirst) non ha
// una fase nel Gantt storico: parte vuoto e viene popolato spostando le card.
const FASE_TO_SILO: Record<FaseFrank, SiloId> = {
  1: 'copy', 2: 'jelo', 3: 'grippo', 4: 'caputo', 5: 'valentino', 6: 'consegnato',
}
export const SILO_TO_FASE: Record<SiloId, FaseFrank> = {
  copy: 1, jelo: 2, grippo: 3, caputo: 4, valentino: 5, irene: 6, consegnato: 6,
}

export type MappaSilos = Record<string, SiloId> // slug cliente → silo

function seed(): MappaSilos {
  const m: MappaSilos = {}
  for (const r of CONSULENZE_FRANK) m[slugFrank(r.cliente)] = FASE_TO_SILO[r.fase]
  return m
}

const CHIAVE = 'pipeline-silos-v1'
const listeners = new Set<() => void>()
let cache: MappaSilos | null = null
let cacheRaw: string | null = null
const seedServer = seed()

function leggi(): MappaSilos {
  if (typeof window === 'undefined') return seedServer
  const raw = window.localStorage.getItem(CHIAVE)
  if (cache && raw === cacheRaw) return cache
  cacheRaw = raw
  if (!raw) { cache = seed(); return cache }
  try {
    cache = { ...seed(), ...(JSON.parse(raw) as MappaSilos) }
  } catch {
    cache = seed()
  }
  return cache
}

function salva(m: MappaSilos) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CHIAVE, JSON.stringify(m))
  cache = m
  cacheRaw = JSON.stringify(m)
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  if (typeof window !== 'undefined') window.addEventListener('storage', cb)
  return () => {
    listeners.delete(cb)
    if (typeof window !== 'undefined') window.removeEventListener('storage', cb)
  }
}

/** Sposta un cliente in un silo specifico. */
export function spostaSilo(slug: string, silo: SiloId) {
  salva({ ...leggi(), [slug]: silo })
}
/** Fa avanzare/indietreggiare un cliente di un silo. */
export function avanzaSilo(slug: string) {
  const corr = leggi()[slug] ?? 'copy'
  const next = siloSuccessivo(corr)
  if (next) spostaSilo(slug, next)
}
export function indietreggiaSilo(slug: string) {
  const corr = leggi()[slug] ?? 'copy'
  const prev = siloPrecedente(corr)
  if (prev) spostaSilo(slug, prev)
}
/** Ripristina lo stato al piano ufficiale di partenza. */
export function resetSilos() {
  salva(seed())
}

/** Hook: lo stato vivo dei silos, condiviso tra board e Gantt. */
export function useSilos(): MappaSilos {
  return useSyncExternalStore(subscribe, leggi, () => seedServer)
}
