// ─── Quadro Aziendale ───
// Due code distinte: i clienti già in erogazione (dati reali dal file di
// Grippo, verificato 14 lug 2026 contro il foglio maestro aggiornato) e i 58
// progetti futuri in attesa di produzione (modello a leve: quante persone,
// chi assorbe la revisione/grafica).

export const GIORNO_MS = 86_400_000
const OGGI = new Date(2026, 6, 14) // martedì 14 luglio 2026

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

export const GEN = 240, REVT = 60, REVI = 30, CREDIT = 30, DAY = 420
export const AGENTE_TESTO = 35, AGENTE_IMPAG = 2
export const FULLAI_AGENTE = 60, FULLAI_INTERAZIONE = 60
// Passaggio di Caputo (slide), tra la generazione e la revisione testo — confermato da Lorenzo:
// manuale (senza agente) 2h a report; con l'agente, 10' per generare la bozza + 15' di revisione di Caputo.
export const CAPUTO_MANUALE = 120
export const AGENTE_SLIDE = 10
export const REV_SLIDE = 15

export function perReportCopyMin(grippoOn: boolean, valentinoOn: boolean, fullAiOn: boolean): number {
  let m = fullAiOn ? FULLAI_INTERAZIONE : GEN
  if (!grippoOn) m += REVT
  if (!valentinoOn) m += REVI
  return m - CREDIT
}

/**
 * Tempo reale, da inizio a fine, per consegnare UN report: somma di ogni passaggio della
 * pipeline (agente compreso — non è "gratis", richiede comunque il suo tempo in sequenza),
 * meno i 30' di recupero che chi scrive investe in anticipo sul report successivo mentre
 * l'agente lavora. Diverso da perReportCopyMin, che è solo il tempo che il copy investe
 * (usato per programmare quanti report al giorno riesce a scrivere).
 * Nota: le leve Grippo/Valentino scelgono CHI controlla l'output dell'agente (lui o Carlo),
 * non QUANTO ci mette — il controllo dura sempre la stessa ora/mezz'ora, cambia solo di chi
 * è il tempo (e quindi se pesa sulla capacità di scrittura di Carlo o no). Per questo il totale
 * non dipende da quelle due leve, solo da Caputo (manuale/assistito) e Full AI.
 */
export function tempoTotaleReport(caputoAgenteOn: boolean, fullAiOn: boolean): number {
  const generazione = fullAiOn ? FULLAI_AGENTE + FULLAI_INTERAZIONE : GEN
  const slide = caputoAgenteOn ? AGENTE_SLIDE + REV_SLIDE : CAPUTO_MANUALE
  const revisioneTesto = AGENTE_TESTO + REVT
  const impaginazione = AGENTE_IMPAG + REVI
  return generazione + slide + revisioneTesto + impaginazione - CREDIT
}

export type RigaSchedulata = { nome: string; contesto: string; rifare: boolean; start: number; finish: number }
export type Schedule = {
  righe: RigaSchedulata[]
  per: number
  totalDays: number
  grippoUtilPct: number
  valentinoUtilPct: number
  caputoUtilPct: number
  caputoDays: number
}

export function schedule(copyCount: number, grippoOn: boolean, valentinoOn: boolean, caputoAgenteOn: boolean, fullAiOn: boolean): Schedule {
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
  // Grippo/Valentino non lavorano più veloce di Carlo sullo stesso controllo: la leva sceglie
  // solo chi lo fa (e quindi se pesa sulla capacità di scrittura di Carlo, vedi perReportCopyMin).
  const grippoMin = grippoOn ? N_FUTURI * REVT : 0
  const valentinoMin = valentinoOn ? N_FUTURI * REVI : 0
  const caputoMin = N_FUTURI * (caputoAgenteOn ? REV_SLIDE : CAPUTO_MANUALE)
  const grippoDays = Math.ceil(grippoMin / DAY) || 0
  const valentinoDays = Math.ceil(valentinoMin / DAY) || 0
  const caputoDays = Math.ceil(caputoMin / DAY) || 0
  const totalDays = Math.max(copyDays, grippoDays, valentinoDays, caputoDays, 1)
  const pct = (min: number, days: number) => (days > 0 ? (min / (days * DAY)) * 100 : 0)
  return {
    righe, per, totalDays,
    grippoUtilPct: pct(grippoMin, totalDays), valentinoUtilPct: pct(valentinoMin, totalDays),
    caputoUtilPct: pct(caputoMin, totalDays), caputoDays,
  }
}

// ============================================================
// SCOPE "IN EROGAZIONE" — dati reali dal foglio "CONSULENZE FRANK -
// Report in lavorazione" + "Questionari ricevuti da elaborare" (13 lug 2026)
// I 4 passaggi di Lorenzo, con la spunta esatta che li determina:
//  1. Informazioni mancanti  — questionario non ricevuto
//  2. Il copy scrive + Caputo (slide) — questionario ricevuto, non ancora da Grippo
//  3. Revisione Grippo       — lavorato, non ancora tornato da Grippo (fase 4)
//  4. Grafica (Valentino)    — tornato da Grippo, non ancora dai grafici (fase 6)
//
// Nota su Caputo: confermato (verbale riunione 1 lug 2026 con Alessio Caputo)
// che tra la scrittura del copy e la revisione Grippo c'è un passaggio reale —
// Caputo divide il testo in 5 parti, genera le slide e le monta/seleziona a
// mano — ma il foglio maestro non lo traccia con una colonna o data propria
// (verificato: zero menzioni di "Caputo"/"slide" in 317 righe). Il suo lavoro
// è quindi compreso, non scomponibile, dentro la finestra "stadio 2".
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
  dataApprox?: boolean // la casella del foglio è spuntata ma senza data: uso la data promessa più vicina, vedi nota
}

// Durate empiriche (giorni lavorativi) dal foglio "CONSULENZE FRANK - Report in
// lavorazione" (317 righe, aggiornato al 13 lug 2026 ore 14:04):
//  stage2 = QUESTIONARIO RICEVUTO → INVIO A GRIPPO (copy scrive + Caputo monta slide)
//  stage3 = INVIO → RICEVUTO da Grippo (revisione testo, fase 4)
//  stage4 = INVIO → RICEVUTO dai grafici (Valentino, fase 6)
// Nota: il segnale giusto per "il copy ha finito" è INVIO A GRIPPO, non
// QUESTIONARIO LAVORATO — quella casella non viene più aggiornata da fine
// novembre 2025 (abbandonata nell'uso), avrebbe dato numeri falsati.
// Nessuna stima per lo stadio 1: non esiste una data di "richiesta documenti",
// quindi non c'è un punto di partenza da cui contare — dipende dal cliente.
// Stage2 include anche il passaggio di Caputo (crea e inserisce le slide):
// il foglio non lo traccia separatamente, quindi 57-70gg è il tempo combinato
// copy+Caputo, non solo la scrittura del testo.
export const MEDIANA_STAGE2_STORICO = 57   // n=199, tutto lo storico
export const MEDIANA_STAGE2_RECENTE = 70   // n=66, ultimi 90gg — si è allungato
export const MEDIANA_STAGE3_STORICO = 15   // n=195
export const MEDIANA_STAGE3_RECENTE = 21   // n=73 — anche questo si è allungato
export const MEDIANA_STAGE4_STORICO = 3    // n=192
export const MEDIANA_STAGE4_RECENTE = 3    // n=69 — stabile, Valentino tiene il passo

// Stime "a maglie larghe" per il Gantt di consegna: 75° percentile degli ultimi
// 90 giorni, non la mediana. Solo 1 caso su 4, di recente, ha superato questa
// soglia — una promessa pensata per essere rispettata, non per essere ottimistica.
export const STIMA_LARGA_STAGE2 = 94
export const STIMA_LARGA_STAGE3 = 28
export const STIMA_LARGA_STAGE4 = 4

// Modello "a passaggi separati" per le pagine Umano / Human-in-the-loop (87 clienti
// reali): copy e Caputo sono 2 passaggi distinti (non più uniti), misurati come puro
// tempo di lavorazione (ore) — non includono l'attesa in coda, a differenza dei dati
// sopra. Revisione (Grippo o Tabita, a seconda di chi la fa) e impaginazione (Valentino)
// restano invece il dato reale dal foglio, perché per questi due passaggi non esiste
// un numero "di lavorazione pura" diverso dalla realtà osservata.
export const UMANO_GRIPPO_GG = MEDIANA_STAGE3_RECENTE   // 21gg lavorativi — mediana ultimi 90gg, n=73 (Grippo o Tabita)
export const UMANO_VALENTINO_GG = MEDIANA_STAGE4_RECENTE // 3gg lavorativi — mediana, stabile, n=69

// Vendite reali (fatture) e questionari ricevuti, mese per mese — dallo stesso
// foglio, colonne DATA FATTURA e QUESTIONARIO RICEVUTO, tutte le 317 righe
// (storiche incluse, serve a vedere l'andamento nel tempo).
export const VENDITE_MENSILI: { mese: string; vendite: number; questionari: number }[] = [
  { mese: '2025-07', vendite: 69, questionari: 50 },
  { mese: '2025-08', vendite: 36, questionari: 34 },
  { mese: '2025-09', vendite: 13, questionari: 27 },
  { mese: '2025-10', vendite: 16, questionari: 15 },
  { mese: '2025-11', vendite: 16, questionari: 19 },
  { mese: '2025-12', vendite: 16, questionari: 8 },
  { mese: '2026-01', vendite: 10, questionari: 9 },
  { mese: '2026-02', vendite: 9, questionari: 15 },
  { mese: '2026-03', vendite: 21, questionari: 25 },
  { mese: '2026-04', vendite: 2, questionari: 10 },
  { mese: '2026-05', vendite: 4, questionari: 3 },
  { mese: '2026-06', vendite: 4, questionari: 1 },
  { mese: '2026-07', vendite: 4, questionari: 0 }, // parziale, solo fino al 13
]

function parseDataStadio(s: string): Date | null {
  const m = s.match(/^(\d{1,2})\/(\d{1,2})$/)
  if (!m) return null
  return new Date(2026, Number(m[2]) - 1, Number(m[1]))
}

function workdayAdd(d: Date, n: number): Date {
  const r = new Date(d)
  let added = 0
  while (added < n) {
    r.setDate(r.getDate() + 1)
    if (r.getDay() !== 0 && r.getDay() !== 6) added++
  }
  return r
}

function workdaysBetween(d1: Date, d2: Date): number {
  if (d2 < d1) return -workdaysBetween(d2, d1)
  let n = 0
  const d = new Date(d1)
  while (d < d2) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) n++
  }
  return n
}

function restanteUmano(stadio: StadioErog): number | null {
  return stadio === 2 ? STIMA_LARGA_STAGE2 + STIMA_LARGA_STAGE3 + STIMA_LARGA_STAGE4
    : stadio === 3 ? STIMA_LARGA_STAGE3 + STIMA_LARGA_STAGE4
    : stadio === 4 ? STIMA_LARGA_STAGE4
    : null
}

/** Data di consegna stimata "a maglie larghe" (75° percentile recente) se tutto resta umano da qui in avanti. */
export function stimaConsegna(r: RigaErog): { data: Date; giorniRitardo: number } | null {
  if (!r.dataStadio) return null
  const d0 = parseDataStadio(r.dataStadio)
  if (!d0) return null
  const restante = restanteUmano(r.stadio)
  if (restante == null) return null
  const data = workdayAdd(d0, restante)
  const giorniRitardo = data < OGGI ? workdaysBetween(data, OGGI) : 0
  return { data, giorniRitardo }
}

// ============================================================
// PAGINE "UMANO" / "HUMAN IN THE LOOP" — stessi 87 clienti reali, passaggi
// separati (copy, Caputo, Grippo/Tabita, Valentino), non più i 4 stadi uniti.
// ============================================================

function restanteUmanoV2(stadio: StadioErog): number {
  let g = 0
  if (stadio <= 2) g += minutesToWorkdays(GEN + CAPUTO_MANUALE) // 4h+2h di puro lavoro, ~1gg
  if (stadio <= 3) g += UMANO_GRIPPO_GG
  if (stadio <= 4) g += UMANO_VALENTINO_GG
  return g
}

/** Come stimaConsegna, ma con copy e Caputo separati (4h+2h di lavorazione pura) invece
 * del dato empirico combinato — su richiesta esplicita di Lorenzo. */
export function stimaConsegnaUmanoV2(r: RigaErog): { data: Date; giorniRitardo: number } | null {
  if (!r.dataStadio) return null
  const d0 = parseDataStadio(r.dataStadio)
  if (!d0) return null
  const data = workdayAdd(d0, restanteUmanoV2(r.stadio))
  const giorniRitardo = data < OGGI ? workdaysBetween(data, OGGI) : 0
  return { data, giorniRitardo }
}

/**
 * Come stimaConsegnaUmanoV2, ma i passaggi STRETTAMENTE successivi a quello in corso
 * diventano "human in the loop": l'agente genera, un umano controlla (Grippo/Tabita o
 * Carlo per il testo, Valentino o Carlo per l'impaginazione) — il controllo dura sempre
 * uguale, la leva sceglie solo chi lo fa, non quanto ci mette. Il passaggio ATTUALE non
 * si tocca: resta umano, alla stessa velocità di stimaConsegnaUmanoV2 (non si toglie
 * lavoro già iniziato).
 */
export function stimaConsegnaHITL(r: RigaErog):
  | { tipo: 'data'; data: Date; giorniRisparmiati: number }
  | { tipo: 'condizionale' }
  | null {
  if (r.stadio === 1) return { tipo: 'condizionale' }
  if (!r.dataStadio) return null
  const d0 = parseDataStadio(r.dataStadio)
  if (!d0) return null
  const baseline = stimaConsegnaUmanoV2(r)
  let minutiSuccessivi = 0
  if (r.stadio < 3) minutiSuccessivi += AGENTE_TESTO + REVT
  if (r.stadio < 4) minutiSuccessivi += AGENTE_IMPAG + REVI
  if (minutiSuccessivi === 0) {
    // già sull'ultimo passaggio (impaginazione): nessuna trasformazione possibile
    return baseline ? { tipo: 'data', data: baseline.data, giorniRisparmiati: 0 } : null
  }
  const durataStadioCorrente = r.stadio === 2 ? minutesToWorkdays(GEN + CAPUTO_MANUALE) : UMANO_GRIPPO_GG
  const fineUmana = workdayAdd(d0, durataStadioCorrente)
  const partenzaAgente = fineUmana < OGGI ? OGGI : fineUmana
  const data = workdayAdd(partenzaAgente, minutesToWorkdays(minutiSuccessivi))
  const giorniRisparmiati = baseline ? workdaysBetween(data, baseline.data) : 0
  return { tipo: 'data', data, giorniRisparmiati }
}

export type OccupazioneRuoli = { caputoGg: number; grippoGg: number; valentinoGg: number }

/** Carico di lavoro residuo (giorni-uomo) dei 3 ruoli sugli 87 clienti reali, nello
 * scenario Human-in-the-loop: quanti report devono ancora essere controllati da
 * ciascuno, moltiplicati per quanto dura il controllo (fisso, non dipende dalla leva). */
export function occupazioneHITL(clienti: RigaErog[], caputoAgenteOn: boolean): OccupazioneRuoli {
  // stadio 1 escluso: informazioni mancanti, nessun lavoro futuro certo da contare
  const daCaputo = clienti.filter((r) => r.stadio === 2).length
  const daGrippo = clienti.filter((r) => r.stadio === 2 || r.stadio === 3).length
  const daValentino = clienti.filter((r) => r.stadio >= 2).length
  const caputoMin = daCaputo * (caputoAgenteOn ? REV_SLIDE : CAPUTO_MANUALE)
  const grippoMin = daGrippo * REVT
  const valentinoMin = daValentino * REVI
  return {
    caputoGg: Math.round((caputoMin / DAY) * 10) / 10,
    grippoGg: Math.round((grippoMin / DAY) * 10) / 10,
    valentinoGg: Math.round((valentinoMin / DAY) * 10) / 10,
  }
}

export function minutesToWorkdays(min: number): number {
  return Math.max(1, Math.ceil(min / DAY))
}

/**
 * Minuti restanti in modalità "human in the loop" per i passaggi ANCORA DA FARE
 * di un cliente già in erogazione — il passaggio ATTUALE non si tocca mai (non si
 * toglie lavoro già iniziato): resta umano, alla velocità reale già in corso.
 * Il passaggio di Caputo non è incluso qui apposta: per chi è già in stadio 2 il
 * suo tempo è dentro STIMA_LARGA_STAGE2, indistinguibile dalla scrittura — la leva
 * Caputo si applica solo ai clienti non ancora iniziati (futuri).
 */
function minutiRestantiErogazioneHITL(stadio: StadioErog): number {
  let m = 0
  if (stadio < 3) m += AGENTE_TESTO + REVT
  if (stadio < 4) m += AGENTE_IMPAG + REVI
  return m
}

/**
 * Data di consegna se il passaggio in corso resta alla persona che lo sta già
 * facendo (non le si toglie il lavoro), ma tutti i passaggi successivi li fa
 * l'agente con controllo umano (human in the loop) — il controllo dura sempre
 * la stessa ora/mezz'ora sia che lo faccia Grippo/Valentino sia che lo faccia
 * Carlo, quindi la data non dipende da chi lo fa. Per lo stadio 1 non c'è una
 * data di partenza: non si può stimare finché non arrivano le informazioni.
 */
export function stimaConsegnaAgentica(r: RigaErog):
  | { tipo: 'data'; data: Date; giorniRisparmiati: number }
  | { tipo: 'condizionale' }
  | null {
  if (r.stadio === 1) return { tipo: 'condizionale' }
  if (!r.dataStadio) return null
  const d0 = parseDataStadio(r.dataStadio)
  if (!d0) return null
  const baseline = stimaConsegna(r)
  const minutiRestanti = minutiRestantiErogazioneHITL(r.stadio)
  if (minutiRestanti === 0) {
    // già sull'ultimo passaggio (Valentino): nessuna trasformazione possibile, resta la stima umana
    return baseline ? { tipo: 'data', data: baseline.data, giorniRisparmiati: 0 } : null
  }
  const stimaStadioCorrente =
    r.stadio === 2 ? STIMA_LARGA_STAGE2 : r.stadio === 3 ? STIMA_LARGA_STAGE3 : STIMA_LARGA_STAGE4
  const fineUmana = workdayAdd(d0, stimaStadioCorrente)
  // Se il passaggio umano, con la stima larga, dovrebbe già essere finito, l'agente
  // parte da oggi (il giorno in cui lo attiveremo) — non da una data passata.
  const partenzaAgente = fineUmana < OGGI ? OGGI : fineUmana
  const data = workdayAdd(partenzaAgente, minutesToWorkdays(minutiRestanti))
  const giorniRisparmiati = baseline ? workdaysBetween(data, baseline.data) : 0
  return { tipo: 'data', data, giorniRisparmiati }
}

export type RigaFutura = { nome: string; azienda: string; rifare: boolean; data: Date }

/** Scenario "Umano": i 58 futuri, scritti in coda da copyCount persone, poi Caputo/Grippo/Valentino
 * manuali in sequenza — nessun agente da nessuna parte, la leva è solo quante persone scrivono. */
export function futuriUmano(copyCount: number): { righe: RigaFutura[]; totalDays: number } {
  const sch = schedule(copyCount, false, false, false, false)
  const minutiSuccessivi = CAPUTO_MANUALE + REVT + REVI
  const righe: RigaFutura[] = sch.righe.map((r) => ({
    nome: r.nome, azienda: r.contesto, rifare: r.rifare,
    data: workdayAdd(workday(Math.ceil(r.finish / DAY)), minutesToWorkdays(minutiSuccessivi)),
  }))
  return { righe, totalDays: sch.totalDays }
}

/** Scenario "Human in the loop": stesse leve del calcolatore Futuri, applicate dall'inizio
 * (per i futuri non c'è nessun passaggio "già in corso" da proteggere). */
export function futuriHITL(copyCount: number, grippoOn: boolean, valentinoOn: boolean, caputoAgenteOn: boolean, fullAiOn: boolean): { righe: RigaFutura[]; totalDays: number } {
  const sch = schedule(copyCount, grippoOn, valentinoOn, caputoAgenteOn, fullAiOn)
  const slide = caputoAgenteOn ? AGENTE_SLIDE + REV_SLIDE : CAPUTO_MANUALE
  // Il controllo (testo/impaginazione) dura sempre la stessa ora/mezz'ora: la leva sceglie solo
  // chi lo fa, non quanto ci mette — per questo il tempo totale non cambia con grippoOn/valentinoOn.
  const testo = AGENTE_TESTO + REVT
  const impag = AGENTE_IMPAG + REVI
  const minutiSuccessivi = slide + testo + impag
  const righe: RigaFutura[] = sch.righe.map((r) => ({
    nome: r.nome, azienda: r.contesto, rifare: r.rifare,
    data: workdayAdd(workday(Math.ceil(r.finish / DAY)), minutesToWorkdays(minutiSuccessivi)),
  }))
  return { righe, totalDays: sch.totalDays }
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
  { nome: 'Davide Ghelardi', azienda: 'Ristora SAS', tutor: 'Anissia Cabiddu', servizio: 'Strategica', stadio: 3, dataStadio: '09/06', dataApprox: true },
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
  { nome: 'Davide Raimondi', azienda: 'DR Fasciaterapeuta STP', tutor: 'Cristian Frigerio', servizio: 'Piano Mktg', stadio: 4, dataStadio: '13/07' },
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
  { icona: '⚠', testo: 'Davide Ghelardi — la casella "invio a Grippo" è spuntata ma senza data nel foglio. Uso 09/06 (la data promessa dal copy nella nota "questionario lavorato"), segnato "data stimata": è l\'unico cliente su 35 senza una data sorgente diretta.' },
  { icona: '⚠', testo: 'Davide Raimondi — risulta inviato ai grafici due volte (02/07 e 13/07), segno di una rilavorazione. Uso la data più recente (13/07) come inizio dello stadio attuale.' },
]

export const EROG_STADI = [
  { n: 1 as StadioErog, label: 'Informazioni mancanti', sub: 'non possiamo procedere' },
  { n: 2 as StadioErog, label: 'Copy scrive + Caputo (slide)', sub: 'testo e montaggio slide' },
  { n: 3 as StadioErog, label: 'Revisione Grippo', sub: 'fase 4 del sistema' },
  { n: 4 as StadioErog, label: 'Grafica — Valentino', sub: 'fase 6 del sistema' },
]

export const EROG_OGGI = OGGI
