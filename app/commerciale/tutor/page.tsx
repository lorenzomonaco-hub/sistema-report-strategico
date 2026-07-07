'use client'

// ─── Area Commerciale — Tutor ───
// Il Tutor carica questionario e trascrizione per ogni cartella cliente in
// raccolta documenti. Vede lo stato delle voci di Elisa e Irene in sola
// lettura, così capisce a che punto è la cartella. Il passaggio a Erogazione
// Copy resta un'esclusiva di Elisa.

import { useApp, contaNotifiche } from '@/lib/store'
import { indiceFase, statoCartella } from '@/lib/fasi'
import RoleShell from '@/components/RoleShell'
import PraticaCard from '@/components/PraticaCard'
import EmptyState from '@/components/EmptyState'
import { Pratica } from '@/lib/types'

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

/** Card di una cartella cliente in raccolta documenti, con la lista di controllo completa. */
function CartellaCliente({ pratica }: { pratica: Pratica }) {
  const { caricaQuestionarioTrascrizione } = useApp()
  const cartella = statoCartella(pratica)
  const tutorCompletato = cartella.voci
    .filter((v) => v.responsabile === 'Tutor')
    .every((v) => v.fatto)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{pratica.azienda}</h3>
          <p className="truncate text-sm text-slate-500">
            {pratica.cliente} · {pratica.email}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Creata il {dataIt(pratica.dataCreazione)} · {pratica.dipendenti.length} dipendenti da valutare
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          Raccolta documenti
        </span>
      </div>

      {/* Lista di controllo della cartella cliente */}
      <div className="mt-4">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Cartella cliente</p>
        <ul className="mt-2 space-y-1.5">
          {cartella.voci.map((v) => {
            const mia = v.responsabile === 'Tutor'
            return (
              <li
                key={v.chiave}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                  mia ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100 bg-slate-50'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {v.fatto ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                      ✓
                    </span>
                  ) : (
                    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300 bg-white" />
                  )}
                  <span className={`truncate text-sm ${mia ? 'font-medium text-indigo-900' : 'text-slate-600'}`}>
                    {v.label}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    mia ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {mia ? 'Tutor (tu)' : `${v.responsabile} · sola lettura`}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Attività del Tutor */}
      <div className="mt-4">
        {tutorCompletato ? (
          <button
            disabled
            className="w-full cursor-default rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700"
          >
            ✓ Questionario e trascrizione caricati
          </button>
        ) : (
          <button
            onClick={() => caricaQuestionarioTrascrizione(pratica.id)}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Carica questionario + trascrizione
          </button>
        )}
        {cartella.completa && (
          <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
            ✓ Cartella completa: in attesa che <strong>Elisa</strong> la passi a Erogazione Copy.
          </p>
        )}
      </div>
    </div>
  )
}

export default function PaginaTutor() {
  const { state } = useApp()

  const inRaccolta = state.pratiche.filter((p) => p.faseCorrente === 'raccolta-documenti')
  const consegnate = state.pratiche.filter((p) => indiceFase(p.faseCorrente) >= indiceFase('generazione'))

  return (
    <RoleShell
      ruolo="Tutor"
      colore="bg-indigo-500"
      sottotitolo="Questionario e trascrizione per ogni cartella cliente"
      notifiche={contaNotifiche(state, 'tutor')}
    >
      <div className="space-y-10">
        {/* 1. Cartelle in raccolta documenti */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Cartelle da completare</h2>
            <span className="text-xs text-slate-400">{inRaccolta.length} in raccolta documenti</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Le voci evidenziate in indigo sono le tue attività; quelle di Elisa e Irene sono visibili in sola lettura.
          </p>
          <div className="mt-3 space-y-4">
            {inRaccolta.length === 0 ? (
              <EmptyState
                titolo="Nessuna cartella in raccolta documenti"
                sottotitolo="Quando il venditore invia assessment e questionario, la cartella comparirà qui."
                icona="📂"
              />
            ) : (
              inRaccolta.map((p) => <CartellaCliente key={p.id} pratica={p} />)
            )}
          </div>
        </section>

        {/* 2. Cartelle consegnate a Erogazione Copy */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
              Consegnate a Erogazione Copy
            </h2>
            <span className="text-xs text-slate-400">{consegnate.length} cartelle</span>
          </div>
          <div className="mt-3 space-y-3">
            {consegnate.length === 0 ? (
              <EmptyState
                titolo="Nessuna cartella consegnata"
                sottotitolo="Le cartelle complete passate da Elisa a Erogazione Copy compariranno qui."
                icona="📦"
              />
            ) : (
              consegnate.map((p) => (
                <PraticaCard
                  key={p.id}
                  pratica={p}
                  nascondiFase
                  azioni={
                    p.faseCorrente === 'completata' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                        Report consegnato
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                        Consegnata ✓
                      </span>
                    )
                  }
                />
              ))
            )}
          </div>
        </section>
      </div>
    </RoleShell>
  )
}
