'use client'

import Link from 'next/link'
import { useApp } from '@/lib/store'

interface Props {
  ruolo: string
  /** classe Tailwind completa per la barra colore, es. "bg-emerald-500" */
  colore: string
  sottotitolo?: string
  notifiche?: number
  children: React.ReactNode
}

/** Guscio comune di ogni area di ruolo: testata, badge notifiche, contenuto.
 *  Mostra un placeholder finché lo stato salvato non è stato ripristinato da localStorage,
 *  così nessuna pagina lampeggia con i dati seed. */
export default function RoleShell({ ruolo, colore, sottotitolo, notifiche = 0, children }: Props) {
  const { resetDemo, pronto } = useApp()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`h-1.5 ${colore}`} />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-400 transition hover:text-slate-600">
              ← Cambia ruolo
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h1 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                {ruolo}
                {notifiche > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                    {notifiche}
                  </span>
                )}
              </h1>
              {sottotitolo && <p className="text-xs text-slate-500">{sottotitolo}</p>}
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm('Ripristinare i dati demo iniziali?')) resetDemo()
            }}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:bg-slate-100"
          >
            ↺ Reset demo
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {pronto ? children : <p className="py-16 text-center text-sm text-slate-400">Caricamento…</p>}
      </main>
      <footer className="mx-auto max-w-6xl px-6 pb-8 text-center text-xs text-slate-400">
        Sistema Report Strategico — prototipo frontend (dati simulati, nessun backend collegato)
      </footer>
    </div>
  )
}
