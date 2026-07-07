'use client'

// ─── Erogazione Copy — Board Kanban di produzione (stile Notion) ───
// Ogni colonna è una fase di FASI_EROGAZIONE. Le card si trascinano tra le
// colonne (drag & drop nativo HTML5) oppure si aprono per lavorare sul progetto.

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useApp, contaNotifiche } from '@/lib/store'
import { FASI_EROGAZIONE } from '@/lib/fasi'
import { ETICHETTA_TIPO } from '@/lib/batterie'
import { FaseId, Pratica } from '@/lib/types'
import RoleShell from '@/components/RoleShell'
import EmptyState from '@/components/EmptyState'

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

/** Documenti della cartella cliente (esclusi il documento unificato e il report in lavorazione). */
const documentiCartella = (p: Pratica) => p.allegati.filter((a) => a.tipo !== 'unificato' && a.tipo !== 'report')

/** Ritardi a cascata per l'ingresso animato delle colonne. */
const CASCATA = ['anima-1', 'anima-2', 'anima-3', 'anima-4', 'anima-5', 'anima-6']

export default function PaginaBoardErogazione() {
  const { state, spostaFase } = useApp()

  // id della pratica in trascinamento (per lo stile della card)
  const [inTrascinamento, setInTrascinamento] = useState<string | null>(null)
  // colonna evidenziata quando una card le passa sopra
  const [colonnaAttiva, setColonnaAttiva] = useState<FaseId | null>(null)
  // impedisce che il click del Link scatti subito dopo un trascinamento
  const haTrascinatoRef = useRef(false)

  const idFasiBoard = FASI_EROGAZIONE.map((f) => f.id)
  const progettiBoard = state.pratiche.filter((p) => idFasiBoard.includes(p.faseCorrente))
  const progettiAttivi = progettiBoard.filter((p) => p.faseCorrente !== 'completata')
  const progettiCompletati = progettiBoard.filter((p) => p.faseCorrente === 'completata')
  const apprendimentiInAttesa = state.apprendimenti.filter((a) => a.stato === 'in_attesa').length

  return (
    <RoleShell
      ruolo="Erogazione Copy"
      colore="bg-emerald-500"
      sottotitolo="Board di produzione — trascina le card o aprile per lavorarci"
      notifiche={contaNotifiche(state, 'erogazione')}
    >
      <div className="space-y-6">
        {/* Barra sopra la board */}
        <div className="anima anima-1 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-linea bg-carta px-5 py-3.5 shadow-sm">
          <div className="text-sm text-inchiostro/60">
            <span className="font-display text-lg font-bold tracking-tight text-inchiostro">{progettiAttivi.length}</span>{' '}
            {progettiAttivi.length === 1 ? 'progetto attivo' : 'progetti attivi'} sulla board
            {progettiCompletati.length > 0 && (
              <span className="text-inchiostro/40"> · {progettiCompletati.length} completat{progettiCompletati.length === 1 ? 'o' : 'i'}</span>
            )}
          </div>
          <Link
            href="/apprendimento"
            className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-sm font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-100"
          >
            🧠 Centro Apprendimento
            {apprendimentiInAttesa > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-600 px-1.5 text-xs font-bold text-white">
                {apprendimentiInAttesa}
              </span>
            )}
          </Link>
        </div>

        {progettiBoard.length === 0 ? (
          <EmptyState
            titolo="Nessun progetto in erogazione"
            sottotitolo="Le cartelle cliente completate dall'Area Commerciale arriveranno qui, nella colonna «Da lavorare»."
            icona="🗂️"
          />
        ) : (
          <>
            {/* Board Kanban orizzontale */}
            <div className="overflow-x-auto pb-4">
              <div className="flex items-start gap-4">
                {FASI_EROGAZIONE.map((f, i) => {
                  const carte = progettiBoard.filter((p) => p.faseCorrente === f.id)
                  const evidenziata = colonnaAttiva === f.id
                  const completata = f.id === 'completata'
                  return (
                    <div
                      key={f.id}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'move'
                        if (colonnaAttiva !== f.id) setColonnaAttiva(f.id)
                      }}
                      onDragLeave={(e) => {
                        // ignora i dragleave generati passando sui figli della colonna
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setColonnaAttiva((c) => (c === f.id ? null : c))
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const id = e.dataTransfer.getData('text/plain')
                        if (id) spostaFase(id, f.id, 'Team Erogazione')
                        setColonnaAttiva(null)
                        // il dispatch smonta la card sorgente e il suo dragend può non arrivare mai:
                        // lo stato di trascinamento va azzerato qui, o i click restano bloccati
                        setInTrascinamento(null)
                        window.setTimeout(() => {
                          haTrascinatoRef.current = false
                        }, 0)
                      }}
                      className={`anima ${CASCATA[Math.min(i + 1, CASCATA.length - 1)]} min-w-[17rem] max-w-[17rem] flex-shrink-0 rounded-2xl border-2 bg-inchiostro/[0.04] p-2.5 transition ${
                        evidenziata ? 'border-emerald-400 bg-emerald-50' : 'border-transparent'
                      }`}
                    >
                      {/* Header colonna */}
                      <div className="flex items-center gap-2 px-1.5 py-1.5">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${f.dot}`} />
                        <span className="truncate text-sm font-semibold text-inchiostro/80">{f.label}</span>
                        <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-linea bg-carta px-1.5 text-xs font-semibold text-inchiostro/50">
                          {carte.length}
                        </span>
                        <span className="ml-auto truncate text-[10px] text-inchiostro/40" title={`Responsabile: ${f.owner}`}>
                          {f.owner}
                        </span>
                      </div>

                      {/* Card progetto */}
                      <div className="mt-1.5 space-y-2.5">
                        {carte.map((p) => (
                          <Link
                            key={p.id}
                            href={'/erogazione/progetto?id=' + p.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', p.id)
                              e.dataTransfer.effectAllowed = 'move'
                              haTrascinatoRef.current = true
                              setInTrascinamento(p.id)
                            }}
                            onDragEnd={() => {
                              setInTrascinamento(null)
                              // il ref si azzera dopo il possibile click residuo
                              window.setTimeout(() => {
                                haTrascinatoRef.current = false
                              }, 0)
                            }}
                            onClick={(e) => {
                              if (haTrascinatoRef.current || inTrascinamento) e.preventDefault()
                            }}
                            className={`card-sollevabile block cursor-grab rounded-2xl border p-3.5 shadow-sm ${
                              completata ? 'border-green-200 bg-green-50' : 'border-linea bg-carta'
                            } ${inTrascinamento === p.id ? 'opacity-50' : ''}`}
                          >
                            <h3 className={`truncate text-sm font-semibold ${completata ? 'text-green-900' : 'text-inchiostro'}`}>
                              {p.azienda}
                            </h3>
                            <p className={`truncate text-xs ${completata ? 'text-green-700' : 'text-inchiostro/50'}`}>{p.cliente}</p>
                            {p.tipoLavoro ? (
                              <span
                                className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${ETICHETTA_TIPO[p.tipoLavoro].badge}`}
                              >
                                {ETICHETTA_TIPO[p.tipoLavoro].label}
                              </span>
                            ) : (
                              <span className="mt-1.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                ⚠ Tipo da scegliere
                              </span>
                            )}
                            <div className={`mt-2 flex items-center justify-between text-[10px] ${completata ? 'text-green-600' : 'text-inchiostro/40'}`}>
                              <span>{dataIt(p.dataCreazione)}</span>
                              <span>📎 {documentiCartella(p).length} documenti</span>
                            </div>
                          </Link>
                        ))}
                        {carte.length === 0 && (
                          <div className="rounded-xl border border-dashed border-inchiostro/15 px-3 py-4 text-center text-xs text-inchiostro/40">
                            Nessun progetto
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Nota sotto la board */}
            <p className="text-center text-xs text-inchiostro/40">
              Il flusso standard avanza con «Accetta documento» dentro il progetto; il trascinamento è per gestioni
              manuali e viene registrato nello storico.
            </p>
          </>
        )}
      </div>
    </RoleShell>
  )
}
