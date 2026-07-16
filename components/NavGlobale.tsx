'use client'

// ─── Menù di navigazione — a compartimenti stagni ───
// Dentro un'area (Commerciale / Erogazione / Amministrativo) il menù mostra SOLO
// le pagine di quell'area. Per cambiare compartimento si torna alla home, che
// fa da smistamento. I dati restano condivisi nel backend: la separazione è di
// navigazione, non di dati.

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Voce = { href: string; label: string }
type Compartimento = { chiave: string; radice: string; label: string; colore: string; voci: Voce[] }

const COMPARTIMENTI: Compartimento[] = [
  {
    chiave: 'commerciale', radice: '/commerciale', label: 'Commerciale', colore: 'text-indigo-600',
    voci: [
      { href: '/commerciale', label: 'Panoramica' },
      { href: '/commerciale/tutor', label: 'Tutor' },
      { href: '/commerciale/elisa', label: 'Elisa' },
    ],
  },
  {
    chiave: 'erogazione', radice: '/erogazione', label: 'Erogazione', colore: 'text-emerald-600',
    voci: [
      { href: '/erogazione', label: 'Pipeline' },
      { href: '/erogazione/irene', label: 'Report AF' },
    ],
  },
  {
    chiave: 'amministrazione', radice: '/amministrazione', label: 'Quadro Amministrativo', colore: 'text-petrolio',
    voci: [
      { href: '/amministrazione/consulenze-frank', label: 'Consulenze Frank' },
      { href: '/amministrazione/quadro-aziendale', label: 'Quadro Aziendale' },
      { href: '/amministrazione/tutor', label: 'Tutor' },
    ],
  },
]

export default function NavGlobale() {
  const pathname = usePathname() || '/'
  const comp = COMPARTIMENTI.find((c) => pathname === c.radice || pathname.startsWith(c.radice + '/'))

  // scelta della voce attiva: prefisso più lungo che combacia
  const attivo = comp
    ? comp.voci.reduce((best: string | null, v) => {
        const match = pathname === v.href || pathname.startsWith(v.href + '/')
        return match && v.href.length > (best?.length ?? -1) ? v.href : best
      }, null)
    : null

  return (
    <nav className="sticky top-0 z-50 border-b border-linea bg-carta/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2">
        <Link href="/" className="shrink-0 font-display text-sm font-bold tracking-tight text-inchiostro">
          Sistema Report <span className="text-petrolio">Strategico</span>
        </Link>

        {comp ? (
          <>
            <span className="h-4 w-px shrink-0 bg-linea" />
            <span className={`shrink-0 text-[13px] font-bold ${comp.colore}`}>{comp.label}</span>
            <div className="ml-1 flex items-center gap-1 overflow-x-auto">
              {comp.voci.map((v) => {
                const isAttivo = attivo === v.href
                return (
                  <Link
                    key={v.href}
                    href={v.href}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
                      isAttivo ? 'bg-petrolio text-white' : 'text-inchiostro/60 hover:bg-inchiostro/[0.05] hover:text-inchiostro'
                    }`}
                  >
                    {v.label}
                  </Link>
                )
              })}
            </div>
            <Link href="/" className="ml-auto shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-inchiostro/45 transition hover:text-inchiostro">
              ← Cambia area
            </Link>
          </>
        ) : (
          <span className="text-[12px] text-inchiostro/40">Scegli un&rsquo;area di lavoro</span>
        )}
      </div>
    </nav>
  )
}
