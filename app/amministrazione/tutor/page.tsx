'use client'

// ─── Clienti per tutor ───
// Gli stessi 87 clienti del Quadro Aziendale, raggruppati per tutor di
// riferimento — sia chi è già in erogazione (stadio 2-4) sia chi è ancora in
// attesa di informazioni (stadio 1). Una card per tutor, poi la pagina
// individuale con l'elenco completo.

import Link from 'next/link'
import { EROG_TOT, StadioErog, TUTOR_LIST } from '@/lib/quadroaziendale'

function Carta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-linea bg-carta p-4 shadow-sm ${className}`}>{children}</div>
}

const STADIO_COLORE: Record<StadioErog, string> = {
  1: 'bg-rose-500',
  2: 'bg-petrolio',
  3: 'bg-teal-600',
  4: 'bg-indigo-600',
}

function BarraDistribuzione({ perStadio }: { perStadio: [number, number, number, number] }) {
  const tot = perStadio.reduce((s, n) => s + n, 0) || 1
  return (
    <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-inchiostro/[0.06]">
      {([1, 2, 3, 4] as StadioErog[]).map((s) => {
        const n = perStadio[s - 1]
        if (n === 0) return null
        return <div key={s} className={STADIO_COLORE[s]} style={{ width: `${(n / tot) * 100}%` }} />
      })}
    </div>
  )
}

export default function TutorIndex() {
  const totInErogazione = TUTOR_LIST.reduce((s, t) => s + t.perStadio[1] + t.perStadio[2] + t.perStadio[3], 0)
  const totInAttesa = TUTOR_LIST.reduce((s, t) => s + t.perStadio[0], 0)

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Clienti per tutor</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              {EROG_TOT} clienti, {TUTOR_LIST.length} tutor — sia chi è già in erogazione sia chi è ancora in attesa di informazioni.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/quadro-aziendale" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Quadro Aziendale
            </Link>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Carta className="bg-petrolio/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">{EROG_TOT} clienti totali</p>
            <p className="font-display mt-1 text-3xl font-bold tracking-tight text-petrolio-scuro">{TUTOR_LIST.length} tutor</p>
          </Carta>
          <Carta>
            <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Già in erogazione</p>
            <p className="font-display mt-1 text-2xl font-bold text-inchiostro">{totInErogazione}</p>
          </Carta>
          <Carta>
            <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">In attesa di informazioni</p>
            <p className="font-display mt-1 text-2xl font-bold text-rose-700">{totInAttesa}</p>
          </Carta>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-inchiostro/55">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-rose-500" />Informazioni mancanti</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-petrolio" />Copy e Caputo</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-teal-600" />Revisione Grippo</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-indigo-600" />Grafica Valentino</span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TUTOR_LIST.map((t) => (
            <Link key={t.slug} href={`/amministrazione/tutor/${t.slug}`} className="block">
              <Carta className="h-full transition-colors hover:border-petrolio/40">
                <div className="flex items-center justify-between">
                  <p className="font-display text-base font-bold text-inchiostro">{t.tutor}</p>
                  <span className="rounded-full bg-inchiostro/[0.06] px-2 py-0.5 text-[11px] font-bold text-inchiostro/60">{t.totale}</span>
                </div>
                <BarraDistribuzione perStadio={t.perStadio} />
                <p className="mt-2 text-[11px] text-inchiostro/45">
                  {t.perStadio[0]} in attesa · {t.perStadio[1] + t.perStadio[2] + t.perStadio[3]} in erogazione
                </p>
              </Carta>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
