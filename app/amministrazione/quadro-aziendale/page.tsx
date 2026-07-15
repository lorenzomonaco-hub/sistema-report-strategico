'use client'

// ─── Quadro Aziendale — impatto economico + vendite ───
// Il dettaglio operativo dei clienti (fasi, consegne, Gantt) vive ora solo in
// /amministrazione/consulenze-frank. Qui resta il quadro per l'amministrazione:
// quanto fanno risparmiare gli agenti e l'andamento delle vendite.

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  AGENTE_IMPAG, AGENTE_SLIDE, AGENTE_TESTO, ATTIVAZIONE_AGENTI, MEDIANA_STAGE2_RECENTE, MEDIANA_STAGE3_RECENTE,
  MEDIANA_STAGE4_RECENTE, RISPARMIO_ANNUO, RISPARMIO_GIORNO, RISPARMIO_PERSONALE, RISPARMIO_SECONDO,
  TEAM_RESIDUO, VENDITE_MENSILI, fmtData, fmtEuro,
} from '@/lib/quadroaziendale'

const fmtEuroDec = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

function Carta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-linea bg-carta p-4 shadow-sm ${className}`}>{children}</div>
}

/** Portafoglio risparmi: cresce ogni secondo dal giorno di attivazione degli agenti. */
function Portafoglio() {
  const [ora, setOra] = useState<number | null>(null)
  useEffect(() => {
    setOra(Date.now())
    const t = setInterval(() => setOra(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const accumulato = ora === null ? 0 : Math.max(0, ((ora - ATTIVAZIONE_AGENTI.getTime()) / 1000) * RISPARMIO_SECONDO)
  return (
    <Carta className="bg-green-600/10">
      <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Portafoglio risparmi — dal {fmtData(ATTIVAZIONE_AGENTI)}</p>
      <p className="font-display mt-1 text-4xl font-bold tracking-tight text-green-700 tabular-nums">
        {ora === null ? fmtEuro(0) : fmtEuroDec(accumulato)}
      </p>
      <p className="mt-1 text-[11px] text-inchiostro/50">cresce di {fmtEuro(RISPARMIO_GIORNO)} al giorno · {fmtEuro(RISPARMIO_ANNUO)} all&apos;anno</p>
    </Carta>
  )
}

function SezioneImpatto() {
  const agenteMin = AGENTE_TESTO + AGENTE_SLIDE + AGENTE_IMPAG // 47 min: testo + immagini + grafica
  const codaUmanaGg = MEDIANA_STAGE3_RECENTE + MEDIANA_STAGE4_RECENTE // ~24 gg lavorativi di coda
  const totalePrimaGg = MEDIANA_STAGE2_RECENTE + MEDIANA_STAGE3_RECENTE + MEDIANA_STAGE4_RECENTE
  return (
    <div className="space-y-4">
      {/* headline: portafoglio che cresce + chi resta */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><Portafoglio /></div>
        <Carta>
          <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Restano sulla pipeline</p>
          <p className="font-display mt-1 text-2xl font-bold tracking-tight text-petrolio-scuro">{TEAM_RESIDUO.join(' + ')}</p>
          <p className="mt-1 text-[11px] text-inchiostro/50">solo il copy; tutti gli altri passaggi li fanno gli agenti</p>
        </Carta>
      </div>

      {/* dettaglio per persona */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Chi non serve più su questa pipeline — costo assorbito</h3>
        <div className="mt-2 overflow-x-auto rounded-2xl border border-linea bg-carta shadow-sm">
          <div className="min-w-[620px]">
            <div className="grid items-center gap-3 border-b border-linea bg-inchiostro/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-inchiostro/40"
                 style={{ gridTemplateColumns: '1fr 130px 90px 110px 100px' }}>
              <div>Persona · ruolo</div><div>Salario/anno (stima)</div><div>% tempo sul progetto</div><div className="text-right">Risparmio/anno</div><div className="text-right">Al giorno</div>
            </div>
            {RISPARMIO_PERSONALE.map((p) => (
              <div key={p.nome} className="grid items-center gap-3 border-b border-linea/70 px-3 py-2.5 last:border-b-0"
                   style={{ gridTemplateColumns: '1fr 130px 90px 110px 100px' }}>
                <div><span className="text-[13px] font-bold text-inchiostro">{p.nome}</span> <span className="text-[11px] text-inchiostro/45">· {p.ruolo}</span></div>
                <div className="text-[12px] tabular-nums text-inchiostro/70">~{fmtEuro(p.salario)}</div>
                <div className="text-[12px] tabular-nums text-inchiostro/70">{Math.round(p.frazione * 100)}%</div>
                <div className="text-right text-[12.5px] font-bold tabular-nums text-green-700">{fmtEuro(p.salario * p.frazione)}</div>
                <div className="text-right text-[12px] tabular-nums text-green-700/80">{fmtEuro((p.salario * p.frazione) / 365)}</div>
              </div>
            ))}
            <div className="grid items-center gap-3 bg-green-600/[0.06] px-3 py-2.5 text-[13px] font-bold"
                 style={{ gridTemplateColumns: '1fr 130px 90px 110px 100px' }}>
              <div className="text-inchiostro">Totale</div><div /><div />
              <div className="text-right tabular-nums text-green-700">{fmtEuro(RISPARMIO_ANNUO)}</div>
              <div className="text-right tabular-nums text-green-700">{fmtEuro(RISPARMIO_GIORNO)}</div>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-inchiostro/45">
          Salari indicati come <b className="text-inchiostro/60">stima</b>. La colonna «% tempo sul progetto» è la quota del tempo che ciascuno dedicava al progetto <b className="text-inchiostro/60">report consulenze</b> (non al totale del suo lavoro).
        </p>
      </div>

      {/* capacità: prima vs ora */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Carta>
          <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Quanto ci mettevamo PRIMA (dato reale)</p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-inchiostro/75">
            Dall&apos;ingresso alla consegna: <b className="text-inchiostro">~{totalePrimaGg} giorni lavorativi</b> (mediana ultimi 90gg). Dopo che il copy finiva, il report faceva ancora <b className="text-inchiostro">~{codaUmanaGg} giorni lavorativi</b> di coda umana: revisione testo (Grippo, {MEDIANA_STAGE3_RECENTE}gg) + grafica (Valentino, {MEDIANA_STAGE4_RECENTE}gg).
          </p>
        </Carta>
        <Carta className="bg-petrolio/[0.06]">
          <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Quanto ci mettiamo ORA con gli agenti</p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-inchiostro/75">
            Testo, immagini e grafica li fa l&apos;agente in <b className="text-inchiostro">{agenteMin} minuti</b> (35+10+2): quei ~{codaUmanaGg} giorni lavorativi di coda crollano a <b className="text-inchiostro">meno di 1 giornata</b>. Il collo di bottiglia resta solo la scrittura ({TEAM_RESIDUO.join(' + ')}).
          </p>
          <p className="mt-2 text-[11px] text-ambra">⚠ Il tempo di consegna reale end-to-end col nuovo modello è ancora in raccolta: questa è la proiezione dai tempi degli agenti, non una media misurata.</p>
        </Carta>
      </div>
      <Carta className="border-dashed">
        <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Guadagno da capacità — in arrivo</p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-inchiostro/75">
          Il portafoglio qui sopra conta per ora solo il <b className="text-inchiostro">costo del personale</b> assorbito. Si aggiungerà in automatico un secondo pezzo, molto più grande: <b className="text-inchiostro">quanto guadagnavamo</b> con un cliente che ci metteva in media <b className="text-inchiostro">94 giorni</b> alla consegna, contro <b className="text-inchiostro">quanto guadagneremo/risparmieremo</b> col nuovo metodo (più report consegnati nello stesso tempo = più vendite evadibili).
        </p>
        <p className="mt-2 text-[11px] text-ambra">⚠ Questo dato comparirà <b>solo quando la pipeline sarà aggiornata con i clienti veri</b> e avremo i tempi di consegna reali del nuovo metodo — non prima, e non con numeri messi a caso.</p>
      </Carta>
    </div>
  )
}

function SezioneVendite() {
  const maxV = Math.max(...VENDITE_MENSILI.map((x) => x.vendite))
  return (
    <div>
      <h3 className="font-display text-xl font-bold tracking-tight text-inchiostro">Le vendite</h3>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Carta>
          <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Le vendite sono crollate, non la produzione</p>
          <div className="mt-2 space-y-1">
            {VENDITE_MENSILI.map((m) => (
              <div key={m.mese} className="flex items-center gap-2 text-[11px]">
                <span className="w-14 shrink-0 text-inchiostro/50">{m.mese}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-inchiostro/[0.05]">
                  <div className="h-full rounded-full bg-petrolio" style={{ width: `${(m.vendite / maxV) * 100}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right font-bold tabular-nums text-petrolio-scuro">{m.vendite}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-inchiostro/60">
            Da <b className="text-inchiostro">69 vendite/mese</b> (luglio 2025, il picco) a <b className="text-inchiostro">2-4/mese</b> negli ultimi quattro mesi — oltre il 90% in meno. Luglio 2026 è parziale (solo fino al 13). Non è un buco nei dati: sia le fatture sia i questionari ricevuti mostrano lo stesso calo, sostenuto da quasi un anno.
          </p>
        </Carta>
        <Carta>
          <p className="text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Perché la coda si è svuotata, e cosa nasconde</p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-inchiostro/75">
            La lista d&apos;attesa è calata perché <b className="text-inchiostro">sono arrivati molti meno clienti nuovi</b>, non perché il team ha smaltito più in fretta. Anzi: chi entra oggi in produzione aspetta di più di chi entrava un anno fa (57→70gg su copy+Caputo, 15→21gg su Grippo).
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-inchiostro/75">
            Con gli agenti il collo di bottiglia dei revisori sparisce: se le vendite ripartono, la coda non si riforma più agli stessi ritmi lenti — la capacità di evasione cresce di molto.
          </p>
        </Carta>
      </div>
    </div>
  )
}

export default function QuadroAziendale() {
  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Impatto economico e vendite</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/55">
              Quanto ci fanno risparmiare gli agenti e come vanno le vendite. Il dettaglio operativo dei clienti (fasi, consegne, timeline) è nel Gantt Consulenze Frank.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/consulenze-frank" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              Gantt Consulenze Frank →
            </Link>
            <Link href="/amministrazione/tutor" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              Clienti per tutor →
            </Link>
            <Link href="/amministrazione" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">
              ← Quadro Amministrativo
            </Link>
          </div>
        </header>

        <div className="mt-6 space-y-8">
          <SezioneImpatto />
          <SezioneVendite />
        </div>
      </div>
    </div>
  )
}
