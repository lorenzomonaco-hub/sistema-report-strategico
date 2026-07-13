// ─── Quadro Aziendale ───
// Due code distinte: i clienti già in erogazione (dati reali dal file di
// Grippo, 13 lug 2026) e i 58 progetti futuri in attesa di produzione
// (modello a leve: quante persone, chi assorbe la revisione/grafica).

export const GIORNO_MS = 86_400_000
const OGGI = new Date(2026, 6, 13) // lunedì 13 luglio 2026

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']

export function workday(n: number): Date {
  const d = new Date(OGGI)
  let added = 0
  while (added < n) {
    d.setDate(d.getDate() + 1)
    const w = d.getDay()
    if (w !== 0 && w !== 6) added++
  }
  return d
}

export const fmtData = (d: Date) => `${d.getDate()} ${MESI[d.getMonth()]}`

export function fmtHM(min: number): string {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  if (h <= 0) return `${m}m`
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

// ============================================================
// SCOPE "FUTURI" — 58 progetti in attesa di produzione
// ============================================================

export const PROGETTI_FUTURI: [string, string, boolean][] = [
  ['Agostino Romano', 'Romano SPA · 2 piani mktg', false],
  ['Alessandro Chirico', 'Alessandro Chirico · Strategica', false],
  ['Alessandro Fazio', 'Fazio SRL · Startup', false],
  ['Alessandro Fazio', 'Nexora SRL · Piano Mktg', false],
  ['Alessandro Fazio', 'Nexora SRL · Brand', false],
  ['Alessio Barcello', 'Barcello Rappr. · Strat+Brand', false],
  ['Andrea Dallan', 'Dallan SPA · Marbella', false],
  ['Andrea Malgaroli', 'Ciski Malgaroli · Brand', false],
  ['Andrea Novella', 'Stilogistica SRL · Strategica', false],
  ['Andrea Poggi', 'Fastlan SRL · Strategica', false],
  ['Antonio Cannata', 'Red Raion SRL · Smart', false],
  ['Antonio Chillocci', "L'Artigiano Group · Strategica", false],
  ['Antonio Franzè', 'Antonio Franzè · Strategica', false],
  ['Bruno Stomeo', 'Bakery & Bakpow · Strat+Brand', false],
  ['Christian Valentini', 'Dinamica Pulizie · Strategica', false],
  ['Claudio De Padua', 'Clamore SSD · Piano Mktg', false],
  ['Davide Garofalo', 'Davide Garofalo · Startup', false],
  ['Diego Radenza', 'Tegi SRL · Strategica', false],
  ['Emiliano Peviani', 'Cercar SRL · Strategica', false],
  ['Ernesto Iuliano', 'Almer SRL · Strategica', false],
  ['Ethel Cogliani', 'Ethel Cogliani · Smart', false],
  ['Fabrizio Ascoli', 'Fabrizio Ascoli · Strategica', false],
  ['Federico Montagna', 'Fede & Vale SRL · Piano Mktg', false],
  ['Franco Tocci', 'Ambrogio SRL · Strategica', false],
  ['Gerardo Muto', 'Autocentro Muto · Piano Mktg', false],
  ['Gheorghe Cazan', '(azienda mancante) · Rebranding', false],
  ['Giacomo Roncarati', 'Tef SRL · Strategica', false],
  ['Gigi Marazzi', 'Marazzi Gian Luigi · Strategica', false],
  ['Giovanni Corsini', "Caffè Agust SRL · Strategica", false],
  ['Giovanni F. Maugeri', 'GFM SRLS · Strategica', false],
  ['Giovanni Pane', 'Studio Dent. Pane · Strategica', false],
  ['Giulia Favero', 'Officine Alpi SRL · Strategica', false],
  ['Ivan Righetti', 'Righetti Car Service · Strategica', false],
  ['Ivano Salina', 'Lubes SRL · Strategica', false],
  ['Jacopo Pisati', 'Studio Morassi Pisati · Strategica', false],
  ['Kemuel Paradiso', 'Termozero SRL · Strategica', false],
  ['Kevin Nucera', 'Kevin Nucera · Strategica', false],
  ['Lorenzo Romano', 'Lorenzo Romano · Strategica', false],
  ['Lorenzo Romano', '3 Soldi SRL · Strategica', false],
  ['Loris Cadiri', 'Homes4Holidays · Strategica', false],
  ['Luca Sgherri', 'Luca Sgherri · Strategica', false],
  ['Luca Ungaretti', 'Studio Dent. Ungaretti · Startup', false],
  ['Marco Torresan', 'Wedqueen SRL · Strategica', false],
  ['Marianna Santoni', 'Marianna Santoni SRL · Piano Mktg', true],
  ['Martinelli Mara', 'European Textile · Strategica', false],
  ['Massimiliano Rea', 'Erreesse SRL · Strategica', false],
  ['Matteo Gatti', 'C.G.R. Targhe e Timbri · Strategica', false],
  ['Nicola Ornelli', 'Bruciaferro SRL · Strategica', false],
  ['Nicolò Donnantuono', 'Pitwo SRL · Piano Mktg+CFO', false],
  ['Ornella Auzino', 'Rica SRL Uniperson. · Strategica', false],
  ['Paola Canegrati', 'Studio Signorelli · +Upsell', false],
  ['Piergiorgio Carlini', 'Assoc. Unisardegna · Smart', false],
  ["Roberto D'Ancona", 'Ecoenergie SRL · Strategica', false],
  ['Simone Turcato', 'Volta SRL · Piano Mktg', true],
  ['Stefano Bertoli', 'Secit SRLS · Smart', false],
  ['Steve Osler', 'Wildix SRL · Strategica', false],
  ['Ugo Cuncu', 'Ucnet SRL · Strategica', false],
  ['Vito Giudice', 'Giusta SRL · Strategica', false],
]
export const N_FUTURI = PROGETTI_FUTURI.length

export const GEN = 240, REVT = 60, REVG = 15, REVI = 30, CREDIT = 30, DAY = 420
export const AGENTE_TESTO = 35, AGENTE_GRAFICI = 10, AGENTE_IMPAG = 2
export const FULLAI_AGENTE = 60, FULLAI_INTERAZIONE = 60

export function perReportCopyMin(grippoOn: boolean, valentinoOn: boolean, fullAiOn: boolean): number {
  let m = fullAiOn ? FULLAI_INTERAZIONE : GEN
  if (!grippoOn) m += REVT
  if (!valentinoOn) m += REVG
  if (!grippoOn) m += REVI
  return m - CREDIT
}

export type RigaSchedulata = { nome: string; contesto: string; rifare: boolean; start: number; finish: number }
export type Schedule = {
  righe: RigaSchedulata[]
  per: number
  totalDays: number
  grippoUtilPct: number
  valentinoUtilPct: number
}

export function schedule(copyCount: number, grippoOn: boolean, valentinoOn: boolean, fullAiOn: boolean): Schedule {
  const per = perReportCopyMin(grippoOn, valentinoOn, fullAiOn)
  const lanes = new Array(copyCount).fill(0)
  const righe: RigaSchedulata[] = PROGETTI_FUTURI.map(([nome, contesto, rifare]) => {
    let li = 0
    for (let l = 1; l < lanes.length; l++) if (lanes[l] < lanes[li]) li = l
    const start = lanes[li]
    lanes[li] += per
    return { nome, contesto, rifare, start, finish: lanes[li] }
  })
  const copyDays = Math.ceil(Math.max(...lanes) / DAY)
  const grippoMin = grippoOn ? N_FUTURI * (REVT + REVI) * 0.10 : 0
  const valentinoMin = valentinoOn ? N_FUTURI * REVG * 0.10 : 0
  const grippoDays = Math.ceil(grippoMin / DAY) || 0
  const valentinoDays = Math.ceil(valentinoMin / DAY) || 0
  const totalDays = Math.max(copyDays, grippoDays, valentinoDays, 1)
  const pct = (min: number, days: number) => (days > 0 ? (min / (days * DAY)) * 100 : 0)
  return { righe, per, totalDays, grippoUtilPct: pct(grippoMin, totalDays), valentinoUtilPct: pct(valentinoMin, totalDays) }
}

// ============================================================
// SCOPE "IN EROGAZIONE" — dati reali dal file di Grippo (13 lug 2026)
// ============================================================

export type RigaGrafica = { nome: string; contesto: string; tutor: string; data: Date; ancheRevisione: boolean }
export type RigaGenerazione = { nome: string; contesto: string; tutor: string; consegna: Date; grafica: Date; ipotetico: boolean }

export const EROG_GRAFICA: RigaGrafica[] = [
  { nome: 'Federica Sandri', contesto: 'Piano Marketing', tutor: 'Claudia', data: new Date(2026, 6, 14), ancheRevisione: false },
  { nome: 'Matteo Zurlo', contesto: 'Piano Marketing · 138', tutor: 'Francesco', data: new Date(2026, 6, 15), ancheRevisione: false },
  { nome: 'Marco Giaferri', contesto: 'Piano Marketing', tutor: 'Luigi', data: new Date(2026, 6, 16), ancheRevisione: false },
  { nome: 'Francesco Surace', contesto: 'Piano Marketing', tutor: 'Paolo', data: new Date(2026, 6, 17), ancheRevisione: false },
  { nome: 'Michela Sartori', contesto: 'Report Strategica · 128', tutor: 'Tabita', data: new Date(2026, 6, 20), ancheRevisione: false },
  { nome: 'Giuseppe Di Guida', contesto: '102 · Report Strategica', tutor: 'Carlo', data: new Date(2026, 6, 21), ancheRevisione: true },
  { nome: 'Gabriele Cascone', contesto: '23 · Report Strategica', tutor: 'Francesco', data: new Date(2026, 6, 22), ancheRevisione: true },
  { nome: 'Agostino Romano', contesto: 'Piano Marketing (Food truck)', tutor: 'Francesco', data: new Date(2026, 6, 23), ancheRevisione: true },
  { nome: 'Emanuele Soffiotto', contesto: 'Piano Marketing', tutor: 'Paolo', data: new Date(2026, 6, 24), ancheRevisione: false },
  { nome: 'Stefano Lazzarini', contesto: '106 · Report Strategica', tutor: 'Tabita', data: new Date(2026, 6, 27), ancheRevisione: true },
  { nome: 'Michele Brioni', contesto: '81 · Report Strategica', tutor: 'Francesco', data: new Date(2026, 6, 28), ancheRevisione: true },
  { nome: 'Gaetano Rodittis', contesto: '101 · Piano Marketing', tutor: 'Carlo', data: new Date(2026, 6, 29), ancheRevisione: false },
  { nome: 'Davide Ghelardi', contesto: '112 · Report Strategica', tutor: 'Francesco', data: new Date(2026, 6, 30), ancheRevisione: true },
  { nome: 'Marco Ruggeri', contesto: 'Piano Marketing', tutor: 'Paolo', data: new Date(2026, 6, 31), ancheRevisione: false },
  { nome: 'Davide Raimondi', contesto: '20 · Piano Marketing', tutor: 'Tabita', data: new Date(2026, 7, 3), ancheRevisione: false },
  { nome: 'Simone Tomasini', contesto: '22 · Report Strategica', tutor: 'Francesco', data: new Date(2026, 7, 4), ancheRevisione: false },
  { nome: 'Filippo Griggio', contesto: '27 · Piano Marketing', tutor: 'Tabita', data: new Date(2026, 7, 5), ancheRevisione: true },
  { nome: 'Samuele Turcato', contesto: '28 · Piano Marketing', tutor: 'Francesco', data: new Date(2026, 7, 6), ancheRevisione: true },
  { nome: 'Nicola Angius', contesto: '29 · Piano Marketing', tutor: 'Francesco', data: new Date(2026, 7, 7), ancheRevisione: true },
]
export const EROG_SOLO_GRAFICA_N = EROG_GRAFICA.filter((r) => !r.ancheRevisione).length
export const EROG_ANCHE_REV_N = EROG_GRAFICA.filter((r) => r.ancheRevisione).length

export const EROG_GENERAZIONE: RigaGenerazione[] = [
  { nome: 'Giovanni Mazzamati', contesto: '30 · Report Strategica', tutor: 'Tabita', consegna: new Date(2026, 6, 22), grafica: new Date(2026, 6, 27), ipotetico: false },
  { nome: 'Giancarmine Battigaglia', contesto: 'non ancora assegnato', tutor: '—', consegna: new Date(2026, 7, 12), grafica: new Date(2026, 7, 17), ipotetico: true },
  { nome: 'Pierluigi Cipriani', contesto: 'non ancora assegnato', tutor: '—', consegna: new Date(2026, 7, 12), grafica: new Date(2026, 7, 17), ipotetico: true },
  { nome: 'Elisa Boccassin e Isabella Coppe', contesto: 'non ancora assegnato', tutor: '—', consegna: new Date(2026, 7, 12), grafica: new Date(2026, 7, 17), ipotetico: true },
  { nome: 'Lorenzo Serarcangeli', contesto: 'non ancora assegnato', tutor: '—', consegna: new Date(2026, 7, 12), grafica: new Date(2026, 7, 17), ipotetico: true },
  { nome: 'Monica Fin', contesto: 'non ancora assegnato', tutor: '—', consegna: new Date(2026, 7, 12), grafica: new Date(2026, 7, 17), ipotetico: true },
  { nome: 'Fabrizo Massaro', contesto: 'non ancora assegnato · non urgente', tutor: '—', consegna: new Date(2026, 7, 12), grafica: new Date(2026, 7, 17), ipotetico: true },
  { nome: 'Gaetano Petrillo', contesto: 'non ancora assegnato · non urgente', tutor: '—', consegna: new Date(2026, 7, 12), grafica: new Date(2026, 7, 17), ipotetico: true },
  { nome: 'Veronica Savaglio', contesto: 'non ancora assegnato · non urgente', tutor: '—', consegna: new Date(2026, 7, 12), grafica: new Date(2026, 7, 17), ipotetico: true },
  { nome: 'Luca Garimberiti', contesto: 'non ancora assegnato · non urgente', tutor: '—', consegna: new Date(2026, 7, 12), grafica: new Date(2026, 7, 17), ipotetico: true },
]

export const EROG_ANOMALIE: { icona: string; testo: string }[] = [
  { icona: '⚠', testo: 'Maddalena Tessitore — in revisione, ma bloccata da oltre 5 mesi (arrivata 02/02, rimandata a Carlo per un check sulla fase 3). Fuori pattern: va sciolta a mano, non rientra nella stima.' },
  { icona: '⏸', testo: 'Daniele Sciannimanico — sospeso il 10/06, in stand-by in attesa di istruzioni da Carlo.' },
  { icona: '↻', testo: "Claudio Virdis — sospeso l'08/07: il cliente ha cambiato modello di business, il report andrà rifatto da zero." },
]

export const EROG_OGGI = OGGI
export const EROG_MAX = new Date(2026, 7, 17)
