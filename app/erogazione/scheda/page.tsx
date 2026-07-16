'use client'

// ─── Scheda del progetto in pipeline ───
// Il log di OGNI passaggio nei silo, con l'ora e la durata: quanto tempo passa
// dalla registrazione all'invio, passaggio per passaggio. Per i 34 clienti
// ufficiali mostra anche le date del piano (foglio maestro).

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useApp } from '@/lib/store'
import { useClientiPipeline } from '@/lib/clientiPipeline'
import { SILOS, siloById, siloSuccessivo } from '@/lib/pipelineSilos'
import { fmtData } from '@/lib/quadroaziendale'

/** Chi eseguirà ogni fase (per la struttura di esecuzione agente). */
const AGENTE_FASE: Record<string, string> = {
  copy: 'Passaggio umano — Copy (Carlo / Paolo / Luigi)',
  jelo: 'Passaggio umano — Avv. Jelo',
  lavorazione: 'Agente unico testo + grafici (in arrivo, non ancora caricato)',
  valentino: 'Agente grafica — blocco-impaginazione',
}

const fmtOra = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })

function durata(ms: number): string {
  if (ms <= 0) return '0 min'
  const min = Math.round(ms / 60000)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  if (h < 48) return `${h}h ${min % 60}m`
  const g = Math.floor(h / 24)
  return `${g}g ${h % 24}h`
}

function Scheda() {
  const params = useSearchParams()
  const slug = params.get('slug') ?? ''
  const { state, avanzaSilo, spostaSilo, bloccoInfo, setBloccoInfo } = useApp()
  const clienti = useClientiPipeline()
  const c = clienti.find((x) => x.slug === slug)
  const [mostraInnesto, setMostraInnesto] = useState(false)
  const infoBlocco = bloccoInfo[slug]
  const [notaBlocco, setNotaBlocco] = useState(infoBlocco?.nota ?? '')
  const [reminderBlocco, setReminderBlocco] = useState(infoBlocco?.reminder ?? '')
  const [salvato, setSalvato] = useState(false)

  if (!c) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-sm text-inchiostro/55">Scheda non trovata.</p>
        <Link href="/erogazione" className="mt-3 inline-block rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">← Torna alla pipeline</Link>
      </div>
    )
  }

  const log = state.siloLog?.[slug] ?? []
  const siloCorr = siloById(c.silo)
  const consegnato = c.silo === 'consegnato'

  // durata totale: dalla prima voce all'ultima (o a ora, se ancora in corso)
  const primo = log[0] ? new Date(log[0].dataOra).getTime() : null
  const ultimo = log[log.length - 1] ? new Date(log[log.length - 1].dataOra).getTime() : null
  const fine = consegnato && ultimo ? ultimo : Date.now()
  const totaleMs = primo ? fine - primo : 0

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Scheda progetto</p>
          <h1 className="font-display mt-1 truncate text-3xl font-bold tracking-tight text-inchiostro">{c.nome}</h1>
          <p className="mt-1 text-sm text-inchiostro/55">{c.owner} · tutor {c.tutor}</p>
        </div>
        <div className="ml-auto">
          <Link href="/erogazione" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">← Pipeline</Link>
        </div>
      </header>

      {/* blocco (silo -1) */}
      {c.silo === 'bloccato' ? (
        <div className="mt-5 rounded-2xl border border-zinc-300 bg-zinc-50 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-bold text-zinc-700">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" /> Cliente bloccato (−1)
            </span>
          </div>
          <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-inchiostro">Motivazione del blocco (nota di Carlo)</label>
          <textarea value={notaBlocco} onChange={(e) => { setNotaBlocco(e.target.value); setSalvato(false) }} rows={3}
            placeholder="Es. problema interno in azienda, cambio modello di business, cliente non risponde…"
            className="mt-1 w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm text-inchiostro placeholder:text-inchiostro/35 focus:border-petrolio focus:outline-none focus:ring-2 focus:ring-petrolio/15" />
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-inchiostro">Reminder follow-up</label>
              <input type="date" value={reminderBlocco} onChange={(e) => { setReminderBlocco(e.target.value); setSalvato(false) }}
                className="mt-1 rounded-xl border border-linea bg-carta px-3 py-2 text-sm text-inchiostro focus:border-petrolio focus:outline-none focus:ring-2 focus:ring-petrolio/15" />
            </div>
            <button onClick={() => { setBloccoInfo(slug, notaBlocco.trim(), reminderBlocco || undefined); setSalvato(true) }}
              className="rounded-xl bg-petrolio px-4 py-2 text-sm font-semibold text-white transition hover:bg-petrolio-scuro">Salva</button>
            <button onClick={() => spostaSilo(slug, 'copy')}
              className="rounded-xl border border-linea bg-carta px-4 py-2 text-sm font-semibold text-inchiostro/70 transition hover:border-petrolio/40 hover:text-petrolio">Sblocca → in lavorazione</button>
            {salvato && <span className="text-xs font-semibold text-green-700">✓ salvato</span>}
          </div>
          <p className="mt-2 text-[11px] text-inchiostro/45">Il reminder resterà segnato qui; l&rsquo;invio automatico dell&rsquo;email di follow-up si collega col backend.</p>
        </div>
      ) : (
        <div className="mt-5 flex justify-end">
          <button onClick={() => spostaSilo(slug, 'bloccato')}
            className="rounded-xl border border-zinc-300 bg-carta px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100">
            🚫 Segna come bloccato
          </button>
        </div>
      )}

      {/* dati vendita (prodotto, prezzo, data) */}
      {(c.prodotto || c.prezzo || c.dataVendita) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-linea bg-carta px-4 py-3 text-sm shadow-sm">
          {c.prodotto && <span className="text-inchiostro"><span className="text-inchiostro/45">Prodotto:</span> <b>{c.prodotto}</b></span>}
          {c.prezzo && <span className="text-inchiostro"><span className="text-inchiostro/45">Prezzo:</span> <b>{c.prezzo}</b></span>}
          {c.dataVendita && <span className="text-inchiostro"><span className="text-inchiostro/45">Venduto il:</span> <b>{new Date(c.dataVendita).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })}</b></span>}
        </div>
      )}

      {/* stato + tempo totale */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-linea bg-carta p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Passaggio attuale</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${siloCorr.colore.punto}`} />
            <span className={`font-display text-lg font-bold ${siloCorr.colore.testo}`}>{siloCorr.ordine === 0 ? 'Step 0' : siloCorr.ordine} · {siloCorr.label}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-linea bg-carta p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">{consegnato ? 'Tempo totale erogazione' : 'In pipeline da'}</p>
          <p className="font-display mt-1 text-lg font-bold text-inchiostro">{primo ? durata(totaleMs) : '—'}</p>
          {primo && <p className="mt-0.5 text-[11px] text-inchiostro/45">dalla registrazione {fmtOra(log[0].dataOra)}</p>}
        </div>
      </div>

      {/* esecuzione agente — struttura front-end, backend da collegare */}
      {c.silo !== 'documenti' && c.silo !== 'consegnato' && (
        <div className="mt-4 rounded-2xl border border-petrolio/25 bg-petrolio/[0.05] p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-petrolio-scuro">Esecuzione agente — {siloCorr.label}</p>
          <p className="mt-1 text-sm text-inchiostro">{siloCorr.spec}</p>
          <p className="mt-2 text-[12px] text-inchiostro"><b>Agente:</b> {AGENTE_FASE[c.silo] ?? '—'}</p>

          {/* flusso documenti tra fasi (predisposto, automatico) */}
          <div className="mt-3 grid gap-2 sm:grid-cols-2 text-[11px]">
            <div className="rounded-lg border border-dashed border-inchiostro/20 bg-carta px-3 py-2 text-inchiostro/60">Documento in ingresso — dalla fase precedente <span className="text-inchiostro/40">(automatico, in arrivo)</span></div>
            <div className="rounded-lg border border-dashed border-inchiostro/20 bg-carta px-3 py-2 text-inchiostro/60">Documento in uscita — verso la fase successiva <span className="text-inchiostro/40">(automatico, in arrivo)</span></div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={() => setMostraInnesto(true)} className="rounded-xl bg-petrolio px-4 py-2 text-sm font-semibold text-white transition hover:bg-petrolio-scuro">▶ Esegui «{siloCorr.label}» con l&rsquo;agente</button>
            {siloSuccessivo(c.silo) && (
              <button onClick={() => avanzaSilo(slug)} className="rounded-xl border border-linea bg-carta px-4 py-2 text-sm font-semibold text-inchiostro/70 transition hover:border-petrolio/40 hover:text-petrolio">✓ Fatto — avanza al prossimo silo</button>
            )}
          </div>
          {mostraInnesto && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Struttura pronta: qui si innesta l&rsquo;agente reale. Lo colleghiamo (backend) appena carichi gli aggiornamenti — l&rsquo;operatore lancia, l&rsquo;agente lavora, poi si revisiona e si preme «Fatto — avanza».
            </p>
          )}
        </div>
      )}

      {/* log dei passaggi con durate */}
      <h2 className="font-display mt-8 text-xl font-bold tracking-tight text-inchiostro">Log dei passaggi</h2>
      <p className="mt-1 text-xs text-inchiostro/45">Ogni volta che il progetto cambia silo viene timbrata l&rsquo;ora. La durata è il tempo passato in quel silo.</p>

      {log.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-inchiostro/15 px-4 py-6 text-center text-sm text-inchiostro/45">
          Nessun passaggio registrato in piattaforma per questo cliente.
        </p>
      ) : (
        <ol className="mt-3 space-y-0">
          {log.map((v, i) => {
            const s = siloById(v.silo as typeof SILOS[number]['id'])
            const t = new Date(v.dataOra).getTime()
            const prossimo = log[i + 1] ? new Date(log[i + 1].dataOra).getTime() : (consegnato ? t : Date.now())
            const eUltimo = i === log.length - 1
            const durataStep = durata(prossimo - t)
            return (
              <li key={i} className="relative flex gap-3 pb-6 last:pb-0">
                {/* linea verticale */}
                {!eUltimo && <span className="absolute left-[7px] top-4 bottom-0 w-px bg-inchiostro/10" />}
                <span className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-carta ${s.colore.punto}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className={`text-sm font-bold ${s.colore.testo}`}>{s.ordine === 0 ? 'Step 0' : s.ordine} · {s.label}</span>
                    <span className="text-[11px] tabular-nums text-inchiostro/50">{fmtOra(v.dataOra)}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-inchiostro/45">
                    {eUltimo && !consegnato ? `in questo silo da ${durataStep}` : `durata: ${durataStep}`}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {/* per i 34 ufficiali: date del piano */}
      {c.riga && (
        <>
          <h2 className="font-display mt-8 text-lg font-bold tracking-tight text-inchiostro">Date dal piano ufficiale</h2>
          <div className="mt-2 space-y-1.5 rounded-2xl border border-linea bg-carta p-4 text-sm shadow-sm">
            {c.riga.entrata && <p className="text-inchiostro/70">In pipeline dal <b>{fmtData(c.riga.entrata)}</b></p>}
            {c.riga.copyDone && <p className="text-inchiostro/70">Copy completato <b>{fmtData(c.riga.copyDone)}</b></p>}
            {c.riga.grippoDone && <p className="text-inchiostro/70">Revisione Grippo <b>{fmtData(c.riga.grippoDone)}</b></p>}
            <p className="text-inchiostro/70">Consegna prevista <b>{fmtData(c.riga.consegnaPrevista)}</b></p>
            {c.riga.consulenzaFrank
              ? <p className="text-green-700">Consulenza con Frank <b>{fmtData(c.riga.consulenzaFrank)}</b></p>
              : <p className="text-rose-600">Consulenza con Frank: da programmare</p>}
          </div>
        </>
      )}
    </div>
  )
}

export default function SchedaPage() {
  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <Suspense fallback={<div className="px-6 py-16 text-center text-sm text-inchiostro/50">Carico…</div>}>
        <Scheda />
      </Suspense>
    </div>
  )
}
