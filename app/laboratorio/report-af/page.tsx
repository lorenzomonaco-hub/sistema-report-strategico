'use client'

// ─── Compartimento n°4a — Report AF (banco di prova) ───
// Banco isolato che parla col blocco Report AF su Railway: carichi il piano di
// consulenza (Word o PDF) + i PDF AssessFirst di una persona, il server genera
// il report, lo controlla e lo impagina in PDF.
// ⚠️ Ogni avvio consuma l'API a pagamento del blocco (regola: sempre stimare
// il costo e chiedere conferma prima di inviare — vedi il banner sotto).

import Link from 'next/link'
import { useEffect, useState } from 'react'
import RoleShell from '@/components/RoleShell'
import {
  CHIAVE_TOKEN_REPORT_AF,
  ETICHETTA_CHECK_AF,
  ETICHETTA_PASSO_AF,
  StatoJobReportAF,
  URL_REPORT_AF,
  creaJobReportAF,
  leggiMarkdownReportAF,
  meseCorrenteAF,
  scaricaPdfReportAF,
  statoJobReportAF,
} from '@/lib/reportaf'

const CHIAVE_ULTIMO_JOB = 'laboratorio-report-af-ultimo-job'

const VERDETTO_STILE: Record<string, string> = {
  APPROVATO: 'border-green-200 bg-green-50 text-green-800',
  DA_CONTROLLARE_A_MANO: 'border-amber-200 bg-amber-50 text-amber-800',
}

/** Stima grezza: ~3,3 caratteri per token (tokenizer Claude 4.x/5), prezzi ufficiali per milione di token. */
const PREZZI: Record<string, { input: number; output: number }> = {
  'claude-sonnet-5': { input: 2, output: 10 },
  'claude-opus-4-8': { input: 5, output: 25 },
}

function stimaCosto(caratteriInput: number, modello: string): { euro: string; token: number } {
  const prezzo = PREZZI[modello] ?? PREZZI['claude-sonnet-5']
  const tokenInput = Math.round(caratteriInput / 3.3)
  const tokenOutput = 15000 // report tipo ~7.900 parole
  const costo = (tokenInput * prezzo.input + tokenOutput * prezzo.output) / 1_000_000
  return { euro: costo.toFixed(2), token: tokenInput + tokenOutput }
}

export default function BancoReportAF() {
  const [token, setToken] = useState('')
  const [piano, setPiano] = useState<File | null>(null)
  const [assessfirst, setAssessfirst] = useState<File[]>([])
  const [destinatario, setDestinatario] = useState('')
  const [candidato, setCandidato] = useState('')
  const [ruolo, setRuolo] = useState('')
  const [relazione, setRelazione] = useState<'a' | 'b' | 'c'>('a')
  const [dataReport, setDataReport] = useState(meseCorrenteAF())
  const [jobId, setJobId] = useState<string | null>(null)
  const [stato, setStato] = useState<StatoJobReportAF | null>(null)
  const [errore, setErrore] = useState('')
  const [avvioInCorso, setAvvioInCorso] = useState(false)
  const [markdown, setMarkdown] = useState('')
  const [chiedoConferma, setChiedoConferma] = useState(false)
  const [modello, setModello] = useState('claude-sonnet-5')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura iniziale da localStorage
    setToken(localStorage.getItem(CHIAVE_TOKEN_REPORT_AF) ?? '')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ripresa ultimo job del banco
    setJobId(localStorage.getItem(CHIAVE_ULTIMO_JOB))
  }, [])

  useEffect(() => {
    fetch(`${URL_REPORT_AF}/health`)
      .then((r) => r.json())
      .then((h) => h?.modello && setModello(h.modello))
      .catch(() => {})
  }, [])

  const salvaToken = (v: string) => {
    setToken(v)
    localStorage.setItem(CHIAVE_TOKEN_REPORT_AF, v)
  }

  const finale = stato?.fase === 'completato' || stato?.fase === 'errore'
  const prontoPerInvio = !!token && !!piano && assessfirst.length > 0 && !!destinatario.trim() && !!candidato.trim() && !!ruolo.trim()

  const caratteriInputStimati = (piano?.size ?? 0) + assessfirst.reduce((s, f) => s + f.size, 0)
  const stima = stimaCosto(caratteriInputStimati, modello)

  useEffect(() => {
    if (!jobId || !token) return
    let fermo = false
    const aggiorna = async () => {
      try {
        const s = await statoJobReportAF(token, jobId)
        if (!fermo) setStato(s)
        if (s.fase === 'completato' || s.fase === 'errore') return true
      } catch (e) {
        if (!fermo) setErrore(e instanceof Error ? e.message : 'errore di collegamento')
        return true
      }
      return false
    }
    aggiorna()
    const intervallo = window.setInterval(async () => {
      if (await aggiorna()) window.clearInterval(intervallo)
    }, 4000)
    return () => {
      fermo = true
      window.clearInterval(intervallo)
    }
  }, [jobId, token])

  const avviaDavvero = async () => {
    if (!piano) return
    setChiedoConferma(false)
    setErrore('')
    setAvvioInCorso(true)
    try {
      const id = await creaJobReportAF({
        token, piano, assessfirst,
        destinatario: destinatario.trim(), candidato: candidato.trim(), ruolo: ruolo.trim(),
        relazione, data: dataReport,
      })
      localStorage.setItem(CHIAVE_ULTIMO_JOB, id)
      setStato(null)
      setMarkdown('')
      setJobId(id)
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'avvio fallito')
    } finally {
      setAvvioInCorso(false)
    }
  }

  const azzera = () => {
    localStorage.removeItem(CHIAVE_ULTIMO_JOB)
    setJobId(null)
    setStato(null)
    setMarkdown('')
    setErrore('')
  }

  return (
    <RoleShell
      ruolo="Compartimento n°4a — Report AF"
      colore="bg-indigo-500"
      sottotitolo="Genera il report AssessFirst di una persona: piano + AssessFirst dentro, PDF fuori"
    >
      <div className="space-y-6">
        <Link href="/laboratorio" className="anima anima-1 block text-sm text-inchiostro/40 transition hover:text-petrolio">
          ← Tutti i compartimenti
        </Link>

        <div className="anima anima-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          ⚠️ Questo banco chiama l&apos;API a pagamento ({modello}). Prima di ogni invio ti chiedo conferma
          mostrandoti una stima di costo.
        </div>

        {/* 1 · Collegamento */}
        <section className="anima anima-2 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">1 · Collegamento</h2>
          <label className="mt-3 mb-1 block text-xs font-medium text-inchiostro/60">Token del blocco</label>
          <input
            type="password"
            value={token}
            onChange={(e) => salvaToken(e.target.value)}
            placeholder="incolla il WORKER_TOKEN (Railway → blocco-report-af → Variables)"
            className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-inchiostro/40">
            Resta solo in questo browser e viaggia esclusivamente verso {URL_REPORT_AF.replace('https://', '')}.
          </p>
        </section>

        {/* 2 · Persona e documenti */}
        <section className="anima anima-3 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">2 · Persona e documenti</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Candidato (nome e cognome)</label>
              <input value={candidato} onChange={(e) => setCandidato(e.target.value)} placeholder="Es. Fabio Reginato"
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Ruolo operativo reale</label>
              <input value={ruolo} onChange={(e) => setRuolo(e.target.value)} placeholder="Es. Titolare"
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Destinatario/i del report</label>
              <input value={destinatario} onChange={(e) => setDestinatario(e.target.value)} placeholder="Es. Fabio Reginato"
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Relazione (caso)</label>
              <select value={relazione} onChange={(e) => setRelazione(e.target.value as 'a' | 'b' | 'c')}
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none">
                <option value="a">a — titolare/socio (report a se stesso)</option>
                <option value="b">b — dipendente, un solo titolare</option>
                <option value="c">c — dipendente, più figure</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Data (AAAA-MM)</label>
              <input value={dataReport} onChange={(e) => setDataReport(e.target.value)}
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none" />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-inchiostro/60">Piano di consulenza (Word o PDF — il documento del passaggio 4)</label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setPiano(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-inchiostro/60 file:mr-3 file:rounded-xl file:border-0 file:bg-petrolio file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-petrolio-scuro"
            />
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-inchiostro/60">
              PDF AssessFirst della persona (SWIPE, DRIVE, BRAIN, comportamenti chiave… anche più file insieme)
            </label>
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => setAssessfirst(e.target.files ? Array.from(e.target.files) : [])}
              className="block w-full text-sm text-inchiostro/60 file:mr-3 file:rounded-xl file:border-0 file:bg-petrolio file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-petrolio-scuro"
            />
            {assessfirst.length > 0 && (
              <p className="mt-1.5 text-xs text-inchiostro/50">{assessfirst.length} file selezionati</p>
            )}
          </div>
        </section>

        {/* 3 · Esecuzione */}
        <section className="anima anima-4 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">3 · Generazione</h2>
            {jobId ? (
              <button onClick={azzera} className="text-xs font-medium text-inchiostro/40 transition hover:text-petrolio">
                Nuovo job
              </button>
            ) : chiedoConferma ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setChiedoConferma(false)}
                  className="rounded-xl border border-linea bg-carta px-3 py-2 text-xs font-semibold text-inchiostro/60 transition hover:border-petrolio/40">
                  Annulla
                </button>
                <button onClick={avviaDavvero} disabled={avvioInCorso}
                  className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-40">
                  {avvioInCorso ? 'Invio…' : `Sì, spendi ~$${stima.euro} e genera`}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setChiedoConferma(true)}
                disabled={!prontoPerInvio}
                className="rounded-xl bg-ambra px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                🚀 Avvia sul server
              </button>
            )}
          </div>

          {chiedoConferma && !jobId && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Stima: ~{stima.token.toLocaleString('it-IT')} token totali con <strong>{modello}</strong> →{' '}
              <strong>circa ${stima.euro}</strong>. È una stima approssimativa (dipende dalla lunghezza reale del
              report generato); confermi l&apos;invio?
            </div>
          )}

          {!jobId && !chiedoConferma && (
            <p className="mt-2 text-sm text-inchiostro/50">Servono: token, piano, almeno un PDF AssessFirst e i campi persona.</p>
          )}

          {jobId && (
            <>
              <ul className="mt-3 space-y-1.5">
                {(stato?.passi ?? []).map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-inchiostro/70">
                    <span className="text-green-600">✓</span>
                    {ETICHETTA_PASSO_AF[p.passo] ?? p.passo}
                    {p.dettaglio && <span className="text-xs text-inchiostro/40">({p.dettaglio})</span>}
                    <span className="ml-auto text-xs text-inchiostro/35">{p.ora.slice(11, 19)}</span>
                  </li>
                ))}
                {!finale && (
                  <li className="flex items-center gap-2 text-sm text-inchiostro/40">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-ambra border-t-transparent" />
                    {stato ? (ETICHETTA_PASSO_AF[stato.fase] ?? stato.fase) : 'collegamento'}…
                  </li>
                )}
              </ul>

              {stato?.generazione && (
                <p className="mt-3 text-xs text-inchiostro/50">
                  {stato.generazione.parole.toLocaleString('it-IT')} parole generate ·{' '}
                  {stato.generazione.token_in.toLocaleString('it-IT')} token input ·{' '}
                  {stato.generazione.token_out.toLocaleString('it-IT')} token output
                </p>
              )}

              {stato?.qa && (
                <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
                  {Object.entries(stato.qa.esiti).map(([k, ok]) => (
                    <div key={k} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${ok ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                      {ok ? '✓' : '✗'} {ETICHETTA_CHECK_AF[k] ?? k}
                    </div>
                  ))}
                </div>
              )}

              {stato?.fase === 'errore' && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  <strong>Errore del server:</strong> {stato.errore}
                </div>
              )}

              {stato?.verdetto && (
                <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${VERDETTO_STILE[stato.verdetto] ?? 'border-linea bg-carta'}`}>
                  <strong>Verdetto: {stato.verdetto.replaceAll('_', ' ')}</strong>
                  {stato.pagine ? ` — ${stato.pagine} pagine` : ''}
                </div>
              )}

              {stato?.fase === 'completato' && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => scaricaPdfReportAF(token, jobId, stato.pdf ?? 'report.pdf').catch((e) => setErrore(String(e)))}
                    className="flex-1 rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro"
                  >
                    ⬇ Scarica il PDF
                  </button>
                  <button
                    onClick={() => leggiMarkdownReportAF(token, jobId).then(setMarkdown).catch((e) => setErrore(String(e)))}
                    className="flex-1 rounded-xl border border-linea bg-carta px-4 py-2.5 text-sm font-medium text-inchiostro/70 transition hover:border-petrolio/40 hover:text-petrolio"
                  >
                    📋 Leggi il markdown grezzo
                  </button>
                </div>
              )}

              {markdown && (
                <pre className="mt-3 max-h-96 overflow-y-auto rounded-xl bg-linea/30 p-4 text-xs leading-5 whitespace-pre-wrap text-inchiostro/80">
                  {markdown}
                </pre>
              )}
            </>
          )}

          {errore && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{errore}</div>
          )}
        </section>

        <p className="anima anima-5 text-center text-xs text-inchiostro/40">
          Compartimento stagno: il banco parla solo col blocco Report AF su Railway, non tocca le pratiche della piattaforma.
        </p>
      </div>
    </RoleShell>
  )
}
