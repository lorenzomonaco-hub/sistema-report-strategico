'use client'

// ─── Erogazione — Irene: generazione report AssessFirst (attivo) ───
// Irene lavora i clienti in erogazione: per ognuno inserisce le persone
// (soci/dipendenti, salvate sul cliente), carica UNA volta il piano di
// consulenza e genera il report AF di ciascuna persona chiamando il worker
// reale blocco-report-af. Ogni generazione consuma l'API a pagamento: prima
// dell'avvio viene chiesta conferma con un tetto di costo.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/store'
import { useClientiPipeline, ClientePipeline } from '@/lib/clientiPipeline'
import { tokenDati } from '@/lib/datiblocco'
import { ASSESSFIRST_TIPI, PersonaAF, Qualifica } from '@/lib/types'
import {
  ETICHETTA_PASSO_AF, LimitiReportAF, StatoJobReportAF, URL_REPORT_AF,
  blobPdfReportAF, creaJobReportAF, leggiSaluteReportAF, meseCorrenteAF, scaricaPdfReportAF, statoJobReportAF,
} from '@/lib/reportaf'
import { inviaEmailConZip } from '@/lib/email'
import { blobFile, caricaFile } from '@/lib/archivioblocco'

/** Indirizzo di TEST per l'invio al tutor (poi diventerà l'email del tutor reale). */
const EMAIL_TEST_TUTOR = 'irene.delbelbelluz@metodomerenda.com'

const PREZZI: Record<string, { input: number; output: number }> = {
  'claude-sonnet-5': { input: 2, output: 10 },
  'claude-opus-4-8': { input: 5, output: 25 },
}
function stimaTettoCosto(nFileAF: number, limiti: LimitiReportAF, modello: string): { euro: string; token: number } | null {
  const prezzo = PREZZI[modello]
  if (!prezzo) return null
  const car = limiti.max_car_piano + nFileAF * limiti.max_car_af_per_file + limiti.caratteri_prompt_sistema + 3 * limiti.max_car_campo
  const tokenInput = Math.round(car / 3.3)
  const tokenOutput = limiti.max_token_uscita
  const costo = (tokenInput * prezzo.input + tokenOutput * prezzo.output) / 1_000_000
  return { euro: costo.toFixed(2), token: tokenInput + tokenOutput }
}

const relazioneDa = (q: Qualifica): 'a' | 'b' | 'c' => (q === 'dipendente' ? 'b' : 'a')

/** Riconosce quale dei 4 AssessFirst è un file dal suo nome (come lato Elisa). */
function categoriaDaNome(nome: string): string | null {
  const n = nome.toLowerCase()
  if (n.includes('swipe')) return 'SWIPE'
  if (n.includes('drive')) return 'DRIVE'
  if (n.includes('brain')) return 'BRAIN'
  if (n.includes('comportament')) return 'Comportamenti chiave'
  return null
}

/** 4 caselle AssessFirst di UNA persona (stesso schema di Elisa): un caricamento
 *  multiplo che riconosce SWIPE/DRIVE/BRAIN/Comportamenti dal nome; i non
 *  riconosciuti si assegnano a mano. Tiene i File in memoria e li passa su. */
function SlotsAF({ onChange }: { onChange: (files: File[]) => void }) {
  const [slot, setSlot] = useState<Record<string, File | undefined>>({})
  const [daAssegnare, setDaAssegnare] = useState<File[]>([])
  const [errore, setErrore] = useState('')

  const emetti = (s: Record<string, File | undefined>) =>
    onChange(ASSESSFIRST_TIPI.map((t) => s[t]).filter((f): f is File => !!f))

  const processa = (files: File[]) => {
    const nonPdf = files.filter((f) => !f.name.toLowerCase().endsWith('.pdf'))
    if (nonPdf.length) { setErrore(`Non PDF: ${nonPdf.map((f) => f.name).join(', ')}`); return }
    setErrore('')
    const s = { ...slot }; const rest: File[] = []
    files.forEach((f) => { const c = categoriaDaNome(f.name); if (c) s[c] = f; else rest.push(f) })
    setSlot(s); setDaAssegnare(rest); emetti(s)
  }
  const assegna = (tipo: string, f: File) => {
    const s = { ...slot, [tipo]: f }; setSlot(s); emetti(s)
  }
  const rimuovi = (tipo: string) => {
    const s = { ...slot }; delete s[tipo]; setSlot(s); emetti(s)
  }

  const completi = ASSESSFIRST_TIPI.every((t) => slot[t])

  return (
    <div className={`rounded-lg border p-2.5 ${completi ? 'border-green-200 bg-green-50/50' : 'border-linea bg-carta'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-inchiostro">I 4 AssessFirst di questo dipendente</span>
        <label className="ml-auto cursor-pointer rounded-lg bg-petrolio px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-petrolio-scuro">
          {completi ? 'Ricarica i file' : 'Carica i 4 file insieme'}
          <input type="file" multiple accept=".pdf" className="hidden"
            onChange={(e) => { processa(Array.from(e.target.files ?? [])); e.target.value = '' }} />
        </label>
        {completi && <span className="text-[11px] font-semibold text-green-700">4/4 ✓</span>}
      </div>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {ASSESSFIRST_TIPI.map((t) => {
          const f = slot[t]
          return (
            <div key={t} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] ${f ? 'border-green-200 bg-green-50/60' : 'border-linea bg-carta'}`}>
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${f ? 'bg-green-100 text-green-700' : 'border-2 border-inchiostro/20 text-transparent'}`}>✓</span>
              <span className="w-28 shrink-0 font-semibold text-inchiostro">{t}</span>
              {f ? (
                <>
                  <span className="min-w-0 truncate text-inchiostro/80" title={f.name}>{f.name}</span>
                  <button onClick={() => rimuovi(t)} className="ml-auto shrink-0 text-rose-500 hover:text-rose-700">rimuovi</button>
                </>
              ) : (
                <label className="ml-auto shrink-0 cursor-pointer text-petrolio hover:underline">
                  scegli
                  <input type="file" accept=".pdf" className="hidden"
                    onChange={(e) => { const x = e.target.files?.[0]; if (x) assegna(t, x); e.target.value = '' }} />
                </label>
              )}
            </div>
          )
        })}
      </div>
      {daAssegnare.length > 0 && (
        <div className="mt-2 space-y-1">
          {daAssegnare.map((f, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-800">
              <span className="min-w-0 truncate">Non riconosciuto: <b>{f.name}</b></span>
              <select defaultValue="" onChange={(e) => { if (e.target.value) { assegna(e.target.value, f); setDaAssegnare(daAssegnare.filter((_, j) => j !== i)) } }}
                className="ml-auto rounded border border-rose-200 bg-white px-1.5 py-0.5 text-[11px]">
                <option value="">assegna a…</option>
                {ASSESSFIRST_TIPI.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
      {errore && <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{errore}</p>}
    </div>
  )
}

// ─── Generazione del report AF di UNA persona ───
function GenPersona({ persona, slug, pianoFileId, pianoNome, jobIdIniziale, token, modello, limiti, onReport }: {
  persona: PersonaAF; slug: string; pianoFileId?: string; pianoNome?: string; jobIdIniziale?: string
  token: string; modello: string | null; limiti: LimitiReportAF | null
  onReport: (jobId: string | null, af?: { nome: string; fileId: string }[]) => void
}) {
  const [af, setAf] = useState<File[]>([])
  const [afSalvati, setAfSalvati] = useState<{ nome: string; fileId: string }[]>([])
  const [relazione, setRelazione] = useState<'a' | 'b' | 'c'>(relazioneDa(persona.qualifica))
  const [jobId, setJobId] = useState<string | null>(jobIdIniziale ?? null)
  const [stato, setStato] = useState<StatoJobReportAF | null>(null)
  const [errore, setErrore] = useState('')
  const [conferma, setConferma] = useState(false)
  const [invio, setInvio] = useState(false)

  const finale = stato?.fase === 'completato' || stato?.fase === 'errore'
  const troppi = !!limiti && af.length > limiti.max_file_af
  const pronto = !!token && !!pianoFileId && af.length > 0 && !!modello && !!limiti && !troppi
  const stima = limiti && modello ? stimaTettoCosto(af.length, limiti, modello) : null

  useEffect(() => {
    if (!jobId || !token) return
    let fermo = false
    const tick = async () => {
      try {
        const s = await statoJobReportAF(token, jobId)
        if (!fermo) setStato(s)
        return s.fase === 'completato' || s.fase === 'errore'
      } catch (e) {
        if (!fermo) setErrore(e instanceof Error ? e.message : 'errore di collegamento')
        return true
      }
    }
    tick()
    const iv = window.setInterval(async () => { if (await tick()) window.clearInterval(iv) }, 4000)
    return () => { fermo = true; window.clearInterval(iv) }
  }, [jobId, token])

  // persiste il report SOLO su stato definitivo: completato → salva (con gli AF
  // salvati su blocco-dati, se appena caricati), errore → rimuovi. In pending o
  // al montaggio non tocca lo stato salvato (af undefined = mantieni esistente).
  useEffect(() => {
    if (stato?.fase === 'completato' && jobId) onReport(jobId, afSalvati.length ? afSalvati : undefined)
    else if (stato?.fase === 'errore') onReport(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stato?.fase, jobId])

  const genera = async () => {
    if (!pianoFileId) return
    setConferma(false); setErrore(''); setInvio(true)
    try {
      // il piano è salvato su blocco-dati: lo riprendo come File per inviarlo al worker
      const b = await blobFile(pianoFileId)
      const piano = new File([b], pianoNome || 'piano.pdf', { type: b.type || 'application/octet-stream' })
      // salvo i 4 AssessFirst grezzi su blocco-dati, così potranno finire nell'email al tutor
      const salvati: { nome: string; fileId: string }[] = []
      for (const f of af) {
        const c = await caricaFile(f, { praticaId: slug, categoria: 'assessfirst', dipendente: persona.nome })
        salvati.push({ nome: f.name, fileId: c.id })
      }
      setAfSalvati(salvati)
      const id = await creaJobReportAF({
        token, piano, assessfirst: af,
        destinatario: persona.nome, candidato: persona.nome, ruolo: persona.ruolo || persona.qualifica,
        relazione, data: meseCorrenteAF(),
      })
      setStato(null); setJobId(id)
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'avvio fallito')
    } finally { setInvio(false) }
  }

  return (
    <div className="rounded-xl border border-linea bg-carta p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-inchiostro">{persona.nome}</span>
        <span className="rounded-full bg-inchiostro/10 px-2 py-0.5 text-[11px] text-inchiostro/80">{persona.ruolo || persona.qualifica}</span>
        {stato?.fase === 'completato' && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">✓ report pronto</span>}
      </div>

      {!jobId && (
        <div className="mt-2 space-y-2">
          <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/80">
            Relazione (caso)
            <select value={relazione} onChange={(e) => setRelazione(e.target.value as 'a' | 'b' | 'c')}
              className="w-full max-w-xs rounded-lg border border-linea bg-carta px-2 py-1.5 text-[12px] text-inchiostro focus:border-petrolio focus:outline-none">
              <option value="a">a — titolare/socio</option>
              <option value="b">b — dipendente, un titolare</option>
              <option value="c">c — dipendente, più figure</option>
            </select>
          </label>
          <SlotsAF onChange={setAf} />
        </div>
      )}
      {troppi && !jobId && <p className="mt-1 text-[11px] font-semibold text-rose-600">Massimo {limiti?.max_file_af} file per persona.</p>}

      {!jobId && !conferma && (
        <button onClick={() => setConferma(true)} disabled={!pronto}
          className="mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">
          Genera report AF
        </button>
      )}
      {!jobId && !pronto && !conferma && (
        <p className="mt-1 text-[11px] text-inchiostro/80">Serve il piano del cliente {pianoFileId ? '✓' : '(manca)'} e almeno un PDF AssessFirst.</p>
      )}

      {conferma && stima && (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          Tetto di costo: fino a <strong>${stima.euro}</strong> ({stima.token.toLocaleString('it-IT')} token, {modello}). Il costo reale è quasi sempre più basso. Confermi la generazione?
          <div className="mt-2 flex gap-2">
            <button onClick={() => setConferma(false)} className="rounded-lg border border-linea bg-carta px-2.5 py-1 text-[11px] font-semibold text-inchiostro/80">Annulla</button>
            <button onClick={genera} disabled={invio} className="rounded-lg bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-amber-700 disabled:opacity-40">{invio ? 'Invio…' : `Sì, genera (fino a $${stima.euro})`}</button>
          </div>
        </div>
      )}

      {jobId && (
        <div className="mt-2">
          <ul className="space-y-1">
            {(stato?.passi ?? []).map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-[11px] text-inchiostro"><span className="text-green-600">✓</span>{ETICHETTA_PASSO_AF[p.passo] ?? p.passo}</li>
            ))}
            {!finale && <li className="flex items-center gap-2 text-[11px] text-inchiostro/80"><span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-ambra border-t-transparent" />{stato ? (ETICHETTA_PASSO_AF[stato.fase] ?? stato.fase) : 'collegamento'}…</li>}
          </ul>
          {stato?.fase === 'completato' && (
            <button onClick={() => scaricaPdfReportAF(token, jobId, stato.pdf ?? 'report-af.pdf').catch((e) => setErrore(String(e)))}
              className="mt-2 rounded-lg bg-petrolio px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-petrolio-scuro">⬇ Scarica il PDF</button>
          )}
          {stato?.fase === 'errore' && (
            <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800"><strong>Errore:</strong> {stato.errore}
              <button onClick={() => { setJobId(null); setStato(null) }} className="ml-2 font-semibold underline">riprova</button>
            </div>
          )}
        </div>
      )}
      {errore && <p className="mt-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-700">{errore}</p>}
    </div>
  )
}

// ─── Card di un cliente: persone (salvate) + piano + generazione ───
function CartaCliente({ cliente, token, modello, limiti }: {
  cliente: ClientePipeline; token: string; modello: string | null; limiti: LimitiReportAF | null
}) {
  const { state, aggiungiPersona, rimuoviPersona, personeCliente, aggiungiPersonaCliente, rimuoviPersonaCliente,
    generazioneAF, setPianoAF, setReportAF, rimuoviReportAF } = useApp()
  const [aperto, setAperto] = useState(false)
  const [pianoInCorso, setPianoInCorso] = useState(false)
  const [nome, setNome] = useState(''); const [cognome, setCognome] = useState('')
  const [email, setEmail] = useState(''); const [qualifica, setQualifica] = useState<Qualifica>('socio'); const [ruolo, setRuolo] = useState('')
  const [err, setErr] = useState('')
  const [confermaInvio, setConfermaInvio] = useState(false)
  const [inviando, setInviando] = useState(false)
  const [inviato, setInviato] = useState(false)
  const [erroreInvio, setErroreInvio] = useState('')

  // lavoro AF PERSISTENTE del cliente (piano + report per persona)
  const gen = generazioneAF[cliente.slug] ?? { report: {} }
  const pianoFileId = gen.pianoFileId
  const pianoNome = gen.pianoNome

  const daPratica = !!cliente.praticaId
  const persone: PersonaAF[] = daPratica
    ? (state.pratiche.find((p) => p.id === cliente.praticaId)?.dipendenti ?? [])
    : (personeCliente[cliente.slug] ?? [])

  const aggiungi = () => {
    const n = nome.trim(), c = cognome.trim()
    if (!n || !c) return setErr('Servono nome e cognome.')
    if (qualifica === 'dipendente' && !ruolo.trim()) return setErr('Per un dipendente scrivi il ruolo.')
    const persona: PersonaAF = { nome: `${n} ${c}`, email: email.trim(), qualifica, ruolo: ruolo.trim() || (qualifica === 'titolare' ? 'Titolare' : qualifica === 'socio' ? 'Socio' : '') }
    if (daPratica) aggiungiPersona(cliente.praticaId!, persona)
    else aggiungiPersonaCliente(cliente.slug, persona)
    setNome(''); setCognome(''); setEmail(''); setRuolo(''); setErr('')
  }
  const togli = (n: string) => { if (daPratica) rimuoviPersona(cliente.praticaId!, n); else rimuoviPersonaCliente(cliente.slug, n) }

  const inp = 'rounded-lg border border-linea bg-carta px-2.5 py-2 text-sm text-inchiostro placeholder:text-inchiostro/35 focus:border-petrolio focus:outline-none'

  // caricamento piano → salvato su blocco-dati (persistente)
  const caricaPiano = async (f: File) => {
    if (!/\.(pdf|docx)$/i.test(f.name)) { setErr('Il piano dev’essere Word (.docx) o PDF.'); return }
    setErr(''); setPianoInCorso(true)
    try {
      const c = await caricaFile(f, { praticaId: cliente.slug, categoria: 'piano' })
      setPianoAF(cliente.slug, c.id, c.nome)
    } catch (e) { setErr(e instanceof Error ? e.message : 'caricamento piano fallito') } finally { setPianoInCorso(false) }
  }

  // invio al tutor
  const nReport = persone.filter((p) => gen.report[p.nome]).length
  const tuttiPronti = persone.length > 0 && persone.every((p) => gen.report[p.nome])
  const nFile = (pianoFileId ? 1 : 0) + nReport
  const puoInviare = nFile > 0 && (daPratica ? tuttiPronti : true)

  const inviaAlTutor = async () => {
    setConfermaInvio(false); setErroreInvio(''); setInviando(true); setInviato(false)
    try {
      const files: { nome: string; blob: Blob }[] = []
      if (pianoFileId) { const ext = /\.docx$/i.test(pianoNome || '') ? 'docx' : 'pdf'; files.push({ nome: `piano-${cliente.nome}.${ext}`, blob: await blobFile(pianoFileId) }) }
      for (const p of persone) {
        const r = gen.report[p.nome]
        const slug = p.nome.replace(/\s+/g, '-')
        if (r?.jobId) { const b = await blobPdfReportAF(token, r.jobId); files.push({ nome: `report-AF-${slug}.pdf`, blob: b }) }
        // i 4 AssessFirst grezzi salvati per la persona
        for (const a of r?.af ?? []) { const b = await blobFile(a.fileId); files.push({ nome: `AssessFirst-${slug}-${a.nome}`, blob: b }) }
      }
      await inviaEmailConZip({
        token, a: EMAIL_TEST_TUTOR,
        oggetto: `Report AssessFirst — ${cliente.nome}`,
        corpo: `In allegato lo ZIP con il piano/report e i report AssessFirst di ${cliente.nome} (tutor ${cliente.tutor}).\n\n[Invio di TEST]`,
        zipNome: `${cliente.nome.replace(/\s+/g, '-')}-report-AF.zip`,
        files,
      })
      setInviato(true)
    } catch (e) { setErroreInvio(e instanceof Error ? e.message : 'invio fallito') } finally { setInviando(false) }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm">
      <button onClick={() => setAperto((v) => !v)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-inchiostro/[0.02]">
        <div className="min-w-0">
          <p className="truncate font-display font-bold text-inchiostro">{cliente.nome}</p>
          <p className="truncate text-[11px] text-inchiostro/80">tutor {cliente.tutor} · {persone.length} {persone.length === 1 ? 'persona' : 'persone'}</p>
        </div>
        <span className="text-inchiostro/80">{aperto ? '▲' : '▼'}</span>
      </button>

      {aperto && (
        <div className="space-y-3 border-t border-linea bg-inchiostro/[0.015] p-4">
          {/* piano del cliente (1 volta) */}
          <div className="rounded-xl border border-linea bg-carta p-3">
            <p className="text-[12px] font-bold text-inchiostro">Piano di consulenza / report <span className="font-semibold text-inchiostro/80">— UNO per cliente (Word/PDF), vale per tutte le persone</span></p>
            <input type="file" accept=".pdf,.docx" disabled={pianoInCorso}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) caricaPiano(f); e.target.value = '' }}
              className="mt-1.5 block w-full text-[12px] text-inchiostro/80 file:mr-2 file:rounded-lg file:border-0 file:bg-petrolio file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-white" />
            {pianoInCorso && <p className="mt-1 text-[11px] text-inchiostro/80">Carico il piano…</p>}
            {pianoFileId && !pianoInCorso && (
              <p className="mt-1 flex items-center gap-2 text-[11px] text-green-700">✓ {pianoNome} <button onClick={() => setPianoAF(cliente.slug, undefined, undefined)} className="text-rose-500 hover:text-rose-700">rimuovi</button></p>
            )}
          </div>

          {/* inserimento persone */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
            <p className="text-[12px] font-bold text-indigo-900">Persone da valutare</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className={inp} />
              <input value={cognome} onChange={(e) => setCognome(e.target.value)} placeholder="Cognome" className={inp} />
              <input value={ruolo} onChange={(e) => setRuolo(e.target.value)} placeholder="Ruolo in azienda" className={inp} />
              <select value={qualifica} onChange={(e) => setQualifica(e.target.value as Qualifica)} className={inp}>
                <option value="titolare">Titolare</option>
                <option value="socio">Socio</option>
                <option value="dipendente">Dipendente</option>
              </select>
            </div>
            <button onClick={aggiungi} className="mt-2 w-full rounded-xl border border-indigo-200 bg-carta px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 sm:w-auto">+ Aggiungi persona</button>
            {err && <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{err}</p>}
          </div>

          {/* generazione per persona */}
          {persone.length === 0 ? (
            <p className="rounded-xl border border-dashed border-inchiostro/25 px-3 py-4 text-center text-[12px] text-inchiostro">
              Aggiungi qui sopra ogni persona da valutare. <b>Per ciascuna comparirà qui sotto il caricamento dei suoi 4 AssessFirst</b> (SWIPE, DRIVE, BRAIN, Comportamenti) e il tasto «Genera report AF».
            </p>
          ) : (
            <div className="space-y-2">
              {persone.map((p) => (
                <div key={p.nome} className="relative">
                  <button onClick={() => togli(p.nome)} className="absolute right-2 top-2 z-10 text-[11px] font-semibold text-rose-400 hover:text-rose-700">rimuovi</button>
                  <GenPersona persona={p} slug={cliente.slug} pianoFileId={pianoFileId} pianoNome={pianoNome} jobIdIniziale={gen.report[p.nome]?.jobId}
                    token={token} modello={modello} limiti={limiti}
                    onReport={(jid, af) => { if (jid) setReportAF(cliente.slug, p.nome, jid, undefined, af); else rimuoviReportAF(cliente.slug, p.nome) }} />
                </div>
              ))}
            </div>
          )}

          {/* invio al tutor: ZIP report + report AF */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
            <p className="text-[12px] font-bold text-inchiostro">Invia al tutor</p>
            <p className="mt-0.5 text-[11px] text-inchiostro/80">
              ZIP con il piano/report + i report AF generati. {daPratica ? 'Si abilita quando tutte le persone hanno il report.' : 'Cliente inserito manualmente: invio sempre disponibile.'} <b>Invio di TEST a {EMAIL_TEST_TUTOR}</b>.
            </p>
            {daPratica && !tuttiPronti && persone.length > 0 && (
              <p className="mt-1 text-[11px] text-rose-600">Mancano i report di: {persone.filter((p) => !gen.report[p.nome]).map((p) => p.nome).join(', ')}</p>
            )}
            {!confermaInvio ? (
              <button onClick={() => setConfermaInvio(true)} disabled={!puoInviare || inviando}
                className="mt-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40">
                📧 Invia ZIP al tutor
              </button>
            ) : (
              <div className="mt-2 rounded-lg border border-emerald-300 bg-carta px-3 py-2 text-[12px] text-inchiostro">
                Invio lo ZIP ({nFile} file: {pianoFileId ? 'piano + ' : ''}{nReport} report AF) a <b>{EMAIL_TEST_TUTOR}</b>. Confermi?
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setConfermaInvio(false)} className="rounded-lg border border-linea bg-carta px-2.5 py-1 text-[11px] font-semibold text-inchiostro/80">Annulla</button>
                  <button onClick={inviaAlTutor} disabled={inviando} className="rounded-lg bg-emerald-700 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-40">{inviando ? 'Invio…' : 'Sì, invia'}</button>
                </div>
              </div>
            )}
            {inviato && <p className="mt-1.5 text-[11px] font-semibold text-green-700">✓ Email inviata a {EMAIL_TEST_TUTOR}.</p>}
            {erroreInvio && <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{erroreInvio}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AreaIrene() {
  const clienti = useClientiPipeline()
  const [token, setToken] = useState('')
  const [modello, setModello] = useState<string | null>(null)
  const [limiti, setLimiti] = useState<LimitiReportAF | null>(null)
  const [saluteErr, setSaluteErr] = useState(false)
  const [q, setQ] = useState('')

  useEffect(() => { setToken(tokenDati()) }, [])
  useEffect(() => {
    let off = false
    leggiSaluteReportAF()
      .then((h) => { if (off) return; if (h.modello) setModello(h.modello); if (h.limiti) setLimiti(h.limiti); else setSaluteErr(true) })
      .catch(() => { if (!off) setSaluteErr(true) })
    return () => { off = true }
  }, [])

  // clienti in EROGAZIONE: report in lavorazione nella pipeline (fuori da step 0, consegnato, bloccato)
  const inErogazione = clienti.filter((c) => c.silo !== 'documenti' && c.silo !== 'consegnato' && c.silo !== 'bloccato')
  // ricerca: se scrivi, spazia su TUTTI i clienti (anche pronto-consulenza / attesa);
  // se vuoto, resta la lista degli «in erogazione».
  const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  const query = norm(q.trim())
  const mostrati = query
    ? clienti.filter((c) => norm(`${c.nome} ${c.owner} ${c.tutor}`).includes(query))
    : inErogazione

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Erogazione · Irene</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Report AssessFirst</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro">
              Per ogni cliente in erogazione: inserisci le persone (restano salvate), carica il piano di consulenza una volta e genera il report AF di ciascuna persona. La generazione usa l&rsquo;agente sul server.
            </p>
          </div>
          <div className="ml-auto"><Link href="/erogazione" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/80 hover:text-inchiostro">← Pipeline</Link></div>
        </header>

        {saluteErr ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">⚠️ Il blocco {URL_REPORT_AF.replace('https://', '')} non risponde: la generazione resta bloccata finché non è raggiungibile.</div>
        ) : (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">⚠️ Ogni generazione chiama l&rsquo;API a pagamento ({modello ?? 'lettura in corso…'}). Prima di ogni report ti mostro un tetto di costo e chiedo conferma.</div>
        )}
        {!token && <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">⚠️ Token del blocco assente in questo browser: la generazione non partirà finché non è configurato.</div>}

        <div className="relative mt-6 max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-inchiostro/50">🔍</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca un cliente per nome (anche fuori erogazione, es. pronto-consulenza)…"
            className="w-full rounded-xl border border-linea bg-carta py-2 pl-9 pr-3 text-sm text-inchiostro placeholder:text-inchiostro/40 focus:border-petrolio focus:outline-none focus:ring-2 focus:ring-petrolio/15" />
        </div>
        <p className="mt-1 text-[11px] text-inchiostro/70">{query ? `${mostrati.length} risultati per «${q}»` : `${inErogazione.length} clienti in erogazione — cerca per lavorarne altri (pronto-consulenza, in attesa…)`}</p>

        <div className="mt-4 space-y-3">
          {mostrati.length === 0 ? (
            <p className="rounded-2xl border border-linea bg-carta px-4 py-10 text-center text-sm text-inchiostro/80">{query ? `Nessun cliente trovato per «${q}».` : 'Nessun cliente in erogazione al momento.'}</p>
          ) : (
            mostrati.map((c) => <CartaCliente key={c.slug} cliente={c} token={token} modello={modello} limiti={limiti} />)
          )}
        </div>
      </div>
    </div>
  )
}
