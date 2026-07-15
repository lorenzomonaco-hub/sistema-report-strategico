'use client'

// ─── Erogazione — Pipeline a silos ───
// Board dei 5 passaggi reali del progetto Consulenze Frank + il report AssessFirst
// di Irene, modellati come silos a compartimento stagno. Ogni cliente sta in un
// silo; lo si sposta (drag & drop o frecce) al silo successivo quando quel
// compartimento ha finito. Lo stato è vivo e condiviso: il Gantt Consulenze Frank
// legge gli stessi silos e si aggiorna da solo.

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { CONSULENZE_FRANK, slugFrank } from '@/lib/consulenzeFrank'
import { fmtData } from '@/lib/quadroaziendale'
import {
  SILOS, SiloId, avanzaSilo, indietreggiaSilo, resetSilos, siloPrecedente, siloSuccessivo, spostaSilo, useSilos,
} from '@/lib/pipelineSilos'

export default function PaginaSilos() {
  const map = useSilos()
  const [inTrascinamento, setInTrascinamento] = useState<string | null>(null)
  const [colonnaAttiva, setColonnaAttiva] = useState<SiloId | null>(null)
  const haTrascinatoRef = useRef(false)

  // clienti con il loro silo vivo, ordinati per consegna
  const clienti = useMemo(
    () => CONSULENZE_FRANK
      .map((r) => ({ r, slug: slugFrank(r.cliente), silo: (map[slugFrank(r.cliente)] ?? 'copy') as SiloId }))
      .sort((a, b) => a.r.consegnaPrevista.getTime() - b.r.consegnaPrevista.getTime()),
    [map],
  )

  const perSilo = (id: SiloId) => clienti.filter((c) => c.silo === id)

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Erogazione · pipeline a silos</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Il flusso di lavoro, per silo</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              {CONSULENZE_FRANK.length} clienti nei {SILOS.length} silos. Trascina una card (o usa le frecce) per spostarla al silo successivo — il Gantt Consulenze Frank si aggiorna da solo.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/consulenze-frank" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              Gantt Consulenze Frank →
            </Link>
            <Link href="/erogazione/kanban-v2" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/50 hover:text-inchiostro">
              Board v2
            </Link>
            <button onClick={() => { if (confirm('Ripristinare tutti i clienti alla posizione del piano ufficiale?')) resetSilos() }}
              className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/50 hover:text-rose-600">
              Ripristina piano
            </button>
          </div>
        </header>

        {/* conteggio per silo, separato (non raggruppato) */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {SILOS.map((s) => (
            <div key={s.id} className="rounded-xl border border-linea bg-carta p-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${s.colore.punto}`} />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-inchiostro/45">{s.ordine}</span>
              </div>
              <p className={`font-display mt-0.5 text-2xl font-bold ${s.colore.testo}`}>{perSilo(s.id).length}</p>
              <p className="truncate text-[10.5px] text-inchiostro/50" title={s.label}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* board */}
        <div className="mt-6 overflow-x-auto pb-4">
          <div className="flex items-start gap-4">
            {SILOS.map((s) => {
              const carte = perSilo(s.id)
              const evidenziata = colonnaAttiva === s.id
              return (
                <div
                  key={s.id}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (colonnaAttiva !== s.id) setColonnaAttiva(s.id) }}
                  onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setColonnaAttiva((c) => (c === s.id ? null : c)) }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const slug = e.dataTransfer.getData('text/plain')
                    if (slug) spostaSilo(slug, s.id)
                    setColonnaAttiva(null); setInTrascinamento(null)
                    window.setTimeout(() => { haTrascinatoRef.current = false }, 0)
                  }}
                  className={`min-w-[15.5rem] max-w-[15.5rem] flex-shrink-0 rounded-2xl border-2 bg-inchiostro/[0.04] p-2.5 transition ${
                    evidenziata ? 'border-petrolio/50 bg-petrolio/5' : 'border-transparent'
                  }`}
                >
                  <div className="px-1.5 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${s.colore.punto}`} />
                      <span className="truncate text-sm font-semibold text-inchiostro/80">{s.ordine}. {s.label}</span>
                      <span className="ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-linea bg-carta px-1.5 text-xs font-semibold text-inchiostro/50">
                        {carte.length}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-inchiostro/40" title={s.spec}>{s.owner}{s.soloBranding ? ' · solo branding' : ''}</p>
                  </div>

                  <div className="mt-1.5 space-y-2.5">
                    {carte.map(({ r, slug, silo }) => {
                      const prev = siloPrecedente(silo)
                      const next = siloSuccessivo(silo)
                      return (
                        <div
                          key={slug}
                          draggable
                          onDragStart={(e) => { e.dataTransfer.setData('text/plain', slug); e.dataTransfer.effectAllowed = 'move'; haTrascinatoRef.current = true; setInTrascinamento(slug) }}
                          onDragEnd={() => { setInTrascinamento(null); window.setTimeout(() => { haTrascinatoRef.current = false }, 0) }}
                          className={`card-sollevabile block cursor-grab rounded-2xl border border-linea bg-carta p-3 shadow-sm ${inTrascinamento === slug ? 'opacity-50' : ''}`}
                        >
                          <Link href={`/amministrazione/consulenze-frank/${slug}`} className="block" onClick={(e) => { if (haTrascinatoRef.current) e.preventDefault() }}>
                            <h3 className="truncate text-[13px] font-bold text-inchiostro">{r.cliente}</h3>
                            <p className="truncate text-[11px] text-inchiostro/45">{r.owner}</p>
                          </Link>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className={`text-[10.5px] font-semibold ${s.colore.testo}`}>consegna {fmtData(r.consegnaPrevista)}</span>
                            <div className="flex items-center gap-1">
                              <button disabled={!prev} onClick={() => indietreggiaSilo(slug)}
                                className="rounded-md border border-linea px-1.5 py-0.5 text-[11px] font-bold text-inchiostro/50 enabled:hover:bg-inchiostro/[0.04] disabled:opacity-30" title="Silo precedente">◀</button>
                              <button disabled={!next} onClick={() => avanzaSilo(slug)}
                                className="rounded-md border border-linea px-1.5 py-0.5 text-[11px] font-bold text-petrolio enabled:hover:bg-petrolio/10 disabled:opacity-30" title="Silo successivo">▶</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {carte.length === 0 && (
                      <div className="rounded-xl border border-dashed border-inchiostro/15 px-3 py-4 text-center text-[11px] text-inchiostro/40">
                        Vuoto
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-linea bg-carta p-4 text-xs leading-relaxed text-inchiostro/65">
          <p><b className="text-inchiostro">Silos a compartimento stagno.</b> Ogni colonna è un passaggio che lavora isolato: riceve un input, produce un output, e passa il testimone al successivo. Le specifiche di ogni silo:</p>
          <ul className="mt-2 space-y-1">
            {SILOS.map((s) => (
              <li key={s.id} className="flex gap-2">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${s.colore.punto}`} />
                <span><b className={s.colore.testo}>{s.label}</b> <span className="text-inchiostro/45">({s.owner})</span> — {s.spec}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-inchiostro/45">Per ora lo spostamento è manuale. Gli agenti reali (Grippo, Caputo, Valentino) si agganceranno ai rispettivi silos rispettando il contratto dei blocchi già presente nel progetto, così l&apos;avanzamento diventerà automatico.</p>
        </div>
      </div>
    </div>
  )
}
