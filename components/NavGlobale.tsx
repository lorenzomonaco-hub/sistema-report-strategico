'use client'

// ─── Menù di navigazione globale ───
// Barra in alto su tutte le pagine per spostarsi agilmente tra le aree.

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const VOCI: { href: string; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/commerciale', label: 'Commerciale' },
  { href: '/erogazione', label: 'Pipeline' },
  { href: '/erogazione/irene', label: 'Report AF' },
  { href: '/amministrazione/consulenze-frank', label: 'Consulenze Frank' },
  { href: '/amministrazione/quadro-aziendale', label: 'Quadro Aziendale' },
  { href: '/amministrazione/tutor', label: 'Tutor' },
]

export default function NavGlobale() {
  const pathname = usePathname() || '/'
  // voce attiva = prefisso più lungo che combacia col percorso ('/' solo esatto)
  const attivo = VOCI.reduce((best, v) => {
    const match = v.href === '/' ? pathname === '/' : pathname === v.href || pathname.startsWith(v.href + '/')
    if (match && v.href.length > (best?.length ?? -1)) return v.href
    return best
  }, null as string | null)

  return (
    <nav className="sticky top-0 z-50 border-b border-linea bg-carta/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2">
        <Link href="/" className="shrink-0 font-display text-sm font-bold tracking-tight text-inchiostro">
          Sistema Report <span className="text-petrolio">Strategico</span>
        </Link>
        <div className="ml-2 flex items-center gap-1 overflow-x-auto">
          {VOCI.filter((v) => v.href !== '/').map((v) => {
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
      </div>
    </nav>
  )
}
