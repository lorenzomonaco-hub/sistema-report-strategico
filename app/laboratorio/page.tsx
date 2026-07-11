'use client'

// ─── Laboratorio — console dei blocchi della pipeline ───
// Il Laboratorio è il livello backend della pipeline: ogni card è un blocco
// indipendente (il suo Git, il suo servizio, i suoi test). Da qui si vede lo
// stato vivo di ogni servizio e si entra nel banco di prova del blocco.

import Link from 'next/link'
import { useEffect, useState } from 'react'
import RoleShell from '@/components/RoleShell'

const GITHUB = 'https://github.com/lorenzomonaco-hub'

interface Blocco {
  passo: string
  titolo: string
  descrizione: string
  proprietario: 'Lorenzo' | 'Christian'
  accento: string
  url?: string
  repo?: string
  bench?: string
}

const BLOCCHI: Blocco[] = [
  {
    passo: '3',
    titolo: 'Generazione',
    descrizione: 'Esegue la batteria di prompt (Consulenza o Branding) e produce la prima bozza del report.',
    proprietario: 'Christian',
    accento: 'bg-teal-500',
  },
  {
    passo: '4a',
    titolo: 'Report AF + email tutor',
    descrizione: 'Un report AssessFirst per ogni dipendente, in piena autonomia, poi email al tutor.',
    proprietario: 'Lorenzo',
    accento: 'bg-indigo-500',
    url: 'https://blocco-report-af-production.up.railway.app',
    repo: `${GITHUB}/blocco-report-af`,
    bench: '/laboratorio/report-af',
  },
  {
    passo: '5',
    titolo: 'Revisione',
    descrizione: 'La prima valutazione input/output della bozza generata.',
    proprietario: 'Christian',
    accento: 'bg-teal-500',
  },
  {
    passo: '6',
    titolo: 'Visual',
    descrizione: 'Trasforma i muri di testo in tabelle, diagrammi e grafici col tema pastello.',
    proprietario: 'Lorenzo',
    accento: 'bg-cyan-500',
    url: 'https://blocco-visual-production.up.railway.app',
    repo: `${GITHUB}/blocco-visual`,
    bench: '/laboratorio/visual',
  },
  {
    passo: '7',
    titolo: 'Revisione diagrammi',
    descrizione: 'Il lettore ignaro: giudica i visual in loop finché non sono perfetti, con lezioni.',
    proprietario: 'Lorenzo',
    accento: 'bg-violet-500',
    repo: `${GITHUB}/blocco-revisione-diagrammi`,
    bench: '/laboratorio/leggibilita',
  },
  {
    passo: '9',
    titolo: 'Impaginazione',
    descrizione: 'Impagina il report nel modello Macheda: PDF dentro, report impaginato e verdetto fuori.',
    proprietario: 'Lorenzo',
    accento: 'bg-stone-500',
    url: 'https://blocco-impaginazione-production.up.railway.app',
    repo: `${GITHUB}/blocco-impaginazione`,
    bench: '/laboratorio/grafica',
  },
  {
    passo: '10',
    titolo: 'Revisione impaginazione',
    descrizione: 'Confronta il PDF impaginato con tutta la base di conoscenza prima della consegna.',
    proprietario: 'Lorenzo',
    accento: 'bg-rose-400',
    repo: `${GITHUB}/blocco-revisione-impaginazione`,
  },
  {
    passo: '1 · 4a · 11',
    titolo: 'Email',
    descrizione: 'Il servizio comune che manda le notifiche: vendita registrata, report AF, PDF finale.',
    proprietario: 'Lorenzo',
    accento: 'bg-amber-500',
    repo: `${GITHUB}/blocco-email`,
  },
]

interface Salute {
  stato: string
  chiave_api_configurata?: boolean
  token_configurato?: boolean
  modello?: string
}

type EsitoSalute = { tipo: 'online'; dati: Salute } | { tipo: 'offline' } | { tipo: 'attesa' }

function BadgeSalute({ blocco }: { blocco: Blocco }) {
  const [esito, setEsito] = useState<EsitoSalute>({ tipo: 'attesa' })

  useEffect(() => {
    if (!blocco.url) return
    let fermo = false
    fetch(`${blocco.url}/health`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((dati: Salute) => {
        if (!fermo) setEsito({ tipo: 'online', dati })
      })
      .catch(() => {
        if (!fermo) setEsito({ tipo: 'offline' })
      })
    return () => {
      fermo = true
    }
  }, [blocco.url])

  if (!blocco.url) {
    return (
      <span className="shrink-0 rounded-full bg-inchiostro/5 px-2.5 py-0.5 text-xs font-semibold text-inchiostro/40">
        {blocco.proprietario === 'Christian' ? 'In integrazione' : 'In costruzione'}
      </span>
    )
  }
  if (esito.tipo === 'attesa') {
    return (
      <span className="shrink-0 rounded-full bg-inchiostro/5 px-2.5 py-0.5 text-xs font-semibold text-inchiostro/40">
        Controllo…
      </span>
    )
  }
  if (esito.tipo === 'offline') {
    return (
      <span className="shrink-0 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
        Non raggiungibile
      </span>
    )
  }
  return (
    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
      Online
    </span>
  )
}

function DettagliSalute({ blocco }: { blocco: Blocco }) {
  const [dati, setDati] = useState<Salute | null>(null)

  useEffect(() => {
    if (!blocco.url) return
    let fermo = false
    fetch(`${blocco.url}/health`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((d: Salute) => {
        if (!fermo) setDati(d)
      })
      .catch(() => {})
    return () => {
      fermo = true
    }
  }, [blocco.url])

  if (!blocco.url || !dati) return null
  return (
    <p className="mt-2 text-xs text-inchiostro/40">
      {dati.modello ? `Modello ${dati.modello}` : ''}
      {dati.chiave_api_configurata === false ? ' · chiave API mancante (regia agentica spenta)' : ''}
    </p>
  )
}

export default function PaginaLaboratorio() {
  return (
    <RoleShell
      ruolo="Laboratorio"
      colore="bg-ambra"
      sottotitolo="La console dei blocchi: ogni pezzo della pipeline ha il suo Git, il suo servizio e il suo banco di prova"
    >
      <div className="space-y-6">
        <div className="anima anima-1 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">🧱 Architettura a blocchi</h2>
          <p className="mt-2 text-sm leading-6 text-inchiostro/60">
            Ogni blocco è un modulo indipendente: il suo repository Git, il suo servizio su Railway e il suo
            banco di prova. Qui si lavora sul backend di ogni singolo passaggio — test agentici, verifiche in
            produzione — senza toccare la pipeline né gli altri blocchi. I numeri sono gli step della pipeline.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {BLOCCHI.map((b, i) => (
            <div
              key={b.titolo}
              className={`anima anima-${Math.min(i + 2, 6)} flex flex-col rounded-2xl border border-linea bg-carta p-5 shadow-sm`}
            >
              <div className={`h-1 rounded-full ${b.accento} ${b.url ? '' : 'opacity-30'}`} />
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-inchiostro/40 uppercase">
                    Step {b.passo} · {b.proprietario}
                  </p>
                  <h3 className={`font-display mt-0.5 text-lg font-bold tracking-tight ${b.url || b.bench ? 'text-inchiostro' : 'text-inchiostro/50'}`}>
                    {b.titolo}
                  </h3>
                  <p className={`mt-1 text-sm leading-5 ${b.url || b.bench ? 'text-inchiostro/60' : 'text-inchiostro/35'}`}>
                    {b.descrizione}
                  </p>
                </div>
                <BadgeSalute blocco={b} />
              </div>
              <DettagliSalute blocco={b} />
              {(b.bench || b.repo) && (
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3">
                  {b.bench && (
                    <Link href={b.bench} className="text-sm font-semibold text-petrolio transition hover:text-petrolio-scuro">
                      Banco di prova →
                    </Link>
                  )}
                  {b.repo && (
                    <a
                      href={b.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-inchiostro/40 transition hover:text-petrolio"
                    >
                      Repository Git ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="anima anima-6 text-center text-xs text-inchiostro/40">
          Generazione e Revisione arrivano dal sistema di Christian e si agganciano con lo stesso contratto
          standard degli altri blocchi (health, job, esito). I blocchi «in costruzione» hanno già il repository
          con lo scheletro pronto.
        </p>
      </div>
    </RoleShell>
  )
}
