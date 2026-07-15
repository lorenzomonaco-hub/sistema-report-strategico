// ─── Clienti per tutor ─── (indice)
// Gli stessi clienti del Gantt Consulenze Frank, raggruppati per tutor. Per
// ciascun tutor: quanti clienti in produzione e quanti NON hanno ancora la
// consulenza con Frank prenotata (così il tutor sa chi manca e può segnalarlo).

import Link from 'next/link'
import { CONSULENZE_FRANK, IN_ATTESA, TUTOR_FRANK } from '@/lib/consulenzeFrank'

function Carta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-linea bg-carta p-4 shadow-sm ${className}`}>{children}</div>
}

export default function TutorIndex() {
  const inProd = CONSULENZE_FRANK.length
  const inAttesa = IN_ATTESA.length
  const senzaConsTot = CONSULENZE_FRANK.filter((r) => !r.consulenzaFrank).length

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Clienti per tutor</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              {inProd} clienti in produzione + {inAttesa} in attesa (questionario/AssessFirst non ancora compilati), {TUTOR_FRANK.length} tutor. Il badge rosso segnala chi non ha ancora prenotato la consulenza con Frank.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/consulenze-frank" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              Gantt Consulenze Frank →
            </Link>
            <Link href="/amministrazione/quadro-aziendale" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Quadro Aziendale
            </Link>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Carta className="bg-petrolio/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">{inProd + inAttesa} clienti · {TUTOR_FRANK.length} tutor</p>
            <p className="font-display mt-1 text-3xl font-bold tracking-tight text-petrolio-scuro">{inProd}</p>
            <p className="mt-1 text-[11px] text-inchiostro/50">in produzione</p>
          </Carta>
          <Carta>
            <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">In attesa</p>
            <p className="font-display mt-1 text-2xl font-bold text-inchiostro/70">{inAttesa}</p>
            <p className="mt-1 text-[11px] text-inchiostro/50">questionario / AssessFirst da compilare</p>
          </Carta>
          <Carta className={senzaConsTot > 0 ? 'bg-rose-50' : ''}>
            <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Senza consulenza prenotata</p>
            <p className="font-display mt-1 text-2xl font-bold text-rose-700">{senzaConsTot}</p>
            <p className="mt-1 text-[11px] text-inchiostro/50">da sollecitare / segnalare</p>
          </Carta>
          <Carta>
            <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Consulenza prenotata</p>
            <p className="font-display mt-1 text-2xl font-bold text-green-700">{inProd - senzaConsTot}</p>
          </Carta>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TUTOR_FRANK.map((t) => (
            <Link key={t.slug} href={`/amministrazione/tutor/${t.slug}`} className="block">
              <Carta className="h-full transition-colors hover:border-petrolio/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-base font-bold text-inchiostro">{t.tutor}</p>
                  <span className="shrink-0 rounded-full bg-inchiostro/[0.06] px-2 py-0.5 text-[11px] font-bold text-inchiostro/60">{t.totale}</span>
                </div>
                <p className="mt-1 text-[11px] text-inchiostro/45">{t.produzione} in produzione · {t.inAttesa} in attesa</p>
                <div className="mt-2">
                  {t.senzaConsulenza > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                      ⚠ {t.senzaConsulenza} senza consulenza
                    </span>
                  ) : t.produzione > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">
                      ✓ consulenze a posto
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-inchiostro/[0.06] px-2 py-0.5 text-[11px] font-bold text-inchiostro/50">
                      nessuno in produzione
                    </span>
                  )}
                </div>
              </Carta>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
