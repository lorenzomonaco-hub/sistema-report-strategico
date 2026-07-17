// ─── Client del blocco Email su Railway ───
// Invia un'email al tutor con lo ZIP dei documenti (report + report AF).
// Il token è quello condiviso dei blocchi (WORKER_TOKEN), preso dal blocco dati.

export const URL_EMAIL = 'https://blocco-email-production.up.railway.app'

export interface SaluteEmail {
  stato?: string
  token_configurato?: boolean
  email_configurata?: boolean
  mittente?: string
}

export async function saluteEmail(): Promise<SaluteEmail> {
  const r = await fetch(`${URL_EMAIL}/health`)
  if (!r.ok) throw new Error(`email /health non raggiungibile (${r.status})`)
  return r.json()
}

/** Invia un'email con un unico ZIP che raccoglie i file passati. */
export async function inviaEmailConZip(opts: {
  token: string
  a: string
  oggetto: string
  corpo: string
  zipNome: string
  files: { nome: string; blob: Blob }[]
}): Promise<{ ok: boolean; allegati_nello_zip: number }> {
  const fd = new FormData()
  fd.append('a', opts.a)
  fd.append('oggetto', opts.oggetto)
  fd.append('corpo', opts.corpo)
  fd.append('zip_nome', opts.zipNome)
  opts.files.forEach((f) => fd.append('files', f.blob, f.nome))
  const r = await fetch(`${URL_EMAIL}/invia`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opts.token}` },
    body: fd,
  })
  if (!r.ok) {
    let msg = `invio fallito (${r.status})`
    try { const j = await r.json(); if (j?.detail) msg = j.detail } catch {}
    throw new Error(msg)
  }
  return r.json()
}
