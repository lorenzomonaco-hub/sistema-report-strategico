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
  { cliente: 'Matteo Zurlo', fase: 6, owner: 'Delivery', consegnaPrevista: d(14, 7), nota: 'Consegna già in corso.' },

  { cliente: 'Ferrario', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(15, 7), nota: 'Manca la grafica del punto 5 — ordine mantenuto come fornito.' },
  { cliente: 'Simone Tomasini', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(15, 7), nota: '' },
  { cliente: 'Giuseppe Di Guida', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(16, 7), nota: '' },
  { cliente: 'Davide Raimondi', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(16, 7), nota: '' },
  { cliente: 'Emanuele Soffiotto', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(17, 7), nota: '' },
  { cliente: 'Francesco Surace', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(17, 7), nota: '' },
  { cliente: 'Gaetano Rodittis', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(20, 7), nota: '' },
  { cliente: 'Marco Giaferri', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(20, 7), nota: '' },
  { cliente: 'Marco Ruggeri', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(21, 7), nota: '' },
  { cliente: 'Michela Sartori', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(21, 7), nota: '' },
  { cliente: 'Imbriano 2', fase: 5, owner: 'Agente AI Valentino', consegnaPrevista: d(22, 7), nota: '2° progetto del cliente Imbriano.' },

  { cliente: 'Giovanni Mazzamati', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(22, 7), nota: '' },
  { cliente: 'Gabriele Cascone', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(23, 7), nota: '' },
  { cliente: 'Agostino Romano', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(23, 7), nota: '' },
  { cliente: 'Stefano Lazzarini', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(24, 7), nota: '' },
  { cliente: 'Michele Brioni', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(24, 7), nota: '' },
  { cliente: 'Davide Ghelardi', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(27, 7), nota: '' },
  { cliente: 'Filippo Griggio', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(27, 7), nota: '' },
  { cliente: 'Samuele Turcato', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(28, 7), nota: '' },
  { cliente: 'Nicola Angius', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(28, 7), nota: '' },
  { cliente: 'Rudy Luxardo', fase: 4, owner: 'Agente AI Caputo', consegnaPrevista: d(29, 7), nota: 'Inviato per revisione immagini.' },

  { cliente: 'Daniele Sciannimanico', fase: 3, owner: 'Agente AI Grippo', consegnaPrevista: d(29, 7), nota: 'Primo cliente nella coda della revisione testo.' },

  { cliente: 'Mastella', fase: 1, owner: 'Carlo', consegnaPrevista: d(30, 7), nota: 'Data indicata trattata come fine copy. Tipologia branding da confermare.' },
  { cliente: 'Rea', fase: 1, owner: 'Carlo', consegnaPrevista: d(30, 7), nota: 'Data indicata trattata come fine copy. Tipologia branding da confermare.' },

  { cliente: 'Pessot', fase: 2, owner: 'Avv. Jelo', consegnaPrevista: d(31, 7), nota: 'Attesa 2° brand avvocato.' },
  { cliente: 'Lancia', fase: 2, owner: 'Avv. Jelo', consegnaPrevista: d(31, 7), nota: 'In attesa di approvazione Avv. Jelo.' },
  { cliente: 'Barcello', fase: 2, owner: 'Avv. Jelo', consegnaPrevista: d(3, 8), nota: 'In attesa di approvazione Avv. Jelo.' },
  { cliente: 'Cazan (3° brand)', fase: 2, owner: 'Avv. Jelo', consegnaPrevista: d(3, 8), nota: 'In attesa di approvazione Avv. Jelo.' },
  { cliente: 'Imbriano 1', fase: 2, owner: 'Avv. Jelo', consegnaPrevista: d(4, 8), nota: 'Branding — in attesa di approvazione Avv. Jelo.' },

  { cliente: 'Banfi', fase: 1, owner: 'Carlo', consegnaPrevista: d(4, 8), nota: 'Data indicata trattata come fine copy. Tipologia branding da confermare.' },
  { cliente: 'Donnantuono', fase: 1, owner: 'Da assegnare', consegnaPrevista: d(5, 8), nota: 'Data indicata trattata come fine copy. Tipologia branding da confermare.' },
  { cliente: 'Novella', fase: 1, owner: 'Paolo', consegnaPrevista: d(5, 8), nota: 'Data indicata trattata come fine copy. Inizia e finisce il 22/7. Tipologia branding da confermare.' },
  { cliente: 'Tamburini', fase: 1, owner: 'Luigi', consegnaPrevista: d(6, 8), nota: 'Data indicata trattata come fine copy. Tipologia branding da confermare.' },
]

export const FRANK_OGGI = new Date(2026, 6, 14) // martedì 14/07/2026, stessa data di riferimento del file ufficiale
