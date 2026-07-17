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
import { PersonaAF, Qualifica } from '@/lib/types'
import {
  ETICHETTA_PASSO_AF, LimitiReportAF, StatoJobReportAF, URL_REPORT_AF,
  creaJobReportAF, leggiSaluteReportAF, meseCorrenteAF, scaricaPdfReportAF, statoJobReportAF,
} from '@/lib/reportaf'

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

// ─── Generazione del report AF di UNA persona ───
function GenPersona({ persona, piano, token, modello, limiti }: {
  persona: PersonaAF; piano: File | null; token: string; modello: string | null; limiti: LimitiReportAF | null
}) {
  const [af, setAf] = useState<File[]>([])
  const [relazione, setRelazione] = useState<'a' | 'b' | 'c'>(relazioneDa(persona.qualifica))
  const [jobId, setJobId] = useState<string | null>(null)
  const [stato, setStato] = useState<StatoJobReportAF | null>(null)
  const [errore, setErrore] = useState('')
  const [conferma, setConferma] = useState(false)
  const [invio, setInvio] = useState(false)

  const finale = stato?.fase === 'completato' || stato?.fase === 'errore'
  const troppi = !!limiti && af.length > limiti.max_file_af
  const pronto = !!token && !!piano && af.length > 0 && !!modello && !!limiti && !troppi
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

  const genera = async () => {
    if (!piano) return
    setConferma(false); setErrore(''); setInvio(true)
    try {
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
        <span className="rounded-full bg-inchiostro/10 px-2 py-0.5 text-[11px] text-inchiostro/60">{persona.ruolo || persona.qualifica}</span>
        {stato?.fase === 'completato' && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">✓ report pronto</span>}
      </div>

      {!jobId && (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/45">
            Relazione (caso)
            <select value={relazione} onChange={(e) => setRelazione(e.target.value as 'a' | 'b' | 'c')}
              className="rounded-lg border border-linea bg-carta px-2 py-1.5 text-[12px] text-inchiostro focus:border-petrolio focus:outline-none">
              <option value="a">a — titolare/socio</option>
              <option value="b">b — dipendente, un titolare</option>
              <option value="c">c — dipendente, più figure</option>
            </select>
          </label>
          <label className="flex-1 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/45">
            PDF AssessFirst della persona (SWIPE/DRIVE/BRAIN/comportamenti)
            <input type="file" multiple accept=".pdf"
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : []
                const nonPdf = files.filter((f) => !f.name.toLowerCase().endsWith('.pdf'))
                if (nonPdf.length) { setErrore(`Non PDF: ${nonPdf.map((f) => f.name).join(', ')}`); setAf([]); e.target.value = ''; return }
                setErrore(''); setAf(files)
              }}
              className="mt-1 block w-full text-[12px] text-inchiostro/60 file:mr-2 file:rounded-lg file:border-0 file:bg-inchiostro/[0.06] file:px-2 file:py-1 file:text-[11px] file:font-semibold" />
          </label>
        </div>
      )}
      {af.length > 0 && !jobId && <p className="mt-1 text-[11px] text-inchiostro/50">{af.length} file · {troppi ? `max ${limiti?.max_file_af}!` : 'ok'}</p>}

      {!jobId && !conferma && (
        <button onClick={() => setConferma(true)} disabled={!pronto}
          className="mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">
          Genera report AF
        </button>
      )}
      {!jobId && !pronto && !conferma && (
        <p className="mt-1 text-[11px] text-inchiostro/45">Serve il piano del cliente {piano ? '✓' : '(manca)'} e almeno un PDF AssessFirst.</p>
      )}

      {conferma && stima && (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          Tetto di costo: fino a <strong>${stima.euro}</strong> ({stima.token.toLocaleString('it-IT')} token, {modello}). Il costo reale è quasi sempre più basso. Confermi la generazione?
          <div className="mt-2 flex gap-2">
            <button onClick={() => setConferma(false)} className="rounded-lg border border-linea bg-carta px-2.5 py-1 text-[11px] font-semibold text-inchiostro/60">Annulla</button>
            <button onClick={genera} disabled={invio} className="rounded-lg bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-amber-700 disabled:opacity-40">{invio ? 'Invio…' : `Sì, genera (fino a $${stima.euro})`}</button>
          </div>
        </div>
      )}

      {jobId && (
        <div className="mt-2">
          <ul className="space-y-1">
            {(stato?.passi ?? []).map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-[11px] text-inchiostro/70"><span className="text-green-600">✓</span>{ETICHETTA_PASSO_AF[p.passo] ?? p.passo}</li>
            ))}
            {!finale && <li className="flex items-center gap-2 text-[11px] text-inchiostro/40"><span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-ambra border-t-transparent" />{stato ? (ETICHETTA_PASSO_AF[stato.fase] ?? stato.fase) : 'collegamento'}…</li>}
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
  const { state, aggiungiPersona, rimuoviPersona, personeCliente, aggiungiPersonaCliente, rimuoviPersonaCliente } = useApp()
  const [aperto, setAperto] = useState(false)
  const [piano, setPiano] = useState<File | null>(null)
  const [nome, setNome] = useState(''); const [cognome, setCognome] = useState('')
  const [email, setEmail] = useState(''); const [qualifica, setQualifica] = useState<Qualifica>('socio'); const [ruolo, setRuolo] = useState('')
  const [err, setErr] = useState('')

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

  return (
    <div className="overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm">
      <button onClick={() => setAperto((v) => !v)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-inchiostro/[0.02]">
        <div className="min-w-0">
          <p className="truncate font-display font-bold text-inchiostro">{cliente.nome}</p>
          <p className="truncate text-[11px] text-inchiostro/55">tutor {cliente.tutor} · {persone.length} {persone.length === 1 ? 'persona' : 'persone'}</p>
        </div>
        <span className="text-inchiostro/40">{aperto ? '▲' : '▼'}</span>
      </button>

      {aperto && (
        <div className="space-y-3 border-t border-linea bg-inchiostro/[0.015] p-4">
          {/* piano del cliente (1 volta) */}
          <div className="rounded-xl border border-linea bg-carta p-3">
            <p className="text-[12px] font-bold text-inchiostro">Piano di consulenza <span className="font-normal text-inchiostro/45">— 1 per cliente (Word/PDF), vale per tutte le persone</span></p>
            <input type="file" accept=".pdf,.docx"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                if (f && !/\.(pdf|docx)$/i.test(f.name)) { setErr('Il piano dev’essere Word (.docx) o PDF.'); setPiano(null); e.target.value = ''; return }
                setErr(''); setPiano(f)
              }}
              className="mt-1.5 block w-full text-[12px] text-inchiostro/60 file:mr-2 file:rounded-lg file:border-0 file:bg-petrolio file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-white" />
            {piano && <p className="mt-1 text-[11px] text-green-700">✓ {piano.name}</p>}
          </div>

          {/* inserimento persone */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
            <p className="text-[12px] font-bold text-indigo-900">Persone da valutare</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto_auto]">
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className={inp} />
              <input value={cognome} onChange={(e) => setCognome(e.target.value)} placeholder="Cognome" className={inp} />
              <input value={ruolo} onChange={(e) => setRuolo(e.target.value)} placeholder="Ruolo in azienda" className={inp} />
              <select value={qualifica} onChange={(e) => setQualifica(e.target.value as Qualifica)} className={inp}>
                <option value="titolare">Titolare</option>
                <option value="socio">Socio</option>
                <option value="dipendente">Dipendente</option>
              </select>
              <button onClick={aggiungi} className="rounded-xl border border-indigo-200 bg-carta px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">+ Aggiungi</button>
            </div>
            {err && <p className="mt-1.5 text-[11px] text-rose-600">{err}</p>}
          </div>

          {/* generazione per persona */}
          {persone.length === 0 ? (
            <p className="rounded-xl border border-dashed border-inchiostro/20 px-3 py-4 text-center text-[12px] text-inchiostro/50">Aggiungi almeno una persona per generare i report.</p>
          ) : (
            <div className="space-y-2">
              {persone.map((p) => (
                <div key={p.nome} className="relative">
                  <button onClick={() => togli(p.nome)} className="absolute right-2 top-2 z-10 text-[11px] font-semibold text-rose-400 hover:text-rose-700">rimuovi</button>
                  <GenPersona persona={p} piano={piano} token={token} modello={modello} limiti={limiti} />
                </div>
              ))}
            </div>
          )}
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

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Erogazione · Irene</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Report AssessFirst</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/70">
              Per ogni cliente in erogazione: inserisci le persone (restano salvate), carica il piano di consulenza una volta e genera il report AF di ciascuna persona. La generazione usa l&rsquo;agente sul server.
            </p>
          </div>
          <div className="ml-auto"><Link href="/erogazione" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">← Pipeline</Link></div>
        </header>

        {saluteErr ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">⚠️ Il blocco {URL_REPORT_AF.replace('https://', '')} non risponde: la generazione resta bloccata finché non è raggiungibile.</div>
        ) : (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">⚠️ Ogni generazione chiama l&rsquo;API a pagamento ({modello ?? 'lettura in corso…'}). Prima di ogni report ti mostro un tetto di costo e chiedo conferma.</div>
        )}
        {!token && <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">⚠️ Token del blocco assente in questo browser: la generazione non partirà finché non è configurato.</div>}

        <div className="mt-6 space-y-3">
          {inErogazione.length === 0 ? (
            <p className="rounded-2xl border border-linea bg-carta px-4 py-10 text-center text-sm text-inchiostro/50">Nessun cliente in erogazione al momento.</p>
          ) : (
            inErogazione.map((c) => <CartaCliente key={c.slug} cliente={c} token={token} modello={modello} limiti={limiti} />)
          )}
        </div>
      </div>
    </div>
  )
}
