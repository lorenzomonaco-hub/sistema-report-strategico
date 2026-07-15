'use client'

// ─── Area Commerciale: chi sei? ───
// Due sole persone: il Tutor e Irene. Da qui non si accede mai a Erogazione Copy.

import Link from 'next/link'
import { contaNotifiche, useApp } from '@/lib/store'

interface CardPersona {
  href: string
  nome: string
  compito: string
  passi: string[]
  /** classe completa per il ritardo dell'animazione di ingresso */
  anima: string
  /** classe Tailwind completa per la barretta colore in alto */
  barra: string
  /** classe Tailwind completa per il pallino dei passaggi */
  pallino: string
  /** classe Tailwind completa per il titolo al passaggio del mouse */
  titoloHover: string
  /** classe Tailwind completa per il richiamo finale */
  richiamo: string
  /** id ruolo per contaNotifiche */
  ruolo: string
}

const PERSONE: CardPersona[] = [
  {
    href: '/commerciale/tutor',
    nome: 'Tutor',
    compito: 'Registra il cliente e le persone: è il via della pipeline (step 0).',
    passi: [
      'Registra azienda e titolare',
      'Aggiunge le persone: nome, cognome, email, qualifica',
      'Soci illimitati, dipendenti max 3 per azienda',
      'Alla registrazione il cliente entra allo step 0',
    ],
    anima: 'anima-2',
    barra: 'bg-indigo-500',
    pallino: 'bg-indigo-500',
    titoloHover: 'group-hover:text-indigo-700',
    richiamo: 'text-indigo-600 group-hover:text-indigo-700',
    ruolo: 'tutor',
  },
  {
    href: '/commerciale/elisa',
    nome: 'Elisa',
    compito: 'Carica i documenti dei clienti registrati e li porta allo step 1.',
    passi: [
      'Vede i clienti allo step 0',
      'Carica questionario, trascrizione e AssessFirst',
      'Controlla che i file siano della persona giusta',
      '«Documenti completi» → step 0 → 1 (Copy)',
    ],
    anima: 'anima-3',
    barra: 'bg-amber-500',
    pallino: 'bg-amber-500',
    titoloHover: 'group-hover:text-amber-700',
    richiamo: 'text-amber-600 group-hover:text-amber-700',
    ruolo: 'elisa',
  },
  {
    href: '/commerciale/irene',
    nome: 'Irene',
    compito: 'Supervisiona lo step autonomo: report AssessFirst ed email ai tutor.',
    passi: [
      'Vede le generazioni in corso in tempo reale',
      'Controlla che i report AF escano formattati correttamente',
      'Verifica che le email ai tutor partano',
      'Interviene solo se qualcosa va storto',
    ],
    anima: 'anima-4',
    barra: 'bg-violet-500',
    pallino: 'bg-violet-500',
    titoloHover: 'group-hover:text-violet-700',
    richiamo: 'text-violet-600 group-hover:text-violet-700',
    ruolo: 'irene',
  },
]

export default function AreaCommerciale() {
  const { state } = useApp()

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Intestazione */}
        <header className="anima anima-1 text-center">
          <Link href="/" className="text-sm text-inchiostro/40 transition hover:text-inchiostro">
            ← Torna alla home
          </Link>
          <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-inchiostro">
            Area Commerciale
          </h1>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-inchiostro/50">
            Il Tutor registra il cliente (step 0), Elisa carica i documenti e lo porta allo step 1,
            Irene supervisiona lo step autonomo. Scegli la tua area di lavoro.
          </p>
        </header>

        {/* I tre ruoli */}
        <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONE.map((p) => {
            const notifiche = contaNotifiche(state, p.ruolo)
            return (
              <Link
                key={p.href}
                href={p.href}
                className={`anima ${p.anima} card-sollevabile group flex flex-col overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm`}
              >
                <div className={`h-1.5 ${p.barra}`} />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2
                        className={`font-display text-2xl font-bold tracking-tight text-inchiostro ${p.titoloHover}`}
                      >
                        {p.nome}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-inchiostro/50">{p.compito}</p>
                    </div>
                    {notifiche > 0 && (
                      <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-ambra px-2 text-xs font-bold text-white">
                        {notifiche}
                      </span>
                    )}
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {p.passi.map((passo) => (
                      <li key={passo} className="flex items-start gap-2.5 text-sm">
                        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${p.pallino}`} />
                        <span className="leading-6 text-inchiostro/50">{passo}</span>
                      </li>
                    ))}
                  </ul>
                  <p className={`mt-auto pt-6 text-sm font-semibold ${p.richiamo}`}>
                    Entra come {p.nome} →
                  </p>
                </div>
              </Link>
            )
          })}
        </section>

        {/* Nota di area */}
        <footer className="anima anima-5 mt-12 rounded-2xl border border-linea bg-carta p-5 text-center shadow-sm">
          <p className="mx-auto max-w-2xl text-sm leading-6 text-inchiostro/50">
            La registrazione del Tutor crea il cliente allo <strong className="font-semibold text-inchiostro">step 0</strong> (vendita
            registrata, documenti mancanti). Quando <strong className="font-semibold text-inchiostro">Elisa</strong> completa i documenti,
            il cliente passa allo <strong className="font-semibold text-inchiostro">step 1</strong> ed entra nella pipeline (Copy).
          </p>
        </footer>
      </div>
    </div>
  )
}
