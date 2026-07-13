// ─── Client dello storage file (sul blocco dati) ───
// I documenti caricati dal venditore (questionario, trascrizione, i 4
// AssessFirst per persona) vengono salvati DAVVERO sul volume del blocco dati
// e restano a sistema fino alla fase 4a.

import { URL_DATI, tokenDati } from './datiblocco'

export interface FileCaricato {
  id: string
  nome: string
  categoria: string // questionario | trascrizione | assessfirst
  dipendente: string
  sottotipo: string // SWIPE | DRIVE | BRAIN | Comportamenti chiave (per assessfirst)
  dimensione: number
  caricato: string
}

/** Carica un file reale nello storage. Ritorna l'id con cui rileggerlo. */
export async function caricaFile(
  file: File,
  dati: { praticaId: string; categoria: string; dipendente?: string; sottotipo?: string }
): Promise<FileCaricato> {
  const token = tokenDati()
  if (!token) throw new Error('token del blocco dati mancante')
  const fd = new FormData()
  fd.append('file', file)
  fd.append('pratica_id', dati.praticaId)
  fd.append('categoria', dati.categoria)
  fd.append('dipendente', dati.dipendente ?? '')
  fd.append('sottotipo', dati.sottotipo ?? '')
  const r = await fetch(`${URL_DATI}/file`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  if (!r.ok) throw new Error(`caricamento fallito (${r.status})`)
  return r.json()
}

/** Tutti i file già caricati per una pratica (per ricostruire lo stato). */
export async function elencaFile(praticaId: string): Promise<FileCaricato[]> {
  const token = tokenDati()
  if (!token) return []
  const r = await fetch(`${URL_DATI}/files?pratica_id=${encodeURIComponent(praticaId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) throw new Error(`elenco file: ${r.status}`)
  const j = await r.json()
  return j.file ?? []
}

export async function cancellaFile(id: string): Promise<void> {
  const token = tokenDati()
  if (!token) return
  await fetch(`${URL_DATI}/file/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** URL per rileggere/scaricare un file (con token in header non si può linkare
 *  direttamente: si usa fetch + blob quando serve mostrarlo). */
export const urlFile = (id: string) => `${URL_DATI}/file/${id}`
