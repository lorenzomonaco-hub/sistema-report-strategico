/** Stato vuoto riutilizzabile. */
export default function EmptyState({ titolo, sottotitolo, icona = '📭' }: { titolo: string; sottotitolo?: string; icona?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-linea bg-carta/70 px-6 py-14 text-center">
      <div className="text-4xl">{icona}</div>
      <h3 className="mt-3 font-display text-base font-bold tracking-tight text-inchiostro/80">{titolo}</h3>
      {sottotitolo && <p className="mt-1.5 text-sm text-inchiostro/50">{sottotitolo}</p>}
    </div>
  )
}
