'use client'

// ─── Laboratorio · Compartimento n°4 — Revisore 1 (Editor 5 fasi) ───
// Banco di prova isolato: documento in ingresso → API Claude col prompt
// vero del Revisore 1 → documento revisionato in uscita, scaricabile.

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import RoleShell from '@/components/RoleShell'
import DiffView from '@/components/DiffView'
import { CHIAVE_STORAGE_API, eseguiRevisione, MODELLI_LAB } from '@/lib/laboratorio'

type Stato = 'pronto' | 'in-esecuzione' | 'completato' | 'errore'

export default function BancoRevisore1() {
  const [chiaveApi, setChiaveApi] = useState('')
  const [modello, setModello] = useState<string>(MODELLI_LAB[0].id)
  const [destinatario, setDestinatario] = useState('')
  const [documento, setDocumento] = useState('')
  const [stato, setStato] = useState<Stato>('pronto')
  const [risultato, setRisultato] = useState('')
  const [errore, setErrore] = useState('')
  const [token, setToken] = useState<{ input: number; output: number } | null>(null)
  const [mostraDiff, setMostraDiff] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const areaRisultatoRef = useRef<HTMLDivElement | null>(null)

  // la chiave resta solo nel browser dell'utente
  useEffect(() => {
    try {
      const salvata = localStorage.getItem(CHIAVE_STORAGE_API)
      if (salvata) setChiaveApi(salvata)
    } catch {
      // storage non disponibile
    }
  }, [])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const salvaChiave = (valore: string) => {
    setChiaveApi(valore)
    try {
      if (valore) localStorage.setItem(CHIAVE_STORAGE_API, valore)
      else localStorage.removeItem(CHIAVE_STORAGE_API)
    } catch {
      // storage non disponibile
    }
  }

  const caricaFile = (file: File) => {
    const lettore = new FileReader()
    lettore.onload = () => setDocumento(String(lettore.result ?? ''))
    lettore.readAsText(file)
  }

  const avvia = async () => {
    setStato('in-esecuzione')
    setRisultato('')
    setErrore('')
    setToken(null)
    setMostraDiff(false)
    abortRef.current = new AbortController()
    try {
      const esito = await eseguiRevisione({
        chiaveApi: chiaveApi.trim(),
        modello,
        destinatario: destinatario.trim(),
        documento,
        segnale: abortRef.current.signal,
        onTesto: (frammento) => {
          setRisultato((prev) => prev + frammento)
          areaRisultatoRef.current?.scrollTo({ top: areaRisultatoRef.current.scrollHeight })
        },
      })
      setToken({ input: esito.tokenInput, output: esito.tokenOutput })
      setStato('completato')
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        setStato('pronto')
        return
      }
      setErrore((e as Error).message)
      setStato('errore')
    }
  }

  const annulla = () => {
    abortRef.current?.abort()
    setStato('pronto')
  }

  const scarica = () => {
    const blob = new Blob([risultato], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'documento-revisionato.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const prontoAllAvvio = chiaveApi.trim().length > 10 && destinatario.trim().length > 1 && documento.trim().length > 50

  return (
    <RoleShell
      ruolo="Compartimento n°4 — Revisore 1"
      colore="bg-amber-500"
      sottotitolo="Editor Metodo in 5 fasi: documento dentro, documento revisionato fuori"
    >
      <div className="space-y-5">
        <Link href="/laboratorio" className="anima anima-1 inline-block text-sm text-inchiostro/40 transition hover:text-petrolio">
          ← Tutti i compartimenti
        </Link>

        {/* Impostazioni */}
        <section className="anima anima-1 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">1 · Collegamento</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-inchiostro/60">Chiave API Anthropic</label>
              <input
                type="password"
                value={chiaveApi}
                onChange={(e) => salvaChiave(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none"
              />
              <p className="mt-1 text-xs text-inchiostro/40">
                Resta solo in questo browser e viaggia esclusivamente verso Anthropic. Non inserirla su computer condivisi.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-inchiostro/60">Modello</label>
              <select
                value={modello}
                onChange={(e) => setModello(e.target.value)}
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none"
              >
                {MODELLI_LAB.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Documento in ingresso */}
        <section className="anima anima-2 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">2 · Documento da revisionare</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-inchiostro/60">
                Destinatario del report (la FASE 0 del prompt)
              </label>
              <input
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                placeholder="Es. Giuseppe Di Guida — GRUPPO EGS"
                className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-inchiostro/60">
                Carica un file (.txt / .md) — oppure incolla sotto
              </label>
              <input
                type="file"
                accept=".txt,.md,.markdown,text/plain,text/markdown"
                onChange={(e) => e.target.files?.[0] && caricaFile(e.target.files[0])}
                className="w-full rounded-xl border border-dashed border-linea px-3 py-1.5 text-sm text-inchiostro/60 file:mr-3 file:rounded-lg file:border-0 file:bg-petrolio file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
              <p className="mt-1 text-xs text-inchiostro/40">Da Word: copia il testo e incollalo nel riquadro.</p>
            </div>
          </div>
          <textarea
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            placeholder="Incolla qui il documento da revisionare..."
            className="mt-3 h-56 w-full rounded-xl border border-linea bg-carta p-3 font-mono text-xs leading-5 focus:border-petrolio focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-inchiostro/40">
            {documento.trim() ? `${documento.trim().split(/\s+/).length.toLocaleString('it-IT')} parole` : 'nessun documento'}
          </p>
        </section>

        {/* Esecuzione */}
        <section className="anima anima-3 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">3 · Revisione</h2>
            {stato === 'in-esecuzione' ? (
              <button
                onClick={annulla}
                className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                ■ Annulla
              </button>
            ) : (
              <button
                onClick={avvia}
                disabled={!prontoAllAvvio}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition ${
                  prontoAllAvvio
                    ? 'bg-ambra text-white hover:bg-amber-700'
                    : 'cursor-not-allowed bg-inchiostro/10 text-inchiostro/40'
                }`}
              >
                ⚡ Avvia il Revisore 1
              </button>
            )}
          </div>
          {!prontoAllAvvio && stato === 'pronto' && (
            <p className="mt-2 text-xs text-inchiostro/40">
              Servono: chiave API, destinatario e un documento di almeno qualche riga.
            </p>
          )}

          {stato === 'in-esecuzione' && (
            <p className="mt-3 flex items-center gap-2 text-sm text-amber-700">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              Il Revisore 1 sta lavorando — il testo appare man mano che viene riscritto...
            </p>
          )}
          {stato === 'errore' && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              ⚠ {errore}
            </p>
          )}

          {(risultato || stato === 'in-esecuzione') && (
            <div className="mt-4 overflow-hidden rounded-xl border border-linea">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linea bg-linea/30 px-4 py-2">
                <span className="text-xs font-semibold text-inchiostro/60">
                  Documento revisionato {stato === 'completato' && '· ✓ completato'}
                </span>
                {stato === 'completato' && (
                  <div className="flex items-center gap-2">
                    {token && (
                      <span className="text-xs text-inchiostro/40">
                        {token.input.toLocaleString('it-IT')} token in · {token.output.toLocaleString('it-IT')} out
                      </span>
                    )}
                    <button
                      onClick={() => navigator.clipboard.writeText(risultato)}
                      className="rounded-lg border border-linea bg-carta px-3 py-1 text-xs font-semibold text-inchiostro/60 transition hover:border-petrolio/40 hover:text-petrolio"
                    >
                      Copia
                    </button>
                    <button
                      onClick={scarica}
                      className="rounded-lg bg-petrolio px-3 py-1 text-xs font-semibold text-white transition hover:bg-petrolio-scuro"
                    >
                      ⬇ Scarica .md
                    </button>
                  </div>
                )}
              </div>
              <div
                ref={areaRisultatoRef}
                className="max-h-[28rem] overflow-y-auto bg-carta p-4 text-sm leading-6 whitespace-pre-wrap text-inchiostro/80"
              >
                {risultato || '...'}
              </div>
            </div>
          )}

          {stato === 'completato' && (
            <div className="mt-4">
              <button
                onClick={() => setMostraDiff((v) => !v)}
                className="text-sm font-semibold text-petrolio transition hover:text-petrolio-scuro"
              >
                {mostraDiff ? '▲ Nascondi confronto prima/dopo' : '▼ Confronta prima/dopo'}
              </button>
              {mostraDiff && (
                <div className="mt-3">
                  <DiffView prima={documento} dopo={risultato} />
                </div>
              )}
            </div>
          )}
        </section>

        <p className="anima anima-4 text-center text-xs text-inchiostro/35">
          Compartimento stagno: quello che succede qui non tocca la pipeline. Quando il prompt sarà a punto, lo
          stesso motore verrà collegato al checkpoint Revisore 1 della piattaforma.
        </p>
      </div>
    </RoleShell>
  )
}
