'use client'

// ─── Erogazione — Pipeline a silos ───
// Board dei passaggi reali del progetto Consulenze Frank + il report AssessFirst
// di Irene, modellati come silos a compartimento stagno. Ogni cliente sta in un
// silo; lo si sposta (drag & drop o frecce) al silo successivo quando quel
// compartimento ha finito. Lo stato è vivo e CONDIVISO (backend blocco-dati):
// il Gantt Consulenze Frank e la vista tutor leggono gli stessi silos, e i
// clienti nuovi registrati in area commerciale compaiono qui allo step 0.

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { fmtData } from '@/lib/quadroaziendale'
import { SILOS, SiloId, siloPrecedente, siloSuccessivo } from '@/lib/pipelineSilos'
import { ClientePipeline, useClientiPipeline } from '@/lib/clientiPipeline'
import { useApp } from '@/lib/store'

const perConsegna = (a: ClientePipeline, b: ClientePipeline) => {
  if (a.consegnaPrevista && b.consegnaPrevista) return a.consegnaPrevista.getTime() - b.consegnaPrevista.getTime()
  if (a.consegnaPrevista) return -1
  if (b.consegnaPrevista) return 1
  return a.nome.localeCompare(b.nome)
}

export default function PaginaSilos() {
  const { spostaSilo, avanzaSilo, indietreggiaSilo, bloccoInfo } = useApp()
  const clienti = useClientiPipeline()
  const [inTrascinamento, setInTrascinamento] = useState<string | null>(null)
  const [colonnaAttiva, setColonnaAttiva] = useState<SiloId | null>(null)
  const haTrascinatoRef = useRef(false)

  const [q, setQ] = useState('')
  const ordinati = useMemo(() => [...clienti].sort(perConsegna), [clienti])
  const query = q.trim().toLowerCase()
  const combacia = (c: (typeof ordinati)[number]) =>
    !query || c.nome.toLowerCase().includes(query) || c.owner.toLowerCase().includes(query) || c.tutor.toLowerCase().includes(query)
  const perSilo = (id: SiloId) => ordinati.filter((c) => c.silo === id && combacia(c))
  const trovati = query ? ordinati.filter(combacia).length : 0

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-[1500px] px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Erogazione · pipeline a silos</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Il flusso di lavoro, per silo</h1>
            <p className="mt-1 max-w-3xl text-sm text-inchiostro/55">
              {clienti.length} clienti nei {SILOS.length} silos. Trascina una card (o usa le frecce) per spostarla al silo successivo — Gantt e reportistica si aggiornano da soli. I clienti entrano allo <b>step 0</b> e avanzano quando Elisa completa i documenti.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/erogazione/irene" className="rounded-xl border border-emerald-200 bg-carta px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
              Report AF — Irene →
            </Link>
          </div>
        </header>

        {/* ricerca cliente */}
        <div className="mt-6">
          <div className="relative max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-inchiostro/35">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca un cliente per nome, azienda o tutor…"
              className="w-full rounded-xl border border-linea bg-carta py-2 pl-9 pr-9 text-sm text-inchiostro placeholder:text-inchiostro/35 transition focus:border-petrolio focus:outline-none focus:ring-2 focus:ring-petrolio/15"
            />
            {q && (
              <button onClick={() => setQ('')} aria-label="Pulisci ricerca" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-1.5 text-inchiostro/40 hover:text-inchiostro">✕</button>
            )}
          </div>
          {query && <p className="mt-1 text-xs text-inchiostro/50">{trovati} client{trovati === 1 ? 'e' : 'i'} trovati per «{q}»</p>}
        </div>

        {/* conteggio per silo, separato (non raggruppato) */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
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
                    {carte.map((c) => {
                      const prev = siloPrecedente(c.silo)
                      const next = siloSuccessivo(c.silo)
                      const bloccato = c.origine === 'attesa' // niente questionario: non si sposta
                      const inBlocco = c.silo === 'bloccato'
                      const bi = bloccoInfo[c.slug]
                      const intestazione = (
                        <>
                          <div className="flex items-center gap-1.5">
                            <h3 className="truncate text-[13px] font-bold text-inchiostro">{c.nome}</h3>
                            {c.origine === 'nuovo' && <span className="shrink-0 rounded-full bg-petrolio/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-petrolio">nuovo</span>}
                            {c.origine === 'attesa' && <span className="shrink-0 rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-600">in attesa</span>}
                          </div>
                          <p className="truncate text-[11px] text-inchiostro/45">{c.owner}</p>
                        </>
                      )
                      return (
                        <div
                          key={c.slug}
                          draggable={!bloccato}
                          onDragStart={bloccato ? undefined : (e) => { e.dataTransfer.setData('text/plain', c.slug); e.dataTransfer.effectAllowed = 'move'; haTrascinatoRef.current = true; setInTrascinamento(c.slug) }}
                          onDragEnd={bloccato ? undefined : () => { setInTrascinamento(null); window.setTimeout(() => { haTrascinatoRef.current = false }, 0) }}
                          className={`card-sollevabile block rounded-2xl border border-linea bg-carta p-3 shadow-sm ${bloccato ? 'cursor-default' : 'cursor-grab'} ${inTrascinamento === c.slug ? 'opacity-50' : ''}`}
                        >
                          {c.origine !== 'attesa' ? (
                            <Link href={`/erogazione/scheda?slug=${encodeURIComponent(c.slug)}`} className="block" onClick={(e) => { if (haTrascinatoRef.current) e.preventDefault() }}>
                              {intestazione}
                            </Link>
                          ) : (
                            <div>{intestazione}</div>
                          )}
                          {inBlocco && (
                            <p className="mt-1 line-clamp-2 rounded-md bg-zinc-100 px-2 py-1 text-[10.5px] text-zinc-700">
                              {bi?.nota ? bi.nota : <span className="text-inchiostro/40">nessuna nota — aprire la scheda</span>}
                            </p>
                          )}
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className={`text-[10.5px] font-semibold ${bloccato ? 'text-rose-600' : inBlocco ? 'text-zinc-600' : s.colore.testo}`}>
                              {inBlocco ? (bi?.reminder ? `reminder ${fmtData(new Date(bi.reminder))}` : 'reminder da fissare') : bloccato ? 'questionario mancante' : c.consegnaPrevista ? `consegna ${fmtData(c.consegnaPrevista)}` : 'da programmare'}
                            </span>
                            {!bloccato && (
                              <div className="flex items-center gap-1">
                                <button disabled={!prev} onClick={() => indietreggiaSilo(c.slug)}
                                  className="rounded-md border border-linea px-1.5 py-0.5 text-[11px] font-bold text-inchiostro/50 enabled:hover:bg-inchiostro/[0.04] disabled:opacity-30" title="Silo precedente">◀</button>
                                <button disabled={!next} onClick={() => avanzaSilo(c.slug)}
                                  className="rounded-md border border-linea px-1.5 py-0.5 text-[11px] font-bold text-petrolio enabled:hover:bg-petrolio/10 disabled:opacity-30" title="Silo successivo">▶</button>
                              </div>
                            )}
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
