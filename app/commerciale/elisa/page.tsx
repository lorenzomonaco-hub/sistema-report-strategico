'use client'

// ─── Area Commerciale — Elisa ───
// Elisa si occupa dei DOCUMENTI. Vede i clienti che il tutor ha registrato
// allo step 0 (vendita registrata, documenti mancanti), carica per ognuno
// questionario, trascrizione e i 4 AssessFirst di ogni persona, e quando è
// tutto presente li fa passare allo step 1 (presa in carico dal Copy).

import { useState } from 'react'
import Link from 'next/link'
import { useApp, contaNotifiche } from '@/lib/store'
import { documentiTutorPronti, indiceFase } from '@/lib/fasi'
import RoleShell from '@/components/RoleShell'
import EmptyState from '@/components/EmptyState'
import { CartaRaccolta } from '@/components/RaccoltaDocumenti'

function BannerConferma({ testo, onChiudi }: { testo: React.ReactNode; onChiudi: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
      <p className="text-sm text-green-800">{testo}</p>
      <button onClick={onChiudi} aria-label="Chiudi avviso" className="shrink-0 text-green-700/60 transition hover:text-green-800">✕</button>
    </div>
  )
}

function TitoloSezione({ titolo, conteggio }: { titolo: string; conteggio?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="font-display text-xl font-bold tracking-tight text-inchiostro">{titolo}</h2>
      {conteggio && <span className="shrink-0 text-xs text-inchiostro/40">{conteggio}</span>}
    </div>
  )
}

export default function PaginaElisa() {
  const { state } = useApp()
  const [aziendaConfermata, setAziendaConfermata] = useState<string | null>(null)

  // Solo i clienti che il tutor ha esplicitamente inviato a Elisa compaiono qui.
  const step0 = state.pratiche.filter((p) => (p.faseCorrente === 'vendita' || p.faseCorrente === 'raccolta-documenti') && p.inviatoElisa)
  const daCaricare = step0.filter((p) => !documentiTutorPronti(p))
  const pronti = step0.filter((p) => documentiTutorPronti(p))
  const avviate = state.pratiche.filter((p) => indiceFase(p.faseCorrente) >= indiceFase('generazione'))

  return (
    <RoleShell
      ruolo="Elisa"
      colore="bg-amber-500"
      sottotitolo="Carichi i documenti dei clienti registrati dai tutor. Quando sono completi, il cliente passa allo step 1 (Copy)."
      notifiche={contaNotifiche(state, 'elisa')}
    >
      <div className="space-y-10">
        <section className="anima anima-1">
          <TitoloSezione titolo="Step 0 — documenti da caricare" conteggio={`${step0.length} allo step 0`} />
          <p className="mt-1 text-xs text-inchiostro/45">
            Per ogni cliente: questionario e trascrizione dell&rsquo;azienda + i 4 AssessFirst di ogni persona. I file restano a sistema fino al report AssessFirst. Con «Documenti completi» il cliente passa allo <strong>step 1</strong>.
          </p>
          <div className="mt-3 space-y-4">
            {aziendaConfermata && (
              <BannerConferma
                testo={<>Documenti completi per <strong>{aziendaConfermata}</strong>: il cliente è passato allo step 1, la pipeline è partita.</>}
                onChiudi={() => setAziendaConfermata(null)}
              />
            )}
            {step0.length === 0 ? (
              <EmptyState titolo="Nessun cliente da lavorare" sottotitolo="Compaiono qui solo i clienti che il tutor ti invia esplicitamente dalla sua area (bottone «Invia a Elisa»)." icona="📂" />
            ) : (
              <>
                {daCaricare.map((p) => <CartaRaccolta key={p.id} pratica={p} autore="Elisa" onConfermata={setAziendaConfermata} />)}
                {pronti.map((p) => <CartaRaccolta key={p.id} pratica={p} autore="Elisa" onConfermata={setAziendaConfermata} />)}
              </>
            )}
          </div>
        </section>

        <section className="anima anima-2">
          <TitoloSezione titolo="Già avviate (step 1+)" conteggio={`${avviate.length} client${avviate.length === 1 ? 'e' : 'i'}`} />
          <p className="mt-1 text-xs text-inchiostro/45">Clienti i cui documenti sono già completi: sono nella pipeline, non serve fare altro.</p>
          <div className="mt-3 space-y-2">
            {avviate.length === 0 ? (
              <EmptyState titolo="Nessun cliente avviato" sottotitolo="I clienti con documenti completi compariranno qui." icona="✅" />
            ) : (
              avviate.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-linea bg-carta px-4 py-2.5 shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-inchiostro">{p.azienda}</p>
                    <p className="truncate text-xs text-inchiostro/50">{p.cliente}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> in pipeline
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="anima anima-3 rounded-2xl border border-linea bg-carta p-5 text-center shadow-sm">
          <p className="mx-auto max-w-2xl text-sm leading-6 text-inchiostro/50">
            I clienti li registra il <Link href="/commerciale/tutor" className="font-semibold text-petrolio hover:underline">Tutor</Link>. Tu completi i documenti e li mandi in pipeline.
          </p>
        </footer>
      </div>
    </RoleShell>
  )
}
