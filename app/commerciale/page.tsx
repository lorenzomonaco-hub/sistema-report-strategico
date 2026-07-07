'use client'

// ─── Area Commerciale: selettore persona del team ───
// Layout custom centrato (niente RoleShell). Da qui non si accede mai a Erogazione Copy.

import Link from 'next/link'
import { contaNotifiche, useApp } from '@/lib/store'

interface CardPersona {
  href: string
  nome: string
  compito: string
  /** classe Tailwind completa per la barretta colore in alto */
  barra: string
  /** classe Tailwind completa per il pallino accanto al nome */
  pallino: string
  /** id ruolo per contaNotifiche */
  ruolo: string
}

const PERSONE: CardPersona[] = [
  {
    href: '/commerciale/venditore',
    nome: 'Venditore',
    compito: 'Crea le pratiche e invia assessment e questionario',
    barra: 'bg-sky-500',
    pallino: 'bg-sky-500',
    ruolo: 'venditore',
  },
  {
    href: '/commerciale/tutor',
    nome: 'Tutor',
    compito: 'Carica questionario e trascrizione',
    barra: 'bg-indigo-500',
    pallino: 'bg-indigo-500',
    ruolo: 'tutor',
  },
  {
    href: '/commerciale/irene',
    nome: 'Irene',
    compito: 'Genera il report AssessFirst del team con il prompt',
    barra: 'bg-violet-500',
    pallino: 'bg-violet-500',
    ruolo: 'irene',
  },
  {
    href: '/commerciale/elisa',
    nome: 'Elisa',
    compito: 'Carica gli AssessFirst e passa la cartella completa a Erogazione Copy',
    barra: 'bg-fuchsia-500',
    pallino: 'bg-fuchsia-500',
    ruolo: 'elisa',
  },
]

export default function AreaCommerciale() {
  const { state } = useApp()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Intestazione */}
        <header className="text-center">
          <Link href="/" className="text-sm text-slate-400 transition hover:text-slate-600">
            ← Torna alla home
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Area Commerciale</h1>
          <p className="mt-2 text-slate-500">
            Vendita e raccolta documenti: scegli la tua area di lavoro per completare la cartella cliente.
          </p>
        </header>

        {/* Persone del team */}
        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PERSONE.map((p) => {
            const notifiche = contaNotifiche(state, p.ruolo)
            return (
              <Link
                key={p.href}
                href={p.href}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className={`h-1.5 ${p.barra}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-slate-700">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${p.pallino}`} />
                      {p.nome}
                    </h2>
                    {notifiche > 0 && (
                      <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                        {notifiche}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{p.compito}</p>
                </div>
              </Link>
            )
          })}
        </section>

        {/* Nota di area */}
        <footer className="mt-12 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-500">
            Quando la cartella cliente è completa (questionario, trascrizione, AssessFirst e report del team),
            <strong className="font-semibold text-slate-700"> solo Elisa</strong> può passarla a Erogazione Copy.
          </p>
        </footer>
      </div>
    </div>
  )
}
