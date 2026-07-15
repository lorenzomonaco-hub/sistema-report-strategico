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
import { PersonaAF } from '@/lib/types'
import { IN_ATTESA, TUTOR_FRANK } from '@/lib/consulenzeFrank'

/** Elenco tutor (nomi reali) e loro email [nome].[cognome]@metodomerenda.com */
const TUTORS = TUTOR_FRANK.map((t) => t.tutor).sort((a, b) => a.localeCompare(b))
function emailTutor(nome: string): string {
  const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '')
  const parti = nome.trim().split(/\s+/)
  const n = norm(parti[0] || '')
  const c = norm(parti.slice(1).join('') || '')
  return n && c ? `${n}.${c}@metodomerenda.com` : ''
}

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
// Chip di una persona già inserita
function PersonaChip({ p, tono, onRimuovi }: { p: PersonaAF; tono: 'titolare' | 'dipendente'; onRimuovi: () => void }) {
  const stile = tono === 'dipendente'
    ? 'border-sky-200 bg-sky-50 text-sky-900'
    : 'border-indigo-200 bg-indigo-50 text-indigo-900'
  const badge = tono === 'dipendente' ? 'bg-sky-100 text-sky-700' : 'bg-indigo-100 text-indigo-700'
  return (
    <li className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border px-3 py-2 text-sm ${stile}`}>
      <span className="font-semibold">{p.nome}</span>
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge}`}>{p.ruolo}</span>
      <span className="text-inchiostro/45">{p.email}</span>
      <button onClick={onRimuovi} aria-label={`Rimuovi ${p.nome}`} className="ml-auto text-inchiostro/30 transition hover:text-rose-600">✕</button>
    </li>
  )
}

function FormNuovoCliente({ onChiudi, onCreata }: { onChiudi: () => void; onCreata: (azienda: string) => void }) {
  const { creaPratica } = useApp()
  const [tutor, setTutor] = useState('')
  const emailDelTutor = emailTutor(tutor)
  const [azienda, setAzienda] = useState('')
  const [titolareNome, setTitolareNome] = useState('')
  const [titolareCognome, setTitolareCognome] = useState('')
  const [titolareEmail, setTitolareEmail] = useState('')
  // Sezione 1: titolari e soci (illimitati)
  const [soci, setSoci] = useState<PersonaAF[]>([])
  const [sNome, setSNome] = useState('')
  const [sCognome, setSCognome] = useState('')
  const [sEmail, setSEmail] = useState('')
  const [sTipo, setSTipo] = useState<'titolare' | 'socio'>('socio')
  // Sezione 2: dipendenti strategici (max 3)
  const [dip, setDip] = useState<PersonaAF[]>([])
  const [dNome, setDNome] = useState('')
  const [dCognome, setDCognome] = useState('')
  const [dEmail, setDEmail] = useState('')
  const [dQualifica, setDQualifica] = useState('')
  const [errore, setErrore] = useState<string | null>(null)

  const nomiUsati = () => [
    `${titolareNome.trim()} ${titolareCognome.trim()}`.trim().toLowerCase(),
    ...soci.map((s) => s.nome.toLowerCase()),
    ...dip.map((d) => d.nome.toLowerCase()),
  ].filter(Boolean)

  const aggiungiSocio = () => {
    const n = sNome.trim(), c = sCognome.trim(), em = sEmail.trim()
    if (!n || !c) return setErrore('Titolari e soci: servono nome e cognome.')
    if (!em || !em.includes('@')) return setErrore('Titolari e soci: l’email è obbligatoria (serve per l’AssessFirst).')
    const nomeCompleto = `${n} ${c}`
    if (nomiUsati().includes(nomeCompleto.toLowerCase())) return setErrore('Questa persona è già in elenco.')
    setSoci([...soci, { nome: nomeCompleto, email: em, qualifica: sTipo, ruolo: sTipo === 'titolare' ? 'Titolare' : 'Socio' }])
    setSNome(''); setSCognome(''); setSEmail(''); setErrore(null)
  }

  const aggiungiDipendente = () => {
    const n = dNome.trim(), c = dCognome.trim(), em = dEmail.trim(), q = dQualifica.trim()
    if (!n || !c) return setErrore('Dipendenti strategici: servono nome e cognome.')
    if (!em || !em.includes('@')) return setErrore('Dipendenti strategici: l’email è obbligatoria (serve per l’AssessFirst).')
    if (!q) return setErrore('Dipendenti strategici: scrivi la qualifica in azienda.')
    if (dip.length >= MAX_DIPENDENTI) return setErrore(`Massimo ${MAX_DIPENDENTI} dipendenti strategici per azienda.`)
    const nomeCompleto = `${n} ${c}`
    if (nomiUsati().includes(nomeCompleto.toLowerCase())) return setErrore('Questa persona è già in elenco.')
    setDip([...dip, { nome: nomeCompleto, email: em, qualifica: 'dipendente', ruolo: q }])
    setDNome(''); setDCognome(''); setDEmail(''); setDQualifica(''); setErrore(null)
  }

  const registra = () => {
    if (!tutor) return setErrore('Prima di tutto seleziona il tuo nome (tutor).')
    const tn = titolareNome.trim(), tc = titolareCognome.trim(), te = titolareEmail.trim()
    if (!azienda.trim() || !tn || !tc || !te) return setErrore('Azienda, nome, cognome ed email del titolare sono obbligatori.')
    if (!te.includes('@')) return setErrore('Email titolare non valida.')
    const titolare: PersonaAF = { nome: `${tn} ${tc}`, email: te, qualifica: 'titolare', ruolo: 'Titolare' }
    // il titolare (referente) è la prima persona da valutare, poi soci e dipendenti
    const dipendenti = [titolare, ...soci, ...dip]
    creaPratica({ azienda: azienda.trim(), cliente: titolare.nome, email: te, dipendenti, tutor, tutorEmail: emailDelTutor })
    onCreata(azienda.trim()); onChiudi()
  }

  const labelCampo = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-inchiostro/45'

  return (
    <div className="card-sollevabile space-y-6 rounded-2xl border border-linea bg-carta p-6 shadow-sm">
      <div>
        <h3 className="font-display text-lg font-bold tracking-tight text-inchiostro">Registra il cliente — avvia la pipeline (step 0)</h3>
        <p className="mt-1 text-xs text-inchiostro/50">
          Registrare il cliente crea il progetto allo <strong>step 0</strong> (vendita registrata, documenti mancanti). Poi Elisa carica i documenti.
        </p>
      </div>

      {/* ── Tutor: prima cosa, obbligatorio. Genera l'email del tutor ── */}
      <div className="rounded-xl border border-petrolio/25 bg-petrolio/[0.05] p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-petrolio-scuro">Tutor — il tuo nome</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCampo}>Seleziona il tuo nome *</label>
            <select value={tutor} onChange={(e) => setTutor(e.target.value)} aria-label="Tutor" className={classiInput}>
              <option value="">— scegli il tutor —</option>
              {TUTORS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCampo}>Email tutor (automatica)</label>
            <div className={`flex h-[38px] items-center rounded-xl border border-linea px-3 text-sm ${emailDelTutor ? 'bg-carta text-inchiostro' : 'bg-inchiostro/[0.03] text-inchiostro/35'}`}>
              {emailDelTutor || 'compare quando scegli il nome'}
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-inchiostro/45">
          A questa email riceverai le notifiche: il <strong>report AssessFirst di Irene</strong> e il <strong>completamento</strong> dopo la grafica. La registrazione timbra l&rsquo;ora d&rsquo;inizio per misurare la durata di erogazione.
        </p>
      </div>

      {/* ── Azienda e titolare ── */}
      <div className="rounded-xl border border-linea/70 bg-inchiostro/[0.015] p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-inchiostro/50">Azienda e titolare</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelCampo}>Azienda *</label>
            <input value={azienda} onChange={(e) => setAzienda(e.target.value)} placeholder="Es. Rossi S.r.l." className={classiInput} />
          </div>
          <div>
            <label className={labelCampo}>Nome titolare *</label>
            <input value={titolareNome} onChange={(e) => setTitolareNome(e.target.value)} placeholder="Nome" className={classiInput} />
          </div>
          <div>
            <label className={labelCampo}>Cognome titolare *</label>
            <input value={titolareCognome} onChange={(e) => setTitolareCognome(e.target.value)} placeholder="Cognome" className={classiInput} />
          </div>
          <div>
            <label className={labelCampo}>Email titolare *</label>
            <input type="email" value={titolareEmail} onChange={(e) => setTitolareEmail(e.target.value)} placeholder="titolare@azienda.it" className={classiInput} />
          </div>
        </div>
      </div>

      {/* ── Sezione 1: titolari e soci ── */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-bold text-indigo-900">1 · Titolari e soci</p>
          <span className="text-[11px] font-semibold text-indigo-500">{soci.length} inseriti · illimitati</span>
        </div>
        <p className="mt-0.5 text-[11px] text-inchiostro/45">Il titolare qui sopra è già incluso. Aggiungi altri titolari o soci; ognuno fa l&rsquo;AssessFirst.</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <div>
            <label className={labelCampo}>Nome</label>
            <input value={sNome} onChange={(e) => setSNome(e.target.value)} placeholder="Nome" className={classiInput} />
          </div>
          <div>
            <label className={labelCampo}>Cognome</label>
            <input value={sCognome} onChange={(e) => setSCognome(e.target.value)} placeholder="Cognome" className={classiInput} />
          </div>
          <div>
            <label className={labelCampo}>Email</label>
            <input type="email" value={sEmail} onChange={(e) => setSEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aggiungiSocio() } }} placeholder="email" className={classiInput} />
          </div>
          <div>
            <label className={labelCampo}>Qualifica</label>
            <div className="flex h-[38px] overflow-hidden rounded-xl border border-linea">
              {(['titolare', 'socio'] as const).map((t) => (
                <button key={t} onClick={() => setSTipo(t)} type="button"
                  className={`px-3 text-xs font-semibold capitalize transition ${sTipo === t ? 'bg-indigo-500 text-white' : 'bg-carta text-inchiostro/50 hover:text-inchiostro'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={aggiungiSocio} className="mt-2 rounded-xl border border-indigo-200 bg-carta px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100">
          + Aggiungi titolare/socio
        </button>

        {soci.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {soci.map((p) => <PersonaChip key={p.nome} p={p} tono="titolare" onRimuovi={() => setSoci(soci.filter((x) => x.nome !== p.nome))} />)}
          </ul>
        )}
      </div>

      {/* ── Sezione 2: dipendenti strategici ── */}
      <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-bold text-sky-900">2 · Dipendenti strategici</p>
          <span className={`text-[11px] font-semibold ${dip.length >= MAX_DIPENDENTI ? 'text-amber-700' : 'text-sky-500'}`}>{dip.length}/{MAX_DIPENDENTI}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-inchiostro/45">Massimo {MAX_DIPENDENTI}. La qualifica la scrivi tu (testo libero).</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr]">
          <div>
            <label className={labelCampo}>Nome</label>
            <input value={dNome} onChange={(e) => setDNome(e.target.value)} placeholder="Nome" className={classiInput} disabled={dip.length >= MAX_DIPENDENTI} />
          </div>
          <div>
            <label className={labelCampo}>Cognome</label>
            <input value={dCognome} onChange={(e) => setDCognome(e.target.value)} placeholder="Cognome" className={classiInput} disabled={dip.length >= MAX_DIPENDENTI} />
          </div>
          <div>
            <label className={labelCampo}>Email</label>
            <input type="email" value={dEmail} onChange={(e) => setDEmail(e.target.value)} placeholder="email" className={classiInput} disabled={dip.length >= MAX_DIPENDENTI} />
          </div>
          <div>
            <label className={labelCampo}>Qualifica in azienda</label>
            <input value={dQualifica} onChange={(e) => setDQualifica(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aggiungiDipendente() } }}
              placeholder="Es. Responsabile commerciale" className={classiInput} disabled={dip.length >= MAX_DIPENDENTI} />
          </div>
        </div>
        <button onClick={aggiungiDipendente} disabled={dip.length >= MAX_DIPENDENTI}
          className="mt-2 rounded-xl border border-sky-200 bg-carta px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40">
          + Aggiungi dipendente
        </button>

        {dip.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {dip.map((p) => <PersonaChip key={p.nome} p={p} tono="dipendente" onRimuovi={() => setDip(dip.filter((x) => x.nome !== p.nome))} />)}
          </ul>
        )}
      </div>

      {errore && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{errore}</p>}

      <div className="flex flex-wrap gap-2">
        <button onClick={registra} className="rounded-xl bg-petrolio px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-petrolio-scuro">Registra il cliente</button>
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

        {/* In attesa del questionario — PROTOTIPO: per ora un cliente solo */}
        <section className="anima anima-2">
          <TitoloSezione titolo="In attesa del questionario" conteggio={`1 di ${IN_ATTESA.length} — prototipo`} />
          <p className="mt-1 text-xs text-inchiostro/45">
            Clienti già acquisiti che non hanno ancora compilato questionario/AssessFirst. Per ora mostriamo <strong>un solo cliente</strong> come esempio d&rsquo;interfaccia: quando approvi il formato lo replichiamo per tutti e {IN_ATTESA.length}.
          </p>
          <div className="mt-3">
            {IN_ATTESA.length > 0 && (() => {
              const c = IN_ATTESA[0]
              return (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-linea bg-carta px-4 py-3 shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold text-inchiostro">{c.azienda || c.nome}</p>
                    <p className="truncate text-xs text-inchiostro/50">{c.nome} · tutor {c.tutor}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> questionario mancante
                  </span>
                </div>
              )
            })()}
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
