'use client'

import Link from 'next/link'
import { useApp } from '@/lib/store'

interface Props {
  ruolo: string
  /** classe Tailwind completa per l'accento del ruolo, es. "bg-emerald-500" */
  colore: string
  sottotitolo?: string
  notifiche?: number
  children: React.ReactNode
}

/** Guscio comune di ogni area: testata con identità di ruolo, badge notifiche, contenuto.
 *  Mostra un placeholder finché lo stato non è stato ripristinato da localStorage. */
export default function RoleShell({ ruolo, colore, sottotitolo, notifiche = 0, children }: Props) {
  const { resetDemo, pronto } = useApp()

  return (
    <div className="sfondo-trama min-h-screen">
      <header className="sticky top-0 z-40 border-b border-linea bg-carta/90 backdrop-blur">
        <div className={`h-1 ${colore}`} />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/"
              className="shrink-0 text-xs font-medium text-inchiostro/40 transition hover:text-petrolio"
            >
              ← Cambia area
            </Link>
            <div className="h-6 w-px bg-linea" />
            <div className="min-w-0">
              <h1 className="font-display flex items-center gap-2 truncate text-lg font-bold tracking-tight text-inchiostro">
                <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${colore}`} />
                {ruolo}
                {notifiche > 0 && (
                  <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-ambra px-1.5 text-xs font-bold text-white">
                    {notifiche}
                  </span>
                )}
              </h1>
              {sottotitolo && <p className="truncate text-xs text-inchiostro/50">{sottotitolo}</p>}
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm('Ripristinare i dati demo iniziali?')) resetDemo()
            }}
            className="shrink-0 rounded-lg border border-linea bg-carta px-3 py-1.5 text-xs text-inchiostro/50 transition hover:border-petrolio/40 hover:text-petrolio"
          >
            ↺ Reset demo
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {pronto ? children : <p className="py-16 text-center text-sm text-inchiostro/40">Caricamento…</p>}
      </main>
      <footer className="mx-auto max-w-6xl px-6 pb-8 text-center text-xs text-inchiostro/35">
        Sistema Report Strategico — prototipo (dati simulati, nessun backend collegato)
      </footer>
    </div>
  )
}
