/** Confronto affiancato prima/dopo con evidenziazione delle righe cambiate. */
export default function DiffView({ prima, dopo }: { prima: string; dopo: string }) {
  const righePrima = prima.split('\n')
  const righeDopo = dopo.split('\n')
  const setPrima = new Set(righePrima)
  const setDopo = new Set(righeDopo)

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">Prima</div>
        <div className="max-h-72 overflow-y-auto bg-white p-3 font-mono text-xs leading-5">
          {righePrima.map((r, i) => (
            <div key={i} className={!setDopo.has(r) && r.trim() ? 'bg-red-50 text-red-800' : 'text-slate-600'}>
              {r || ' '}
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">Dopo</div>
        <div className="max-h-72 overflow-y-auto bg-white p-3 font-mono text-xs leading-5">
          {righeDopo.map((r, i) => (
            <div key={i} className={!setPrima.has(r) && r.trim() ? 'bg-green-50 text-green-800' : 'text-slate-600'}>
              {r || ' '}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
