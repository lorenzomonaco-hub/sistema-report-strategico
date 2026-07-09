'use client'

// ─── Laboratorio — banchi di prova a compartimenti stagni ───
// Ogni compartimento della pipeline si testa qui da solo, con l'API reale,
// senza toccare la piattaforma né gli altri compartimenti.

import Link from 'next/link'
import RoleShell from '@/components/RoleShell'

const COMPARTIMENTI = [
  {
    numero: 4,
    titolo: 'Revisore 1 — Editor (5 fasi)',
    descrizione: 'Carichi il documento, l\'AI lo revisiona con il prompt vero e scarichi il file corretto.',
    href: '/laboratorio/revisore-1',
    accento: 'bg-amber-500',
    attivo: true,
  },
  {
    numero: 5,
    titolo: 'Revisore 2 — Supervisore',
    descrizione: 'Confronta prima/dopo, giudica il lavoro del Revisore 1: verdetto, problemi e lezioni.',
    href: '/laboratorio/revisore-2',
    accento: 'bg-rose-500',
    attivo: true,
  },
  {
    numero: 6,
    titolo: 'Agente Visual',
    descrizione: 'Tabelle, diagrammi, callout e specifiche per la designer al posto dei muri di testo.',
    href: '/laboratorio/visual',
    accento: 'bg-cyan-500',
    attivo: true,
  },
  {
    numero: 7,
    titolo: 'Revisore Leggibilità',
    descrizione: 'Il lettore ignaro: giudica se i visual fanno capire davvero. Verdetto e lezioni per il Visual.',
    href: '/laboratorio/leggibilita',
    accento: 'bg-violet-500',
    attivo: true,
  },
  {
    numero: 8,
    titolo: 'Grafica — impaginazione automatica',
    descrizione: 'Carichi il PDF del cliente: il worker su Railway lo impagina nel modello Macheda con controlli e verdetto.',
    href: '/laboratorio/grafica',
    accento: 'bg-stone-500',
    attivo: true,
  },
]

export default function PaginaLaboratorio() {
  return (
    <RoleShell
      ruolo="Laboratorio"
      colore="bg-ambra"
      sottotitolo="Banchi di prova a compartimenti stagni — ogni passaggio si testa da solo, con l'API reale"
    >
      <div className="space-y-6">
        <div className="anima anima-1 rounded-2xl border border-linea bg-carta p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-inchiostro">
            🧪 Come funziona
          </h2>
          <p className="mt-2 text-sm leading-6 text-inchiostro/60">
            Ogni compartimento è isolato: carichi un documento in ingresso, il compartimento lo lavora con il suo
            prompt e l&apos;API di Claude, e ti restituisce il documento in uscita. Nessun dato tocca la pipeline:
            è la palestra dove i prompt si mettono a punto prima di collegare tutto.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {COMPARTIMENTI.map((c, i) => {
            const corpo = (
              <>
                <div className={`h-1 rounded-full ${c.accento} ${c.attivo ? '' : 'opacity-30'}`} />
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-wide text-inchiostro/40 uppercase">
                      Compartimento n°{c.numero}
                    </p>
                    <h3 className={`font-display mt-0.5 text-lg font-bold tracking-tight ${c.attivo ? 'text-inchiostro' : 'text-inchiostro/40'}`}>
                      {c.titolo}
                    </h3>
                    <p className={`mt-1 text-sm leading-5 ${c.attivo ? 'text-inchiostro/60' : 'text-inchiostro/35'}`}>
                      {c.descrizione}
                    </p>
                  </div>
                  {c.attivo ? (
                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      Attivo
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-inchiostro/5 px-2.5 py-0.5 text-xs font-semibold text-inchiostro/40">
                      In preparazione
                    </span>
                  )}
                </div>
                {c.attivo && <p className="mt-3 text-sm font-semibold text-petrolio">Apri il banco di prova →</p>}
              </>
            )
            const classi = `anima anima-${Math.min(i + 2, 6)} rounded-2xl border border-linea bg-carta p-5 shadow-sm ${
              c.attivo ? 'card-sollevabile' : ''
            }`
            return c.attivo ? (
              <Link key={c.numero} href={c.href} className={classi}>
                {corpo}
              </Link>
            ) : (
              <div key={c.numero} className={classi}>
                {corpo}
              </div>
            )
          })}
        </div>
      </div>
    </RoleShell>
  )
}
