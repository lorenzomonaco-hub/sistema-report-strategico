// ─── Consulenze Frank — Gantt ufficiale ───
// Dati ufficiali forniti da Lorenzo il 14/07/2026 (file "Gantt_Consulenze_Frank_
// XY_Max2_14-07-2026.xlsx", foglio "Elenco consegne"), non ricalcolati dalla
// piattaforma: le date di consegna qui sotto sono già il risultato del piano
// approvato, con il vincolo "massimo 2 consegne per giornata lavorativa" (weekend
// esclusi) e la priorità di coda fase 5 → 4 → 3 → 1 → 2. Se il piano cambia,
// aggiornare qui i valori con il nuovo file ufficiale.

export type FaseFrank = 1 | 2 | 3 | 4 | 5 | 6

export type RigaFrank = {
  cliente: string
  fase: FaseFrank
  owner: string
  consegnaPrevista: Date
  nota: string
  // Milestone reali dei passaggi già completati (dal foglio maestro CONSULENZE FRANK -
  // Report in lavorazione). Presenti solo per i clienti già entrati in pipeline (fase 3-6);
  // per chi è ancora in copy o dall'avvocato non esistono ancora date a monte.
  entrata?: Date       // questionario ricevuto — ingresso in produzione
  copyDone?: Date      // copy completato (invio a Grippo)
  grippoDone?: Date    // revisione testo Grippo completata (ricevuto da Grippo)
  consulenzaFrank?: Date // step finale: data della consulenza con Frank (dal foglio maestro, se fissata)
  branding?: boolean   // il progetto passa dalla revisione dell'avvocato Jelo (fase 2)
}

export function slugFrank(cliente: string): string {
  return cliente
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const FASI_FRANK: Record<FaseFrank, { label: string; sub: string }> = {
  1: { label: 'Creazione copy', sub: 'piano marketing o branding' },
  2: { label: 'Revisione avvocato Jelo', sub: 'solo per branding, ~3gg lavorativi' },
  3: { label: 'Agente AI — Grippo (Testo)', sub: 'revisione testo' },
  4: { label: 'Agente AI — Caputo (Immagini)', sub: 'revisione immagini' },
  5: { label: 'Agente AI — Valentino (Grafica)', sub: 'revisione grafica' },
  6: { label: 'In consegna', sub: 'consegna già in corso' },
}

const d = (giorno: number, mese: number) => new Date(2026, mese - 1, giorno)

// Ordine di coda ufficiale (già quello del piano approvato): fase 5 → 4 → 3 → 1 → 2,
// due consegne per giornata lavorativa, weekend esclusi.
export const CONSULENZE_FRANK: RigaFrank[] = [
  { cliente: 'Matteo Zurlo', fase: 6, owner: 'Delivery', consegnaPrevista: d(14, 7), nota: 'Consegna già in corso.', entrata: d(23, 2), copyDone: d(27, 5), grippoDone: d(6, 7) },

  { cliente: 'Ferrario', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(15, 7), nota: 'Manca la grafica del punto 5 — ordine mantenuto come fornito.', entrata: d(15, 5) },
  { cliente: 'Simone Tomasini', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(15, 7), nota: '', entrata: d(11, 2), copyDone: d(3, 6) },
  { cliente: 'Giuseppe Di Guida', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(16, 7), nota: '', entrata: d(31, 3), copyDone: d(15, 6) },
  { cliente: 'Davide Raimondi', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(16, 7), nota: '', entrata: d(20, 1), copyDone: d(25, 5), grippoDone: d(2, 7), consulenzaFrank: d(30, 9) },
  { cliente: 'Emanuele Soffiotto', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(17, 7), nota: '', entrata: d(15, 4), copyDone: d(29, 6), grippoDone: d(8, 7) },
  { cliente: 'Francesco Surace', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(17, 7), nota: '', entrata: d(21, 4), copyDone: d(6, 7), grippoDone: d(6, 7) },
  { cliente: 'Gaetano Rodittis', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(20, 7), nota: '', entrata: d(27, 3), copyDone: d(12, 6), grippoDone: d(9, 7) },
  { cliente: 'Marco Giaferri', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(20, 7), nota: '', entrata: d(5, 5), copyDone: d(2, 7), grippoDone: d(6, 7) },
  { cliente: 'Marco Ruggeri', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(21, 7), nota: '', entrata: d(28, 4), copyDone: d(10, 7), grippoDone: d(10, 7) },
  { cliente: 'Michela Sartori', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(21, 7), nota: '', entrata: d(20, 2), copyDone: d(25, 5), grippoDone: d(7, 7), consulenzaFrank: d(27, 8) },
  { cliente: 'Imbriano 2', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(22, 7), nota: '2° progetto del cliente Imbriano.', entrata: d(10, 2), copyDone: d(14, 7) },

  { cliente: 'Giovanni Mazzamati', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(22, 7), nota: '', entrata: d(2, 4), copyDone: d(22, 6) },
  { cliente: 'Gabriele Cascone', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(23, 7), nota: '', entrata: d(18, 2), copyDone: d(3, 6) },
  { cliente: 'Agostino Romano', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(23, 7), nota: '', entrata: d(29, 5), copyDone: d(3, 6) },
  { cliente: 'Stefano Lazzarini', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(24, 7), nota: '', entrata: d(11, 3), copyDone: d(8, 6) },
  { cliente: 'Michele Brioni', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(24, 7), nota: '', entrata: d(16, 2), copyDone: d(8, 6) },
  { cliente: 'Davide Ghelardi', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(27, 7), nota: '', entrata: d(19, 3) },
  { cliente: 'Filippo Griggio', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(27, 7), nota: '', entrata: d(2, 3), copyDone: d(18, 6) },
  { cliente: 'Samuele Turcato', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(28, 7), nota: '', entrata: d(13, 3), copyDone: d(18, 6) },
  { cliente: 'Nicola Angius', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(28, 7), nota: '', entrata: d(1, 4), copyDone: d(22, 6) },
  { cliente: 'Rudy Luxardo', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(29, 7), nota: 'Inviato per revisione immagini.', entrata: d(11, 5), copyDone: d(14, 7) },

  { cliente: 'Daniele Sciannimanico', fase: 3, owner: 'Agente AI Grippo', consegnaPrevista: d(29, 7), nota: 'Primo cliente nella coda della revisione testo.', entrata: d(12, 2), copyDone: d(28, 5) },

  { cliente: 'Mastella', fase: 1, owner: 'Carlo', consegnaPrevista: d(30, 7), nota: 'Data indicata trattata come fine copy. Tipologia branding da confermare.' },
  { cliente: 'Rea', fase: 1, owner: 'Carlo', consegnaPrevista: d(30, 7), nota: 'Data indicata trattata come fine copy. Tipologia branding da confermare.' },

  { cliente: 'Pessot', fase: 2, owner: 'Avv. Jelo', consegnaPrevista: d(31, 7), nota: 'Attesa 2° brand avvocato.', branding: true },
  { cliente: 'Lancia', fase: 2, owner: 'Avv. Jelo', consegnaPrevista: d(31, 7), nota: 'In attesa di approvazione Avv. Jelo.', branding: true },
  { cliente: 'Barcello', fase: 2, owner: 'Avv. Jelo', consegnaPrevista: d(3, 8), nota: 'In attesa di approvazione Avv. Jelo.', branding: true },
  { cliente: 'Cazan (3° brand)', fase: 2, owner: 'Avv. Jelo', consegnaPrevista: d(3, 8), nota: 'In attesa di approvazione Avv. Jelo.', branding: true },
  { cliente: 'Imbriano 1', fase: 2, owner: 'Avv. Jelo', consegnaPrevista: d(4, 8), nota: 'Branding — in attesa di approvazione Avv. Jelo.', branding: true },

  { cliente: 'Banfi', fase: 1, owner: 'Carlo', consegnaPrevista: d(4, 8), nota: 'Data indicata trattata come fine copy. Tipologia branding da confermare.' },
  { cliente: 'Donnantuono', fase: 1, owner: 'Da assegnare', consegnaPrevista: d(5, 8), nota: 'Data indicata trattata come fine copy. Tipologia branding da confermare.' },
  { cliente: 'Novella', fase: 1, owner: 'Paolo', consegnaPrevista: d(5, 8), nota: 'Data indicata trattata come fine copy. Inizia e finisce il 22/7. Tipologia branding da confermare.' },
  { cliente: 'Tamburini', fase: 1, owner: 'Luigi', consegnaPrevista: d(6, 8), nota: 'Data indicata trattata come fine copy. Tipologia branding da confermare.' },
]

export const FRANK_OGGI = new Date(2026, 6, 14) // martedì 14/07/2026, stessa data di riferimento del file ufficiale

export function frankBySlug(slug: string): RigaFrank | null {
  return CONSULENZE_FRANK.find((r) => slugFrank(r.cliente) === slug) ?? null
}

export type StatoStep = 'fatto' | 'in-corso' | 'da-fare'

export type EventoTimeline = {
  step: number          // 1..7 (1-5 fasi, 6 consegna, 7 consulenza) — per il colore rosso→verde
  titolo: string
  owner: string
  data?: Date           // data reale/prevista, se nota
  dataLabel?: string    // testo alternativo quando non c'è una data (es. "da programmare")
  stato: StatoStep
}

/**
 * Ricostruisce il log completo della timeline di un progetto: cosa è già stato
 * fatto (con data reale) e cosa resta (previsto). Ordine cronologico del flusso.
 */
export function timelineFrank(r: RigaFrank): EventoTimeline[] {
  const ev: EventoTimeline[] = []
  const statoFase = (n: number): StatoStep =>
    r.fase === 6 ? 'fatto' : n < r.fase ? 'fatto' : n === r.fase ? 'in-corso' : 'da-fare'

  if (r.entrata) {
    ev.push({ step: 0, titolo: 'Ingresso in pipeline', owner: 'Questionario ricevuto', data: r.entrata, stato: 'fatto' })
  }
  ev.push({ step: 1, titolo: 'Creazione copy', owner: r.fase === 1 ? r.owner : 'Copy', data: r.copyDone, stato: statoFase(1) })
  if (r.branding || r.fase === 2) {
    ev.push({ step: 2, titolo: 'Revisione avvocato Jelo', owner: 'Avv. Jelo', dataLabel: 'solo per branding', stato: statoFase(2) })
  }
  ev.push({ step: 3, titolo: 'Agente AI — Grippo (Testo)', owner: 'Agente AI Grippo', data: r.grippoDone, stato: statoFase(3) })
  ev.push({ step: 4, titolo: 'Agente AI — Caputo (Immagini)', owner: 'Agente AI Caputo', stato: statoFase(4) })
  ev.push({ step: 5, titolo: 'Agente AI — Valentino (Grafica)', owner: 'Agente AI Valentino', stato: statoFase(5) })
  ev.push({ step: 6, titolo: 'Consegna del report', owner: 'Delivery', data: r.consegnaPrevista, stato: r.fase === 6 ? 'fatto' : 'da-fare' })
  ev.push({
    step: 7, titolo: 'Consulenza con Frank', owner: 'Frank Merenda',
    data: r.consulenzaFrank, dataLabel: r.consulenzaFrank ? undefined : 'da programmare',
    stato: r.consulenzaFrank && r.consulenzaFrank.getTime() <= FRANK_OGGI.getTime() ? 'fatto' : 'da-fare',
  })
  return ev
}
