'use client'

// ─── Download Excel della pagina "Clienti per tutor" ───
// Esporta un CSV (apribile in Excel: separatore ';' + BOM per gli accenti) con
// una riga per cliente: dati vendita, stato/fase, consulenza, stato BLOCCO e le
// NOTE inserite dall'amministrazione. Copre i 34 in produzione, i 52 in attesa
// e i 63 pronto-per-consulenza.

import { CONSULENZE_FRANK, FASI_FRANK, IN_ATTESA, slugFrank } from '@/lib/consulenzeFrank'
import { PRONTO_CONSULENZA, slugConsulenza } from '@/lib/prontoConsulenza'
import { fmtData } from '@/lib/quadroaziendale'
import { venditaDaNome } from '@/lib/venditeElisa'
import { useApp, chiaveNoteCliente } from '@/lib/store'

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

export default function ExportTutorExcel() {
  const { silos, bloccoInfo, noteClienti, statoCliente } = useApp()

  const scarica = () => {
    // note di un cliente, concatenate in un'unica cella
    const note = (cliente: string, azienda?: string) =>
      (noteClienti[chiaveNoteCliente(cliente, azienda)] ?? [])
        .map((n) => `${dataIt(n.dataOra)}: ${n.testo}`)
        .join(' | ')
    const stato = (cliente: string, azienda?: string) => statoCliente[chiaveNoteCliente(cliente, azienda)] ?? ''
    const bloccato = (slug: string) => (silos[slug] === 'bloccato' ? 'Sì' : '')
    const sblocco = (slug: string) => (bloccoInfo[slug]?.reminder ? dataIt(bloccoInfo[slug]!.reminder!) : '')

    const intest = ['Tutor', 'Cliente', 'Azienda', 'Categoria pipeline', 'Stato lavorazione', 'Fase', 'Consegna prevista', 'Consulenza Frank', 'Data vendita', 'Prezzo', 'Bloccato', 'Data sblocco prevista', 'Note']

    const righeProd = [...CONSULENZE_FRANK]
      .sort((a, b) => a.tutor.localeCompare(b.tutor) || a.consegnaPrevista.getTime() - b.consegnaPrevista.getTime())
      .map((r) => {
        const v = venditaDaNome(r.cliente)
        const slug = slugFrank(r.cliente)
        return [
          r.tutor, r.cliente, v?.azienda ?? '', 'In produzione', stato(r.cliente),
          r.fase === 6 ? 'Consegnato' : `${r.fase} · ${FASI_FRANK[r.fase]?.label ?? ''}`,
          fmtData(r.consegnaPrevista),
          r.consulenzaFrank ? fmtData(r.consulenzaFrank) : 'da prenotare',
          v ? dataIt(v.dataVendita) : '', v?.prezzo ?? '',
          bloccato(slug), sblocco(slug), note(r.cliente),
        ]
      })

    const righeAttesa = [...IN_ATTESA]
      .map((c, i) => ({ c, slug: `p-pr-attesa-${i}` }))
      .sort((a, b) => a.c.tutor.localeCompare(b.c.tutor) || a.c.nome.localeCompare(b.c.nome))
      .map(({ c, slug }) => {
        const v = venditaDaNome(c.nome, c.azienda)
        return [
          c.tutor, c.nome, c.azienda, 'In attesa (questionario mancante)', stato(c.nome, c.azienda), '', '', '',
          v ? dataIt(v.dataVendita) : '', v?.prezzo ?? '',
          bloccato(slug), sblocco(slug), note(c.nome, c.azienda),
        ]
      })

    const righePronto = PRONTO_CONSULENZA
      .map((c, i) => ({ c, slug: slugConsulenza(i, c) }))
      .sort((a, b) => a.c.tutor.localeCompare(b.c.tutor) || a.c.cliente.localeCompare(b.c.cliente))
      .map(({ c, slug }) => [
        c.tutor, c.cliente, c.azienda, 'Pronto per consulenza', stato(c.cliente, c.azienda), '',
        c.consulenza ? `${dataIt(c.consulenza)}${c.ora ? ` ${c.ora}` : ''}` : 'da fissare',
        c.dataVendita ? dataIt(c.dataVendita) : '', c.prezzo ?? '',
        bloccato(slug), sblocco(slug), note(c.cliente, c.azienda),
      ])

    const tutte = [intest, ...righeProd, ...righeAttesa, ...righePronto]
    const csv = '\uFEFF' + tutte
      .map((riga) => riga.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))
      .join('\r\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clienti-per-tutor.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={scarica}
      className="rounded-xl border border-green-300 bg-carta px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-50"
    >
      ⬇ Scarica Excel
    </button>
  )
}
