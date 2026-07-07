'use client'

// ─── Area Commerciale — Venditore ───
// Il venditore crea la pratica, invia assessment + questionario al cliente
// e poi segue le sue pratiche SOLO tramite macro-stati semplificati:
// la pipeline interna di Erogazione Copy non è mai visibile da qui.

import { useState } from 'react'
import { useApp, contaNotifiche } from '@/lib/store'
import { statoPerVenditore } from '@/lib/fasi'
import RoleShell from '@/components/RoleShell'
import PraticaCard from '@/components/PraticaCard'
import EmptyState from '@/components/EmptyState'
import { Pratica } from '@/lib/types'

/** Badge con il macro-stato semplificato per il venditore (mai la fase interna). */
function BadgeMacroStato({ pratica }: { pratica: Pratica }) {
  const macro = statoPerVenditore(pratica.faseCorrente)
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${macro.badge}`}>
      {macro.label}
    </span>
  )
}

export default function PaginaVenditore() {
  const { state, creaPratica, inviaAssessment } = useApp()

  // ─ Form "Nuova vendita" ─
  const [azienda, setAzienda] = useState('')
  const [cliente, setCliente] = useState('')
  const [email, setEmail] = useState('')
  const [nuovoDipendente, setNuovoDipendente] = useState('')
  const [dipendenti, setDipendenti] = useState<string[]>([])
  const [errore, setErrore] = useState<string | null>(null)
  const [confermaCreazione, setConfermaCreazione] = useState<string | null>(null)
  const [confermaInvio, setConfermaInvio] = useState<string | null>(null)

  const aggiungiDipendente = () => {
    const nome = nuovoDipendente.trim()
    if (!nome) return
    if (dipendenti.some((d) => d.toLowerCase() === nome.toLowerCase())) {
      setErrore(`"${nome}" è già nell'elenco dei dipendenti.`)
      return
    }
    setDipendenti([...dipendenti, nome])
    setNuovoDipendente('')
    setErrore(null)
  }

  const rimuoviDipendente = (nome: string) => setDipendenti(dipendenti.filter((d) => d !== nome))

  const invia = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const mancanti: string[] = []
    if (!azienda.trim()) mancanti.push('azienda')
    if (!cliente.trim()) mancanti.push('cliente referente')
    if (!email.trim()) mancanti.push('email')
    if (mancanti.length > 0) {
      setErrore(`Compila i campi obbligatori: ${mancanti.join(', ')}.`)
      setConfermaCreazione(null)
      return
    }
    if (email.trim() && !email.includes('@')) {
      setErrore("L'indirizzo email non sembra valido.")
      setConfermaCreazione(null)
      return
    }
    if (dipendenti.length === 0) {
      setErrore('Aggiungi almeno un dipendente da valutare con AssessFirst.')
      setConfermaCreazione(null)
      return
    }
    creaPratica({ azienda: azienda.trim(), cliente: cliente.trim(), email: email.trim(), dipendenti })
    setConfermaCreazione(azienda.trim())
    setErrore(null)
    setAzienda('')
    setCliente('')
    setEmail('')
    setNuovoDipendente('')
    setDipendenti([])
  }

  // ─ Raggruppamento per macro-stato (separazione dei ruoli) ─
  const inVendita = state.pratiche.filter((p) => p.faseCorrente === 'vendita')
  const inRaccolta = state.pratiche.filter((p) => p.faseCorrente === 'raccolta-documenti')
  const inLavorazione = state.pratiche.filter(
    (p) => p.faseCorrente !== 'vendita' && p.faseCorrente !== 'raccolta-documenti' && p.faseCorrente !== 'completata'
  )
  const consegnate = state.pratiche.filter((p) => p.faseCorrente === 'completata')

  const gruppi: { titolo: string; descrizione: string; pratiche: Pratica[] }[] = [
    { titolo: 'Raccolta documenti', descrizione: 'Il team commerciale sta completando la cartella cliente.', pratiche: inRaccolta },
    { titolo: 'In lavorazione dal team', descrizione: 'La cartella è passata a Erogazione Copy: nessuna azione richiesta.', pratiche: inLavorazione },
    { titolo: 'Report consegnato', descrizione: 'Il report strategico è stato consegnato al cliente.', pratiche: consegnate },
  ]

  return (
    <RoleShell
      ruolo="Venditore"
      colore="bg-sky-500"
      sottotitolo="Nuove vendite e invio assessment"
      notifiche={contaNotifiche(state, 'venditore')}
    >
      <div className="space-y-10">
        {/* 1. Nuova vendita */}
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Nuova vendita</h2>
          <form onSubmit={invia} className="mt-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="azienda" className="mb-1 block text-xs font-medium text-slate-600">
                  Azienda <span className="text-red-500">*</span>
                </label>
                <input
                  id="azienda"
                  value={azienda}
                  onChange={(e) => setAzienda(e.target.value)}
                  placeholder="Es. Rossi Impianti Srl"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="cliente" className="mb-1 block text-xs font-medium text-slate-600">
                  Cliente referente <span className="text-red-500">*</span>
                </label>
                <input
                  id="cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Es. Paolo Rossi"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-600">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Es. paolo@rossimpianti.it"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Dipendenti da valutare */}
            <div className="mt-4">
              <label htmlFor="dipendente" className="mb-1 block text-xs font-medium text-slate-600">
                Dipendenti da valutare (AssessFirst) <span className="text-red-500">*</span>
              </label>
              <p className="mb-2 text-xs text-slate-400">
                Aggiungi i nomi uno alla volta: per ogni dipendente Elisa caricherà un test AssessFirst.
              </p>
              <div className="flex gap-2">
                <input
                  id="dipendente"
                  value={nuovoDipendente}
                  onChange={(e) => setNuovoDipendente(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      aggiungiDipendente()
                    }
                  }}
                  placeholder="Nome e cognome del dipendente"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={aggiungiDipendente}
                  className="rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                >
                  + Aggiungi
                </button>
              </div>
              {dipendenti.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {dipendenti.map((d) => (
                    <li
                      key={d}
                      className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 py-1 pr-1 pl-3 text-sm text-sky-800"
                    >
                      {d}
                      <button
                        type="button"
                        onClick={() => rimuoviDipendente(d)}
                        aria-label={`Rimuovi ${d}`}
                        title={`Rimuovi ${d}`}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-sky-500 transition hover:bg-sky-200 hover:text-sky-800"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {errore && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errore}</div>
            )}
            {confermaCreazione && !errore && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                ✓ Pratica per <strong>{confermaCreazione}</strong> creata. Ora puoi inviare assessment e questionario al
                cliente dall&apos;elenco qui sotto.
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                Crea pratica cliente
              </button>
            </div>
          </form>
        </section>

        {/* 2. Pratiche in vendita: da inviare */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Da inviare</h2>
            <span className="text-xs text-slate-400">{inVendita.length} pratiche</span>
          </div>
          {confermaInvio && (
            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              ✓ Assessment e questionario inviati al cliente di <strong>{confermaInvio}</strong>. La cartella è passata al
              team commerciale per la raccolta documenti.
            </div>
          )}
          <div className="mt-3 space-y-3">
            {inVendita.length === 0 ? (
              <EmptyState
                titolo="Nessuna pratica da inviare"
                sottotitolo="Crea una nuova vendita qui sopra per iniziare."
                icona="📨"
              />
            ) : (
              inVendita.map((p) => (
                <PraticaCard
                  key={p.id}
                  pratica={p}
                  nascondiFase
                  azioni={
                    <div className="flex flex-col items-end gap-2">
                      <BadgeMacroStato pratica={p} />
                      <button
                        onClick={() => {
                          inviaAssessment(p.id)
                          setConfermaInvio(p.azienda)
                        }}
                        className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
                      >
                        Invia assessment + questionario
                      </button>
                    </div>
                  }
                />
              ))
            )}
          </div>
        </section>

        {/* 3. Le mie pratiche, raggruppate per macro-stato */}
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Le mie pratiche</h2>
          <p className="mt-1 text-xs text-slate-400">
            Vista semplificata: il dettaglio delle attività interne è gestito dal team.
          </p>
          {inRaccolta.length + inLavorazione.length + consegnate.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                titolo="Nessuna pratica avviata"
                sottotitolo="Le pratiche compariranno qui dopo l'invio di assessment e questionario."
                icona="🗂️"
              />
            </div>
          ) : (
            <div className="mt-3 space-y-6">
              {gruppi.map(
                (g) =>
                  g.pratiche.length > 0 && (
                    <div key={g.titolo}>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-sm font-semibold text-slate-700">{g.titolo}</h3>
                        <span className="text-xs text-slate-400">
                          {g.pratiche.length} · {g.descrizione}
                        </span>
                      </div>
                      <div className="mt-2 space-y-3">
                        {g.pratiche.map((p) => (
                          <PraticaCard key={p.id} pratica={p} nascondiFase azioni={<BadgeMacroStato pratica={p} />} />
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </section>
      </div>
    </RoleShell>
  )
}
