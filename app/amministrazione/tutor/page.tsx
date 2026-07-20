'use client'

// ─── Clienti per tutor ─── (indice)
// In alto: blocchi KPI interattivi con i numeri AGGREGATI di tutti i tutor
// (in erogazione, manca documenti, senza call, in attesa di call, call prenotata).
// Cliccando un blocco l'elenco sotto si filtra: ogni tutor mostra solo i clienti
// di quella categoria. Senza filtro, ogni card mostra il riepilogo + pronto-consulenza.

import { useState } from 'react'
import Link from 'next/link'
import {
  CONSULENZE_FRANK, IN_ATTESA, TUTOR_FRANK, RigaFrank, ClienteAttesa,
  clientiTutorFrank, attesaTutor,
} from '@/lib/consulenzeFrank'
import { PRONTO_CONSULENZA, ProntoConsulenza, pcPerTutor } from '@/lib/prontoConsulenza'
import { fmtData } from '@/lib/quadroaziendale'
import { clientiBloccati } from '@/lib/blocco'
import { useApp, chiaveNoteCliente } from '@/lib/store'
import { STATI_CLIENTE } from '@/lib/types'
import ExportTutorExcel from '@/components/ExportTutorExcel'

const fmtGiorno = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

function Carta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-linea bg-carta p-4 shadow-sm ${className}`}>{children}</div>
}

type FiltroKey = 'erogazione' | 'documenti' | 'senza-call' | 'call-da-fissare' | 'call-prenotata' | 'bloccati'

/** una riga cliente generica da mostrare nell'elenco filtrato */
type Voce = { nome: string; destra: string; tono: 'verde' | 'rosso' | 'neutro' }

const pcMap = new Map(pcPerTutor().map((g) => [g.tutor.toUpperCase(), g]))
const pcDi = (tutor: string) => pcMap.get(tutor.toUpperCase())

/** clienti di un tutor per la categoria filtrata */
function vociTutor(tutor: string, filtro: FiltroKey): Voce[] {
  switch (filtro) {
    case 'erogazione':
      return clientiTutorFrank(tutor).map((r: RigaFrank) => ({
        nome: r.cliente,
        destra: r.consulenzaFrank ? `call ${fmtData(r.consulenzaFrank)}` : 'call da prenotare',
        tono: r.consulenzaFrank ? 'verde' : 'rosso',
      }))
    case 'senza-call':
      return clientiTutorFrank(tutor).filter((r) => !r.consulenzaFrank).map((r) => ({
        nome: r.cliente, destra: 'call da prenotare', tono: 'rosso',
      }))
    case 'documenti':
      return attesaTutor(tutor).map((c: ClienteAttesa) => ({
        nome: c.nome, destra: c.servizio || '—', tono: 'neutro',
      }))
    case 'call-da-fissare':
      return (pcDi(tutor)?.daFissare ?? []).map((c: ProntoConsulenza) => ({
        nome: c.cliente, destra: 'da fissare', tono: 'rosso',
      }))
    case 'call-prenotata':
      return (pcDi(tutor)?.fissate ?? []).map((c: ProntoConsulenza) => ({
        nome: c.cliente, destra: `${fmtGiorno(c.consulenza as string)}${c.ora ? ` · ${c.ora}` : ''}`, tono: 'verde',
      }))
    default:
      return [] // 'bloccati' è gestito a parte (serve lo stato condiviso)
  }
}

export default function TutorIndex() {
  const [filtro, setFiltro] = useState<FiltroKey | null>(null)
  const { state, silos, bloccoInfo, statoCliente } = useApp()

  // riepilogo per STATO di lavorazione: raggruppo tutti i clienti per lo stato
  // assegnato nelle note (stessa chiave nome+azienda).
  const universoStato = [
    ...CONSULENZE_FRANK.map((r) => ({ nome: r.cliente, tutor: r.tutor, chiave: chiaveNoteCliente(r.cliente) })),
    ...IN_ATTESA.map((c) => ({ nome: c.nome, tutor: c.tutor, chiave: chiaveNoteCliente(c.nome, c.azienda) })),
    ...PRONTO_CONSULENZA.map((c) => ({ nome: c.cliente, tutor: c.tutor, chiave: chiaveNoteCliente(c.cliente, c.azienda) })),
  ]
  const perStato: Record<string, { nome: string; tutor: string }[]> = {}
  for (const u of universoStato) { const s = statoCliente[u.chiave]; if (s) (perStato[s] ??= []).push({ nome: u.nome, tutor: u.tutor }) }
  const conStato = Object.values(perStato).reduce((a, x) => a + x.length, 0)

  // clienti bloccati (silo -1), risolti a cliente/tutor reale
  const bloccati = clientiBloccati(silos, bloccoInfo, state.pratiche)
  const vociBloccatiTutor = (tutor: string): Voce[] =>
    bloccati
      .filter((b) => b.tutor.toUpperCase() === tutor.toUpperCase())
      .map((b) => ({ nome: b.nome, destra: b.reminder ? `sblocco ${fmtGiorno(b.reminder)}` : 'bloccato', tono: 'rosso' as const }))

  // numeri aggregati (tutti i tutor)
  const inProd = CONSULENZE_FRANK.length
  const inAttesa = IN_ATTESA.length
  const senzaCall = CONSULENZE_FRANK.filter((r) => !r.consulenzaFrank).length
  const callDaFissare = PRONTO_CONSULENZA.filter((c) => !c.consulenza).length
  const callPrenotata = PRONTO_CONSULENZA.filter((c) => c.consulenza).length
  const totaleClienti = inProd + inAttesa + PRONTO_CONSULENZA.length

  const tiles: { key: FiltroKey; valore: number; titolo: string; sub: string; classe: string; num: string }[] = [
    { key: 'documenti', valore: inAttesa, titolo: 'Manca documenti', sub: 'questionario / AssessFirst da compilare', classe: 'bg-amber-50', num: 'text-amber-700' },
    { key: 'erogazione', valore: inProd, titolo: 'In erogazione', sub: 'report in lavorazione nella pipeline', classe: 'bg-petrolio/10', num: 'text-petrolio-scuro' },
    { key: 'senza-call', valore: senzaCall, titolo: 'Senza call fissata', sub: 'in erogazione, consulenza non prenotata', classe: 'bg-rose-50', num: 'text-rose-700' },
    { key: 'call-da-fissare', valore: callDaFissare, titolo: 'In attesa di call', sub: 'report pronto, consulenza da fissare', classe: 'bg-orange-50', num: 'text-orange-700' },
    { key: 'call-prenotata', valore: callPrenotata, titolo: 'Call prenotata', sub: 'report pronto, consulenza fissata', classe: 'bg-green-50', num: 'text-green-700' },
    { key: 'bloccati', valore: bloccati.length, titolo: 'Bloccati', sub: 'in pausa, con data di sblocco prevista', classe: 'bg-inchiostro/[0.06]', num: 'text-inchiostro' },
  ]

  // in modalità filtro: solo i tutor che hanno clienti in quella categoria
  const tutorVisibili = filtro
    ? TUTOR_FRANK.map((t) => ({ t, voci: filtro === 'bloccati' ? vociBloccatiTutor(t.tutor) : vociTutor(t.tutor, filtro) })).filter((x) => x.voci.length > 0)
    : TUTOR_FRANK.map((t) => ({ t, voci: [] as Voce[] }))

  const titoloFiltro = tiles.find((x) => x.key === filtro)?.titolo

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Clienti per tutor</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              {totaleClienti} clienti su {TUTOR_FRANK.length} tutor. I blocchi qui sotto sono i totali di tutti i tutor: cliccane uno per vedere <b className="text-inchiostro/70">chi</b> è in quella situazione, tutor per tutor.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ExportTutorExcel />
            <Link href="/amministrazione/gestione-clienti" className="rounded-xl border border-petrolio/40 bg-petrolio/[0.06] px-3 py-1.5 text-xs font-semibold text-petrolio-scuro hover:bg-petrolio/10">
              ⚙ Gestione clienti →
            </Link>
            <Link href="/amministrazione/consulenze-frank" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              Gantt Consulenze Frank →
            </Link>
            <Link href="/amministrazione/quadro-aziendale" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Quadro Aziendale
            </Link>
          </div>
        </header>

        {/* blocchi KPI interattivi (aggregati di tutti i tutor) */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => {
            const attivo = filtro === tile.key
            return (
              <button
                key={tile.key}
                onClick={() => setFiltro(attivo ? null : tile.key)}
                className={`rounded-2xl border p-4 text-left shadow-sm transition ${tile.classe} ${attivo ? 'border-inchiostro/40 ring-2 ring-inchiostro/15' : 'border-linea hover:border-inchiostro/25'}`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-inchiostro/45">{tile.titolo}</p>
                <p className={`font-display mt-1 text-3xl font-bold tracking-tight ${tile.num}`}>{tile.valore}</p>
                <p className="mt-1 text-[10.5px] leading-tight text-inchiostro/50">{tile.sub}</p>
                <p className={`mt-1.5 text-[10px] font-semibold ${attivo ? 'text-inchiostro/60' : 'text-inchiostro/30'}`}>{attivo ? '● filtro attivo — clicca per togliere' : 'clicca per filtrare'}</p>
              </button>
            )
          })}
        </div>

        {filtro && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-inchiostro/60">Filtro: <b className="text-inchiostro">{titoloFiltro}</b> · {tutorVisibili.reduce((s, x) => s + x.voci.length, 0)} clienti su {tutorVisibili.length} tutor</span>
            <button onClick={() => setFiltro(null)} className="rounded-lg border border-linea bg-carta px-2.5 py-1 text-xs font-semibold text-petrolio hover:bg-petrolio/5">mostra tutti</button>
          </div>
        )}

        {/* elenco tutor */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tutorVisibili.map(({ t, voci }) => (
            <Link key={t.slug} href={`/amministrazione/tutor/${t.slug}`} className="block">
              <Carta className="h-full transition-colors hover:border-petrolio/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-base font-bold text-inchiostro">{t.tutor}</p>
                  <span className="shrink-0 rounded-full bg-inchiostro/[0.06] px-2 py-0.5 text-[11px] font-bold text-inchiostro/60">
                    {filtro ? voci.length : t.totale}
                  </span>
                </div>

                {filtro ? (
                  // modalità filtro: elenco dei clienti di quella categoria
                  <ul className="mt-2 space-y-1">
                    {voci.map((v, i) => (
                      <li key={v.nome + i} className="flex items-center justify-between gap-2 border-t border-linea/50 pt-1 text-[11px] first:border-t-0 first:pt-0">
                        <span className="min-w-0 truncate text-inchiostro">{v.nome}</span>
                        <span className={`shrink-0 font-semibold ${v.tono === 'verde' ? 'text-green-700' : v.tono === 'rosso' ? 'text-rose-600' : 'text-inchiostro/45'}`}>{v.destra}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // vista di default: riepilogo + pronto-consulenza
                  <>
                    <p className="mt-1 text-[11px] text-inchiostro/45">{t.produzione} in produzione · {t.inAttesa} in attesa</p>
                    <div className="mt-2">
                      {t.senzaConsulenza > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">⚠ {t.senzaConsulenza} senza call</span>
                      ) : t.produzione > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">✓ call a posto</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-inchiostro/[0.06] px-2 py-0.5 text-[11px] font-bold text-inchiostro/50">nessuno in produzione</span>
                      )}
                    </div>
                    {(() => {
                      const pc = pcDi(t.tutor)
                      if (!pc) return null
                      return (
                        <div className="mt-3 border-t border-linea/60 pt-2">
                          <p className="text-[11px]">
                            <span className="font-semibold text-inchiostro/60">Pronto per consulenza</span>
                            {' · '}<span className="font-semibold text-green-700">{pc.fissate.length} fissate</span>
                            {pc.daFissare.length > 0 && <span className="font-semibold text-rose-700"> · {pc.daFissare.length} da fissare</span>}
                          </p>
                          <ul className="mt-1.5 space-y-1">
                            {[...pc.fissate, ...pc.daFissare].map((c, i) => (
                              <li key={c.cliente + i} className="flex items-center justify-between gap-2 border-t border-linea/50 pt-1 text-[11px] first:border-t-0 first:pt-0">
                                <span className="min-w-0 truncate text-inchiostro">{c.cliente}</span>
                                {c.consulenza
                                  ? <span className="shrink-0 font-semibold text-green-700">{fmtGiorno(c.consulenza)}{c.ora ? ` · ${c.ora}` : ''}</span>
                                  : <span className="shrink-0 font-semibold text-rose-600">da fissare</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })()}
                  </>
                )}
              </Carta>
            </Link>
          ))}
          {filtro && tutorVisibili.length === 0 && (
            <p className="text-sm text-inchiostro/50">Nessun cliente in questa categoria.</p>
          )}
        </div>

        {/* Riepilogo per STATO di lavorazione (assegnato nelle note dei colloqui) */}
        <div className="mt-10">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="font-display text-xl font-bold tracking-tight text-inchiostro">Riepilogo per stato</h2>
            <span className="text-[12px] text-inchiostro/55">{conStato} clienti con uno stato assegnato · lo stato si imposta nel riquadro «Note & aggiornamenti» di ogni cliente</span>
          </div>
          {conStato === 0 ? (
            <p className="mt-2 text-sm text-inchiostro/55">Nessuno stato assegnato per ora. Aprendo un cliente (scheda del tutor) e scegliendo lo «Stato lavorazione», comparirà qui raggruppato.</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {STATI_CLIENTE.filter((s) => (perStato[s]?.length ?? 0) > 0).map((s) => (
                <Carta key={s} className="h-full">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-bold text-inchiostro">{s}</p>
                    <span className="shrink-0 rounded-full bg-inchiostro/[0.08] px-2 py-0.5 text-[11px] font-bold text-inchiostro/70">{perStato[s].length}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {perStato[s].map((c, i) => (
                      <li key={c.nome + i} className="flex items-center justify-between gap-2 border-t border-linea/60 pt-1 text-[11px] first:border-t-0 first:pt-0">
                        <span className="min-w-0 truncate text-inchiostro">{c.nome}</span>
                        <span className="shrink-0 text-inchiostro/45">{c.tutor}</span>
                      </li>
                    ))}
                  </ul>
                </Carta>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
