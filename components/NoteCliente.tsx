'use client'

// ─── Note/aggiornamenti su un cliente ───
// Interfaccia per l'amministrazione: apri un cliente e registra le note e gli
// aggiornamenti che arrivano dai tutor. Registro cronologico persistente nel
// backend condiviso (AppState.noteClienti, chiave = nome + azienda normalizzati).

import { useState } from 'react'
import { useApp, chiaveNoteCliente } from '@/lib/store'
import { SiloId } from '@/lib/pipelineSilos'
import { STATI_CLIENTE } from '@/lib/types'

const fmtQuando = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })
const fmtData = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

export default function NoteCliente({ cliente, azienda, nome, slug, siloRientro = 'copy' }: {
  cliente: string; azienda?: string; nome?: string
  /** slug del cliente nella pipeline: se presente, abilita il blocco */
  slug?: string
  /** silo in cui rientra quando viene sbloccato (dipende dall'origine) */
  siloRientro?: SiloId
}) {
  const { noteClienti, aggiungiNotaCliente, rimuoviNotaCliente, silos, spostaSilo, setBloccoInfo, bloccoInfo, statoCliente, setStatoCliente } = useApp()
  const chiave = chiaveNoteCliente(cliente, azienda)
  const note = noteClienti[chiave] ?? []
  const stato = statoCliente[chiave] ?? ''
  const [aperto, setAperto] = useState(false)
  const [testo, setTesto] = useState('')

  const bloccato = slug ? silos[slug] === 'bloccato' : false
  const info = slug ? bloccoInfo[slug] : undefined
  const [dataSblocco, setDataSblocco] = useState(info?.reminder ?? '')

  const ultimaNota = note.length ? note[note.length - 1].testo : ''

  const salva = () => {
    const t = testo.trim()
    if (!t) return
    aggiungiNotaCliente(chiave, t, 'Amministrazione')
    setTesto('')
  }

  const blocca = () => {
    if (!slug) return
    spostaSilo(slug, 'bloccato')
    // la nota più recente resta come motivo del blocco; la data come reminder di sblocco
    setBloccoInfo(slug, testo.trim() || ultimaNota || 'Bloccato', dataSblocco || undefined)
    if (testo.trim()) { aggiungiNotaCliente(chiave, testo.trim(), 'Amministrazione'); setTesto('') }
  }
  const sblocca = () => { if (slug) spostaSilo(slug, siloRientro) }
  const aggiornaData = () => { if (slug) setBloccoInfo(slug, info?.nota || ultimaNota || 'Bloccato', dataSblocco || undefined) }

  return (
    <div className="mt-2 border-t border-linea/60 pt-2">
      <button
        onClick={() => setAperto((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-inchiostro/55 hover:text-petrolio"
      >
        <span>{aperto ? '▲' : '▼'}</span>
        <span>Note & aggiornamenti</span>
        {note.length > 0 && (
          <span className="rounded-full bg-petrolio/12 px-1.5 py-0.5 text-[10px] font-bold text-petrolio-scuro">{note.length}</span>
        )}
        {bloccato && (
          <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
            🔒 Bloccato{info?.reminder ? ` · sblocco ${fmtData(info.reminder)}` : ''}
          </span>
        )}
        {stato && !bloccato && (
          <span className="rounded-full bg-inchiostro/[0.08] px-1.5 py-0.5 text-[10px] font-bold text-inchiostro/70">{stato}</span>
        )}
      </button>

      {aperto && (
        <div className="mt-2 space-y-2">
          <label className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-inchiostro/70">
            Stato lavorazione
            <select value={stato} onChange={(e) => setStatoCliente(chiave, e.target.value)}
              className="rounded-lg border border-linea bg-carta px-2 py-1 text-[12px] font-normal text-inchiostro focus:border-petrolio focus:outline-none">
              <option value="">— nessuno —</option>
              {STATI_CLIENTE.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          {note.length > 0 && (
            <ul className="space-y-1.5">
              {[...note].reverse().map((n) => (
                <li key={n.id} className="group rounded-lg border border-linea bg-carta px-2.5 py-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="whitespace-pre-wrap text-[12px] leading-snug text-inchiostro">{n.testo}</p>
                    <button
                      onClick={() => rimuoviNotaCliente(chiave, n.id)}
                      className="shrink-0 rounded px-1 text-[11px] text-inchiostro/30 opacity-0 transition group-hover:opacity-100 hover:text-rose-600"
                      aria-label="Elimina nota"
                    >✕</button>
                  </div>
                  <p className="mt-1 text-[10px] text-inchiostro/40">{n.autore} · {fmtQuando(n.dataOra)}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-1.5">
            <textarea
              value={testo}
              onChange={(e) => setTesto(e.target.value)}
              onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') salva() }}
              rows={2}
              placeholder={nome ? `Aggiornamento su ${nome}…` : 'Scrivi un aggiornamento…'}
              className="w-full rounded-lg border border-linea bg-carta px-2.5 py-2 text-[12px] text-inchiostro placeholder:text-inchiostro/35 focus:border-petrolio focus:outline-none focus:ring-2 focus:ring-petrolio/15"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={salva}
                disabled={!testo.trim()}
                className="rounded-lg bg-petrolio px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-petrolio-scuro disabled:opacity-40"
              >Aggiungi nota</button>
              <span className="text-[10px] text-inchiostro/35">⌘/Ctrl + Invio</span>
            </div>
          </div>

          {/* Blocco cliente: lo sposta nella colonna «Bloccato» della pipeline + data di sblocco */}
          {slug && (
            <div className={`rounded-lg border p-2.5 ${bloccato ? 'border-rose-200 bg-rose-50/60' : 'border-linea bg-inchiostro/[0.015]'}`}>
              {bloccato ? (
                <>
                  <p className="text-[11px] font-bold text-rose-700">🔒 Bloccato — è nella colonna «Bloccato» della pipeline</p>
                  {info?.reminder && <p className="mt-0.5 text-[11px] text-inchiostro/55">Sblocco previsto: <b className="text-inchiostro/70">{fmtData(info.reminder)}</b></p>}
                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/45">
                      Data di sblocco prevista
                      <input type="date" value={dataSblocco} onChange={(e) => setDataSblocco(e.target.value)}
                        className="rounded-lg border border-linea bg-carta px-2 py-1.5 text-[12px] text-inchiostro focus:border-petrolio focus:outline-none" />
                    </label>
                    <button onClick={aggiornaData} className="rounded-lg border border-linea bg-carta px-2.5 py-1.5 text-[11px] font-semibold text-inchiostro/70 hover:border-petrolio/40 hover:text-petrolio">Aggiorna data</button>
                    <button onClick={sblocca} className="ml-auto rounded-lg border border-green-300 bg-carta px-2.5 py-1.5 text-[11px] font-semibold text-green-700 hover:bg-green-50">🔓 Sblocca — rimetti in pipeline</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-bold text-inchiostro/70">Blocca il cliente</p>
                  <p className="mt-0.5 text-[11px] text-inchiostro/55">Lo sposta nella colonna «Bloccato» della pipeline. La nota resta come motivo; la data serve al tutor per ricordarsi quando ricontattarlo.</p>
                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/45">
                      Data di sblocco prevista
                      <input type="date" value={dataSblocco} onChange={(e) => setDataSblocco(e.target.value)}
                        className="rounded-lg border border-linea bg-carta px-2 py-1.5 text-[12px] text-inchiostro focus:border-petrolio focus:outline-none" />
                    </label>
                    <button onClick={blocca} className="ml-auto rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700">🔒 Sposta in Bloccato</button>
                  </div>
                  {note.length === 0 && !testo.trim() && <p className="mt-1.5 text-[10px] text-amber-700">Consiglio: scrivi prima una nota col motivo del blocco.</p>}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
