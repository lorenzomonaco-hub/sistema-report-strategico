'use client'

// ─── Compartimento n°8 — Grafica (banco di prova) ───
// Banco isolato che parla col worker su Railway: carichi il PDF operativo di
// un cliente, il server esegue l'intera pipeline di impaginazione (modello
// Macheda) e restituisce verdetto, controlli e PDF finale.

import Link from 'next/link'
import { useEffect, useState } from 'react'
import RoleShell from '@/components/RoleShell'
import {
  CHIAVE_TOKEN_WORKER,
  ETICHETTA_CHECK,
  ETICHETTA_PASSO,
  StatoJobGrafica,
  URL_WORKER,
  creaJobGrafica,
  leggiControlloGrafica,
  meseCorrente,
  scaricaPdfGrafica,
  statoJobGrafica,
} from '@/lib/grafica'

const CHIAVE_ULTIMO_JOB = 'laboratorio-grafica-ultimo-job'

const VERDETTO_STILE: Record<string, string> = {
  APPROVATO: 'border-green-200 bg-green-50 text-green-800',
  RIMANDATO: 'border-rose-200 bg-rose-50 text-rose-800',
  DA_CONTROLLARE_A_MANO: 'border-amber-200 bg-amber-50 text-amber-800',
}

export default function BancoGrafica() {
  const [token, setToken] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [cliente, setCliente] = useState('')
  const [tipo, setTipo] = useState('Piano Marketing')
  const [dataReport, setDataReport] = useState(meseCorrente())
  const [jobId, setJobId] = useState<string | null>(null)
  const [stato, setStato] = useState<StatoJobGrafica | null>(null)
  const [errore, setErrore] = useState('')
  const [avvioInCorso, setAvvioInCorso] = useState(false)
  const [controllo, setControllo] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura iniziale da localStorage
    setToken(localStorage.getItem(CHIAVE_TOKEN_WORKER) ?? localStorage.getItem('worker-grafica-token') ?? localStorage.getItem('blocco-report-af-token') ?? localStorage.getItem('blocco-visual-token') ?? '')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ripresa ultimo job del banco
    setJobId(localStorage.getItem(CHIAVE_ULTIMO_JOB))
  }, [])

  const salvaToken = (v: string) => {
    setToken(v)
    localStorage.setItem(CHIAVE_TOKEN_WORKER, v)
  }

  const finale = stato?.fase === 'completato' || stato?.fase === 'errore'

  useEffect(() => {
    if (!jobId || !token) return
    let fermo = false
    const aggiorna = async () => {
      try {
        const s = await statoJobGrafica(token, jobId)
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

  const avvia = async () => {
    if (!file || !token || !cliente.trim()) return
    setErrore('')
    setAvvioInCorso(true)
    try {
      const id = await creaJobGrafica({ token, file, cliente: cliente.trim(), tipo, data: dataReport })
      localStorage.setItem(CHIAVE_ULTIMO_JOB, id)
      setStato(null)
      setControllo('')
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
    setControllo('')
    setErrore('')
  }

  return (
    <RoleShell
      ruolo="Compartimento n°8 — Grafica"
      colore="bg-stone-500"
      sottotitolo="Impaginazione automatica sul worker Railway: PDF dentro, report impaginato e verdetto fuori"
    >
      <div className="space-y-6">
        <Link href="/laboratorio" className="anima anima-1 block text-sm text-inchiostro/40 transition hover:text-petrolio">
          ← Tutti i compartimenti
        </Link>

        {/* 1 · Collegamento */}
        <section className="anima anima-2 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">1 · Collegamento</h2>
          <label className="mt-3 mb-1 block text-xs font-medium text-inchiostro/60">Token del worker</label>
          <input
            type="password"
            value={token}
            onChange={(e) => salvaToken(e.target.value)}
            placeholder="incolla il WORKER_TOKEN (Railway → blocco-impaginazione → Variables)"
            className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-inchiostro/40">
            Resta solo in questo browser e viaggia esclusivamente verso {URL_WORKER.replace('https://', '')}.
          </p>
        </section>

        {/* 2 · Documento */}
        <section className="anima anima-3 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">2 · Documento del cliente</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Cliente (Cognome Nome)</label>
              <input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Es. Zurlo Matteo"
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Tipo consulenza</label>
              <input value={tipo} onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-inchiostro/60">Data (AAAA-MM)</label>
              <input value={dataReport} onChange={(e) => setDataReport(e.target.value)}
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none" />
            </div>
          </div>
          <input
            type="file"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null
              const nome = (f?.name ?? '').toLowerCase()
              if (f && !nome.endsWith('.docx') && !nome.endsWith('.pdf')) {
                setErrore(`«${f.name}» non va bene: carica il Word (.docx) prodotto dalla fase 6 (o un PDF).`)
                setFile(null)
                return
              }
              setErrore('')
              setFile(f)
            }}
            className="mt-3 block w-full text-sm text-inchiostro/60 file:mr-3 file:rounded-xl file:border-0 file:bg-petrolio file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-petrolio-scuro"
          />
        </section>

        {/* 3 · Esecuzione */}
        <section className="anima anima-4 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">3 · Impaginazione</h2>
            {jobId ? (
              <button onClick={azzera} className="text-xs font-medium text-inchiostro/40 transition hover:text-petrolio">
                Nuovo job
              </button>
            ) : (
              <button
                onClick={avvia}
                disabled={!token || !file || !cliente.trim() || avvioInCorso}
                className="rounded-xl bg-ambra px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {avvioInCorso ? 'Invio…' : '🚀 Avvia sul server'}
              </button>
            )}
          </div>
          {!jobId && <p className="mt-2 text-sm text-inchiostro/50">Servono: token, cliente e il <strong>Word (.docx) della fase 6</strong> (con i visual già dentro).</p>}

          {jobId && (
            <>
              <ul className="mt-3 space-y-1.5">
                {(stato?.passi ?? []).map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-inchiostro/70">
                    <span className="text-green-600">✓</span>
                    {ETICHETTA_PASSO[p.passo] ?? p.passo}
                    <span className="ml-auto text-xs text-inchiostro/35">{p.ora.slice(11, 19)}</span>
                  </li>
                ))}
                {!finale && (
                  <li className="flex items-center gap-2 text-sm text-inchiostro/40">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-ambra border-t-transparent" />
                    {stato ? (ETICHETTA_PASSO[stato.fase] ?? stato.fase) : 'collegamento'}…
                  </li>
                )}
              </ul>

              {stato?.qa && (
                <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
                  {Object.entries(stato.qa.esiti).map(([k, ok]) => (
                    <div key={k} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${ok ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                      {ok ? '✓' : '✗'} {ETICHETTA_CHECK[k] ?? k}
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
                  {stato.verdetto === 'DA_CONTROLLARE_A_MANO' && (
                    <p className="mt-1 text-xs opacity-80">
                      Controllo visivo agentico saltato: manca la chiave API sul worker. I check automatici sono passati.
                    </p>
                  )}
                </div>
              )}

              {stato?.fase === 'completato' && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => scaricaPdfGrafica(token, jobId, stato.pdf ?? 'report.pdf').catch((e) => setErrore(String(e)))}
                    className="flex-1 rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro"
                  >
                    ⬇ Scarica il PDF impaginato
                  </button>
                  <button
                    onClick={() => leggiControlloGrafica(token, jobId).then(setControllo).catch((e) => setErrore(String(e)))}
                    className="flex-1 rounded-xl border border-linea bg-carta px-4 py-2.5 text-sm font-medium text-inchiostro/70 transition hover:border-petrolio/40 hover:text-petrolio"
                  >
                    📋 Report del controllo visivo
                  </button>
                </div>
              )}

              {controllo && (
                <pre className="mt-3 max-h-80 overflow-y-auto rounded-xl bg-linea/30 p-4 text-xs leading-5 whitespace-pre-wrap text-inchiostro/80">
                  {controllo}
                </pre>
              )}
            </>
          )}

          {errore && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{errore}</div>
          )}
        </section>

        <p className="anima anima-5 text-center text-xs text-inchiostro/40">
          Compartimento stagno: il banco parla solo col worker su Railway, non tocca le pratiche della piattaforma.
          Lo stesso motore è collegato alla fase Grafica della scheda progetto.
        </p>
      </div>
    </RoleShell>
  )
}
