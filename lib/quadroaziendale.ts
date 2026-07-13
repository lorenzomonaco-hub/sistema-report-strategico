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
// SCOPE "IN EROGAZIONE" — dati reali dal foglio "CONSULENZE FRANK -
// Report in lavorazione" + "Questionari ricevuti da elaborare" (13 lug 2026)
// I 4 passaggi di Lorenzo, con la spunta esatta che li determina:
//  1. Informazioni mancanti  — questionario non ricevuto
//  2. Il copy deve lavorarlo — questionario ricevuto, non lavorato
//  3. Revisione Grippo       — lavorato, non ancora tornato da Grippo (fase 4)
//  4. Grafica (Valentino)    — tornato da Grippo, non ancora dai grafici (fase 6)
// ============================================================

export type StadioErog = 1 | 2 | 3 | 4
export type RigaErog = {
  nome: string
  azienda: string
  tutor: string
  servizio: string
  stadio: StadioErog
  dataStadio?: string // data del passaggio più recente, se nota
  daVerificare?: boolean // fonti in conflitto, vedi nota
}

export const EROG_CLIENTI: RigaErog[] = [
  // ---- stadio 1: informazioni mancanti (52) ----
  { nome: 'Agostino Romano', azienda: 'Romano SPA', tutor: 'Anissia Cabiddu', servizio: '2 piani mktg', stadio: 1 },
  { nome: 'Alessandro Chirico', azienda: 'Alessandro Chirico', tutor: 'Matteo Novati', servizio: 'Strategica', stadio: 1 },
  { nome: 'Alessandro Fazio', azienda: 'Fazio SRL', tutor: 'Sabrina Piazzolla', servizio: 'Startup', stadio: 1 },
  { nome: 'Alessandro Fazio', azienda: 'Nexora SRL', tutor: 'Sabrina Piazzolla', servizio: 'Piano Mktg', stadio: 1 },
  { nome: 'Alessandro Fazio', azienda: 'Nexora SRL', tutor: 'Sabrina Piazzolla', servizio: 'Brand', stadio: 1 },
  { nome: 'Andrea Dallan', azienda: 'Dallan SPA', tutor: 'Anissia Cabiddu', servizio: 'Marbella', stadio: 1 },
  { nome: 'Andrea Malgaroli', azienda: 'Ciski Malgaroli Andrea', tutor: 'Anissia Cabiddu', servizio: 'Brand', stadio: 1 },
  { nome: 'Andrea Poggi', azienda: 'Fastlan SRL', tutor: 'Cristian Frigerio', servizio: 'Strategica', stadio: 1 },
  { nome: 'Antonio Cannata', azienda: 'Red Raion SRL', tutor: 'Silvia Andreani', servizio: 'Smart', stadio: 1 },
  { nome: 'Antonio Chillocci', azienda: "L'Artigiano Group SRL", tutor: 'Elsa Galeotti', servizio: 'Strategica', stadio: 1 },
  { nome: "Antonio Franzè", azienda: "Antonio Franzè", tutor: 'Cristian Frigerio', servizio: 'Strategica', stadio: 1 },
  { nome: 'Bruno Stomeo', azienda: 'Bakery & Bakpow SRL', tutor: 'Elsa Galeotti', servizio: 'Strat+Brand', stadio: 1 },
  { nome: 'Christian Valentini', azienda: 'Dinamica Pulizie', tutor: 'Cristian Frigerio', servizio: 'Strategica', stadio: 1 },
  { nome: 'Claudio De Padua', azienda: 'Clamore SSD A RL', tutor: 'Matteo Novati', servizio: 'Piano Mktg', stadio: 1 },
  { nome: 'Davide Garofalo', azienda: 'Davide Garofalo', tutor: 'Silvia Andreani', servizio: 'Startup', stadio: 1 },
  { nome: 'Diego Radenza', azienda: 'Tegi SRL', tutor: 'Matteo Novati', servizio: 'Strategica', stadio: 1 },
  { nome: 'Emiliano Peviani', azienda: 'Cercar SRL', tutor: 'Anissia Cabiddu', servizio: 'Strategica', stadio: 1 },
  { nome: 'Ernesto Iuliano', azienda: 'Almer SRL', tutor: 'Thomas Farinelli', servizio: 'Strategica', stadio: 1 },
  { nome: 'Ethel Cogliani', azienda: 'Ethel Cogliani', tutor: 'Andrea Busellu', servizio: 'Smart', stadio: 1 },
  { nome: 'Fabrizio Ascoli', azienda: 'Fabrizio Ascoli', tutor: 'Fabio Vecchiato', servizio: 'Strategica', stadio: 1 },
  { nome: 'Federico Montagna', azienda: 'Fede & Vale SRL', tutor: 'Silvia Andreani', servizio: 'Piano Mktg', stadio: 1 },
  { nome: 'Francesco Ciaccia', azienda: 'Zoneriflesse Company SRL', tutor: 'Fabio Vecchiato', servizio: 'Consulenza Online', stadio: 1 },
  { nome: 'Franco Tocci', azienda: 'Ambrogio SRL', tutor: 'Cristian Frigerio', servizio: 'Strategica', stadio: 1 },
  { nome: 'Gerardo Muto', azienda: 'Autocentro F.lli Muto SRL', tutor: 'Sabrina Piazzolla', servizio: 'Piano Mktg', stadio: 1 },
  { nome: 'Giacomo Roncarati', azienda: 'Tef SRL', tutor: 'Silvia Andreani', servizio: 'Strategica', stadio: 1 },
  { nome: 'Gigi Marazzi', azienda: 'Marazzi Gian Luigi', tutor: 'Cristian Frigerio', servizio: 'Strategica', stadio: 1 },
  { nome: 'Giovanni Corsini', azienda: "Caffè Agust SRL", tutor: 'Thomas Farinelli', servizio: 'Strategica', stadio: 1 },
  { nome: 'Giovanni F. Maugeri', azienda: 'GFM SRLS', tutor: 'Fabio Vecchiato', servizio: 'Strategica', stadio: 1 },
  { nome: 'Giovanni Pane', azienda: 'Studio Dentistico Pane STP SRL', tutor: 'Cristian Frigerio', servizio: 'Strategica', stadio: 1 },
  { nome: 'Giulia Favero', azienda: 'Officine Alpi SRL', tutor: 'Matteo Novati', servizio: 'Strategica', stadio: 1 },
  { nome: 'Ivan Righetti', azienda: 'Righetti Ivan Car Service', tutor: 'Leonardo Mazzon', servizio: 'Strategica', stadio: 1 },
  { nome: 'Ivano Salina', azienda: 'Lubes SRL', tutor: 'Fabio Vecchiato', servizio: 'Strategica', stadio: 1 },
  { nome: 'Jacopo Pisati', azienda: 'Studio Associato Morassi Pisati', tutor: 'Anissia Cabiddu', servizio: 'Strategica', stadio: 1 },
  { nome: 'Kemuel Paradiso', azienda: 'Termozero SRL', tutor: 'Sabrina Piazzolla', servizio: 'Strategica', stadio: 1 },
  { nome: 'Kevin Nucera', azienda: 'Kevin Nucera', tutor: 'Matteo Novati', servizio: 'Strategica', stadio: 1 },
  { nome: 'Lorenzo Romano', azienda: 'Lorenzo Romano', tutor: 'Matteo Novati', servizio: 'Strategica', stadio: 1 },
  { nome: 'Lorenzo Romano', azienda: '3 Soldi SRL', tutor: 'Matteo Novati', servizio: 'Strategica', stadio: 1 },
  { nome: 'Loris Cadiri', azienda: 'Homes4Holidays', tutor: 'Thomas Farinelli', servizio: 'Strategica', stadio: 1 },
  { nome: 'Luca Sgherri', azienda: 'Luca Sgherri', tutor: 'Fabio Vecchiato', servizio: 'Strategica', stadio: 1 },
  { nome: 'Luca Ungaretti', azienda: 'Studio Dentistico Ungaretti SRL', tutor: 'Cristian Frigerio', servizio: 'Startup', stadio: 1 },
  { nome: 'Marco Torresan', azienda: 'Wedqueen SRL', tutor: 'Fabio Vecchiato', servizio: 'Strategica', stadio: 1 },
  { nome: 'Martinelli Mara', azienda: 'European Textile', tutor: 'Elsa Galeotti', servizio: 'Strategica', stadio: 1 },
  { nome: 'Matteo Gatti', azienda: 'C.G.R. Targhe e Timbri SRL', tutor: 'Sabrina Piazzolla', servizio: 'Strategica', stadio: 1 },
  { nome: 'Nicola Ornelli', azienda: 'Bruciaferro SRL', tutor: 'Matteo Novati', servizio: 'Strategica', stadio: 1 },
  { nome: 'Ornella Auzino', azienda: 'Rica SRL Unipersonale', tutor: 'Silvia Andreani', servizio: 'Strategica', stadio: 1 },
  { nome: 'Paola Canegrati', azienda: 'Studio Dentistico Signorelli SRL', tutor: 'Cristian Frigerio', servizio: '+Upsell', stadio: 1 },
  { nome: 'Piergiorgio Carlini', azienda: 'Associazione Unisardegna', tutor: 'Fabio Vecchiato', servizio: 'Smart', stadio: 1 },
  { nome: "Roberto D'Ancona", azienda: 'Ecoenergie SRL', tutor: 'Leonardo Mazzon', servizio: 'Strategica', stadio: 1 },
  { nome: 'Stefano Bertoli', azienda: 'Secit SRLS', tutor: 'Elsa Galeotti', servizio: 'Smart', stadio: 1 },
  { nome: 'Steve Osler', azienda: 'Wildix SRL', tutor: 'Silvia Andreani', servizio: 'Strategica', stadio: 1 },
  { nome: 'Ugo Cuncu', azienda: 'Ucnet SRL', tutor: 'Matteo Novati', servizio: 'Strategica', stadio: 1 },
  { nome: 'Vito Giudice', azienda: 'Giusta SRL', tutor: 'Silvia Andreani', servizio: 'Strategica', stadio: 1 },

  // ---- stadio 2: il copy deve lavorarlo (14) ----
  { nome: 'Alessandro Imbriano', azienda: 'Vanda Omeopatici SRL', tutor: 'Anissia Cabiddu', servizio: 'Rebranding', stadio: 2, dataStadio: '10/02' },
  { nome: 'Agostino Pessot', azienda: 'Pessot Flli SRL', tutor: 'Anissia Cabiddu', servizio: 'Strategica + 2 Rebranding', stadio: 2, dataStadio: '01/04' },
  { nome: 'Alessio Barcello', azienda: 'Barcello Rappresentanze SAS', tutor: 'Giacomo Saggin', servizio: 'Strategica + Brand', stadio: 2, dataStadio: '20/04' },
  { nome: 'Gheorghe Cazan', azienda: 'Compass In SRL (chiusure a filo)', tutor: 'Anissia Cabiddu', servizio: '3 Mastermind Brand', stadio: 2, dataStadio: '28/04', daVerificare: true },
  { nome: 'Andrea Novella', azienda: 'Stilogistica SRL', tutor: 'Matteo Novati', servizio: 'Strategica', stadio: 2, dataStadio: '09/07' },
  { nome: 'Massimiliano Rea', azienda: 'Erreesse SRL', tutor: 'Leonardo Mazzon', servizio: 'Strategica', stadio: 2, dataStadio: '10/07' },
  { nome: 'Claudio Virdis', azienda: 'Gruppoconsilia SRL', tutor: 'Leonardo Mazzon', servizio: 'Strategica', stadio: 2, dataStadio: '20/04', daVerificare: true },
  { nome: 'Desirèe Lancia', azienda: 'Garden House SRL', tutor: 'Matteo Novati', servizio: 'Strategica + Brand', stadio: 2, dataStadio: '18/03' },
  { nome: 'Elia Banfi', azienda: 'Elia Banfi', tutor: 'Silvia Andreani', servizio: 'Strategica', stadio: 2, dataStadio: '05/05' },
  { nome: 'Rudy Luxardo', azienda: 'Sole 1936 SRL', tutor: 'Leonardo Mazzon', servizio: 'Strategica', stadio: 2, dataStadio: '11/05' },
  { nome: "Marisa Benvegnù Ferrario", azienda: 'Dedi SRL', tutor: 'Cristian Frigerio', servizio: 'Strategica', stadio: 2, dataStadio: '15/05' },
  { nome: 'Matteo Tamburini', azienda: 'MT Service SRL', tutor: 'Matteo Novati', servizio: 'Strategica', stadio: 2, dataStadio: '10/06' },
  { nome: 'Paolo Mastella', azienda: 'Prima Group SRL', tutor: 'Sabrina Piazzolla', servizio: 'Strategica', stadio: 2, dataStadio: '15/06' },
  { nome: 'Nicolò Donnantuono', azienda: 'Pitwo SRL', tutor: 'Elsa Galeotti', servizio: 'Piano Mktg + Upsell CFO', stadio: 2, dataStadio: '08/07' },

  // ---- stadio 3: revisione Grippo (12) ----
  { nome: 'Agostino Romano', azienda: 'Romano SPA (Food truck)', tutor: 'Anissia Cabiddu', servizio: 'Piano Mktg', stadio: 3, dataStadio: '03/06' },
  { nome: 'Daniele Sciannimanico', azienda: 'Scianni SRL', tutor: 'Sabrina Piazzolla', servizio: 'Strategica + Upsell', stadio: 3, dataStadio: '28/05' },
  { nome: 'Davide Ghelardi', azienda: 'Ristora SAS', tutor: 'Anissia Cabiddu', servizio: 'Strategica', stadio: 3 },
  { nome: 'Filippo Griggio', azienda: 'Car For Life SRL', tutor: 'Silvia Andreani', servizio: 'Piano Mktg', stadio: 3, dataStadio: '18/06' },
  { nome: 'Gabriele Cascone', azienda: 'Studio di Architettura', tutor: 'Sabrina Piazzolla', servizio: 'Strategica', stadio: 3, dataStadio: '03/06' },
  { nome: 'Giovanni Mazzamati', azienda: '80 Fame SRL', tutor: 'Andrea Busellu', servizio: 'Strategica', stadio: 3, dataStadio: '22/06' },
  { nome: 'Giuseppe Di Guida', azienda: 'Gruppo EGS SRL', tutor: 'Cristian Frigerio', servizio: 'Strategica', stadio: 3, dataStadio: '15/06' },
  { nome: 'Michele Brioni', azienda: '3B Leisure & Style SRL', tutor: 'Silvia Andreani', servizio: 'Strategica', stadio: 3, dataStadio: '08/06' },
  { nome: 'Nicola Angius', azienda: 'Aquamea SRL', tutor: 'Silvia Andreani', servizio: 'Piano Mktg', stadio: 3, dataStadio: '22/06' },
  { nome: 'Samuele Turcato', azienda: 'Costruzioni Venete SRL', tutor: 'Matteo Novati', servizio: 'Piano Mktg', stadio: 3, dataStadio: '18/06' },
  { nome: 'Simone Tomasini', azienda: 'Trillo Parrucchieri', tutor: 'Matteo Novati', servizio: 'Strategica', stadio: 3, dataStadio: '03/06' },
  { nome: 'Stefano Lazzarini', azienda: 'Cartaria Biellese SRL', tutor: 'Fabio Vecchiato', servizio: 'Strategica', stadio: 3, dataStadio: '08/06' },

  // ---- stadio 4: grafica, Valentino (9) ----
  { nome: 'Claudio Virdis', azienda: 'Gruppoconsilia SRL', tutor: 'Leonardo Mazzon', servizio: 'Strategica', stadio: 4, dataStadio: '06/07', daVerificare: true },
  { nome: 'Davide Raimondi', azienda: 'DR Fasciaterapeuta STP', tutor: 'Cristian Frigerio', servizio: 'Piano Mktg', stadio: 4, dataStadio: '02-13/07' },
  { nome: 'Emanuele Soffiotto', azienda: "La Società dell'Allegria SRL", tutor: 'Matteo Novati', servizio: 'Piano Mktg', stadio: 4, dataStadio: '08/07' },
  { nome: 'Francesco Surace', azienda: 'SF Dental SRL', tutor: 'Anissia Cabiddu', servizio: 'Piano Mktg', stadio: 4, dataStadio: '06/07' },
  { nome: 'Gaetano Rodittis', azienda: 'CTA SRL', tutor: 'Matteo Novati', servizio: 'Piano Mktg', stadio: 4, dataStadio: '09/07' },
  { nome: 'Marco Giaferri', azienda: 'AGMA SRL', tutor: 'Leonardo Mazzon', servizio: 'Strategica', stadio: 4, dataStadio: '06/07' },
  { nome: 'Marco Ruggeri', azienda: 'Privilege SRL', tutor: 'Matteo Novati', servizio: 'Strategica', stadio: 4, dataStadio: '10/07' },
  { nome: 'Matteo Zurlo', azienda: 'MB SRL', tutor: 'Thomas Farinelli', servizio: 'Piano Mktg', stadio: 4, dataStadio: '06/07' },
  { nome: 'Michela Sartori', azienda: 'Il Giocabosco', tutor: 'Elsa Galeotti', servizio: 'Strategica', stadio: 4, dataStadio: '07/07' },
]

export const EROG_TOT = EROG_CLIENTI.length
export const EROG_PER_STADIO = [1, 2, 3, 4].map(
  (s) => EROG_CLIENTI.filter((r) => r.stadio === s).length
)

export const EROG_ANOMALIE: { icona: string; testo: string }[] = [
  { icona: '⚠', testo: 'Maddalena Tessitore — in revisione, ma bloccata da oltre 5 mesi (arrivata 02/02, rimandata a Carlo per un check sulla fase 3). Fuori pattern, va sciolta a mano.' },
  { icona: '⚠', testo: "Gheorghe Cazan e Claudio Virdis compaiono con due progetti paralleli in fonti diverse — posizionati con la data più recente, ma vanno controllati a mano (marcati “da verificare”)." },
  { icona: '⚠', testo: '113 righe del foglio maestro hanno la casella "questionario lavorato" non spuntata pur avendo le fasi successive già completate — quasi certamente pratiche vecchie mai aggiornate, non lavoro reale. Escluse dal conteggio.' },
]

export const EROG_STADI = [
  { n: 1 as StadioErog, label: 'Informazioni mancanti', sub: 'non possiamo procedere' },
  { n: 2 as StadioErog, label: 'Il copy deve lavorarlo', sub: 'generazione del testo' },
  { n: 3 as StadioErog, label: 'Revisione Grippo', sub: 'fase 4 del sistema' },
  { n: 4 as StadioErog, label: 'Grafica — Valentino', sub: 'fase 6 del sistema' },
]

export const EROG_OGGI = OGGI
