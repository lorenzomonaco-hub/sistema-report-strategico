'use client'

// ─── Area Commerciale — Tutor ───
// Il tutor fa UNA cosa: registra il cliente e le persone da valutare.
// La registrazione è il TRIGGER della pipeline: il cliente nasce allo STEP 0
// (vendita registrata, documenti mancanti). Da lì è Elisa a caricare i
// documenti e a farlo passare allo step 1 (Copy).
// Regole persone: nome, cognome, email (serve per l'AssessFirst), qualifica.
//   · soci ILLIMITATI (titolare + soci)   · dipendenti MAX 3 per azienda.

import { useState } from 'react'
import Link from 'next/link'
import { useApp, contaNotifiche } from '@/lib/store'
import { indiceFase, statoCommerciale } from '@/lib/fasi'
import RoleShell from '@/components/RoleShell'
import PraticaCard from '@/components/PraticaCard'
import EmptyState from '@/components/EmptyState'
import { PersonaAF, RUOLI, qualificaDaRuolo, relazioneAF } from '@/lib/types'

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

const classiInput =
  'w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm text-inchiostro placeholder:text-inchiostro/35 transition focus:border-petrolio focus:outline-none focus:ring-2 focus:ring-petrolio/15'

const MAX_DIPENDENTI = 3

function BannerConferma({ testo, onChiudi }: { testo: React.ReactNode; onChiudi: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
      <p className="text-sm text-green-800">{testo}</p>
      <button onClick={onChiudi} aria-label="Chiudi avviso" className="shrink-0 text-green-700/60 transition hover:text-green-800">✕</button>
    </div>
  )
}

function TitoloSezione({ titolo, conteggio }: { titolo: string; conteggio?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="font-display text-xl font-bold tracking-tight text-inchiostro">{titolo}</h2>
      {conteggio && <span className="shrink-0 text-xs text-inchiostro/40">{conteggio}</span>}
    </div>
  )
}

// ─── Form nuovo cliente: il trigger della pipeline ───
function FormNuovoCliente({ onChiudi, onCreata }: { onChiudi: () => void; onCreata: (azienda: string) => void }) {
  const { creaPratica } = useApp()
  const [azienda, setAzienda] = useState('')
  const [titolareNome, setTitolareNome] = useState('')
  const [titolareCognome, setTitolareCognome] = useState('')
  const [emailCliente, setEmailCliente] = useState('')
  const [dipendenti, setDipendenti] = useState<PersonaAF[]>([])
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [email, setEmail] = useState('')
  const [ruolo, setRuolo] = useState<string>('Imprenditore')
  const [ruoloAltro, setRuoloAltro] = useState('')
  const [errore, setErrore] = useState<string | null>(null)

  const nDipendenti = dipendenti.filter((d) => d.qualifica === 'dipendente').length
  const nSoci = dipendenti.length - nDipendenti

  const aggiungi = () => {
    const n = nome.trim()
    const c = cognome.trim()
    const r = ruolo === 'Altro' ? ruoloAltro.trim() : ruolo
    const em = email.trim()
    if (!n || !c) return setErrore('Servono nome E cognome della persona.')
    if (!r) return setErrore('Indica il ruolo (o scrivilo se hai scelto «Altro»).')
    if (!em || !em.includes('@')) return setErrore('L’email è obbligatoria: serve per inviare il test AssessFirst.')
    const nomeCompleto = `${n} ${c}`
    if (dipendenti.some((d) => d.nome.toLowerCase() === nomeCompleto.toLowerCase())) return setErrore('Questa persona è già in elenco.')
    const q = qualificaDaRuolo(r)
    if (q === 'dipendente' && nDipendenti >= MAX_DIPENDENTI) return setErrore(`Massimo ${MAX_DIPENDENTI} dipendenti per azienda. Titolare e soci sono invece illimitati.`)
    setDipendenti([...dipendenti, { nome: nomeCompleto, email: em, ruolo: r, qualifica: q }])
    setNome(''); setCognome(''); setEmail(''); setRuolo('Imprenditore'); setRuoloAltro(''); setErrore(null)
  }

  const registra = () => {
    const titolare = `${titolareNome.trim()} ${titolareCognome.trim()}`.trim()
    if (!azienda.trim() || !titolareNome.trim() || !titolareCognome.trim() || !emailCliente.trim()) return setErrore('Azienda, nome e cognome del titolare ed email del cliente sono obbligatori.')
    if (!emailCliente.includes('@')) return setErrore('Email del cliente non valida.')
    if (dipendenti.length < 1) return setErrore('Aggiungi almeno una persona da valutare.')
    creaPratica({ azienda: azienda.trim(), cliente: titolare, email: emailCliente.trim(), dipendenti })
    onCreata(azienda.trim()); onChiudi()
  }

  return (
    <div className="card-sollevabile rounded-2xl border border-linea bg-carta p-5 shadow-sm">
      <h3 className="font-display font-bold tracking-tight text-inchiostro">Registra il cliente — avvia la pipeline (step 0)</h3>
      <p className="mt-0.5 text-xs text-inchiostro/50">
        Registrare il cliente crea il progetto allo <strong>step 0</strong> (vendita registrata, documenti mancanti). Poi Elisa carica i documenti.
      </p>

      {/* Cliente / azienda */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <label className="mb-1 block text-xs font-semibold text-inchiostro/60">Azienda *</label>
          <input value={azienda} onChange={(e) => setAzienda(e.target.value)} placeholder="Es. Rossi S.r.l." className={classiInput} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-inchiostro/60">Nome titolare *</label>
          <input value={titolareNome} onChange={(e) => setTitolareNome(e.target.value)} placeholder="Nome" className={classiInput} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-inchiostro/60">Cognome titolare *</label>
          <input value={titolareCognome} onChange={(e) => setTitolareCognome(e.target.value)} placeholder="Cognome" className={classiInput} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-inchiostro/60">Email cliente *</label>
          <input type="email" value={emailCliente} onChange={(e) => setEmailCliente(e.target.value)} placeholder="nome@azienda.it" className={classiInput} />
        </div>
      </div>

      {/* Persone */}
      <div className="mt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label className="block text-xs font-semibold text-inchiostro/60">Persone da valutare * — nome, cognome, email (per l&rsquo;AssessFirst), qualifica</label>
          <span className="text-[11px] text-inchiostro/45">{nSoci} titolare/soci · <span className={nDipendenti >= MAX_DIPENDENTI ? 'font-bold text-amber-700' : ''}>{nDipendenti}/{MAX_DIPENDENTI} dipendenti</span></span>
        </div>
        <div className="mt-1 flex flex-wrap items-start gap-2">
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className={`${classiInput} min-w-28 flex-1`} />
          <input value={cognome} onChange={(e) => setCognome(e.target.value)} placeholder="Cognome" className={`${classiInput} min-w-28 flex-1`} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email *" className={`${classiInput} min-w-40 flex-1`} />
          <select value={ruolo} onChange={(e) => setRuolo(e.target.value)} aria-label="Qualifica" className={`${classiInput} w-40 shrink-0`}>
            {RUOLI.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          {ruolo === 'Altro' && (
            <input value={ruoloAltro} onChange={(e) => setRuoloAltro(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aggiungi() } }}
              placeholder="Quale ruolo?" className={`${classiInput} w-40 shrink-0`} />
          )}
          <button onClick={aggiungi} className="shrink-0 rounded-xl border border-linea bg-carta px-4 py-2.5 text-sm font-semibold text-inchiostro/70 transition hover:border-petrolio/40 hover:text-petrolio">
            + Aggiungi
          </button>
        </div>
        <p className="mt-1 text-[11px] text-inchiostro/40">Titolare e soci: illimitati. Dipendenti: massimo {MAX_DIPENDENTI} per azienda.</p>

        {dipendenti.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {dipendenti.map((d) => {
              const rel = relazioneAF({ dipendenti, cliente: `${titolareNome} ${titolareCognome}`.trim() || '—' }, d)
              const badge = d.qualifica === 'dipendente' ? 'bg-sky-100 text-sky-700' : 'bg-indigo-100 text-indigo-700'
              return (
                <li key={d.nome} className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm text-indigo-900">
                  <span className="font-semibold">{d.nome}</span>
                  <span className="text-indigo-800/70">{d.email}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}>{d.ruolo} · {d.qualifica}</span>
                  <span className="ml-auto text-xs text-indigo-500">report AF: caso {rel.caso}</span>
                  <button onClick={() => setDipendenti(dipendenti.filter((x) => x.nome !== d.nome))} aria-label={`Rimuovi ${d.nome}`} className="text-indigo-400 transition hover:text-indigo-700">✕</button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {errore && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{errore}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={registra} className="rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro">Registra il cliente</button>
        <button onClick={onChiudi} className="rounded-xl border border-linea bg-carta px-4 py-2.5 text-sm font-semibold text-inchiostro/60 transition hover:border-petrolio/40 hover:text-petrolio">Annulla</button>
      </div>
    </div>
  )
}

export default function PaginaTutor() {
  const { state } = useApp()
  const [formAperto, setFormAperto] = useState(false)
  const [aziendaCreata, setAziendaCreata] = useState<string | null>(null)

  const step0 = state.pratiche.filter((p) => p.faseCorrente === 'vendita' || p.faseCorrente === 'raccolta-documenti')
  const inLavorazione = state.pratiche.filter((p) => indiceFase(p.faseCorrente) >= indiceFase('generazione'))

  return (
    <RoleShell
      ruolo="Tutor"
      colore="bg-indigo-500"
      sottotitolo="Registri il cliente e le persone: è il via della pipeline (step 0). Poi Elisa carica i documenti."
      notifiche={contaNotifiche(state, 'tutor')}
    >
      <div className="space-y-10">
        {/* Registrazione */}
        <section className="anima anima-1">
          <TitoloSezione titolo="Nuovo cliente — step 0" />
          <p className="mt-1 text-xs text-inchiostro/45">
            Registra azienda, titolare e le persone da valutare. La registrazione avvia la pipeline: il cliente entra allo step 0 in attesa dei documenti di Elisa.
          </p>
          <div className="mt-3 space-y-3">
            {aziendaCreata && (
              <BannerConferma
                testo={<>Cliente <strong>{aziendaCreata}</strong> registrato allo <strong>step 0</strong>. Ora Elisa carica i documenti per farlo passare allo step 1.</>}
                onChiudi={() => setAziendaCreata(null)}
              />
            )}
            {formAperto ? (
              <FormNuovoCliente onChiudi={() => setFormAperto(false)} onCreata={setAziendaCreata} />
            ) : (
              <button onClick={() => { setFormAperto(true); setAziendaCreata(null) }} className="rounded-xl bg-petrolio px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro">
                + Registra un cliente
              </button>
            )}
          </div>
        </section>

        {/* Step 0: in attesa dei documenti di Elisa */}
        <section className="anima anima-2">
          <TitoloSezione titolo="Step 0 — in attesa dei documenti (Elisa)" conteggio={`${step0.length} client${step0.length === 1 ? 'e' : 'i'}`} />
          <p className="mt-1 text-xs text-inchiostro/45">
            Clienti registrati per cui Elisa deve ancora caricare tutti i documenti. Quando li completa, passano allo step 1 (Copy).
          </p>
          <div className="mt-3 space-y-3">
            {step0.length === 0 ? (
              <EmptyState titolo="Nessun cliente allo step 0" sottotitolo="Registra un cliente qui sopra: comparirà in attesa dei documenti di Elisa." icona="📂" />
            ) : (
              step0.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-linea bg-carta px-4 py-3 shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold text-inchiostro">{p.azienda}</p>
                    <p className="truncate text-xs text-inchiostro/50">{p.cliente} · {p.dipendenti.length} {p.dipendenti.length === 1 ? 'persona' : 'persone'} · registrato {dataIt(p.dataCreazione)}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> step 0 · documenti da Elisa
                  </span>
                </div>
              ))
            )}
          </div>
          <p className="mt-3 text-xs text-inchiostro/45">
            I documenti li carica <Link href="/commerciale/elisa" className="font-semibold text-petrolio hover:underline">Elisa</Link>.
          </p>
        </section>

        {/* In lavorazione */}
        <section className="anima anima-3">
          <TitoloSezione titolo="In lavorazione" conteggio={`${inLavorazione.length} client${inLavorazione.length === 1 ? 'e' : 'i'}`} />
          <p className="mt-1 text-xs text-inchiostro/45">Dallo step 1 in poi lavorano il team copy e la pipeline: questi macro-stati ti bastano per aggiornare il cliente.</p>
          <div className="mt-3 space-y-3">
            {inLavorazione.length === 0 ? (
              <EmptyState titolo="Nessun cliente in lavorazione" sottotitolo="I clienti avviati compariranno qui con il loro stato." icona="🗂️" />
            ) : (
              inLavorazione.map((p) => {
                const stato = statoCommerciale(p.faseCorrente)
                return (
                  <PraticaCard key={p.id} pratica={p} nascondiFase azioni={
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${stato.badge}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" /> {stato.label}
                    </span>
                  } />
                )
              })
            )}
          </div>
        </section>
      </div>
    </RoleShell>
  )
}
