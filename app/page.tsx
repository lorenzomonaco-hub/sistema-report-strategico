'use client'

// ─── Home del Sistema Report Strategico ───
// Tre livelli di accesso (compartimenti stagni): Commerciale, Erogazione, Quadro
// Amministrativo. Ognuno vede solo la propria area, ma il backend è unico e
// condiviso: quando un cliente si muove nella pipeline, il Gantt e la
// reportistica dell'amministrativo si aggiornano live.

import Link from 'next/link'
import { contaNotifiche, useApp } from '@/lib/store'

const PASSI: { numero: number; titolo: string; descrizione: string }[] = [
  {
    numero: 1,
    titolo: 'Commerciale prepara',
    descrizione: 'Il Tutor registra il cliente e le persone (avvio pipeline, step 0); Elisa carica i documenti e lo porta allo step 1.',
  },
  {
    numero: 2,
    titolo: 'Erogazione produce',
    descrizione: 'Il cliente avanza nei silos; l’operatore fa eseguire gli agenti (human-in-the-loop) e Irene genera i report AssessFirst.',
  },
  {
    numero: 3,
    titolo: 'Amministrativo monitora',
    descrizione: 'Consegna e consulenza con Frank; ogni movimento della pipeline aggiorna live il Gantt, i log e la reportistica.',
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
  const notificheCommerciale = contaNotifiche(state, 'tutor')
  const notificheErogazione = contaNotifiche(state, 'erogazione')

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Hero */}
        <header className="anima anima-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Dalla vendita alla consegna</p>
          <h1 className="font-display mt-3 text-5xl font-bold tracking-tight text-inchiostro">Sistema Report Strategico</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-7 text-inchiostro/60">
            Tre aree di lavoro, un unico percorso. Ogni squadra entra solo nella propria, ma i dati sono
            condivisi: la pipeline aggiorna tutto in tempo reale.
          </p>
        </header>

        {/* Tre livelli di accesso */}
        <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Commerciale */}
          <Link href="/commerciale" className="anima anima-2 card-sollevabile group flex flex-col overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm hover:border-indigo-300">
            <div className="h-1.5 bg-indigo-500" />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-500">Livello 1</p>
                  <h2 className="font-display mt-0.5 text-xl font-bold tracking-tight text-inchiostro group-hover:text-indigo-700">Commerciale</h2>
                  <p className="mt-1 text-sm text-inchiostro/60">Vendita, documenti e avvio della pipeline</p>
                </div>
                <BadgeNotifiche conta={notificheCommerciale} />
              </div>
              <ul className="mt-5 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span className="leading-6 text-inchiostro/60"><span className="font-semibold text-inchiostro">Tutor</span> — registra il cliente e le persone (avvia la pipeline, step 0)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span className="leading-6 text-inchiostro/60"><span className="font-semibold text-inchiostro">Elisa</span> — carica i documenti e porta il cliente allo step 1</span>
                </li>
              </ul>
              <p className="mt-auto pt-6 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">Entra in Commerciale →</p>
            </div>
          </Link>

          {/* Erogazione */}
          <Link href="/erogazione" className="anima anima-3 card-sollevabile group flex flex-col overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm hover:border-emerald-300">
            <div className="h-1.5 bg-emerald-500" />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-500">Livello 2</p>
                  <h2 className="font-display mt-0.5 text-xl font-bold tracking-tight text-inchiostro group-hover:text-emerald-700">Erogazione</h2>
                  <p className="mt-1 text-sm text-inchiostro/60">Produzione del report: pipeline a silos</p>
                </div>
                <BadgeNotifiche conta={notificheErogazione} />
              </div>
              <ul className="mt-5 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span className="leading-6 text-inchiostro/60"><span className="font-semibold text-inchiostro">Copy</span> — lavora il cliente nei silos ed esegue gli agenti (human-in-the-loop)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span className="leading-6 text-inchiostro/60"><span className="font-semibold text-inchiostro">Report AF — Irene</span> — genera i report AssessFirst (area dedicata)</span>
                </li>
              </ul>
              <p className="mt-auto pt-6 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">Entra in Erogazione →</p>
            </div>
          </Link>

          {/* Quadro Amministrativo */}
          <Link href="/amministrazione/consulenze-frank" className="anima anima-4 card-sollevabile group flex flex-col overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm hover:border-petrolio/40">
            <div className="h-1.5 bg-petrolio" />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-petrolio">Livello 3</p>
                  <h2 className="font-display mt-0.5 text-xl font-bold tracking-tight text-inchiostro group-hover:text-petrolio-scuro">Quadro Amministrativo</h2>
                  <p className="mt-1 text-sm text-inchiostro/60">Gantt, log e reportistica — vista di controllo</p>
                </div>
                <span className="text-lg" aria-hidden>🔐</span>
              </div>
              <ul className="mt-5 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-petrolio" />
                  <span className="leading-6 text-inchiostro/60"><span className="font-semibold text-inchiostro">Gantt Consulenze Frank</span> — stato di tutti i clienti, aggiornato live dalla pipeline</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-petrolio" />
                  <span className="leading-6 text-inchiostro/60"><span className="font-semibold text-inchiostro">Quadro aziendale + tutor</span> — impatto economico e clienti per tutor</span>
                </li>
              </ul>
              <p className="mt-auto pt-6 text-sm font-semibold text-petrolio group-hover:text-petrolio-scuro">Entra nel Quadro Amministrativo →</p>
            </div>
          </Link>
        </section>

        {/* Il percorso in 3 passi */}
        <section className="anima anima-4 mt-14">
          <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-inchiostro/40">Il percorso in tre passi</h2>
          <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row">
            {PASSI.map((p, i) => (
              <div key={p.numero} className="flex flex-1 flex-col items-center gap-2 sm:flex-row">
                {i > 0 && <span className="shrink-0 rotate-90 text-lg text-inchiostro/40 sm:rotate-0" aria-hidden>→</span>}
                <div className="w-full rounded-2xl border border-linea bg-carta p-5 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-petrolio text-xs font-bold text-white">{p.numero}</span>
                    <span className="font-display text-sm font-bold tracking-tight text-inchiostro">{p.titolo}</span>
                  </div>
                  <p className="mt-2.5 text-xs leading-5 text-inchiostro/60">{p.descrizione}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compartimenti stagni, backend unico */}
        <footer className="anima anima-5 mt-14 rounded-2xl border border-linea bg-carta p-5 text-center shadow-sm">
          <h2 className="font-display font-bold tracking-tight text-inchiostro">Tre compartimenti stagni, un solo backend</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-inchiostro/60">
            Ogni area vede esclusivamente la propria, ma i dati sono condivisi. Quando un cliente si muove
            nella pipeline (Erogazione), il <strong className="font-semibold text-inchiostro">Gantt</strong>, i
            <strong className="font-semibold text-inchiostro"> log</strong> e la
            <strong className="font-semibold text-inchiostro"> reportistica</strong> del Quadro Amministrativo si
            aggiornano da soli, in tempo reale.
          </p>
        </footer>
      </div>
    </div>
  )
}
