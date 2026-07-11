// ─── Client del blocco Visual (Step 6) su Railway ───
// Word dentro → regia agentica (17 famiglie) → PDF pastello o docx fuori.
// La stima è calcolata dal SERVER leggendo il documento (gratis, nessuna
// chiamata API): mai dalla dimensione del file.

export const URL_VISUAL = 'https://blocco-visual-production.up.railway.app'
export const CHIAVE_TOKEN_VISUAL = 'blocco-visual-token'

export interface StimaVisual {
  blocchi: number
  caratteri: number
  lotti: number
  caratteri_lotti: number
  caratteri_sistema: number
  visual_previsti: number
  modello: string
}

export interface StatoJobVisual {
  id: string
  fase: string
  cliente: string
  formato: string
  passi?: { passo: string; dettaglio?: string; ora: string }[]
  lettura?: { blocchi: number }
  regia?: {
    modo: string
    visual_pianificati: number
    uso?: { token_in: number; token_out: number; token_cache_scrittura: number; token_cache_lettura: number; lotti: number }
  }
  resa?: Record<string, unknown>
  qa?: { esiti: Record<string, boolean>; tutti_pass?: boolean; problemi?: string[] }
  verdetto?: string
  pdf?: string
  docx?: string
  pagine?: number
  errore?: string
}

export const ETICHETTA_PASSO_VISUAL: Record<string, string> = {
  in_coda: 'In coda',
  lettura: 'Lettura della struttura del documento',
  regia: 'Regia agentica (piano dei visual)',
  resa: 'Resa dei visual e composizione',
  controllo_qualita: 'Controlli automatici (leggibilità, contrasto)',
  completato: 'Completato',
  errore: 'Errore',
}

const PREZZI: Record<string, { input: number; output: number }> = {
  'claude-sonnet-5': { input: 2, output: 10 },
  'claude-opus-4-8': { input: 5, output: 25 },
}

/** Tetto di costo dai numeri VERI del server (con prompt caching attivo).
 *  null se il modello non è tra quelli di cui conosciamo il prezzo. */
export function stimaCostoVisual(s: StimaVisual): { euro: string; token: number } | null {
  const prezzo = PREZZI[s.modello]
  if (!prezzo) return null
  const tokPrefisso = Math.round(s.caratteri_sistema / 3.3) + 2000 // sistema + schema strumento (cachati insieme)
  const tokInput =
    Math.round(tokPrefisso * 1.25) + // prima chiamata: scrittura cache
    Math.round(tokPrefisso * 0.1 * Math.max(0, s.lotti - 1)) + // letture successive a 1/10
    Math.round(s.caratteri_lotti / 3.3) +
    s.lotti * 200 // intestazione del lotto
  const tokOutput = s.lotti * 1800 // piano JSON, stima larga
  const costo = (tokInput * prezzo.input + tokOutput * prezzo.output) / 1_000_000
  return { euro: costo.toFixed(2), token: tokInput + tokOutput }
}

async function esito<T>(r: Response): Promise<T> {
  if (!r.ok) {
    let dettaglio = `${r.status}`
    try {
      const j = await r.json()
      dettaglio = j.detail ?? dettaglio
    } catch {
      /* corpo non JSON */
    }
    throw new Error(dettaglio)
  }
  return r.json() as Promise<T>
}

export async function stimaVisual(token: string, file: File): Promise<StimaVisual> {
  const corpo = new FormData()
  corpo.append('file', file)
  const r = await fetch(`${URL_VISUAL}/stima`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: corpo,
  })
  return esito<StimaVisual>(r)
}

export async function creaJobVisual(opts: {
  token: string
  file: File
  titolo: string
  formato: 'pdf' | 'docx'
}): Promise<string> {
  const corpo = new FormData()
  corpo.append('file', opts.file)
  corpo.append('titolo', opts.titolo)
  corpo.append('formato', opts.formato)
  const r = await fetch(`${URL_VISUAL}/visual-jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opts.token}` },
    body: corpo,
  })
  const j = await esito<{ job_id: string }>(r)
  return j.job_id
}

export async function statoJobVisual(token: string, jobId: string): Promise<StatoJobVisual> {
  const r = await fetch(`${URL_VISUAL}/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return esito<StatoJobVisual>(r)
}

export async function scaricaUscitaVisual(token: string, jobId: string, formato: 'pdf' | 'docx', nomeFile: string): Promise<void> {
  const r = await fetch(`${URL_VISUAL}/jobs/${jobId}/${formato}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) throw new Error(`download fallito (${r.status})`)
  const blob = await r.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeFile
  a.click()
  URL.revokeObjectURL(url)
}
