'use client'

// ─── Laboratorio · Compartimento n°5 — Revisore 2 (Supervisore Qualità) ───
// Banco di prova isolato: ORIGINALE + REVISIONATO in ingresso → verdetto
// APPROVATO/RIMANDATO, problemi puntuali e lezioni per il trajectory learning.

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import RoleShell from '@/components/RoleShell'
import { CHIAVE_STORAGE_API, eseguiSupervisione, MODELLI_LAB } from '@/lib/laboratorio'

type Stato = 'pronto' | 'in-esecuzione' | 'completato' | 'errore'

/** Chiave localStorage dove il banco n°4 salva l'ultima revisione completata. */
const CHIAVE_ULTIMA_REVISIONE = 'laboratorio-ultima-revisione'

export default function BancoRevisore2() {
  const [chiaveApi, setChiaveApi] = useState('')
  const [modello, setModello] = useState<string>(MODELLI_LAB[0].id)
  const [originale, setOriginale] = useState('')
  const [revisionato, setRevisionato] = useState('')
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
      setImportDisponibile(localStorage.getItem(CHIAVE_ULTIMA_REVISIONE) !== null)
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

  const importaDalBanco4 = () => {
    try {
      const dati = localStorage.getItem(CHIAVE_ULTIMA_REVISIONE)
      if (!dati) return
      const { documento, risultato: revisione } = JSON.parse(dati) as { documento: string; risultato: string }
      setOriginale(documento ?? '')
      setRevisionato(revisione ?? '')
    } catch {
      // dati corrotti: ignora
    }
  }

  const caricaFile = (file: File, dove: 'originale' | 'revisionato') => {
    const lettore = new FileReader()
    lettore.onload = () => {
      const testo = String(lettore.result ?? '')
      if (dove === 'originale') setOriginale(testo)
      else setRevisionato(testo)
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
      const esito = await eseguiSupervisione({
        chiaveApi: chiaveApi.trim(),
        modello,
        originale,
        revisionato,
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
    a.download = 'verdetto-supervisore.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const prontoAllAvvio =
    chiaveApi.trim().length > 10 && originale.trim().length > 50 && revisionato.trim().length > 50

  const verdetto = /VERDETTO:\s*(APPROVATO|RIMANDATO)/i.exec(risultato)?.[1]?.toUpperCase() ?? null

  return (
    <RoleShell
      ruolo="Compartimento n°5 — Revisore 2"
      colore="bg-rose-500"
      sottotitolo="Supervisore Qualità: confronta prima/dopo, emette il verdetto e le lezioni per l'Editor"
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
              <p className="mt-1 text-xs text-inchiostro/40">
                È la stessa del banco n°4: resta solo in questo browser.
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

        {/* Le due versioni */}
        <section className="anima anima-2 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">
              2 · Le due versioni del documento
            </h2>
            {importDisponibile && (
              <button
                onClick={importaDalBanco4}
                className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                ↩ Importa l&apos;ultima corsa del banco n°4
              </button>
            )}
          </div>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-inchiostro/60">
                ORIGINALE — prima dell&apos;Editor
              </label>
              <input
                type="file"
                accept=".txt,.md,.markdown,text/plain,text/markdown"
                onChange={(e) => e.target.files?.[0] && caricaFile(e.target.files[0], 'originale')}
                className="mb-2 w-full rounded-xl border border-dashed border-linea px-3 py-1.5 text-xs text-inchiostro/60 file:mr-3 file:rounded-lg file:border-0 file:bg-petrolio file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
              />
              <textarea
                value={originale}
                onChange={(e) => setOriginale(e.target.value)}
                placeholder="Incolla il documento PRIMA della revisione..."
                className="h-48 w-full rounded-xl border border-linea bg-carta p-3 font-mono text-xs leading-5 focus:border-petrolio focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-inchiostro/60">
                REVISIONATO — dopo l&apos;Editor
              </label>
              <input
                type="file"
                accept=".txt,.md,.markdown,text/plain,text/markdown"
                onChange={(e) => e.target.files?.[0] && caricaFile(e.target.files[0], 'revisionato')}
                className="mb-2 w-full rounded-xl border border-dashed border-linea px-3 py-1.5 text-xs text-inchiostro/60 file:mr-3 file:rounded-lg file:border-0 file:bg-petrolio file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
              />
              <textarea
                value={revisionato}
                onChange={(e) => setRevisionato(e.target.value)}
                placeholder="Incolla il documento DOPO la revisione..."
                className="h-48 w-full rounded-xl border border-linea bg-carta p-3 font-mono text-xs leading-5 focus:border-petrolio focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Esecuzione */}
        <section className="anima anima-3 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">3 · Supervisione</h2>
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
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'cursor-not-allowed bg-inchiostro/10 text-inchiostro/40'
                }`}
              >
                ⚖ Avvia il Supervisore
              </button>
            )}
          </div>
          {!prontoAllAvvio && stato === 'pronto' && (
            <p className="mt-2 text-xs text-inchiostro/40">Servono: chiave API e le due versioni del documento.</p>
          )}

          {stato === 'in-esecuzione' && (
            <p className="mt-3 flex items-center gap-2 text-sm text-rose-700">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rose-500" />
              Il Supervisore sta confrontando le due versioni...
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
                  ? 'Il lavoro dell’Editor supera il controllo: il documento può proseguire.'
                  : 'Il documento torna all’Editor: i problemi sono elencati sotto.'}
              </p>
            </div>
          )}

          {(risultato || stato === 'in-esecuzione') && (
            <div className="mt-4 overflow-hidden rounded-xl border border-linea">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linea bg-linea/30 px-4 py-2">
                <span className="text-xs font-semibold text-inchiostro/60">
                  Rapporto del Supervisore {stato === 'completato' && '· ✓ completato'}
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
          Le &laquo;LEZIONI PER L&apos;EDITOR&raquo; sono il carburante del trajectory learning: quando il backend
          sarà collegato, ogni lezione diventerà una proposta di miglioramento del prompt del Revisore 1 nel Centro
          Apprendimento.
        </p>
      </div>
    </RoleShell>
  )
}
