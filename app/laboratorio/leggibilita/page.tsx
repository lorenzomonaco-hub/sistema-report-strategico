'use client'

// ─── Laboratorio · Compartimento n°7 — Revisore Leggibilità ───
// Banco di prova isolato: APPROVATO + CON VISUAL in ingresso → verdetto
// APPROVATO/RIMANDATO, problemi e lezioni per l'Agente Visual.

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import RoleShell from '@/components/RoleShell'
import { CHIAVE_STORAGE_API, eseguiLeggibilita, MODELLI_LAB } from '@/lib/laboratorio'

type Stato = 'pronto' | 'in-esecuzione' | 'completato' | 'errore'

/** Ultima corsa del banco n°6: {documento: pre-visual, risultato: con visual}. */
const CHIAVE_ULTIMO_VISUAL = 'laboratorio-ultimo-visual'

export default function BancoLeggibilita() {
  const [chiaveApi, setChiaveApi] = useState('')
  const [modello, setModello] = useState<string>(MODELLI_LAB[0].id)
  const [approvato, setApprovato] = useState('')
  const [conVisual, setConVisual] = useState('')
  const [stato, setStato] = useState<Stato>('pronto')
  const [risultato, setRisultato] = useState('')
  const [errore, setErrore] = useState('')
  const [token, setToken] = useState<{ input: number; output: number } | null>(null)
  const [importDisponibile, setImportDisponibile] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const areaRisultatoRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      const salvata = localStorage.getItem(CHIAVE_STORAGE_API)
      if (salvata) setChiaveApi(salvata)
      setImportDisponibile(localStorage.getItem(CHIAVE_ULTIMO_VISUAL) !== null)
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

  const importaDalBanco6 = () => {
    try {
      const dati = localStorage.getItem(CHIAVE_ULTIMO_VISUAL)
      if (!dati) return
      const { documento, risultato: visual } = JSON.parse(dati) as { documento: string; risultato: string }
      setApprovato(documento ?? '')
      setConVisual(visual ?? '')
    } catch {
      // dati corrotti: ignora
    }
  }

  const caricaFile = (file: File, dove: 'approvato' | 'conVisual') => {
    const lettore = new FileReader()
    lettore.onload = () => {
      const testo = String(lettore.result ?? '')
      if (dove === 'approvato') setApprovato(testo)
      else setConVisual(testo)
    }
    lettore.readAsText(file)
  }

  const avvia = async () => {
    setStato('in-esecuzione')
    setRisultato('')
    setErrore('')
    setToken(null)
    abortRef.current = new AbortController()
    try {
      const esito = await eseguiLeggibilita({
        chiaveApi: chiaveApi.trim(),
        modello,
        approvato,
        conVisual,
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
    a.download = 'verdetto-leggibilita.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const prontoAllAvvio =
    chiaveApi.trim().length > 10 && approvato.trim().length > 50 && conVisual.trim().length > 50

  const verdetto = /VERDETTO:\s*(APPROVATO|RIMANDATO)/i.exec(risultato)?.[1]?.toUpperCase() ?? null

  return (
    <RoleShell
      ruolo="Compartimento n°7 — Revisore Leggibilità"
      colore="bg-violet-500"
      sottotitolo="Il lettore ignaro: i visual fanno capire davvero, o decorano e basta?"
    >
      <div className="space-y-5">
        <Link
          href="/laboratorio"
          className="anima anima-1 inline-block text-sm text-inchiostro/40 transition hover:text-petrolio"
        >
          ← Tutti i compartimenti
        </Link>

        {/* Collegamento */}
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
              <p className="mt-1 text-xs text-inchiostro/40">La stessa degli altri banchi: resta solo in questo browser.</p>
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

        {/* Le due versioni */}
        <section className="anima anima-2 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">
              2 · Le due versioni del report
            </h2>
            {importDisponibile && (
              <button
                onClick={importaDalBanco6}
                className="rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-2 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100"
              >
                ↩ Importa l&apos;ultima corsa del banco n°6
              </button>
            )}
          </div>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-inchiostro/60">
                APPROVATO — prima dell&apos;Agente Visual
              </label>
              <input
                type="file"
                accept=".txt,.md,.markdown,text/plain,text/markdown"
                onChange={(e) => e.target.files?.[0] && caricaFile(e.target.files[0], 'approvato')}
                className="mb-2 w-full rounded-xl border border-dashed border-linea px-3 py-1.5 text-xs text-inchiostro/60 file:mr-3 file:rounded-lg file:border-0 file:bg-petrolio file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
              />
              <textarea
                value={approvato}
                onChange={(e) => setApprovato(e.target.value)}
                placeholder="Incolla il report APPROVATO (senza visual)..."
                className="h-48 w-full rounded-xl border border-linea bg-carta p-3 font-mono text-xs leading-5 focus:border-petrolio focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-inchiostro/60">
                CON VISUAL — dopo l&apos;Agente Visual
              </label>
              <input
                type="file"
                accept=".txt,.md,.markdown,text/plain,text/markdown"
                onChange={(e) => e.target.files?.[0] && caricaFile(e.target.files[0], 'conVisual')}
                className="mb-2 w-full rounded-xl border border-dashed border-linea px-3 py-1.5 text-xs text-inchiostro/60 file:mr-3 file:rounded-lg file:border-0 file:bg-petrolio file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
              />
              <textarea
                value={conVisual}
                onChange={(e) => setConVisual(e.target.value)}
                placeholder="Incolla il report CON VISUAL..."
                className="h-48 w-full rounded-xl border border-linea bg-carta p-3 font-mono text-xs leading-5 focus:border-petrolio focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Esecuzione */}
        <section className="anima anima-3 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">3 · Giudizio di leggibilità</h2>
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
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'cursor-not-allowed bg-inchiostro/10 text-inchiostro/40'
                }`}
              >
                👁 Avvia il Lettore Ignaro
              </button>
            )}
          </div>
          {!prontoAllAvvio && stato === 'pronto' && (
            <p className="mt-2 text-xs text-inchiostro/40">Servono: chiave API e le due versioni del report.</p>
          )}

          {stato === 'in-esecuzione' && (
            <p className="mt-3 flex items-center gap-2 text-sm text-violet-700">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-violet-500" />
              Il Revisore Leggibilità sta guardando il report con gli occhi di chi non sa nulla...
            </p>
          )}
          {stato === 'errore' && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              ⚠ {errore}
            </p>
          )}

          {stato === 'completato' && verdetto && (
            <div
              className={`mt-4 rounded-xl border px-5 py-4 text-center ${
                verdetto === 'APPROVATO' ? 'border-green-200 bg-green-50' : 'border-rose-200 bg-rose-50'
              }`}
            >
              <p
                className={`font-display text-2xl font-bold tracking-tight ${
                  verdetto === 'APPROVATO' ? 'text-green-700' : 'text-rose-700'
                }`}
              >
                {verdetto === 'APPROVATO' ? '✓ APPROVATO' : '⟲ RIMANDATO'}
              </p>
              <p className={`mt-1 text-sm ${verdetto === 'APPROVATO' ? 'text-green-700' : 'text-rose-700'}`}>
                {verdetto === 'APPROVATO'
                  ? 'Il report è comprensibile a chiunque: pronto per l’impaginazione della designer.'
                  : 'Torna all’Agente Visual: i problemi sono elencati sotto.'}
              </p>
            </div>
          )}

          {(risultato || stato === 'in-esecuzione') && (
            <div className="mt-4 overflow-hidden rounded-xl border border-linea">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linea bg-linea/30 px-4 py-2">
                <span className="text-xs font-semibold text-inchiostro/60">
                  Rapporto del Lettore Ignaro {stato === 'completato' && '· ✓ completato'}
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
                className="max-h-[26rem] overflow-y-auto bg-carta p-4 text-sm leading-6 whitespace-pre-wrap text-inchiostro/80"
              >
                {risultato || '...'}
              </div>
            </div>
          )}
        </section>

        <p className="anima anima-4 text-center text-xs text-inchiostro/35">
          Ultimo controllo prima dell&apos;impaginazione: dopo l&apos;APPROVATO di questo banco, il report passa alla
          collega grafica (compartimento n°8). Le LEZIONI alimentano il registro degli apprendimenti.
        </p>
      </div>
    </RoleShell>
  )
}
