/** Stato vuoto riutilizzabile. */
export default function EmptyState({ titolo, sottotitolo, icona = '📭' }: { titolo: string; sottotitolo?: string; icona?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="text-3xl">{icona}</div>
      <h3 className="mt-2 font-medium text-slate-700">{titolo}</h3>
      {sottotitolo && <p className="mt-1 text-sm text-slate-500">{sottotitolo}</p>}
    </div>
  )
}
