import { FASI, indiceFase } from '@/lib/fasi'
import { FaseId } from '@/lib/types'

/** Stepper orizzontale delle 11 fasi con la fase corrente evidenziata. */
export default function PipelineStepper({ faseCorrente }: { faseCorrente: FaseId }) {
  const corrente = indiceFase(faseCorrente)

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-center gap-0">
        {FASI.map((f, i) => {
          const passata = i < corrente
          const attiva = i === corrente
          return (
            <div key={f.id} className="flex items-center">
              {i > 0 && <div className={`h-px w-6 ${passata || attiva ? 'bg-petrolio/30' : 'bg-linea'}`} />}
              <div
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${
                  attiva
                    ? `${f.badge} border-transparent font-semibold shadow-sm ring-2 ring-petrolio/20`
                    : passata
                      ? 'border-linea bg-carta text-inchiostro/60'
                      : 'border-linea/60 bg-carta text-inchiostro/30'
                }`}
                title={`${f.label} — ${f.descrizione}`}
              >
                {passata ? <span className="text-green-600">✓</span> : <span className={`h-1.5 w-1.5 rounded-full ${attiva ? f.dot : 'bg-linea'}`} />}
                {f.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
