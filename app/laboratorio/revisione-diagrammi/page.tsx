'use client'

// ─── Compartimento n°7 — Revisione diagrammi (banco di prova del BLOCCO) ───
// Il «lettore ignaro» sulle pagine: carichi il PDF illustrato uscito dalla
// fase 6, il server renderizza le pagine e le ispeziona con la visione.
// Uscita: VERDETTO + PROBLEMI (pagina per pagina) + LEZIONI per il Visual —
// il carburante del loop 6↔7.

import Link from 'next/link'
import { useEffect, useState } from 'react'
import RoleShell from '@/components/RoleShell'
import {
  CHIAVE_TOKEN_REVISIONE,
  ETICHETTA_PASSO_REVISIONE,
  StatoJobRevisione,
  StimaRevisione,
  URL_REVISIONE,
  creaJobRevisione,
  statoJobRevisione,
  stimaCostoRevisione,
  stimaRevisione,
} from '@/lib/revisionediagrammi'

const CHIAVE_ULTIMO_JOB = 'laboratorio-revisione-diagrammi-ultimo-job'

const VERDETTO_STILE: Record<string, string> = {
  APPROVATO: 'border-green-200 bg-green-50 text-green-800',
  RIMANDATO: 'border-rose-200 bg-rose-50 text-rose-800',
}

export default function BancoRevisioneDiagrammi() {
  const [token, setToken] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [titolo, setTitolo] = useState('')
  const [stima, setStima] = useState<StimaRevisione | null>(null)
  const [stimaInCorso, setStimaInCorso] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [stato, setStato] = useState<StatoJobRevisione | null>(null)
  const [errore, setErrore] = useState('')
  const [avvioInCorso, setAvvioInCorso] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura iniziale da localStorage
    setToken(localStorage.getItem(CHIAVE_TOKEN_REVISIONE) ?? '')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ripresa ultimo job del banco
    setJobId(localStorage.getItem(CHIAVE_ULTIMO_JOB))
  }, [])

  const salvaToken = (v: string) => {
    setToken(v)
    localStorage.setItem(CHIAVE_TOKEN_REVISIONE, v)
  }

  const finale = stato?.fase === 'completato' || stato?.fase === 'errore'
  const costo = stima ? stimaCostoRevisione(stima) : null

  useEffect(() => {
    if (!jobId || !token) return
    let fermo = false
    const aggiorna = async () => {
      try {
        const s = await statoJobRevisione(token, jobId)
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
      setStima(await stimaRevisione(token, file))
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
      const id = await creaJobRevisione(token, file, titolo.trim() || file.name)
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

  return (
    <RoleShell
      ruolo="Compartimento n°7 — Revisione diagrammi"
      colore="bg-violet-500"
      sottotitolo="Il lettore ignaro sulle pagine: PDF illustrato dentro, verdetto + lezioni per il Visual fuori"
    >
      <div className="space-y-6">
        <Link href="/laboratorio" className="anima anima-1 block text-sm text-inchiostro/40 transition hover:text-petrolio">
          ← Tutti i compartimenti
        </Link>

        <div className="anima anima-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          ⚠️ L&apos;ispezione visiva chiama l&apos;API a pagamento. La stima è <strong>gratuita</strong> (il server conta
          le pagine) e confermi solo dopo averla vista. Le LEZIONI che escono da qui sono quelle che il loop
          automatico rimanderà al Visual.
        </div>

        {/* 1 · Collegamento */}
        <section className="anima anima-2 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">1 · Collegamento</h2>
          <label className="mt-3 mb-1 block text-xs font-medium text-inchiostro/60">Token del blocco</label>
          <input
            type="password"
            value={token}
            onChange={(e) => salvaToken(e.target.value)}
            placeholder="incolla il WORKER_TOKEN (Railway → blocco-revisione-diagrammi → Variables)"
            className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-inchiostro/40">
            Resta solo in questo browser e viaggia esclusivamente verso {URL_REVISIONE.replace('https://', '')}.
          </p>
        </section>

        {/* 2 · Documento */}
        <section className="anima anima-3 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">2 · PDF illustrato</h2>
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-inchiostro/60">Titolo (per riconoscere il job)</label>
            <input value={titolo} onChange={(e) => setTitolo(e.target.value)} placeholder="Es. De Lilla - Report illustrato"
              maxLength={200}
              className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none" />
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-inchiostro/60">PDF illustrato (l&apos;uscita della fase 6)</label>
            <input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                if (f && !f.name.toLowerCase().endsWith('.pdf')) {
                  setErrore(`«${f.name}» non è un PDF: qui si giudica il PDF illustrato prodotto dal Visual.`)
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

        {/* 3 · Stima e revisione */}
        <section className="anima anima-4 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">3 · Stima e revisione</h2>
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
                  {avvioInCorso ? 'Invio…' : costo ? `Sì, spendi ~$${costo.euro} e giudica` : 'Prezzo modello sconosciuto'}
                </button>
              </div>
            ) : (
              <button
                onClick={calcolaStima}
                disabled={!token || !file || stimaInCorso}
                className="rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro disabled:cursor-not-allowed disabled:opacity-40"
              >
                {stimaInCorso ? 'Conto le pagine…' : '① Calcola la stima (gratis)'}
              </button>
            )}
          </div>

          {stima && !jobId && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>{stima.pagine} pagine</strong> da ispezionare in {stima.lotti} lotti con{' '}
              <strong>{stima.modello}</strong>. {costo ? (
                <>Tetto stimato: ~{costo.token.toLocaleString('it-IT')} token → <strong>circa ${costo.euro}</strong>. Confermi?</>
              ) : (
                <>Non conosco il prezzo di «{stima.modello}»: invio bloccato per prudenza.</>
              )}
            </div>
          )}

          {!jobId && !stima && (
            <p className="mt-2 text-sm text-inchiostro/50">Servono: token e il PDF illustrato. La stima non costa nulla.</p>
          )}

          {jobId && (
            <>
              <ul className="mt-3 space-y-1.5">
                {(stato?.passi ?? []).slice(-8).map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-inchiostro/70">
                    <span className="text-green-600">✓</span>
                    {ETICHETTA_PASSO_REVISIONE[p.passo] ?? p.passo}
                    {p.dettaglio && <span className="text-xs text-inchiostro/40">({p.dettaglio})</span>}
                    <span className="ml-auto text-xs text-inchiostro/35">{p.ora.slice(11, 19)}</span>
                  </li>
                ))}
                {!finale && (
                  <li className="flex items-center gap-2 text-sm text-inchiostro/40">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-ambra border-t-transparent" />
                    {stato ? (ETICHETTA_PASSO_REVISIONE[stato.fase] ?? stato.fase) : 'collegamento'}…
                  </li>
                )}
              </ul>

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
                  <strong>Verdetto: {stato.verdetto}</strong>
                  {' — '}{stato.gravi ?? 0} problemi gravi, {stato.minori ?? 0} minori
                  {stato.uso && (
                    <span className="mt-1 block text-xs opacity-70">
                      {stato.uso.token_in.toLocaleString('it-IT')} token vivi + {stato.uso.token_cache_lettura.toLocaleString('it-IT')} dalla
                      cache · {stato.uso.token_out.toLocaleString('it-IT')} in uscita
                    </span>
                  )}
                </div>
              )}

              {(stato?.problemi?.length ?? 0) > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-inchiostro">Problemi</h3>
                  <ul className="mt-2 max-h-80 space-y-1.5 overflow-y-auto">
                    {stato?.problemi?.map((p, i) => (
                      <li key={i} className={`rounded-xl border px-3 py-2 text-xs leading-5 ${p.gravita === 'GRAVE' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
                        <strong>pag. {p.pagina} · {p.gravita} · {p.categoria}</strong> — {p.descrizione}
                        <span className="mt-0.5 block opacity-80">→ {p.correzione}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(stato?.lezioni?.length ?? 0) > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-inchiostro">🧠 Lezioni per l&apos;Agente Visual</h3>
                  <ul className="mt-2 space-y-1.5">
                    {stato?.lezioni?.map((l, i) => (
                      <li key={i} className="rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs leading-5 text-violet-900">
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {errore && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{errore}</div>
          )}
        </section>

        <p className="anima anima-5 text-center text-xs text-inchiostro/40">
          Compartimento stagno: il banco parla solo col blocco Revisione diagrammi su Railway.
          Quando il giudice sarà validato, entrerà nel loop automatico 6↔7.
        </p>
      </div>
    </RoleShell>
  )
}
