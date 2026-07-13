'use client'

// ─── Area Commerciale — Tutor ───
// FASE 1: il tutor registra il cliente (azienda, titolare, email) e i
//   dipendenti (nome, email, ruolo a tendina). Compilazione semplice.
// FASE 2: il venditore (o un dipendente) carica i documenti REALI —
//   questionario e trascrizione per l'azienda, i 4 AssessFirst per persona —
//   che restano a sistema fino alla 4a. Con «Completo» parte la generazione.

import { useState } from 'react'
import { useApp, contaNotifiche } from '@/lib/store'
import { documentiTutorPronti, indiceFase, statoCommerciale } from '@/lib/fasi'
import { caricaFile, cancellaFile } from '@/lib/archivioblocco'
import RoleShell from '@/components/RoleShell'
import PraticaCard from '@/components/PraticaCard'
import EmptyState from '@/components/EmptyState'
import {
  ASSESSFIRST_TIPI, DocumentoAllegato, PersonaAF, Pratica, RUOLI, qualificaDaRuolo, relazioneAF,
} from '@/lib/types'

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })

const classiInput =
  'w-full rounded-xl border border-linea bg-carta px-3 py-2 text-sm text-inchiostro placeholder:text-inchiostro/35 transition focus:border-petrolio focus:outline-none focus:ring-2 focus:ring-petrolio/15'

const uid = () => `al-${Math.random().toString(36).slice(2, 10)}`

const normalizza = (s: string) =>
  (s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

/** Riconosce quale dei 4 AssessFirst è un file dal suo nome. */
function categoriaDaNome(nomeFile: string): string | null {
  const n = normalizza(nomeFile)
  if (n.includes('swipe')) return 'SWIPE'
  if (n.includes('drive')) return 'DRIVE'
  if (n.includes('brain')) return 'BRAIN'
  if (n.includes('comportament')) return 'Comportamenti chiave'
  return null
}

/** Il nome file contiene il nome e cognome della persona? (controllo veridicità) */
function nomeCorrisponde(nomeFile: string, persona: string): boolean {
  const f = normalizza(nomeFile)
  const tokens = normalizza(persona).split(' ').filter((t) => t.length >= 3)
  return tokens.length > 0 && tokens.every((t) => f.includes(t))
}

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

// ─── FASE 1: form nuovo cliente ───
function FormNuovoCliente({ onChiudi, onCreata }: { onChiudi: () => void; onCreata: (azienda: string) => void }) {
  const { creaPratica } = useApp()
  const [azienda, setAzienda] = useState('')
  const [titolare, setTitolare] = useState('')
  const [emailCliente, setEmailCliente] = useState('')
  const [dipendenti, setDipendenti] = useState<PersonaAF[]>([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [ruolo, setRuolo] = useState<string>('Imprenditore')
  const [ruoloAltro, setRuoloAltro] = useState('')
  const [errore, setErrore] = useState<string | null>(null)

  const aggiungi = () => {
    const n = nome.trim()
    const r = ruolo === 'Altro' ? ruoloAltro.trim() : ruolo
    if (!n) return setErrore('Manca il nome del dipendente.')
    if (!r) return setErrore('Indica il ruolo (o scrivilo se hai scelto «Altro»).')
    if (email.trim() && !email.includes('@')) return setErrore('Email del dipendente non valida.')
    if (dipendenti.some((d) => d.nome.toLowerCase() === n.toLowerCase())) return setErrore('Questa persona è già in elenco.')
    setDipendenti([...dipendenti, { nome: n, email: email.trim(), ruolo: r, qualifica: qualificaDaRuolo(r) }])
    setNome(''); setEmail(''); setRuolo('Imprenditore'); setRuoloAltro(''); setErrore(null)
  }

  const registra = () => {
    if (!azienda.trim() || !titolare.trim() || !emailCliente.trim()) return setErrore('Azienda, titolare ed email del cliente sono obbligatori.')
    if (!emailCliente.includes('@')) return setErrore('Email del cliente non valida.')
    if (dipendenti.length < 1) return setErrore('Aggiungi almeno una persona.')
    creaPratica({ azienda: azienda.trim(), cliente: titolare.trim(), email: emailCliente.trim(), dipendenti })
    onCreata(azienda.trim()); onChiudi()
  }

  return (
    <div className="card-sollevabile rounded-2xl border border-linea bg-carta p-5 shadow-sm">
      <h3 className="font-display font-bold tracking-tight text-inchiostro">Fase 1 — Registra il cliente</h3>
      <p className="mt-0.5 text-xs text-inchiostro/50">Dati del cliente e persone da valutare. Semplice: nome, email, ruolo.</p>

      {/* Cliente */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-inchiostro/60">Azienda *</label>
          <input value={azienda} onChange={(e) => setAzienda(e.target.value)} placeholder="Es. Rossi S.r.l." className={classiInput} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-inchiostro/60">Nome titolare *</label>
          <input value={titolare} onChange={(e) => setTitolare(e.target.value)} placeholder="Nome e cognome" className={classiInput} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-inchiostro/60">Email cliente *</label>
          <input type="email" value={emailCliente} onChange={(e) => setEmailCliente(e.target.value)} placeholder="nome@azienda.it" className={classiInput} />
        </div>
      </div>

      {/* Dipendenti */}
      <div className="mt-5">
        <label className="mb-1 block text-xs font-semibold text-inchiostro/60">Persone da valutare * — nomi ESATTI (finiscono sui report)</label>
        <div className="flex flex-wrap items-start gap-2">
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome e cognome" className={`${classiInput} min-w-40 flex-1`} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className={`${classiInput} min-w-40 flex-1`} />
          <select value={ruolo} onChange={(e) => setRuolo(e.target.value)} aria-label="Ruolo" className={`${classiInput} w-40 shrink-0`}>
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

        {dipendenti.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {dipendenti.map((d) => {
              const rel = relazioneAF({ dipendenti, cliente: titolare || '—' }, d)
              return (
                <li key={d.nome} className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm text-indigo-900">
                  <span className="font-semibold">{d.nome}</span>
                  {d.email && <span className="text-indigo-800/70">{d.email}</span>}
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">{d.ruolo}</span>
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

// ─── Slot di caricamento REALE di un singolo file ───
function SlotUpload({ pratica, categoria, sottotipo, dipendente, label }: {
  pratica: Pratica; categoria: DocumentoAllegato['tipo']; sottotipo?: string; dipendente?: string; label: string
}) {
  const { registraAllegato, rimuoviAllegato } = useApp()
  const [inCorso, setInCorso] = useState(false)
  const [errore, setErrore] = useState('')
  const esistente = pratica.allegati.find(
    (a) => a.tipo === categoria && (a.dipendente ?? '') === (dipendente ?? '') && (a.sottotipo ?? '') === (sottotipo ?? '')
  )

  const onFile = async (f: File | null) => {
    if (!f) return
    setErrore(''); setInCorso(true)
    try {
      const c = await caricaFile(f, { praticaId: pratica.id, categoria, dipendente, sottotipo })
      registraAllegato(pratica.id, {
        id: uid(), nome: c.nome, tipo: categoria, sottotipo, dipendente,
        fileId: c.id, dimensione: c.dimensione, caricatoDa: 'Venditore', dataCaricamento: new Date().toISOString(),
      })
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'caricamento fallito')
    } finally {
      setInCorso(false)
    }
  }

  return (
    <div className={`rounded-xl border px-3 py-2 ${esistente ? 'border-green-200 bg-green-50/60' : 'border-linea bg-carta'}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${esistente ? 'bg-green-100 text-green-700' : 'border-2 border-inchiostro/15 bg-carta text-inchiostro/30'}`}>
          {esistente ? '✓' : ''}
        </span>
        <span className="min-w-24 shrink-0 text-xs font-semibold text-inchiostro/70">{label}</span>
        {esistente ? (
          <>
            <span className="truncate text-xs text-inchiostro/60">{esistente.nome}</span>
            <button
              onClick={() => { if (esistente.fileId) cancellaFile(esistente.fileId); rimuoviAllegato(pratica.id, esistente.id) }}
              className="ml-auto shrink-0 text-xs text-rose-400 transition hover:text-rose-700"
            >
              rimuovi
            </button>
          </>
        ) : (
          <label className="ml-auto shrink-0 cursor-pointer rounded-lg border border-linea px-2.5 py-1 text-xs font-semibold text-inchiostro/60 transition hover:border-petrolio/40 hover:text-petrolio">
            {inCorso ? 'Carico…' : 'Scegli file'}
            <input type="file" className="hidden" disabled={inCorso}
              onChange={(e) => { onFile(e.target.files?.[0] ?? null); e.target.value = '' }} />
          </label>
        )}
      </div>
      {errore && <p className="mt-1 pl-7 text-xs text-rose-600">{errore}</p>}
    </div>
  )
}

// ─── I 4 AssessFirst di UNA persona: un solo caricamento, riconoscimento dal nome ───
function CaricaAssessFirst({ pratica, persona }: { pratica: Pratica; persona: PersonaAF }) {
  const { registraAllegato, rimuoviAllegato } = useApp()
  const [inCorso, setInCorso] = useState(false)
  const [daAssegnare, setDaAssegnare] = useState<File[]>([])
  const [errore, setErrore] = useState('')

  const slot = (s: string) =>
    pratica.allegati.find((a) => a.tipo === 'assessfirst' && a.dipendente === persona.nome && a.sottotipo === s)

  const salva = async (f: File, sottotipo: string) => {
    const c = await caricaFile(f, { praticaId: pratica.id, categoria: 'assessfirst', dipendente: persona.nome, sottotipo })
    registraAllegato(pratica.id, {
      id: uid(), nome: c.nome, tipo: 'assessfirst', sottotipo, dipendente: persona.nome,
      fileId: c.id, dimensione: c.dimensione, caricatoDa: 'Venditore', dataCaricamento: new Date().toISOString(),
    })
  }

  // Riconosce e carica una manciata di file in un colpo solo.
  const processa = async (files: File[]) => {
    setErrore(''); setInCorso(true)
    const nonRiconosciuti: File[] = []
    try {
      for (const f of files) {
        const cat = categoriaDaNome(f.name)
        if (cat) await salva(f, cat)
        else nonRiconosciuti.push(f)
      }
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'caricamento fallito')
    } finally {
      setInCorso(false)
      setDaAssegnare(nonRiconosciuti)
    }
  }

  const completa = ASSESSFIRST_TIPI.every((s) => slot(s))

  return (
    <div className={`rounded-xl border p-3 ${completa ? 'border-green-200 bg-green-50/40' : 'border-linea bg-inchiostro/[0.015]'}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-inchiostro">{persona.nome}</span>
        <span className="rounded-full bg-inchiostro/5 px-2 py-0.5 text-[11px] text-inchiostro/55">{persona.ruolo}</span>
        <label className="ml-auto shrink-0 cursor-pointer rounded-lg bg-petrolio px-3 py-1 text-xs font-semibold text-white transition hover:bg-petrolio-scuro">
          {inCorso ? 'Carico…' : completa ? 'Ricarica i file' : 'Carica i 4 file insieme'}
          <input type="file" multiple accept=".pdf" className="hidden" disabled={inCorso}
            onChange={(e) => { processa(Array.from(e.target.files ?? [])); e.target.value = '' }} />
        </label>
        {completa && <span className="text-xs font-semibold text-green-700">4/4 ✓</span>}
      </div>

      {/* stato dei 4: riconosciuto automaticamente, con controllo che il nome sia della persona */}
      <div className="grid gap-1.5 sm:grid-cols-2">
        {ASSESSFIRST_TIPI.map((s) => {
          const a = slot(s)
          const nomeOk = a ? nomeCorrisponde(a.nome, persona.nome) : true
          return (
            <div key={s} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${
              a ? (nomeOk ? 'border-green-200 bg-green-50/60' : 'border-amber-300 bg-amber-50') : 'border-linea bg-carta'}`}>
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                a ? (nomeOk ? 'bg-green-100 text-green-700' : 'bg-amber-200 text-amber-800') : 'border-2 border-inchiostro/15 text-transparent'}`}>
                {a ? (nomeOk ? '✓' : '!') : ''}
              </span>
              <span className="w-24 shrink-0 font-semibold text-inchiostro/70">{s}</span>
              {a ? (
                <>
                  <span className="truncate text-inchiostro/60" title={a.nome}>{a.nome}</span>
                  <button onClick={() => { if (a.fileId) cancellaFile(a.fileId); rimuoviAllegato(pratica.id, a.id) }}
                    className="ml-auto shrink-0 text-rose-400 transition hover:text-rose-700">rimuovi</button>
                </>
              ) : (
                <span className="text-inchiostro/35">manca</span>
              )}
            </div>
          )
        })}
      </div>

      {/* avviso: qualche slot ha il nome di un'altra persona → da correggere */}
      {ASSESSFIRST_TIPI.some((s) => { const a = slot(s); return a && !nomeCorrisponde(a.nome, persona.nome) }) && (
        <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
          ⚠ Un file (giallo, «!») non ha nel nome «{persona.nome}»: controlla che sia davvero suo, altrimenti rimuovilo e ricarica quello giusto.
        </p>
      )}

      {/* file caricati ma non riconosciuti: assegnazione manuale */}
      {daAssegnare.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {daAssegnare.map((f, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs text-rose-800">
              <span className="truncate">Non riconosciuto: <strong>{f.name}</strong></span>
              <select defaultValue="" aria-label="Assegna a" className="ml-auto rounded border border-rose-200 bg-white px-1.5 py-0.5 text-xs"
                onChange={async (e) => {
                  if (!e.target.value) return
                  await salva(f, e.target.value)
                  setDaAssegnare(daAssegnare.filter((_, j) => j !== i))
                }}>
                <option value="">assegna a…</option>
                {ASSESSFIRST_TIPI.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
      {errore && <p className="mt-2 text-xs text-rose-600">{errore}</p>}
    </div>
  )
}

// ─── FASE 2: caricamento documenti (reale) ───
function CartaRaccolta({ pratica, onConfermata }: { pratica: Pratica; onConfermata: (azienda: string) => void }) {
  const { clientePronto } = useApp()
  const pronti = documentiTutorPronti(pratica)

  return (
    <div className="card-sollevabile rounded-2xl border border-linea bg-carta p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-display font-bold tracking-tight text-inchiostro">{pratica.azienda}</h3>
          <p className="truncate text-sm text-inchiostro/50">{pratica.cliente} · {pratica.email}</p>
          <p className="mt-1 text-xs text-inchiostro/40">
            Registrato il {dataIt(pratica.dataCreazione)} · {pratica.dipendenti.length} {pratica.dipendenti.length === 1 ? 'persona' : 'persone'}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Fase 2 — documenti
        </span>
      </div>

      {/* Documenti dell'azienda */}
      <div className="mt-4">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-inchiostro/40">Documenti dell&rsquo;azienda</p>
        <div className="space-y-1.5">
          <SlotUpload pratica={pratica} categoria="questionario" label="Questionario" />
          <SlotUpload pratica={pratica} categoria="trascrizione" label="Trascrizione" />
        </div>
      </div>

      {/* AssessFirst per persona: UN caricamento, i 4 file riconosciuti dal nome */}
      <div className="mt-4">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-inchiostro/40">
          AssessFirst — carica i 4 file di ogni persona insieme (SWIPE, DRIVE, BRAIN, Comportamenti riconosciuti dal nome)
        </p>
        <div className="space-y-3">
          {pratica.dipendenti.map((d) => (
            <CaricaAssessFirst key={d.nome} pratica={pratica} persona={d} />
          ))}
        </div>
      </div>

      <button
        onClick={() => { clientePronto(pratica.id); onConfermata(pratica.azienda) }}
        disabled={!pronti}
        className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${pronti ? 'bg-ambra text-white hover:bg-amber-700' : 'cursor-not-allowed border border-linea bg-carta text-inchiostro/30'}`}
      >
        🚀 Completo — avvia generazione e report AssessFirst
      </button>
      {!pronti && (
        <p className="mt-2 text-xs text-inchiostro/40">
          Il bottone si attiva quando ci sono questionario, trascrizione e tutti e 4 gli AssessFirst di ogni persona.
        </p>
      )}
    </div>
  )
}

export default function PaginaTutor() {
  const { state } = useApp()
  const [formAperto, setFormAperto] = useState(false)
  const [aziendaCreata, setAziendaCreata] = useState<string | null>(null)
  const [aziendaConfermata, setAziendaConfermata] = useState<string | null>(null)

  const inRaccolta = state.pratiche.filter((p) => p.faseCorrente === 'vendita' || p.faseCorrente === 'raccolta-documenti')
  const inLavorazione = state.pratiche.filter((p) => indiceFase(p.faseCorrente) >= indiceFase('generazione'))

  return (
    <RoleShell
      ruolo="Tutor"
      colore="bg-indigo-500"
      sottotitolo="Fase 1: registri il cliente. Fase 2: carichi i documenti e avvii la pipeline."
      notifiche={contaNotifiche(state, 'tutor')}
    >
      <div className="space-y-10">
        {/* FASE 1 */}
        <section className="anima anima-1">
          <TitoloSezione titolo="Fase 1 — Nuovo cliente" />
          <p className="mt-1 text-xs text-inchiostro/45">Registra azienda, titolare e le persone da valutare (nome, email, ruolo).</p>
          <div className="mt-3 space-y-3">
            {aziendaCreata && (
              <BannerConferma
                testo={<>Cliente <strong>{aziendaCreata}</strong> registrato: ora carica i documenti nella Fase 2 qui sotto.</>}
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

        {/* FASE 2 */}
        <section className="anima anima-2">
          <TitoloSezione titolo="Fase 2 — Documenti da caricare" conteggio={`${inRaccolta.length} in raccolta`} />
          <p className="mt-1 text-xs text-inchiostro/45">
            Il venditore carica questionario e trascrizione dell&rsquo;azienda e i 4 AssessFirst di ogni persona. I file restano a sistema fino al report AssessFirst.
          </p>
          <div className="mt-3 space-y-4">
            {aziendaConfermata && (
              <BannerConferma
                testo={<>Pipeline avviata per <strong>{aziendaConfermata}</strong>: generazione e report AssessFirst in corso.</>}
                onChiudi={() => setAziendaConfermata(null)}
              />
            )}
            {inRaccolta.length === 0 ? (
              <EmptyState titolo="Nessun cliente in raccolta documenti" sottotitolo="Registra un cliente nella Fase 1: comparirà qui per il caricamento dei documenti." icona="📂" />
            ) : (
              inRaccolta.map((p) => <CartaRaccolta key={p.id} pratica={p} onConfermata={setAziendaConfermata} />)
            )}
          </div>
        </section>

        {/* In lavorazione */}
        <section className="anima anima-3">
          <TitoloSezione titolo="In lavorazione" conteggio={`${inLavorazione.length} pratiche`} />
          <p className="mt-1 text-xs text-inchiostro/45">Da qui in poi lavorano Irene e il team copy: questi macro-stati ti bastano per aggiornare il cliente.</p>
          <div className="mt-3 space-y-3">
            {inLavorazione.length === 0 ? (
              <EmptyState titolo="Nessuna pratica in lavorazione" sottotitolo="Le pratiche avviate compariranno qui con il loro stato." icona="🗂️" />
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
