// ─── Client del blocco Report AF (Step 4a) su Railway ───
// Un job = una persona: piano di consulenza (Word/PDF) + PDF AssessFirst +
// destinatario/candidato/ruolo/relazione. Il token resta nel browser.

export const URL_REPORT_AF = 'https://blocco-report-af-production.up.railway.app'
export const CHIAVE_TOKEN_REPORT_AF = 'blocco-report-af-token'

export interface PassoJobAF {
  passo: string
  dettaglio?: string
  ora: string
}

/** Limiti reali della pipeline, letti da /health: il tetto di costo si calcola
 *  SOLO da questi numeri (mai dalla dimensione dei file caricati — un PDF
 *  illustrato pesa molto più del testo che ne verrà estratto). */
export interface LimitiReportAF {
  max_car_piano: number
  max_car_af_per_file: number
  max_file_af: number
  max_token_uscita: number
  max_continuazioni: number
  max_car_campo: number
  caratteri_prompt_sistema: number
}

export interface SaluteReportAF {
  stato: string
  modello?: string
  chiave_api_configurata?: boolean
  token_configurato?: boolean
  limiti?: LimitiReportAF
}

export async function leggiSaluteReportAF(): Promise<SaluteReportAF> {
  const r = await fetch(`${URL_REPORT_AF}/health`)
  if (!r.ok) throw new Error(`health non raggiungibile (${r.status})`)
  return r.json()
}

export interface StatoJobReportAF {
  id: string
  fase: string
  destinatario: string
  candidato: string
  ruolo: string
  relazione: 'a' | 'b' | 'c'
  data: string
  passi?: PassoJobAF[]
  verdetto?: string
  pdf?: string
  pagine?: number
  errore?: string
  estrazione?: { pagine_piano: number; piano_troncato: boolean; files_af: { nome: string; pagine: number }[] }
  generazione?: { parole: number; token_in: number; token_out: number }
  qa?: { esiti: Record<string, boolean>; tutti_pass: boolean; problemi: string[]; parole: number }
}

export const ETICHETTA_PASSO_AF: Record<string, string> = {
  in_coda: 'In coda',
  estrazione: 'Lettura del piano e degli AssessFirst',
  generazione: 'Generazione del report (AI)',
  controllo_struttura: 'Controllo struttura (6 errori, 7 sezioni…)',
  rendering: 'Impaginazione PDF',
  completato: 'Completato',
  errore: 'Errore',
}

export const ETICHETTA_CHECK_AF: Record<string, string> = {
  apertura: 'Apertura presente',
  verita_scomoda: 'Verità scomoda presente',
  sei_errori: 'Esattamente 6 errori',
  checklist_7_sezioni: 'Checklist con 7 sezioni',
  conclusione_a_voce: 'Conclusione + chiusura "a voce"',
  risultato_finale: 'Risultato finale presente',
  domanda_finale: 'Domanda finale presente',
  regola_se_2_no: 'Regola "Se 2 o più NO" in ogni sezione',
  niente_emoji_checkbox: 'Niente emoji/checkbox (stile esempi)',
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

export async function creaJobReportAF(opts: {
  token: string
  piano: File
  assessfirst: File[]
  destinatario: string
  candidato: string
  ruolo: string
  relazione: 'a' | 'b' | 'c'
  data: string
}): Promise<string> {
  const corpo = new FormData()
  corpo.append('piano', opts.piano)
  opts.assessfirst.forEach((f) => corpo.append('assessfirst', f))
  corpo.append('destinatario', opts.destinatario)
  corpo.append('candidato', opts.candidato)
  corpo.append('ruolo', opts.ruolo)
  corpo.append('relazione', opts.relazione)
  corpo.append('data', opts.data)
  const r = await fetch(`${URL_REPORT_AF}/jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opts.token}` },
    body: corpo,
  })
  const j = await esito<{ job_id: string }>(r)
  return j.job_id
}

export async function statoJobReportAF(token: string, jobId: string): Promise<StatoJobReportAF> {
  const r = await fetch(`${URL_REPORT_AF}/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return esito<StatoJobReportAF>(r)
}

export async function scaricaPdfReportAF(token: string, jobId: string, nomeFile: string): Promise<void> {
  const r = await fetch(`${URL_REPORT_AF}/jobs/${jobId}/out`, {
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

export async function leggiMarkdownReportAF(token: string, jobId: string): Promise<string> {
  const r = await fetch(`${URL_REPORT_AF}/jobs/${jobId}/markdown`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) throw new Error(`markdown non disponibile (${r.status})`)
  return r.text()
}

/** Data corrente in formato AAAA-MM. */
export function meseCorrenteAF(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
