'use client'

// ─── Lista clienti unificata della pipeline ───
// Un'unica fonte per board /erogazione, Gantt Consulenze Frank e vista tutor:
//   · i 34 clienti UFFICIALI (CONSULENZE_FRANK) — hanno date reali e milestone;
//   · i clienti NUOVI registrati in area commerciale (Pratiche del backend
//     condiviso) — nascono allo step 0 e non hanno ancora una data di consegna.
// La posizione nel silo di TUTTI viene dallo stato condiviso (useApp().silos).

import { CONSULENZE_FRANK, RigaFrank, slugFrank } from './consulenzeFrank'
import { SiloId } from './pipelineSilos'
import { Pratica } from './types'
import { slugPratica, useApp } from './store'
import { venditaDaNome } from './venditeElisa'
import { PRONTO_CONSULENZA } from './prontoConsulenza'

export type ClientePipeline = {
  slug: string
  /** nome mostrato in grande (azienda per i nuovi, nome cliente per i 34) */
  nome: string
  /** riga sotto: owner del passaggio (34) o titolare (nuovi) */
  owner: string
  tutor: string
  silo: SiloId
  /** data di consegna prevista: null per i nuovi (ancora da programmare) */
  consegnaPrevista: Date | null
  /** 'frank' = 34 ufficiali; 'nuovo' = registrati in commerciale;
   *  'attesa' = clienti reali senza questionario ancora compilato (step 0) */
  origine: 'frank' | 'nuovo' | 'attesa' | 'consulenza'
  /** presente per i 34: dà accesso a milestone, timeline e pagina di log */
  riga?: RigaFrank
  /** presente per i nuovi */
  praticaId?: string
  nDipendenti?: number
  /** dati vendita: dal cliente (Pratica) o dal foglio di elisa.mazza (match cognome) */
  dataVendita?: string
  prezzo?: string
  prodotto?: string
  /** per «pronto per consulenza»: data ISO della consulenza Frank (null = da fissare) */
  consulenza?: string | null
  consulenzaOra?: string
}

/** Silo di una Pratica nuova: dallo stato condiviso, con fallback dalla fase. */
function siloDaPratica(p: Pratica, silos: Record<string, SiloId>): SiloId {
  const s = silos[slugPratica(p.id)]
  if (s) return s
  if (p.faseCorrente === 'vendita' || p.faseCorrente === 'raccolta-documenti') return 'documenti'
  if (p.faseCorrente === 'completata') return 'consegnato'
  return 'copy'
}

/** Tutti i clienti della pipeline: 34 ufficiali + nuovi dal backend condiviso. */
export function useClientiPipeline(): ClientePipeline[] {
  const { state, silos } = useApp()

  const frank: ClientePipeline[] = CONSULENZE_FRANK.map((r) => {
    const slug = slugFrank(r.cliente)
    const v = venditaDaNome(r.cliente)
    return {
      slug,
      nome: r.cliente,
      owner: r.owner,
      tutor: r.tutor,
      silo: (silos[slug] ?? 'copy') as SiloId,
      consegnaPrevista: r.consegnaPrevista,
      origine: 'frank' as const,
      riga: r,
      dataVendita: v?.dataVendita,
      prezzo: v?.prezzo,
    }
  })

  const nuovi: ClientePipeline[] = state.pratiche.map((p) => {
    const v = venditaDaNome(p.azienda, p.cliente)
    return {
      slug: slugPratica(p.id),
      nome: p.azienda,
      owner: p.cliente,
      tutor: p.tutor,
      silo: siloDaPratica(p, silos),
      consegnaPrevista: null,
      origine: 'nuovo' as const,
      praticaId: p.id,
      nDipendenti: p.dipendenti.length,
      dataVendita: p.dataVendita || v?.dataVendita,
      prezzo: p.prezzo || v?.prezzo,
      prodotto: p.prodotto,
    }
  })

  // Clienti PRONTO PER CONSULENZA (report finito, in attesa consulenza) → silo Consegnato.
  const consulenza: ClientePipeline[] = PRONTO_CONSULENZA.map((c, i) => ({
    slug: `pc-${i}-${slugFrank(c.azienda || c.cliente)}`,
    nome: c.cliente,
    owner: c.azienda,
    tutor: c.tutor,
    silo: 'consegnato' as SiloId,
    consegnaPrevista: null,
    origine: 'consulenza' as const,
    consulenza: c.consulenza,
    consulenzaOra: c.ora,
    dataVendita: c.dataVendita,
    prezzo: c.prezzo,
  }))

  return [...frank, ...nuovi, ...consulenza]
}
