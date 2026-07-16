'use client'

// ─── Erogazione — Irene: report AssessFirst ───
// Passo SEPARATO dalla pipeline a silos. Qui Irene genera i documenti (report
// AssessFirst) dei clienti. Struttura front-end: il pulsante «Genera» è pronto
// per essere collegato al worker reale blocco-report-af (backend, in arrivo).

import { useState } from 'react'
import Link from 'next/link'
import { useClientiPipeline } from '@/lib/clientiPipeline'
import { siloById } from '@/lib/pipelineSilos'

export default function AreaIrene() {
  const clienti = useClientiPipeline()
  // Clienti su cui Irene può generare il report: quelli entrati in pipeline
  // (documenti caricati), quindi fuori dallo step 0.
  const lavorabili = clienti.filter((c) => c.silo !== 'documenti')
  const [innesto, setInnesto] = useState(false)

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Erogazione · Irene</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Report AssessFirst</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro">
              Passo separato dalla pipeline: qui Irene <b>genera i documenti</b> (report AssessFirst, uno per persona valutata). Il pulsante è pronto per collegare il worker reale <b>blocco-report-af</b> — backend in arrivo.
            </p>
          </div>
          <div className="ml-auto">
            <Link href="/erogazione" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">← Pipeline</Link>
          </div>
        </header>

        {innesto && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Struttura pronta: qui si innesta <b>blocco-report-af</b>. Al collegamento del backend, il pulsante genererà davvero i report AssessFirst e li allegherà al cliente.
          </p>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm">
          {lavorabili.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-inchiostro/50">Nessun cliente in pipeline al momento. I clienti compaiono qui quando Elisa ha caricato i documenti.</p>
          ) : (
            lavorabili.map((c) => {
              const s = siloById(c.silo)
              return (
                <div key={c.slug} className="flex flex-wrap items-center justify-between gap-3 border-b border-linea/70 px-4 py-3 last:border-b-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-inchiostro">{c.nome}</p>
                    <p className="truncate text-[11px] text-inchiostro/55">{c.owner} · tutor {c.tutor}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.colore.track} ${s.colore.testo}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.colore.punto}`} /> {s.label}
                    </span>
                    <button onClick={() => setInnesto(true)}
                      className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700">
                      Genera report AF
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
