'use client'

// ─── Gestione clienti (hub triage + report unico) ───
// Registro clienti editabile: rinomina, split (un cliente in più prodotti),
// aggiungi, nascondi. Per ciascuno: prodotto, tipo call (Frank/Moreno/Nessuna,
// dedotto dal prodotto ma correggibile), stato di lavorazione e note.
// Tutto nello stato condiviso: le chiavi sono stabili, niente indici che slittano.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/store'
import { tokenDati } from '@/lib/datiblocco'
import { inviaEmail } from '@/lib/email'
import { ClienteRegistro, STATI_CLIENTE, TipoCall, tipoCallDaProdotto } from '@/lib/types'
import NoteCliente from '@/components/NoteCliente'

// Indirizzo di TEST per gli invii ai tutor (poi si passa alle email reali dei tutor).
const EMAIL_TEST = 'irene.delbelbelluz@metodomerenda.com'
const emailTutor = (t: string) => {
  const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '')
  const p = (t || '').trim().split(/\s+/); const n = norm(p[0] || ''); const c = norm(p.slice(1).join('') || '')
  return n && c ? `${n}.${c}@metodomerenda.com` : ''
}
const fmtGiorno = (iso: string) => new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })

const TIPI_CALL: TipoCall[] = ['Frank', 'Moreno', 'Nessuna']
const coloreCall: Record<TipoCall, string> = {
  Frank: 'bg-petrolio/12 text-petrolio-scuro',
  Moreno: 'bg-violet-100 text-violet-700',
  Nessuna: 'bg-inchiostro/[0.07] text-inchiostro/55',
}
const rnd = () => Math.random().toString(36).slice(2, 8)

function Riga({ c }: { c: ClienteRegistro }) {
  const { modificaRegistro, aggiungiRegistro, statoCliente } = useApp()
  const [aperto, setAperto] = useState(false)
  const [nome, setNome] = useState(c.nome)
  const [azienda, setAzienda] = useState(c.azienda)
  const [prodotto, setProdotto] = useState(c.prodotto)
  const [tipoCall, setTipoCall] = useState<TipoCall>(c.tipoCall)
  const [salvato, setSalvato] = useState(false)
  const [emailStato, setEmailStato] = useState('')
  const tutorMail = emailTutor(c.tutor)

  const chiediAggiornamento = async () => {
    setEmailStato('invio')
    try {
      await inviaEmail({
        token: tokenDati(), a: EMAIL_TEST,
        oggetto: `Aggiornamento cliente — ${c.nome}`,
        corpo: `Ciao ${c.tutor},\n\nci puoi aggiornare sullo stato di ${c.nome}${c.azienda ? ` (${c.azienda})` : ''}?\n${c.dataSollecito ? `Sollecito previsto: ${fmtGiorno(c.dataSollecito)}.\n` : ''}\nGrazie.\n\n[Invio di TEST — destinatario reale del tutor: ${tutorMail || '—'}]`,
      })
      setEmailStato('ok')
    } catch (e) { setEmailStato('err:' + (e instanceof Error ? e.message : 'invio fallito')) }
  }

  const stato = statoCliente[c.id] ?? ''
  const inp = 'rounded-lg border border-linea bg-carta px-2.5 py-1.5 text-sm text-inchiostro focus:border-petrolio focus:outline-none'

  const salva = () => {
    modificaRegistro(c.id, { nome: nome.trim() || c.nome, azienda: azienda.trim(), prodotto: prodotto.trim(), tipoCall })
    setSalvato(true); setTimeout(() => setSalvato(false), 1500)
  }
  const split = () => {
    aggiungiRegistro({ ...c, id: `${c.id}--s${rnd()}`, nome: `${c.nome} (nuovo)`, origine: 'manuale' })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-linea bg-carta shadow-sm">
      <button onClick={() => setAperto((v) => !v)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-inchiostro/[0.02]">
        <div className="min-w-0">
          <p className="truncate font-display font-bold text-inchiostro">{c.nome}</p>
          <p className="truncate text-[11px] text-inchiostro/70">
            {c.azienda || '—'} · tutor {c.tutor}{c.prodotto ? ` · ${c.prodotto}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${coloreCall[c.tipoCall]}`}>{c.tipoCall === 'Nessuna' ? 'no call' : `call ${c.tipoCall}`}</span>
          {stato && <span className="rounded-full bg-inchiostro/[0.08] px-2 py-0.5 text-[10px] font-bold text-inchiostro/70">{stato}</span>}
          <span className="text-inchiostro/40">{aperto ? '▲' : '▼'}</span>
        </div>
      </button>

      {aperto && (
        <div className="space-y-3 border-t border-linea bg-inchiostro/[0.015] p-4">
          {/* anagrafica editabile */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-inchiostro/50">Nome
              <input value={nome} onChange={(e) => setNome(e.target.value)} className={`mt-1 w-full ${inp}`} /></label>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-inchiostro/50">Azienda
              <input value={azienda} onChange={(e) => setAzienda(e.target.value)} className={`mt-1 w-full ${inp}`} /></label>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-inchiostro/50">Prodotto
              <input value={prodotto} onChange={(e) => { setProdotto(e.target.value); setTipoCall(tipoCallDaProdotto(e.target.value)) }} placeholder="es. Strategica, Branding, Smart" className={`mt-1 w-full ${inp}`} /></label>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-inchiostro/50">Tipo call
              <select value={tipoCall} onChange={(e) => setTipoCall(e.target.value as TipoCall)} className={`mt-1 w-full ${inp}`}>
                {TIPI_CALL.map((t) => <option key={t} value={t}>{t === 'Nessuna' ? 'Nessuna (branding)' : t}</option>)}
              </select></label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={salva} className="rounded-lg bg-petrolio px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-petrolio-scuro">Salva anagrafica</button>
            {salvato && <span className="text-[11px] font-semibold text-green-700">✓ salvato</span>}
            <button onClick={split} className="rounded-lg border border-linea bg-carta px-3 py-1.5 text-[12px] font-semibold text-inchiostro/70 hover:border-petrolio/40">➕ Split (aggiungi prodotto/cliente derivato)</button>
            <button onClick={() => modificaRegistro(c.id, { nascosto: !c.nascosto })} className="rounded-lg border border-linea bg-carta px-3 py-1.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50">{c.nascosto ? 'Ripristina' : '🙈 Nascondi'}</button>
          </div>

          {/* sollecito: data + email al tutor per aggiornamenti */}
          <div className="flex flex-wrap items-end gap-2 rounded-lg border border-linea bg-carta p-2.5">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-inchiostro/50">Data sollecito
              <input type="date" value={c.dataSollecito ?? ''} onChange={(e) => modificaRegistro(c.id, { dataSollecito: e.target.value || undefined })}
                className={`mt-1 block ${inp}`} /></label>
            <button onClick={chiediAggiornamento} disabled={emailStato === 'invio'}
              className="rounded-lg bg-petrolio px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-petrolio-scuro disabled:opacity-40">📧 Chiedi aggiornamento al tutor</button>
            <span className="text-[11px] text-inchiostro/55">tutor: {tutorMail || c.tutor} <span className="text-inchiostro/40">(test → {EMAIL_TEST})</span></span>
            {emailStato === 'ok' && <span className="text-[11px] font-semibold text-green-700">✓ inviata</span>}
            {emailStato.startsWith('err:') && <span className="text-[11px] font-semibold text-rose-600">{emailStato.slice(4)}</span>}
          </div>

          {/* stato + note (chiave stabile del registro) */}
          <NoteCliente cliente={c.nome} azienda={c.azienda} nome={c.nome} chiaveOverride={c.id} />
        </div>
      )}
    </div>
  )
}

export default function GestioneClienti() {
  const { registro, aggiungiRegistro, statoCliente } = useApp()
  const [q, setQ] = useState('')
  const [mostraNascosti, setMostraNascosti] = useState(false)
  const [nuovoAperto, setNuovoAperto] = useState(false)
  const [nn, setNn] = useState({ nome: '', azienda: '', tutor: '', prodotto: '' })

  const norm = (s: string) => s.toLowerCase()
  const visibili = registro.filter((c) => (mostraNascosti || !c.nascosto))
  const filtrati = q.trim()
    ? visibili.filter((c) => norm(`${c.nome} ${c.azienda} ${c.tutor} ${c.prodotto}`).includes(norm(q.trim())))
    : visibili

  // riepilogo per stato (solo registro visibile)
  const perStato = useMemo(() => {
    const m: Record<string, number> = {}
    for (const c of registro) { if (c.nascosto) continue; const s = statoCliente[c.id]; if (s) m[s] = (m[s] ?? 0) + 1 }
    return m
  }, [registro, statoCliente])
  const conStato = Object.values(perStato).reduce((a, x) => a + x, 0)

  const creaNuovo = () => {
    if (!nn.nome.trim()) return
    aggiungiRegistro({ id: `man-${rnd()}`, nome: nn.nome.trim(), azienda: nn.azienda.trim(), tutor: nn.tutor.trim() || '—', prodotto: nn.prodotto.trim(), tipoCall: tipoCallDaProdotto(nn.prodotto), origine: 'manuale' })
    setNn({ nome: '', azienda: '', tutor: '', prodotto: '' }); setNuovoAperto(false)
  }

  return (
    <div className="min-h-screen flex-1 sfondo-trama">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ambra">Solo amministratori</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-inchiostro">Gestione clienti</h1>
            <p className="mt-1 max-w-2xl text-sm text-inchiostro/70">
              L&rsquo;hub unico: rinomina, splitta (un cliente in più prodotti), aggiungi o nascondi un cliente; imposta prodotto, tipo di call (Frank/Moreno/nessuna), stato e note. {registro.length} clienti nel registro.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/amministrazione/tutor" className="rounded-xl border border-linea bg-carta px-3 py-1.5 text-xs font-semibold text-inchiostro/60 hover:text-inchiostro">← Clienti per tutor</Link>
          </div>
        </header>

        {/* riepilogo per stato */}
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-inchiostro/[0.06] px-3 py-1 text-xs font-semibold text-inchiostro/60">{conStato} con stato</span>
          {STATI_CLIENTE.filter((s) => perStato[s]).map((s) => (
            <span key={s} className="rounded-full border border-linea bg-carta px-3 py-1 text-xs font-semibold text-inchiostro/70">{s}: <b className="text-inchiostro">{perStato[s]}</b></span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="relative max-w-md flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-inchiostro/40">🔍</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca per nome, azienda, tutor, prodotto…"
              className="w-full rounded-xl border border-linea bg-carta py-2 pl-9 pr-3 text-sm text-inchiostro placeholder:text-inchiostro/40 focus:border-petrolio focus:outline-none focus:ring-2 focus:ring-petrolio/15" />
          </div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-inchiostro/60">
            <input type="checkbox" checked={mostraNascosti} onChange={(e) => setMostraNascosti(e.target.checked)} className="h-4 w-4 accent-petrolio" /> mostra nascosti
          </label>
          <button onClick={() => setNuovoAperto((v) => !v)} className="ml-auto rounded-xl bg-petrolio px-3 py-2 text-xs font-semibold text-white hover:bg-petrolio-scuro">+ Aggiungi cliente</button>
        </div>

        {nuovoAperto && (
          <div className="mt-3 grid gap-2 rounded-2xl border border-petrolio/30 bg-petrolio/[0.04] p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <input value={nn.nome} onChange={(e) => setNn({ ...nn, nome: e.target.value })} placeholder="Nome" className="rounded-lg border border-linea bg-carta px-2.5 py-2 text-sm" />
            <input value={nn.azienda} onChange={(e) => setNn({ ...nn, azienda: e.target.value })} placeholder="Azienda" className="rounded-lg border border-linea bg-carta px-2.5 py-2 text-sm" />
            <input value={nn.tutor} onChange={(e) => setNn({ ...nn, tutor: e.target.value })} placeholder="Tutor" className="rounded-lg border border-linea bg-carta px-2.5 py-2 text-sm" />
            <input value={nn.prodotto} onChange={(e) => setNn({ ...nn, prodotto: e.target.value })} placeholder="Prodotto" className="rounded-lg border border-linea bg-carta px-2.5 py-2 text-sm" />
            <button onClick={creaNuovo} className="rounded-lg bg-petrolio px-3 py-2 text-sm font-semibold text-white hover:bg-petrolio-scuro">Crea</button>
          </div>
        )}

        <p className="mt-4 text-[11px] text-inchiostro/55">{filtrati.length} clienti{q ? ` per «${q}»` : ''}</p>
        <div className="mt-2 space-y-2">
          {filtrati.map((c) => <Riga key={c.id} c={c} />)}
          {filtrati.length === 0 && <p className="text-sm text-inchiostro/50">Nessun cliente.</p>}
        </div>
      </div>
    </div>
  )
}
