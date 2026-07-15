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
  origine: 'frank' | 'nuovo'
  /** presente per i 34: dà accesso a milestone, timeline e pagina di log */
  riga?: RigaFrank
  /** presente per i nuovi */
  praticaId?: string
  nDipendenti?: number
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
    return {
      slug,
      nome: r.cliente,
      owner: r.owner,
      tutor: r.tutor,
      silo: (silos[slug] ?? 'copy') as SiloId,
      consegnaPrevista: r.consegnaPrevista,
      origine: 'frank' as const,
      riga: r,
    }
  })

  const nuovi: ClientePipeline[] = state.pratiche.map((p) => ({
    slug: slugPratica(p.id),
    nome: p.azienda,
    owner: p.cliente,
    tutor: p.tutor,
    silo: siloDaPratica(p, silos),
    consegnaPrevista: null,
    origine: 'nuovo' as const,
    praticaId: p.id,
    nDipendenti: p.dipendenti.length,
  }))

  return [...frank, ...nuovi]
}
