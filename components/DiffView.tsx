/** Confronto affiancato prima/dopo con evidenziazione delle righe cambiate. */
export default function DiffView({ prima, dopo }: { prima: string; dopo: string }) {
  const righePrima = prima.split('\n')
  const righeDopo = dopo.split('\n')
  const setPrima = new Set(righePrima)
  const setDopo = new Set(righeDopo)

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-linea shadow-sm">
        <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          Prima
        </div>
        <div className="max-h-72 overflow-y-auto bg-carta p-3 font-mono text-xs leading-5">
          {righePrima.map((r, i) => (
            <div key={i} className={!setDopo.has(r) && r.trim() ? 'rounded-sm bg-red-50 text-red-800' : 'text-inchiostro/60'}>
              {r || ' '}
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-linea shadow-sm">
        <div className="flex items-center gap-2 border-b border-green-100 bg-green-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Dopo
        </div>
        <div className="max-h-72 overflow-y-auto bg-carta p-3 font-mono text-xs leading-5">
          {righeDopo.map((r, i) => (
            <div key={i} className={!setPrima.has(r) && r.trim() ? 'rounded-sm bg-green-50 text-green-800' : 'text-inchiostro/60'}>
              {r || ' '}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
