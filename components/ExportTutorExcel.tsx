'use client'

// ─── Download Excel della pagina "Clienti per tutor" ───
// Esporta un CSV (apribile direttamente in Excel: separatore ';' + BOM per gli
// accenti) con una riga per cliente: tutor, cliente, stato, fase, consegna,
// consulenza Frank. Include i clienti in produzione (34) e quelli in attesa.

import { CONSULENZE_FRANK, FASI_FRANK, IN_ATTESA } from '@/lib/consulenzeFrank'
import { fmtData } from '@/lib/quadroaziendale'

function scarica() {
  const intest = ['Tutor', 'Cliente', 'Azienda', 'Stato', 'Fase', 'Consegna prevista', 'Consulenza Frank']
  const righeProd = [...CONSULENZE_FRANK]
    .sort((a, b) => a.tutor.localeCompare(b.tutor) || a.consegnaPrevista.getTime() - b.consegnaPrevista.getTime())
    .map((r) => [
      r.tutor,
      r.cliente,
      '',
      'In produzione',
      r.fase === 6 ? 'Consegnato' : `${r.fase} · ${FASI_FRANK[r.fase]?.label ?? ''}`,
      fmtData(r.consegnaPrevista),
      r.consulenzaFrank ? fmtData(r.consulenzaFrank) : 'da prenotare',
    ])
  const righeAttesa = [...IN_ATTESA]
    .sort((a, b) => a.tutor.localeCompare(b.tutor) || a.nome.localeCompare(b.nome))
    .map((c) => [c.tutor, c.nome, c.azienda, 'In attesa (questionario mancante)', '', '', ''])

  const tutte = [intest, ...righeProd, ...righeAttesa]
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

export default function ExportTutorExcel() {
  return (
    <button
      onClick={scarica}
      className="rounded-xl border border-green-300 bg-carta px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-50"
    >
      ⬇ Scarica Excel
    </button>
  )
}
