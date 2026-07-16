'use client'

// ─── Note/aggiornamenti su un cliente ───
// Interfaccia per l'amministrazione: apri un cliente e registra le note e gli
// aggiornamenti che arrivano dai tutor. Registro cronologico persistente nel
// backend condiviso (AppState.noteClienti, chiave = nome + azienda normalizzati).

import { useState } from 'react'
import { useApp, chiaveNoteCliente } from '@/lib/store'

const fmtQuando = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })

export default function NoteCliente({ cliente, azienda, nome }: { cliente: string; azienda?: string; nome?: string }) {
  const { noteClienti, aggiungiNotaCliente, rimuoviNotaCliente } = useApp()
  const chiave = chiaveNoteCliente(cliente, azienda)
  const note = noteClienti[chiave] ?? []
  const [aperto, setAperto] = useState(false)
  const [testo, setTesto] = useState('')

  const salva = () => {
    const t = testo.trim()
    if (!t) return
    aggiungiNotaCliente(chiave, t, 'Amministrazione')
    setTesto('')
  }

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
      </button>

      {aperto && (
        <div className="mt-2 space-y-2">
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
        </div>
      )}
    </div>
  )
}
