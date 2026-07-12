// ─── Client del Worker Grafica (Fase 8) su Railway ───
// Il worker esegue la pipeline di impaginazione (estrazione → composizione →
// rifinitura → QA → controllo visivo agentico) e risponde con verdetto e PDF.
// Il token di accesso resta nel browser (come la chiave API dei banchi) e
// viaggia solo verso il worker.

export const URL_WORKER = 'https://blocco-impaginazione-production.up.railway.app'
export const CHIAVE_TOKEN_WORKER = 'blocchi-worker-token'

export interface PassoJob {
  passo: string
  dettaglio?: string
  ora: string
}

export interface StatoJobGrafica {
  id: string
  fase: string
  cliente: string
  tipo: string
  data: string
  passi?: PassoJob[]
  verdetto?: string
  pdf?: string
  pagine?: number
  errore?: string
  qa?: {
    esiti: Record<string, boolean>
    dettagli?: Record<string, string>
    problemi?: string[]
    tutti_pass?: boolean
  }
  controllo_visivo?: {
    eseguito: boolean
    verdetto: string
    problemi: string[]
    errore?: string
    pagine_ispezionate?: number[]
  }
  estrazione?: { conteggi: Record<string, number>; pagine_input?: number }
  generazione?: { pagine: number; capitoli: number }
}

export const ETICHETTA_PASSO: Record<string, string> = {
  in_coda: 'In coda',
  estrazione: 'Estrazione dei blocchi dal PDF',
  composizione: 'Composizione sul template Macheda',
  rifinitura: 'Header, footer e numeri di pagina',
  controllo_qualita: 'Controlli automatici (overflow, tagli, fedeltà)',
  render: 'Render delle pagine chiave',
  controllo_visivo: 'Controllo visivo agentico',
  completato: 'Completato',
  errore: 'Errore',
}

export const ETICHETTA_CHECK: Record<string, string> = {
  overflow: 'Testo dentro la gabbia',
  titoli_orfani: 'Nessun titolo orfano',
  pagina_2: 'Pagina 2 col logo corretto',
  fedelta_testo: 'Fedeltà del testo',
  pagine_finali: 'Pagine finali obbligatorie',
  qualita_raster: 'Immagini nitide (≥300 DPI)',
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

export async function creaJobGrafica(opts: {
  token: string
  file: File
  cliente: string
  tipo: string
  data: string
}): Promise<string> {
  const corpo = new FormData()
  corpo.append('file', opts.file)
  corpo.append('cliente', opts.cliente)
  corpo.append('tipo', opts.tipo)
  corpo.append('data', opts.data)
  const r = await fetch(`${URL_WORKER}/jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opts.token}` },
    body: corpo,
  })
  const j = await esito<{ job_id: string }>(r)
  return j.job_id
}

export async function statoJobGrafica(token: string, jobId: string): Promise<StatoJobGrafica> {
  const r = await fetch(`${URL_WORKER}/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return esito<StatoJobGrafica>(r)
}

export async function scaricaPdfGrafica(token: string, jobId: string, nomeFile: string): Promise<void> {
  const r = await fetch(`${URL_WORKER}/jobs/${jobId}/pdf`, {
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

export async function leggiControlloGrafica(token: string, jobId: string): Promise<string> {
  const r = await fetch(`${URL_WORKER}/jobs/${jobId}/controllo`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) throw new Error(`report non disponibile (${r.status})`)
  return r.text()
}

/** Mese corrente in formato AAAA-MM, per il campo data del job. */
export function meseCorrente(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
