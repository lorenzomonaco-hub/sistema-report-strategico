'use client'

// ─── Home del Sistema Report Strategico ───
// Landing a due portali: Area Commerciale (Tutor + Irene) ed Erogazione Copy.
// Layout custom centrato (niente RoleShell): ogni squadra entra solo nella propria area.

import Link from 'next/link'
import { contaNotifiche, useApp } from '@/lib/store'

const PERSONE_COMMERCIALE: { nome: string; compito: string }[] = [
  {
    nome: 'Tutor',
    compito: 'Registra la vendita, carica i documenti e conferma quando è tutto presente',
  },
  {
    nome: 'Irene',
    compito: 'AssessFirst, report del team e invio a Erogazione Copy',
  },
]

const ATTIVITA_EROGAZIONE: string[] = [
  'Board kanban',
  'Revisioni',
  'Visual',
  'Grafica',
  'Centro Apprendimento',
]

const PASSI: { numero: number; titolo: string; descrizione: string }[] = [
  {
    numero: 1,
    titolo: 'Il Tutor prepara',
    descrizione: 'Registra la vendita, invia assessment e questionario, carica i documenti del cliente.',
  },
  {
    numero: 2,
    titolo: 'Irene completa e invia',
    descrizione: 'Aggiunge gli AssessFirst, genera il report del team e lo passa a Erogazione Copy.',
  },
  {
    numero: 3,
    titolo: 'Il team copy produce e consegna',
    descrizione: 'Revisioni, visual e grafica fino al report finito, pronto per il cliente.',
  },
]

function BadgeNotifiche({ conta }: { conta: number }) {
  if (conta <= 0) return null
  return (
    <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-ambra px-2 text-xs font-bold text-white">
      {conta}
    </span>
  )
}

export default function Home() {
  const { state } = useApp()

  const notificheCommerciale = contaNotifiche(state, 'tutor') + contaNotifiche(state, 'irene')
  const notificheErogazione = contaNotifiche(state, 'erogazione')

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <header className="anima anima-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-ambra">
            Dalla vendita alla consegna
          </p>
          <h1 className="font-display mt-3 text-5xl font-bold tracking-tight text-inchiostro">
            Sistema Report Strategico
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-7 text-inchiostro/50">
            La pratica nasce con la vendita, si completa con i documenti e diventa un report
            strategico rivisto riga per riga. Due aree, un unico percorso.
          </p>
        </header>

        {/* Due portali */}
        <section className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Portale Area Commerciale */}
          <Link
            href="/commerciale"
            className="anima anima-2 card-sollevabile group flex flex-col overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm hover:border-indigo-300"
          >
            <div className="h-1.5 bg-indigo-500" />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-inchiostro group-hover:text-indigo-700">
                    Area Commerciale
                  </h2>
                  <p className="mt-1 text-sm text-inchiostro/50">Vendita, documenti e report del team</p>
                </div>
                <BadgeNotifiche conta={notificheCommerciale} />
              </div>
              <ul className="mt-5 space-y-3">
                {PERSONE_COMMERCIALE.map((p) => (
                  <li key={p.nome} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    <span className="leading-6 text-inchiostro/50">
                      <span className="font-semibold text-inchiostro">{p.nome}</span> — {p.compito}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-6 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                Entra nell&rsquo;Area Commerciale →
              </p>
            </div>
          </Link>

          {/* Portale Erogazione Copy */}
          <Link
            href="/erogazione"
            className="anima anima-3 card-sollevabile group flex flex-col overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm hover:border-emerald-300"
          >
            <div className="h-1.5 bg-emerald-500" />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-inchiostro group-hover:text-emerald-700">
                    Erogazione Copy
                  </h2>
                  <p className="mt-1 text-sm text-inchiostro/50">Produzione del report, dalla bozza alla consegna</p>
                </div>
                <BadgeNotifiche conta={notificheErogazione} />
              </div>
              <ul className="mt-5 space-y-2">
                {ATTIVITA_EROGAZIONE.map((a) => (
                  <li key={a} className="flex items-center gap-2.5 text-sm">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span className="text-inchiostro/50">{a}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-6 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
                Entra in Erogazione Copy →
              </p>
            </div>
          </Link>
        </section>

        {/* Il percorso in 3 passi */}
        <section className="anima anima-4 mt-14">
          <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-inchiostro/40">
            Il percorso in tre passi
          </h2>
          <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch">
            {PASSI.map((p, i) => (
              <div key={p.numero} className="flex flex-1 flex-col items-center gap-2 sm:flex-row">
                {i > 0 && (
                  <span className="shrink-0 rotate-90 text-lg text-inchiostro/40 sm:rotate-0" aria-hidden>
                    →
                  </span>
                )}
                <div className="w-full rounded-2xl border border-linea bg-carta p-5 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-petrolio text-xs font-bold text-white">
                      {p.numero}
                    </span>
                    <span className="font-display text-sm font-bold tracking-tight text-inchiostro">
                      {p.titolo}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs leading-5 text-inchiostro/50">{p.descrizione}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nota sulle aree separate */}
        <footer className="anima anima-5 mt-14 rounded-2xl border border-linea bg-carta p-5 text-center shadow-sm">
          <h2 className="font-display font-bold tracking-tight text-inchiostro">Due aree, due squadre</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-inchiostro/50">
            Le due aree sono separate: ognuno vede esclusivamente la propria. L&rsquo;Area Commerciale
            prepara la pratica e i documenti del cliente, Erogazione Copy produce il report e lo porta
            alla consegna.
          </p>
        </footer>
      </div>
    </div>
  )
}
