// ─── Risoluzione dei clienti «bloccati» ───
// Un cliente è bloccato quando il suo silo condiviso è 'bloccato' (silo -1).
// Lo slug può essere di tre tipi: frank (slugFrank), pratica (p-<id>) o
// pronto-consulenza (pc-<i>-<slug>). Qui li ri-mappo al cliente reale così da
// mostrarli/contarli nella vista tutor e includerli nell'export.

import { CONSULENZE_FRANK, slugFrank } from './consulenzeFrank'
import { PRONTO_CONSULENZA } from './prontoConsulenza'
import { BloccoInfo, Pratica } from './types'

export type ClienteBloccato = {
  slug: string
  tutor: string
  nome: string
  azienda: string
  reminder?: string
  nota?: string
}

export function clientiBloccati(
  silos: Record<string, string>,
  bloccoInfo: Record<string, BloccoInfo>,
  pratiche: Pratica[],
): ClienteBloccato[] {
  const out: ClienteBloccato[] = []
  for (const slug in silos) {
    if (silos[slug] !== 'bloccato') continue
    const info = bloccoInfo[slug]
    if (slug.startsWith('pc-')) {
      const i = parseInt(slug.split('-')[1], 10)
      const c = PRONTO_CONSULENZA[i]
      if (c) out.push({ slug, tutor: c.tutor, nome: c.cliente, azienda: c.azienda, reminder: info?.reminder, nota: info?.nota })
    } else if (slug.startsWith('p-')) {
      const p = pratiche.find((x) => `p-${x.id}` === slug)
      if (p) out.push({ slug, tutor: p.tutor, nome: p.cliente || p.azienda, azienda: p.azienda, reminder: info?.reminder, nota: info?.nota })
    } else {
      const r = CONSULENZE_FRANK.find((x) => slugFrank(x.cliente) === slug)
      if (r) out.push({ slug, tutor: r.tutor, nome: r.cliente, azienda: '', reminder: info?.reminder, nota: info?.nota })
    }
  }
  return out
}
