// ─── Client del blocco Visual (Step 6) su Railway ───
// Word dentro → regia agentica (17 famiglie) → PDF pastello o docx fuori.
// La stima è calcolata dal SERVER leggendo il documento (gratis, nessuna
// chiamata API): mai dalla dimensione del file.

export const URL_VISUAL = 'https://blocco-visual-production.up.railway.app'
export const CHIAVE_TOKEN_VISUAL = 'blocchi-worker-token'

export interface StimaVisual {
  blocchi: number
  caratteri: number
  lotti: number
  caratteri_lotti: number
  caratteri_sistema: number
  visual_previsti: number
  modello: string
  loop_attivo?: boolean
  giri_max?: number
  pagine_stimate?: number
  lezioni_in_memoria?: number
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
  loop?: { giro: number; verdetto: string; gravi: number; minori: number; lezioni: number }[]
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
  revisione_diagrammi: 'Revisione diagrammi (fase 7, loop)',
  controllo_qualita: 'Controlli automatici (leggibilità, contrasto)',
  completato: 'Completato',
  errore: 'Errore',
}

const PREZZI: Record<string, { input: number; output: number }> = {
  'claude-sonnet-5': { input: 2, output: 10 },
  'claude-opus-4-8': { input: 5, output: 25 },
}

/** Tetto di costo dai numeri VERI del server (con prompt caching attivo).
 *  Se il loop 6↔7 è attivo, il tetto include il caso peggiore: giri_max regie
 *  + giri_max giudizi del revisore. null se il prezzo del modello è ignoto. */
export function stimaCostoVisual(s: StimaVisual): { euro: string; token: number; euroGiro: string } | null {
  const prezzo = PREZZI[s.modello]
  if (!prezzo) return null
  const tokPrefisso = Math.round(s.caratteri_sistema / 3.3) + 2000 // sistema + schema strumento (cachati insieme)
  const tokInput =
    Math.round(tokPrefisso * 1.25) + // prima chiamata: scrittura cache
    Math.round(tokPrefisso * 0.1 * Math.max(0, s.lotti - 1)) + // letture successive a 1/10
    Math.round(s.caratteri_lotti / 3.3) +
    s.lotti * 200 // intestazione del lotto
  const tokOutput = s.lotti * 1800 // piano JSON, stima larga
  const tokGiro = tokInput + tokOutput
  const costoGiro = (tokInput * prezzo.input + tokOutput * prezzo.output) / 1_000_000
  if (!s.loop_attivo) return { euro: costoGiro.toFixed(2), token: tokGiro, euroGiro: costoGiro.toFixed(2) }
  // giudizio del revisore: ~1.150 token/pagina di immagine + esiti
  const pagine = s.pagine_stimate ?? Math.round(s.caratteri / 2300)
  const lottiRev = Math.ceil(pagine / 10)
  const tokGiudizio = pagine * 1150 + lottiRev * 1300
  const costoGiudizio = (pagine * 1150 * prezzo.input + lottiRev * 1200 * prezzo.output) / 1_000_000
  const giri = s.giri_max ?? 3
  const costoTetto = giri * (costoGiro + costoGiudizio)
  return { euro: costoTetto.toFixed(2), token: giri * (tokGiro + tokGiudizio), euroGiro: (costoGiro + costoGiudizio).toFixed(2) }
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

// ─── Ritocchi del responsabile (dopo il loop) ───

export interface VoceePiano {
  indice: number
  tipo: string
  titolo: string
  ancora?: number
}

export async function leggiPianoVisual(token: string, jobId: string): Promise<VoceePiano[]> {
  const r = await fetch(`${URL_VISUAL}/jobs/${jobId}/piano`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const j = await esito<{ visual: VoceePiano[] }>(r)
  return j.visual
}

/** Elimina i visual selezionati e rigenera il PDF: solo resa, ZERO costo API. */
export async function eliminaERigenera(token: string, jobId: string, indici: number[]): Promise<{ visual_rimasti: number; eliminati: number; pagine: number }> {
  const r = await fetch(`${URL_VISUAL}/jobs/${jobId}/rendi`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ elimina: indici }),
  })
  return esito(r)
}

/** Modifica un visual su istruzione: UNA chiamata mirata (~$0,02-0,05). */
export async function modificaVisual(token: string, jobId: string, indice: number, istruzione: string): Promise<{ fase: string; pagine: number }> {
  const r = await fetch(`${URL_VISUAL}/jobs/${jobId}/visual/${indice}/modifica`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ istruzione }),
  })
  return esito(r)
}

/** Il report .md del revisore per un giro del loop. */
export async function leggiReportGiro(token: string, jobId: string, giro: number): Promise<string> {
  const r = await fetch(`${URL_VISUAL}/jobs/${jobId}/report/${giro}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) throw new Error(`report non disponibile (${r.status})`)
  return r.text()
}

// ─── Memoria online dell'Agente Visual (Centro Apprendimento) ───

export async function leggiLezioniOnline(token: string): Promise<string[]> {
  const r = await fetch(`${URL_VISUAL}/lezioni`, { headers: { Authorization: `Bearer ${token}` } })
  const j = await esito<{ lezioni: string[] }>(r)
  return j.lezioni
}

/** Governance umana: rimuove una lezione sbagliata dalla memoria del blocco. */
export async function cancellaLezioneOnline(token: string, indice: number): Promise<{ rimossa: string; restanti: number }> {
  const r = await fetch(`${URL_VISUAL}/lezioni/${indice}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return esito(r)
}

export async function listaApprendimentiOnline(token: string): Promise<string[]> {
  const r = await fetch(`${URL_VISUAL}/apprendimenti`, { headers: { Authorization: `Bearer ${token}` } })
  const j = await esito<{ report: string[] }>(r)
  return j.report
}

export async function leggiApprendimentoOnline(token: string, nome: string): Promise<string> {
  const r = await fetch(`${URL_VISUAL}/apprendimenti/${nome}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(`report non disponibile (${r.status})`)
  return r.text()
}
