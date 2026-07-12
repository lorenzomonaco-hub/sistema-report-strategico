'use client'

// ─── Compartimento n°6 — Visual (banco di prova del BLOCCO) ───
// Parla col blocco Visual su Railway: carichi il Word del report, il server
// legge la struttura (stima GRATUITA), tu confermi il costo, la regia
// agentica pianifica i visual (17 famiglie) e esce il PDF pastello o il docx.
// Sostituisce il vecchio banco v1 (prompt nel browser), superato dal blocco.

import Link from 'next/link'
import { useEffect, useState } from 'react'
import RoleShell from '@/components/RoleShell'
import {
  CHIAVE_TOKEN_VISUAL,
  ETICHETTA_PASSO_VISUAL,
  StatoJobVisual,
  StimaVisual,
  URL_VISUAL,
  creaJobVisual,
  scaricaUscitaVisual,
  statoJobVisual,
  stimaCostoVisual,
  stimaVisual,
} from '@/lib/visualblocco'

const CHIAVE_ULTIMO_JOB = 'laboratorio-visual-ultimo-job'

const VERDETTO_STILE: Record<string, string> = {
  APPROVATO: 'border-green-200 bg-green-50 text-green-800',
  RIMANDATO: 'border-rose-200 bg-rose-50 text-rose-800',
  DA_CONTROLLARE_A_MANO: 'border-amber-200 bg-amber-50 text-amber-800',
}

export default function BancoVisualBlocco() {
  const [token, setToken] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [titolo, setTitolo] = useState('')
  const [formato, setFormato] = useState<'pdf' | 'docx'>('pdf')
  const [stima, setStima] = useState<StimaVisual | null>(null)
  const [stimaInCorso, setStimaInCorso] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [stato, setStato] = useState<StatoJobVisual | null>(null)
  const [errore, setErrore] = useState('')
  const [avvioInCorso, setAvvioInCorso] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura iniziale da localStorage
    setToken(localStorage.getItem(CHIAVE_TOKEN_VISUAL) ?? localStorage.getItem('worker-grafica-token') ?? localStorage.getItem('blocco-report-af-token') ?? localStorage.getItem('blocco-visual-token') ?? '')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ripresa ultimo job del banco
    setJobId(localStorage.getItem(CHIAVE_ULTIMO_JOB))
  }, [])

  const salvaToken = (v: string) => {
    setToken(v)
    localStorage.setItem(CHIAVE_TOKEN_VISUAL, v)
  }

  const finale = stato?.fase === 'completato' || stato?.fase === 'errore'
  const costo = stima ? stimaCostoVisual(stima) : null

  useEffect(() => {
    if (!jobId || !token) return
    let fermo = false
    const aggiorna = async () => {
      try {
        const s = await statoJobVisual(token, jobId)
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
    }, 5000)
    return () => {
      fermo = true
      window.clearInterval(intervallo)
    }
  }, [jobId, token])

  const calcolaStima = async () => {
    if (!file || !token) return
    setErrore('')
    setStimaInCorso(true)
    setStima(null)
    try {
      setStima(await stimaVisual(token, file))
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'stima fallita')
    } finally {
      setStimaInCorso(false)
    }
  }

  const avvia = async () => {
    if (!file || !token || !stima) return
    setErrore('')
    setAvvioInCorso(true)
    try {
      const id = await creaJobVisual({ token, file, titolo: titolo.trim() || (file.name ?? ''), formato })
      localStorage.setItem(CHIAVE_ULTIMO_JOB, id)
      setStato(null)
      setStima(null)
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
    setStima(null)
    setErrore('')
  }

  const uso = stato?.regia?.uso

  return (
    <RoleShell
      ruolo="Compartimento n°6 — Visual"
      colore="bg-cyan-600"
      sottotitolo="Word dentro → regia agentica dei visual (17 famiglie) → PDF pastello o docx fuori"
    >
      <div className="space-y-6">
        <Link href="/laboratorio" className="anima anima-1 block text-sm text-inchiostro/40 transition hover:text-petrolio">
          ← Tutti i compartimenti
        </Link>

        <div className="anima anima-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          ⚠️ La regia chiama l&apos;API a pagamento. La stima però è <strong>gratuita</strong>: il server legge il
          documento e conta i numeri veri (blocchi, lotti) senza toccare l&apos;API — confermi solo dopo averla vista.
        </div>

        {/* 1 · Collegamento */}
        <section className="anima anima-2 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">1 · Collegamento</h2>
          <label className="mt-3 mb-1 block text-xs font-medium text-inchiostro/60">Token del blocco</label>
          <input
            type="password"
            value={token}
            onChange={(e) => salvaToken(e.target.value)}
            placeholder="incolla il WORKER_TOKEN (Railway → blocco-visual → Variables)"
            className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-inchiostro/40">
            Resta solo in questo browser e viaggia esclusivamente verso {URL_VISUAL.replace('https://', '')}.
          </p>
        </section>

        {/* 2 · Documento */}
        <section className="anima anima-3 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">2 · Documento</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Titolo (per il nome del file)</label>
              <input value={titolo} onChange={(e) => setTitolo(e.target.value)} placeholder="Es. Zurlo Matteo - Piano Marketing"
                maxLength={200}
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Formato di uscita</label>
              <select value={formato} onChange={(e) => setFormato(e.target.value as 'pdf' | 'docx')}
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none">
                <option value="pdf">PDF — motore pastello (consigliato)</option>
                <option value="docx">Word — stampi nativi</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-inchiostro/60">Report in Word (.docx)</label>
            <input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                if (f && !f.name.toLowerCase().endsWith('.docx')) {
                  setErrore(`«${f.name}» non è un Word .docx: il Visual lavora sulla struttura del documento Word (i PDF non la conservano).`)
                  setFile(null)
                  e.target.value = ''
                  return
                }
                setErrore('')
                setFile(f)
                setStima(null)
              }}
              className="block w-full text-sm text-inchiostro/60 file:mr-3 file:rounded-xl file:border-0 file:bg-petrolio file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-petrolio-scuro"
            />
          </div>
        </section>

        {/* 3 · Stima e generazione */}
        <section className="anima anima-4 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">3 · Stima e generazione</h2>
            {jobId ? (
              <button onClick={azzera} className="text-xs font-medium text-inchiostro/40 transition hover:text-petrolio">
                Nuovo job
              </button>
            ) : stima ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setStima(null)}
                  className="rounded-xl border border-linea bg-carta px-3 py-2 text-xs font-semibold text-inchiostro/60 transition hover:border-petrolio/40">
                  Annulla
                </button>
                <button onClick={avvia} disabled={avvioInCorso || !costo}
                  className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-40">
                  {avvioInCorso ? 'Invio…' : costo ? `Sì, spendi ~$${costo.euro} e genera` : 'Prezzo modello sconosciuto'}
                </button>
              </div>
            ) : (
              <button
                onClick={calcolaStima}
                disabled={!token || !file || stimaInCorso}
                className="rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro disabled:cursor-not-allowed disabled:opacity-40"
              >
                {stimaInCorso ? 'Leggo il documento…' : '① Calcola la stima (gratis)'}
              </button>
            )}
          </div>

          {stima && !jobId && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Il documento ha <strong>{stima.blocchi.toLocaleString('it-IT')} blocchi</strong> →{' '}
              {stima.lotti} chiamate alla regia con <strong>{stima.modello}</strong>, ~{stima.visual_previsti} visual
              previsti.{' '}
              {stima.loop_attivo && (
                <>Il <strong>loop 6↔7 è attivo</strong> (max {stima.giri_max} giri col revisore; {stima.lezioni_in_memoria ?? 0} lezioni
                già in memoria): un giro costa ~${costo?.euroGiro}, il tetto sotto è il caso peggiore.{' '}</>
              )}
              {costo ? (
                <>Tetto stimato: <strong>fino a ${costo.euro}</strong>. Confermi?</>
              ) : (
                <>Non conosco il prezzo di «{stima.modello}»: invio bloccato per prudenza.</>
              )}
            </div>
          )}

          {!jobId && !stima && (
            <p className="mt-2 text-sm text-inchiostro/50">Servono: token e il Word del report. La stima non costa nulla.</p>
          )}

          {jobId && (
            <>
              <ul className="mt-3 space-y-1.5">
                {(stato?.passi ?? []).map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-inchiostro/70">
                    <span className="text-green-600">✓</span>
                    {ETICHETTA_PASSO_VISUAL[p.passo] ?? p.passo}
                    <span className="ml-auto text-xs text-inchiostro/35">{p.ora.slice(11, 19)}</span>
                  </li>
                ))}
                {!finale && (
                  <li className="flex items-center gap-2 text-sm text-inchiostro/40">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-ambra border-t-transparent" />
                    {stato ? (ETICHETTA_PASSO_VISUAL[stato.fase] ?? stato.fase) : 'collegamento'}…
                  </li>
                )}
              </ul>

              {stato?.regia && (
                <p className="mt-3 text-xs text-inchiostro/50">
                  Regia: {stato.regia.modo} · {stato.regia.visual_pianificati.toLocaleString('it-IT')} visual pianificati
                  {uso && (
                    <>
                      {' '}· {uso.token_in.toLocaleString('it-IT')} token vivi + {uso.token_cache_lettura.toLocaleString('it-IT')} dalla cache
                      (1/10) · {uso.token_out.toLocaleString('it-IT')} in uscita
                    </>
                  )}
                </p>
              )}

              {(stato?.loop?.length ?? 0) > 0 && (
                <div className="mt-3 space-y-1">
                  {stato?.loop?.map((g) => (
                    <p key={g.giro} className={`rounded-lg px-2.5 py-1.5 text-xs ${g.verdetto === 'APPROVATO' ? 'bg-green-50 text-green-800' : 'bg-rose-50 text-rose-800'}`}>
                      Giro {g.giro}: <strong>{g.verdetto}</strong> — {g.gravi} gravi, {g.minori} minori
                      {g.verdetto !== 'APPROVATO' && ` → ${g.lezioni} lezioni al Visual`}
                    </p>
                  ))}
                </div>
              )}

              {stato?.qa && (
                <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
                  {Object.entries(stato.qa.esiti).map(([k, ok]) => (
                    <div key={k} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${ok ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                      {ok ? '✓' : '✗'} {k}
                    </div>
                  ))}
                </div>
              )}

              {stato?.fase === 'errore' && (
                <>
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    <strong>Errore del server:</strong> {stato.errore}
                  </div>
                  <button
                    onClick={azzera}
                    className="mt-3 w-full rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro"
                  >
                    ↺ Riprova con un nuovo job (ricarica il file e riavvia)
                  </button>
                </>
              )}

              {stato?.verdetto && (
                <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${VERDETTO_STILE[stato.verdetto] ?? 'border-linea bg-carta'}`}>
                  <strong>Verdetto: {stato.verdetto.replaceAll('_', ' ')}</strong>
                  {stato.pagine ? ` — ${stato.pagine} pagine` : ''}
                </div>
              )}

              {stato?.fase === 'completato' && (
                <button
                  onClick={() =>
                    scaricaUscitaVisual(
                      token,
                      jobId,
                      stato.pdf ? 'pdf' : 'docx',
                      stato.pdf ?? stato.docx ?? 'report-illustrato'
                    ).catch((e) => setErrore(String(e)))
                  }
                  className="mt-4 w-full rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro"
                >
                  ⬇ Scarica il report illustrato ({stato.pdf ? 'PDF' : 'Word'})
                </button>
              )}
            </>
          )}

          {errore && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{errore}</div>
          )}
        </section>

        <p className="anima anima-5 text-center text-xs text-inchiostro/40">
          Compartimento stagno: il banco parla solo col blocco Visual su Railway, non tocca le pratiche della piattaforma.
        </p>
      </div>
    </RoleShell>
  )
}
