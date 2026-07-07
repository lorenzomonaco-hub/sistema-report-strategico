'use client'

// ─── Pannello di revisione documento ───
// Usato in OGNI checkpoint umano della pipeline: Carlo, Revisore 1, Revisore 2,
// Leggibilità, Grafica. Garantisce che l'esperienza "Accetta / Revisiona e modifica"
// sia identica ovunque e che ogni revisione alimenti il sistema di apprendimento.

import { useEffect, useState } from 'react'
import { useApp } from '@/lib/store'
import { faseById, faseSuccessiva } from '@/lib/fasi'
import { FaseId } from '@/lib/types'
import DiffView from './DiffView'

const dataOraIt = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })

interface Props {
  praticaId: string
  /** nome mostrato come autore delle azioni, es. "Carlo", "Revisore 1" */
  autore: string
  /** contenuto extra da mostrare sopra i bottoni (es. bottone "Rimanda indietro" del Revisore 2) */
  azioniExtra?: React.ReactNode
}

export default function ReviewPanel({ praticaId, autore, azioniExtra }: Props) {
  const { state, accettaDocumento, salvaRevisione } = useApp()
  const [modalAperto, setModalAperto] = useState(false)
  const [testo, setTesto] = useState('')
  const [note, setNote] = useState('')
  const [esito, setEsito] = useState<'accettato' | 'revisionato' | null>(null)
  // fase di destinazione congelata al momento del click su "Accetta"
  const [destinazione, setDestinazione] = useState<FaseId | null>(null)
  const [mostraVersioni, setMostraVersioni] = useState(false)

  // Il pannello resta montato quando si cambia pratica dalla coda:
  // lo stato locale va azzerato per non mostrare esiti della pratica precedente.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset intenzionale al cambio pratica
    setModalAperto(false)
    setTesto('')
    setNote('')
    setEsito(null)
    setDestinazione(null)
    setMostraVersioni(false)
  }, [praticaId])

  const pratica = state.pratiche.find((p) => p.id === praticaId)
  if (!pratica) return null

  const versione = pratica.versioni[pratica.versioni.length - 1]
  const fase = faseById(pratica.faseCorrente)
  const prossima = faseSuccessiva(pratica.faseCorrente)

  if (!versione) {
    return (
      <div className="rounded-2xl border border-linea bg-carta p-6 text-sm text-inchiostro/50">
        Nessun documento ancora presente per questa pratica.
      </div>
    )
  }

  if (esito === 'accettato') {
    const f = destinazione ? faseById(destinazione) : null
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center shadow-sm">
        <div className="text-2xl">✓</div>
        <h3 className="mt-1 font-display font-bold tracking-tight text-green-800">Documento accettato</h3>
        <p className="mt-1 text-sm text-green-700">
          {f && f.id !== 'completata' ? (
            <>
              La pratica è passata alla fase successiva: <strong>{f.label}</strong> ({f.owner})
            </>
          ) : (
            <>
              <strong>Report consegnato al cliente.</strong> La pratica è completata.
            </>
          )}
        </p>
      </div>
    )
  }

  // Pratica già completata: nessuna azione possibile, solo lettura.
  if (pratica.faseCorrente === 'completata') {
    return (
      <div className="overflow-hidden rounded-2xl border border-green-200 bg-carta shadow-sm">
        <div className="border-b border-green-200 bg-green-50 px-5 py-2.5 text-sm font-medium text-green-800">
          ✓ Pratica completata — report consegnato al cliente. Documento in sola lettura.
        </div>
        <div className="max-h-[28rem] overflow-y-auto whitespace-pre-wrap p-5 text-sm leading-6 text-inchiostro/80">
          {versione.contenuto}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {esito === 'revisionato' && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
          <strong>🧠 Revisione salvata — apprendimento generato.</strong> La tua correzione è stata inviata al Centro
          Apprendimento: se Carlo la approva, migliorerà i prompt dei passaggi precedenti. Ora puoi accettare il
          documento per farlo proseguire.
        </div>
      )}

      {/* Documento */}
      <div className="overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm">
        <div className="flex items-center justify-between border-b border-linea bg-linea/30 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-inchiostro/50">
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                versione.tipo === 'ai' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {versione.tipo === 'ai' ? '🤖 Generato dall\'AI' : '👤 Versione umana'}
            </span>
            <span>{versione.etichetta}</span>
            <span>· {versione.autore}</span>
            <span>· {dataOraIt(versione.dataOra)}</span>
          </div>
          {pratica.versioni.length > 1 && (
            <button
              onClick={() => setMostraVersioni(!mostraVersioni)}
              className="text-xs font-medium text-inchiostro/50 transition hover:text-petrolio"
            >
              {mostraVersioni ? 'Nascondi confronto versioni' : `Confronta versioni (${pratica.versioni.length})`}
            </button>
          )}
        </div>

        {mostraVersioni && pratica.versioni.length > 1 ? (
          <div className="p-4">
            <p className="mb-3 text-xs text-inchiostro/50">
              Confronto tra la versione precedente e quella attuale:
            </p>
            <DiffView prima={pratica.versioni[pratica.versioni.length - 2].contenuto} dopo={versione.contenuto} />
          </div>
        ) : (
          <div className="max-h-[28rem] overflow-y-auto whitespace-pre-wrap p-5 text-sm leading-6 text-inchiostro/80">
            {versione.contenuto}
          </div>
        )}
      </div>

      {azioniExtra}

      {/* Azioni principali — presenti in OGNI passaggio della pipeline */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => {
            setDestinazione(prossima)
            accettaDocumento(praticaId, autore)
            setEsito('accettato')
          }}
          className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          ✓ Accetta documento
          {prossima && <span className="block text-xs font-normal opacity-80">passa a: {faseById(prossima).label}</span>}
        </button>
        <button
          onClick={() => {
            setTesto(versione.contenuto)
            setNote('')
            setModalAperto(true)
          }}
          className="flex-1 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3 font-semibold text-amber-800 transition hover:bg-amber-100"
        >
          ✎ Revisiona e modifica
          <span className="block text-xs font-normal opacity-70">la correzione alimenta l&apos;apprendimento</span>
        </button>
      </div>

      <p className="text-center text-xs text-inchiostro/40">
        Fase corrente: {fase.label} · Responsabile: {fase.owner}
      </p>

      {/* Modal editor */}
      {modalAperto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inchiostro/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-carta shadow-2xl">
            <div className="border-b border-linea px-5 py-4">
              <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">Revisiona e modifica il documento</h3>
              <p className="mt-0.5 text-xs text-inchiostro/50">
                Le tue modifiche verranno confrontate con la versione originale: il sistema imparerà dalla differenza.
              </p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <textarea
                value={testo}
                onChange={(e) => setTesto(e.target.value)}
                className="h-72 w-full rounded-xl border border-linea bg-carta p-3 font-mono text-xs leading-5 focus:border-petrolio focus:outline-none"
              />
              <div>
                <label className="mb-1 block text-xs font-medium text-inchiostro/60">
                  Cosa non andava? (questa nota guida l&apos;apprendimento del sistema)
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Es. voce narrante sbagliata, blocco di testo troppo denso, dato impreciso..."
                  className="w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm focus:border-petrolio focus:outline-none"
                />
              </div>
              <div className="rounded-xl bg-violet-50 px-3 py-2 text-xs text-violet-700">
                🧠 Al salvataggio verrà creata una proposta di miglioramento per i prompt dei passaggi precedenti.
                Nessuna modifica ai prompt diventa attiva senza l&apos;approvazione di Carlo nel Centro Apprendimento.
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-linea px-5 py-3">
              <button
                onClick={() => setModalAperto(false)}
                className="rounded-xl border border-linea bg-carta px-4 py-2 text-sm text-inchiostro/60 transition hover:border-petrolio/40"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  salvaRevisione(praticaId, { autore, testoDopo: testo, note })
                  setModalAperto(false)
                  setEsito('revisionato')
                }}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Salva revisione e genera apprendimento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
