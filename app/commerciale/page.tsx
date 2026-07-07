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
    compito: 'Apre la pratica alla vendita e raccoglie i documenti del cliente.',
    passi: [
      'Registra la vendita con i dipendenti coinvolti',
      'Invia assessment e questionario al cliente',
      'Carica questionario e trascrizione',
      'Conferma con «Dati completi» quando è tutto presente',
    ],
    anima: 'anima-2',
    barra: 'bg-indigo-500',
    pallino: 'bg-indigo-500',
    titoloHover: 'group-hover:text-indigo-700',
    richiamo: 'text-indigo-600 group-hover:text-indigo-700',
    ruolo: 'tutor',
  },
  {
    href: '/commerciale/irene',
    nome: 'Irene',
    compito: 'Completa la pratica con gli AssessFirst e il report del team.',
    passi: [
      'Riceve i blocchi confermati dal Tutor',
      'Scarica i documenti e carica gli AssessFirst',
      'Verifica la lista di controllo e genera il report',
      'Con «Completo» il blocco passa a Erogazione Copy',
    ],
    anima: 'anima-3',
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
            Il Tutor apre la pratica e raccoglie i documenti, Irene la completa e la invia in
            produzione. Scegli la tua area di lavoro.
          </p>
        </header>

        {/* Le due persone */}
        <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
        <footer className="anima anima-4 mt-12 rounded-2xl border border-linea bg-carta p-5 text-center shadow-sm">
          <p className="mx-auto max-w-2xl text-sm leading-6 text-inchiostro/50">
            Quando il Tutor conferma i <strong className="font-semibold text-inchiostro">dati completi</strong>,
            la pratica passa a Irene. Quando Irene la segna come{' '}
            <strong className="font-semibold text-inchiostro">completa</strong>, il blocco entra nella
            lavorazione di Erogazione Copy.
          </p>
        </footer>
      </div>
    </div>
  )
}
