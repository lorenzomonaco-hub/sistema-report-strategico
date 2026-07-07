'use client'

// ─── Laboratorio · Compartimento n°6 — Agente Visual ───
// Banco di prova isolato: report approvato in ingresso → report arricchito
// con tabelle, diagrammi, callout e specifiche per la designer in uscita.

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import RoleShell from '@/components/RoleShell'
import { CHIAVE_STORAGE_API, eseguiVisual, MODELLI_LAB } from '@/lib/laboratorio'

type Stato = 'pronto' | 'in-esecuzione' | 'completato' | 'errore'

/** Ultima corsa del banco n°4 (il documento revisionato è l'ingresso naturale del Visual). */
const CHIAVE_ULTIMA_REVISIONE = 'laboratorio-ultima-revisione'
/** Dove questo banco salva la propria uscita, per il futuro banco n°7 (Leggibilità). */
const CHIAVE_ULTIMO_VISUAL = 'laboratorio-ultimo-visual'

export default function BancoVisual() {
  const [chiaveApi, setChiaveApi] = useState('')
  const [modello, setModello] = useState<string>(MODELLI_LAB[0].id)
  const [documento, setDocumento] = useState('')
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
      const { risultato: revisione } = JSON.parse(dati) as { risultato: string }
      if (revisione) setDocumento(revisione)
    } catch {
      // dati corrotti: ignora
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
    abortRef.current = new AbortController()
    try {
      const esito = await eseguiVisual({
        chiaveApi: chiaveApi.trim(),
        modello,
        documento,
        segnale: abortRef.current.signal,
        onTesto: (frammento) => {
          setRisultato((prev) => prev + frammento)
          areaRisultatoRef.current?.scrollTo({ top: areaRisultatoRef.current.scrollHeight })
        },
      })
      setToken({ input: esito.tokenInput, output: esito.tokenOutput })
      setStato('completato')
      // rende la corsa disponibile al futuro banco n°7 (Leggibilità)
      try {
        localStorage.setItem(CHIAVE_ULTIMO_VISUAL, JSON.stringify({ documento, risultato: esito.testo }))
      } catch {
        // quota piena: il passaggio di mano è facoltativo
      }
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
    a.download = 'report-con-visual.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const prontoAllAvvio = chiaveApi.trim().length > 10 && documento.trim().length > 50

  // statistiche sugli elementi visivi inseriti (solo a corsa completata)
  const statistiche =
    stato === 'completato'
      ? {
          tabelle: (risultato.match(/^\|.*\|$/gm) ?? []).filter((r) => /-{3,}/.test(r)).length,
          diagrammi: (risultato.match(/```/g) ?? []).length / 2,
          callout: (risultato.match(/^>\s*📌/gm) ?? []).length,
          perDesigner: (risultato.match(/\[VISUAL DA REALIZZARE\]/g) ?? []).length,
        }
      : null

  return (
    <RoleShell
      ruolo="Compartimento n°6 — Agente Visual"
      colore="bg-cyan-500"
      sottotitolo="Tabelle, diagrammi e callout al posto dei muri di testo — comprensibile a chiunque"
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

        {/* Documento in ingresso */}
        <section className="anima anima-2 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">
              2 · Report approvato da arricchire
            </h2>
            {importDisponibile && (
              <button
                onClick={importaDalBanco4}
                className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                ↩ Importa la revisione del banco n°4
              </button>
            )}
          </div>
          <div className="mt-3">
            <input
              type="file"
              accept=".txt,.md,.markdown,text/plain,text/markdown"
              onChange={(e) => e.target.files?.[0] && caricaFile(e.target.files[0])}
              className="mb-2 w-full rounded-xl border border-dashed border-linea px-3 py-1.5 text-xs text-inchiostro/60 file:mr-3 file:rounded-lg file:border-0 file:bg-petrolio file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
            />
            <textarea
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder="Incolla qui il report approvato dal Supervisore..."
              className="h-56 w-full rounded-xl border border-linea bg-carta p-3 font-mono text-xs leading-5 focus:border-petrolio focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-inchiostro/40">
              {documento.trim()
                ? `${documento.trim().split(/\s+/).length.toLocaleString('it-IT')} parole`
                : 'nessun documento'}
            </p>
          </div>
        </section>

        {/* Esecuzione */}
        <section className="anima anima-3 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">3 · Arricchimento visivo</h2>
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
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                    : 'cursor-not-allowed bg-inchiostro/10 text-inchiostro/40'
                }`}
              >
                ✨ Avvia l&apos;Agente Visual
              </button>
            )}
          </div>
          {!prontoAllAvvio && stato === 'pronto' && (
            <p className="mt-2 text-xs text-inchiostro/40">Servono: chiave API e il report da arricchire.</p>
          )}

          {stato === 'in-esecuzione' && (
            <p className="mt-3 flex items-center gap-2 text-sm text-cyan-700">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
              L&apos;Agente Visual sta trasformando i blocchi di testo in tabelle e diagrammi...
            </p>
          )}
          {stato === 'errore' && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              ⚠ {errore}
            </p>
          )}

          {statistiche && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { etichetta: 'Tabelle', valore: statistiche.tabelle },
                { etichetta: 'Diagrammi', valore: Math.floor(statistiche.diagrammi) },
                { etichetta: 'Callout 📌', valore: statistiche.callout },
                { etichetta: 'Per la designer', valore: statistiche.perDesigner },
              ].map((s) => (
                <div key={s.etichetta} className="rounded-xl border border-linea bg-carta px-3 py-2.5 text-center">
                  <p className="font-display text-xl font-bold text-cyan-700">{s.valore}</p>
                  <p className="text-xs text-inchiostro/50">{s.etichetta}</p>
                </div>
              ))}
            </div>
          )}

          {(risultato || stato === 'in-esecuzione') && (
            <div className="mt-4 overflow-hidden rounded-xl border border-linea">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linea bg-linea/30 px-4 py-2">
                <span className="text-xs font-semibold text-inchiostro/60">
                  Report con visual {stato === 'completato' && '· ✓ completato'}
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
        </section>

        <p className="anima anima-4 text-center text-xs text-inchiostro/35">
          I blocchi [VISUAL DA REALIZZARE] sono le specifiche pronte per la collega grafica: tipo di grafico, dati
          esatti e messaggio da trasmettere. L&apos;uscita di questo banco è l&apos;ingresso del futuro n°7 (Leggibilità).
        </p>
      </div>
    </RoleShell>
  )
}
