'use client'

// ─── Area Commerciale — Irene (pipeline v2) ───
// Irene SUPERVISIONA lo step autonomo 4a: la generazione dei report
// AssessFirst (un PDF per dipendente) e l'invio dell'email al tutor.
// Non opera più sui documenti: controlla che tutto fili liscio.

import { useApp, contaNotifiche } from '@/lib/store'
import { indiceFase } from '@/lib/fasi'
import { Pratica } from '@/lib/types'
import RoleShell from '@/components/RoleShell'
import EmptyState from '@/components/EmptyState'

const dataOraIt = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })

const STATO_AF: Record<string, { label: string; classi: string }> = {
  in_attesa: { label: 'In lavorazione', classi: 'bg-amber-100 text-amber-800' },
  generati: { label: 'Report generati', classi: 'bg-sky-100 text-sky-800' },
  email_inviata: { label: '✓ Email inviata al tutor', classi: 'bg-green-100 text-green-700' },
  errore: { label: '⚠ Errore — da controllare', classi: 'bg-rose-100 text-rose-700' },
}

function CartaSupervisione({ pratica }: { pratica: Pratica }) {
  const af = pratica.reportAF
  const stato = STATO_AF[af?.stato ?? 'in_attesa']
  const reportGenerati = pratica.allegati.filter((a) => a.tipo === 'report-af')

  return (
    <div className="rounded-2xl border border-linea bg-carta p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-display font-bold tracking-tight text-inchiostro">{pratica.azienda}</h3>
          <p className="truncate text-sm text-inchiostro/50">
            {pratica.cliente} · tutor: {pratica.tutor} · {pratica.dipendenti.length}{' '}
            {pratica.dipendenti.length === 1 ? 'dipendente' : 'dipendenti'}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${stato.classi}`}>{stato.label}</span>
      </div>

      {af?.dettaglio && (
        <p className="mt-2 text-xs text-inchiostro/50">
          {af.dettaglio}
          {af.dataOra ? ` · ${dataOraIt(af.dataOra)}` : ''}
        </p>
      )}

      {reportGenerati.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {reportGenerati.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-green-100 bg-green-50/60 px-3 py-2 text-sm">
              <span className="truncate text-green-900">📊 {r.nome}</span>
              <span className="shrink-0 text-xs text-green-700">generato in autonomia</span>
            </li>
          ))}
        </ul>
      )}

      {af?.stato === 'errore' && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          Qualcosa è andato storto in questo passaggio: verifica i log del worker e, se serve, rilancia la generazione.
        </div>
      )}
    </div>
  )
}

export default function PaginaIrene() {
  const { state } = useApp()

  const inGenerazione = state.pratiche.filter((p) => p.faseCorrente === 'generazione')
  const conReportAF = state.pratiche
    .filter((p) => p.reportAF && p.faseCorrente !== 'generazione')
    .sort((a, b) => (b.reportAF?.dataOra ?? '').localeCompare(a.reportAF?.dataOra ?? ''))
  const inArrivo = state.pratiche.filter((p) => indiceFase(p.faseCorrente) < indiceFase('generazione'))

  return (
    <RoleShell
      ruolo="Irene"
      colore="bg-violet-500"
      sottotitolo="Supervisione dello step autonomo: report AssessFirst + email ai tutor"
      notifiche={contaNotifiche(state, 'irene')}
    >
      <div className="space-y-10">
        <section className="anima anima-1 rounded-2xl border border-violet-200 bg-violet-50/70 p-5">
          <h2 className="font-display text-base font-bold tracking-tight text-violet-900">👁 Il tuo ruolo nella pipeline v2</h2>
          <p className="mt-1.5 text-sm leading-6 text-violet-800/80">
            I report AssessFirst (uno per dipendente) vengono generati <strong>in autonomia</strong> dall&apos;agente
            e inviati via email al tutor insieme al report principale. Qui controlli che ogni pratica completi il
            passaggio senza intoppi: se qualcosa va storto, lo vedi subito.
          </p>
        </section>

        <section className="anima anima-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight text-inchiostro">In lavorazione adesso</h2>
            <span className="text-sm text-inchiostro/40">{inGenerazione.length} in generazione</span>
          </div>
          <div className="mt-3 space-y-3">
            {inGenerazione.length === 0 ? (
              <EmptyState titolo="Nessuna generazione in corso" sottotitolo="Quando un tutor preme «Cliente pronto», la pratica compare qui." />
            ) : (
              inGenerazione.map((p) => <CartaSupervisione key={p.id} pratica={p} />)
            )}
          </div>
        </section>

        <section className="anima anima-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight text-inchiostro">Report AF completati</h2>
            <span className="text-sm text-inchiostro/40">{conReportAF.length} pratiche</span>
          </div>
          <div className="mt-3 space-y-3">
            {conReportAF.length === 0 ? (
              <EmptyState titolo="Ancora nessun report generato" sottotitolo="Gli esiti dello step autonomo compariranno qui." />
            ) : (
              conReportAF.map((p) => <CartaSupervisione key={p.id} pratica={p} />)
            )}
          </div>
        </section>

        <section className="anima anima-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight text-inchiostro">In arrivo dai tutor</h2>
            <span className="text-sm text-inchiostro/40">{inArrivo.length} in preparazione</span>
          </div>
          <p className="mt-1 text-xs text-inchiostro/45">
            Pratiche ancora in mano ai tutor (vendita o raccolta documenti): nessuna azione richiesta.
          </p>
          <ul className="mt-3 space-y-2">
            {inArrivo.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-linea bg-carta px-4 py-2.5 text-sm">
                <span className="truncate text-inchiostro/70">
                  {p.azienda} <span className="text-inchiostro/40">· {p.cliente}</span>
                </span>
                <span className="shrink-0 text-xs text-inchiostro/40">
                  {p.faseCorrente === 'vendita' ? 'Vendita registrata' : 'Raccolta documenti'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </RoleShell>
  )
}
