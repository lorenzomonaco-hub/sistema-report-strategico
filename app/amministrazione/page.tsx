'use client'

// La vecchia dashboard "Quadro Amministrativo" è stata rimossa: l'unica vista
// amministrativa è il Gantt Consulenze Frank. Qui reindirizziamo lì.

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AmministrazioneRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/amministrazione/consulenze-frank')
  }, [router])

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-sm text-inchiostro/60">Ti porto al Gantt Consulenze Frank…</p>
        <Link href="/amministrazione/consulenze-frank" className="mt-3 inline-block rounded-xl border border-linea bg-carta px-4 py-2 text-sm font-semibold text-petrolio hover:bg-petrolio/10">
          Gantt Consulenze Frank →
        </Link>
      </div>
    </div>
  )
}
