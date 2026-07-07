'use client'

// ─── Home del Sistema Report Strategico ───
// Due portali separati: Area Commerciale ed Erogazione Copy.
// Layout custom centrato (niente RoleShell): ogni team entra solo nella propria area.

import Link from 'next/link'
import { contaNotifiche, useApp } from '@/lib/store'

const RUOLI_COMMERCIALE: { nome: string; compito: string }[] = [
  { nome: 'Venditore', compito: 'Vendita' },
  { nome: 'Tutor', compito: 'Documenti' },
  { nome: 'Irene', compito: 'Report' },
  { nome: 'Elisa', compito: 'Passaggio' },
]

const ATTIVITA_EROGAZIONE: string[] = [
  'Board kanban',
  'Revisioni',
  'Visual',
  'Grafica',
  'Centro Apprendimento',
]

const PASSI: { numero: number; titolo: string; descrizione: string }[] = [
  { numero: 1, titolo: 'Cartella cliente', descrizione: 'Il commerciale completa la cartella cliente' },
  { numero: 2, titolo: 'Produzione', descrizione: 'Erogazione Copy produce il report (AI + revisori)' },
  { numero: 3, titolo: 'Consegna', descrizione: 'Report consegnato al cliente' },
]

export default function Home() {
  const { state } = useApp()

  const notificheCommerciale =
    contaNotifiche(state, 'venditore') +
    contaNotifiche(state, 'tutor') +
    contaNotifiche(state, 'irene') +
    contaNotifiche(state, 'elisa')
  const notificheErogazione = contaNotifiche(state, 'erogazione')

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Sistema Report Strategico</h1>
          <p className="mt-3 text-lg text-slate-500">
            Dalla vendita alla consegna: cartella cliente, produzione del report e revisioni in un unico flusso.
          </p>
        </header>

        {/* Due portali */}
        <section className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Portale Area Commerciale */}
          <Link
            href="/commerciale"
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-sky-300 hover:shadow-md"
          >
            <div className="h-2 bg-gradient-to-r from-sky-500 to-indigo-500" />
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-sky-700">Area Commerciale</h2>
                  <p className="mt-1 text-sm text-slate-500">Vendita e raccolta documenti</p>
                </div>
                {notificheCommerciale > 0 && (
                  <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                    {notificheCommerciale}
                  </span>
                )}
              </div>
              <ul className="mt-5 space-y-2">
                {RUOLI_COMMERCIALE.map((r) => (
                  <li key={r.nome} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                    <span className="font-medium text-slate-700">{r.nome}</span>
                    <span className="text-slate-400">· {r.compito}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-6 text-sm font-semibold text-sky-600 group-hover:text-sky-700">
                Entra nell&apos;Area Commerciale →
              </p>
            </div>
          </Link>

          {/* Portale Erogazione Copy */}
          <Link
            href="/erogazione"
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <div className="h-2 bg-emerald-500" />
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700">Erogazione Copy</h2>
                  <p className="mt-1 text-sm text-slate-500">Produzione del report — board di lavorazione</p>
                </div>
                {notificheErogazione > 0 && (
                  <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                    {notificheErogazione}
                  </span>
                )}
              </div>
              <ul className="mt-5 space-y-2">
                {ATTIVITA_EROGAZIONE.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <span className="text-slate-700">{a}</span>
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
        <section className="mt-14">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-400">
            Il percorso in tre passi
          </h2>
          <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            {PASSI.map((p, i) => (
              <div key={p.numero} className="flex flex-1 flex-col items-center gap-2 sm:flex-row">
                {i > 0 && (
                  <span className="shrink-0 text-lg text-slate-300 rotate-90 sm:rotate-0" aria-hidden>
                    →
                  </span>
                )}
                <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {p.numero}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{p.titolo}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{p.descrizione}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nota separazione aree */}
        <footer className="mt-14 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="font-semibold text-slate-900">Due aree, due team</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Le due aree sono separate: ogni team vede esclusivamente la propria. L&apos;Area Commerciale si occupa
            della cartella cliente, Erogazione Copy della produzione del report.
          </p>
        </footer>
      </div>
    </div>
  )
}
