// ─── Client del Blocco Dati: l'archivio condiviso della pipeline ───
// Tutti i browser leggono e scrivono lo stesso stato sul blocco Railway, così
// la pipeline è unica per tutto il team e il Gantt amministrativo si aggiorna
// da solo. Il server timbra ogni cambio di fase (cronologia) col SUO orologio:
// è la base dell'avanzamento reale nel Gantt.

import { AppState, FaseId } from './types'

export const URL_DATI = 'https://blocco-dati-production.up.railway.app'
export const CHIAVE_TOKEN_DATI = 'blocchi-worker-token'

/** Un timbro del server: la pratica è entrata in questa fase in questo momento. */
export interface TimbroFase {
  fase: FaseId
  dataOra: string
}

/** praticaId → timbri in ordine cronologico */
export type CronologiaFasi = Record<string, TimbroFase[]>

export interface DocumentoCondiviso {
  revisione: number
  aggiornato: string | null
  stato: AppState | null
  cronologia: CronologiaFasi
}

export function tokenDati(): string {
  if (typeof localStorage === 'undefined') return ''
  return (
    localStorage.getItem(CHIAVE_TOKEN_DATI) ??
    localStorage.getItem('visual-worker-token') ??
    ''
  )
}

const intestazioni = (token: string) => ({ Authorization: `Bearer ${token}` })

export async function leggiStatoCondiviso(token: string): Promise<DocumentoCondiviso> {
  const r = await fetch(`${URL_DATI}/stato`, { headers: intestazioni(token) })
  if (!r.ok) throw new Error(`blocco dati: ${r.status}`)
  return r.json()
}

export async function scriviStatoCondiviso(
  token: string,
  stato: AppState,
  base: number | null
): Promise<{ revisione: number; conflitto: boolean; cronologia: CronologiaFasi }> {
  const r = await fetch(`${URL_DATI}/stato`, {
    method: 'PUT',
    headers: { ...intestazioni(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ stato, base }),
  })
  if (!r.ok) throw new Error(`blocco dati: ${r.status}`)
  return r.json()
}
