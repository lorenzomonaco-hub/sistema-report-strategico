// ─── Client del blocco Revisione diagrammi (Step 7) su Railway ───
// PDF illustrato dentro → lettore ignaro sui render (visione) → verdetto,
// problemi e LEZIONI per il loop con il Visual. Stima gratuita dal server.

export const URL_REVISIONE = 'https://blocco-revisione-diagrammi-production.up.railway.app'
export const CHIAVE_TOKEN_REVISIONE = 'blocco-revisione-diagrammi-token'

export interface StimaRevisione {
  pagine: number
  lotti: number
  caratteri_sistema: number
  modello: string
}

export interface ProblemaRevisione {
  pagina: number
  gravita: 'GRAVE' | 'MINORE'
  categoria: string
  descrizione: string
  correzione: string
}

export interface StatoJobRevisione {
  id: string
  fase: string
  titolo: string
  passi?: { passo: string; dettaglio?: string; ora: string }[]
  render?: { pagine: number }
  verdetto?: string
  gravi?: number
  minori?: number
  problemi?: ProblemaRevisione[]
  lezioni?: string[]
  uso?: { token_in: number; token_out: number; token_cache_scrittura: number; token_cache_lettura: number; lotti: number }
  errore?: string
}

export const ETICHETTA_PASSO_REVISIONE: Record<string, string> = {
  in_coda: 'In coda',
  render: 'Render delle pagine',
  ispezione: 'Ispezione visiva (lettore ignaro, a lotti)',
  completato: 'Completato',
  errore: 'Errore',
}

const PREZZI: Record<string, { input: number; output: number }> = {
  'claude-sonnet-5': { input: 2, output: 10 },
  'claude-opus-4-8': { input: 5, output: 25 },
}

/** Tetto di costo dai numeri veri del server: ~1.150 token/pagina di immagine
 *  + prompt cachato + esiti in uscita. null se il prezzo del modello è ignoto. */
export function stimaCostoRevisione(s: StimaRevisione): { euro: string; token: number } | null {
  const prezzo = PREZZI[s.modello]
  if (!prezzo) return null
  const tokPrefisso = Math.round(s.caratteri_sistema / 3.3) + 1200 // sistema + schema strumento
  const tokInput =
    Math.round(tokPrefisso * 1.25) +
    Math.round(tokPrefisso * 0.1 * Math.max(0, s.lotti - 1)) +
    s.pagine * 1150 + // immagini
    s.lotti * 120
  const tokOutput = s.lotti * 1200
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

export async function stimaRevisione(token: string, file: File): Promise<StimaRevisione> {
  const corpo = new FormData()
  corpo.append('file', file)
  const r = await fetch(`${URL_REVISIONE}/stima`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: corpo,
  })
  return esito<StimaRevisione>(r)
}

export async function creaJobRevisione(token: string, file: File, titolo: string): Promise<string> {
  const corpo = new FormData()
  corpo.append('file', file)
  corpo.append('titolo', titolo)
  const r = await fetch(`${URL_REVISIONE}/jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: corpo,
  })
  const j = await esito<{ job_id: string }>(r)
  return j.job_id
}

export async function statoJobRevisione(token: string, jobId: string): Promise<StatoJobRevisione> {
  const r = await fetch(`${URL_REVISIONE}/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return esito<StatoJobRevisione>(r)
}
