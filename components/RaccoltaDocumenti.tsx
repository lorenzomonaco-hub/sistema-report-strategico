'use client'

// ─── Raccolta documenti (componente condiviso) ───
// Il caricamento REALE dei documenti che porta il cliente dallo step 0
// (vendita registrata, documenti mancanti) allo step 1 (preso in carico dal
// Copy). Lo usano sia la pagina Elisa (chi carica di norma) sia il Tutor.
// Estratto per non far divergere le due viste.

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { documentiTutorPronti } from '@/lib/fasi'
import { caricaFile, cancellaFile } from '@/lib/archivioblocco'
import { ASSESSFIRST_TIPI, DocumentoAllegato, PersonaAF, Pratica } from '@/lib/types'

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

const uid = () => `al-${Math.random().toString(36).slice(2, 10)}`

const classiInputSm =
  'w-full rounded-lg border border-linea bg-carta px-2.5 py-2 text-sm text-inchiostro placeholder:text-inchiostro/35 transition focus:border-petrolio focus:outline-none focus:ring-2 focus:ring-petrolio/15'

const normalizza = (s: string) =>
  (s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

/** Riconosce quale dei 4 AssessFirst è un file dal suo nome. */
function categoriaDaNome(nomeFile: string): string | null {
  const n = normalizza(nomeFile)
  if (n.includes('swipe')) return 'SWIPE'
  if (n.includes('drive')) return 'DRIVE'
  if (n.includes('brain')) return 'BRAIN'
  if (n.includes('comportament')) return 'Comportamenti chiave'
  return null
}

/** Il nome file contiene il nome e cognome della persona? (controllo veridicità) */
function nomeCorrisponde(nomeFile: string, persona: string): boolean {
  const f = normalizza(nomeFile)
  const tokens = normalizza(persona).split(' ').filter((t) => t.length >= 3)
  return tokens.length > 0 && tokens.every((t) => f.includes(t))
}

// ─── Slot di caricamento REALE di un singolo file ───
function SlotUpload({ pratica, categoria, sottotipo, dipendente, label, autore }: {
  pratica: Pratica; categoria: DocumentoAllegato['tipo']; sottotipo?: string; dipendente?: string; label: string; autore: string
}) {
  const { registraAllegato, rimuoviAllegato } = useApp()
  const [inCorso, setInCorso] = useState(false)
  const [errore, setErrore] = useState('')
  const esistente = pratica.allegati.find(
    (a) => a.tipo === categoria && (a.dipendente ?? '') === (dipendente ?? '') && (a.sottotipo ?? '') === (sottotipo ?? '')
  )

  const onFile = async (f: File | null) => {
    if (!f) return
    setErrore(''); setInCorso(true)
    try {
      const c = await caricaFile(f, { praticaId: pratica.id, categoria, dipendente, sottotipo })
      registraAllegato(pratica.id, {
        id: uid(), nome: c.nome, tipo: categoria, sottotipo, dipendente,
        fileId: c.id, dimensione: c.dimensione, caricatoDa: autore, dataCaricamento: new Date().toISOString(),
      })
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'caricamento fallito')
    } finally {
      setInCorso(false)
    }
  }

  return (
    <div className={`rounded-xl border px-3 py-2 ${esistente ? 'border-green-200 bg-green-50/60' : 'border-linea bg-carta'}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${esistente ? 'bg-green-100 text-green-700' : 'border-2 border-inchiostro/15 bg-carta text-inchiostro'}`}>
          {esistente ? '✓' : ''}
        </span>
        <span className="min-w-24 shrink-0 text-xs font-semibold text-inchiostro">{label}</span>
        {esistente ? (
          <>
            <span className="truncate text-xs text-inchiostro">{esistente.nome}</span>
            <button
              onClick={() => { if (esistente.fileId) cancellaFile(esistente.fileId); rimuoviAllegato(pratica.id, esistente.id) }}
              className="ml-auto shrink-0 text-xs text-rose-400 transition hover:text-rose-700"
            >
              rimuovi
            </button>
          </>
        ) : (
          <label className="ml-auto shrink-0 cursor-pointer rounded-lg border border-linea px-2.5 py-1 text-xs font-semibold text-inchiostro transition hover:border-petrolio/40 hover:text-petrolio">
            {inCorso ? 'Carico…' : 'Scegli file'}
            <input type="file" className="hidden" disabled={inCorso}
              onChange={(e) => { onFile(e.target.files?.[0] ?? null); e.target.value = '' }} />
          </label>
        )}
      </div>
      {errore && <p className="mt-1 pl-7 text-xs text-rose-600">{errore}</p>}
    </div>
  )
}

// ─── I 4 AssessFirst di UNA persona: un solo caricamento, riconoscimento dal nome ───
function CaricaAssessFirst({ pratica, persona, autore, onRimuovi }: { pratica: Pratica; persona: PersonaAF; autore: string; onRimuovi?: () => void }) {
  const { registraAllegato, rimuoviAllegato } = useApp()
  const [inCorso, setInCorso] = useState(false)
  const [daAssegnare, setDaAssegnare] = useState<File[]>([])
  const [errore, setErrore] = useState('')

  const slot = (s: string) =>
    pratica.allegati.find((a) => a.tipo === 'assessfirst' && a.dipendente === persona.nome && a.sottotipo === s)

  const salva = async (f: File, sottotipo: string) => {
    const c = await caricaFile(f, { praticaId: pratica.id, categoria: 'assessfirst', dipendente: persona.nome, sottotipo })
    registraAllegato(pratica.id, {
      id: uid(), nome: c.nome, tipo: 'assessfirst', sottotipo, dipendente: persona.nome,
      fileId: c.id, dimensione: c.dimensione, caricatoDa: autore, dataCaricamento: new Date().toISOString(),
    })
  }

  // Riconosce e carica una manciata di file in un colpo solo.
  const processa = async (files: File[]) => {
    setErrore(''); setInCorso(true)
    const nonRiconosciuti: File[] = []
    try {
      for (const f of files) {
        const cat = categoriaDaNome(f.name)
        if (cat) await salva(f, cat)
        else nonRiconosciuti.push(f)
      }
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'caricamento fallito')
    } finally {
      setInCorso(false)
      setDaAssegnare(nonRiconosciuti)
    }
  }

  return (
    <div className={`rounded-xl border p-3 ${ASSESSFIRST_TIPI.every((s) => slot(s)) ? 'border-green-200 bg-green-50/40' : 'border-linea bg-inchiostro/[0.015]'}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-inchiostro">{persona.nome}</span>
        <span className="rounded-full bg-inchiostro/10 px-2 py-0.5 text-[11px] font-medium text-inchiostro">{persona.ruolo}</span>
        {onRimuovi && (
          <button onClick={onRimuovi} className="text-[11px] font-semibold text-rose-500 hover:text-rose-700">rimuovi persona</button>
        )}
        <label className="ml-auto shrink-0 cursor-pointer rounded-lg bg-petrolio px-3 py-1 text-xs font-semibold text-white transition hover:bg-petrolio-scuro">
          {inCorso ? 'Carico…' : ASSESSFIRST_TIPI.every((s) => slot(s)) ? 'Ricarica i file' : 'Carica i 4 file insieme'}
          <input type="file" multiple accept=".pdf" className="hidden" disabled={inCorso}
            onChange={(e) => { processa(Array.from(e.target.files ?? [])); e.target.value = '' }} />
        </label>
        {ASSESSFIRST_TIPI.every((s) => slot(s)) && <span className="text-xs font-semibold text-green-700">4/4 ✓</span>}
      </div>

      {/* stato dei 4: riconosciuto automaticamente, con controllo che il nome sia della persona */}
      <div className="grid gap-1.5 sm:grid-cols-2">
        {ASSESSFIRST_TIPI.map((s) => {
          const a = slot(s)
          const nomeOk = a ? nomeCorrisponde(a.nome, persona.nome) : true
          return (
            <div key={s} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${
              a ? (nomeOk ? 'border-green-200 bg-green-50/60' : 'border-amber-300 bg-amber-50') : 'border-linea bg-carta'}`}>
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                a ? (nomeOk ? 'bg-green-100 text-green-700' : 'bg-amber-200 text-amber-800') : 'border-2 border-inchiostro/15 text-transparent'}`}>
                {a ? (nomeOk ? '✓' : '!') : ''}
              </span>
              <span className="w-24 shrink-0 font-semibold text-inchiostro">{s}</span>
              {a ? (
                <>
                  <span className="truncate text-inchiostro" title={a.nome}>{a.nome}</span>
                  <button onClick={() => { if (a.fileId) cancellaFile(a.fileId); rimuoviAllegato(pratica.id, a.id) }}
                    className="ml-auto shrink-0 text-rose-400 transition hover:text-rose-700">rimuovi</button>
                </>
              ) : (
                <span className="text-inchiostro">manca</span>
              )}
            </div>
          )
        })}
      </div>

      {/* avviso: qualche slot ha il nome di un'altra persona → da correggere */}
      {ASSESSFIRST_TIPI.some((s) => { const a = slot(s); return a && !nomeCorrisponde(a.nome, persona.nome) }) && (
        <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
          ⚠ Un file (giallo, «!») non ha nel nome «{persona.nome}»: controlla che sia davvero suo, altrimenti rimuovilo e ricarica quello giusto.
        </p>
      )}

      {/* file caricati ma non riconosciuti: assegnazione manuale */}
      {daAssegnare.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {daAssegnare.map((f, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs text-rose-800">
              <span className="truncate">Non riconosciuto: <strong>{f.name}</strong></span>
              <select defaultValue="" aria-label="Assegna a" className="ml-auto rounded border border-rose-200 bg-white px-1.5 py-0.5 text-xs"
                onChange={async (e) => {
                  if (!e.target.value) return
                  await salva(f, e.target.value)
                  setDaAssegnare(daAssegnare.filter((_, j) => j !== i))
                }}>
                <option value="">assegna a…</option>
                {ASSESSFIRST_TIPI.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
      {errore && <p className="mt-2 text-xs text-rose-600">{errore}</p>}
    </div>
  )
}

// ─── Carta di raccolta: documenti di un cliente + avanzamento step 0 → 1 ───
const QUALIFICHE: { val: PersonaAF['qualifica']; label: string }[] = [
  { val: 'titolare', label: 'Titolare' },
  { val: 'socio', label: 'Socio' },
  { val: 'dipendente', label: 'Dipendente' },
]

export function CartaRaccolta({ pratica, autore = 'Elisa', onConfermata }: {
  pratica: Pratica; autore?: string; onConfermata?: (azienda: string) => void
}) {
  const { clientePronto, aggiungiPersona, rimuoviPersona } = useApp()
  const pronti = documentiTutorPronti(pratica)
  const [pNome, setPNome] = useState('')
  const [pCognome, setPCognome] = useState('')
  const [pEmail, setPEmail] = useState('')
  const [pQual, setPQual] = useState<PersonaAF['qualifica']>('titolare')
  const [errP, setErrP] = useState('')

  const aggiungi = () => {
    const n = pNome.trim(), c = pCognome.trim()
    if (!n || !c) return setErrP('Servono nome e cognome della persona.')
    const nomeCompleto = `${n} ${c}`
    if (pratica.dipendenti.some((d) => d.nome.toLowerCase() === nomeCompleto.toLowerCase())) return setErrP('Questa persona è già in elenco.')
    const ruolo = QUALIFICHE.find((q) => q.val === pQual)!.label
    aggiungiPersona(pratica.id, { nome: nomeCompleto, email: pEmail.trim(), qualifica: pQual, ruolo })
    setPNome(''); setPCognome(''); setPEmail(''); setErrP('')
  }

  return (
    <div className="card-sollevabile rounded-2xl border border-linea bg-carta p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold tracking-tight text-inchiostro">{pratica.cliente}</h3>
          <p className="truncate text-sm font-semibold text-inchiostro">{pratica.azienda}</p>
          <p className="mt-0.5 text-xs text-inchiostro">tutor {pratica.tutor} · {pratica.dataVendita ? `venduto il ${dataIt(pratica.dataVendita)}` : 'data vendita da inserire'} · {pratica.dipendenti.length} {pratica.dipendenti.length === 1 ? 'persona' : 'persone'}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Step 0 — documenti mancanti
        </span>
      </div>

      {/* Documenti dell'azienda */}
      <div className="mt-4">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-inchiostro">Documenti dell&rsquo;azienda</p>
        <div className="space-y-1.5">
          <SlotUpload pratica={pratica} categoria="questionario" label="Questionario" autore={autore} />
          <SlotUpload pratica={pratica} categoria="trascrizione" label="Trascrizione" autore={autore} />
        </div>
      </div>

      {/* Persone da valutare (titolari, soci, dipendenti) + AssessFirst */}
      <div className="mt-4">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-inchiostro">
          Persone da valutare — titolari, soci e dipendenti (i 4 AssessFirst si caricano insieme)
        </p>

        {/* aggiungi persona */}
        <div className="rounded-xl border border-linea bg-inchiostro/[0.015] p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto_auto]">
            <input value={pNome} onChange={(e) => setPNome(e.target.value)} placeholder="Nome" className={classiInputSm} />
            <input value={pCognome} onChange={(e) => setPCognome(e.target.value)} placeholder="Cognome" className={classiInputSm} />
            <input type="email" value={pEmail} onChange={(e) => setPEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aggiungi() } }} placeholder="email" className={classiInputSm} />
            <select value={pQual} onChange={(e) => setPQual(e.target.value as PersonaAF['qualifica'])} aria-label="Qualifica" className={classiInputSm}>
              {QUALIFICHE.map((q) => <option key={q.val} value={q.val}>{q.label}</option>)}
            </select>
            <button onClick={aggiungi} className="shrink-0 rounded-xl border border-petrolio/30 bg-carta px-4 py-2 text-sm font-semibold text-petrolio transition hover:bg-petrolio/10">+ Aggiungi</button>
          </div>
          {errP && <p className="mt-1.5 text-xs text-rose-600">{errP}</p>}
        </div>

        {/* elenco persone con caricamento dei 4 AssessFirst */}
        <div className="mt-3 space-y-3">
          {pratica.dipendenti.length === 0 ? (
            <p className="rounded-xl border border-dashed border-inchiostro/20 px-3 py-4 text-center text-xs text-inchiostro">
              Nessuna persona ancora. Aggiungi almeno il titolare per caricare i suoi AssessFirst.
            </p>
          ) : (
            pratica.dipendenti.map((d) => (
              <CaricaAssessFirst key={d.nome} pratica={pratica} persona={d} autore={autore} onRimuovi={() => rimuoviPersona(pratica.id, d.nome)} />
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => { clientePronto(pratica.id); onConfermata?.(pratica.azienda) }}
        disabled={!pronti}
        className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${pronti ? 'bg-ambra text-white hover:bg-amber-700' : 'cursor-not-allowed border border-linea bg-carta text-inchiostro'}`}
      >
        🚀 Documenti completi — avvia la pipeline (step 0 → 1: Copy)
      </button>
      {!pronti && (
        <p className="mt-2 text-xs text-inchiostro">
          Il bottone si attiva quando ci sono questionario, trascrizione e tutti e 4 gli AssessFirst di ogni persona.
        </p>
      )}
    </div>
  )
}
