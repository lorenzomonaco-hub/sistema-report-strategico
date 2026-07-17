// ─── Clienti PRONTO PER CONSULENZA (report finito, in attesa della consulenza) ───
// Dal file "CONSULENZE FRANK - Report in lavorazione" (stato PRONTO PER CONSULENZA).
// consulenza = data ISO se già fissata (colonna DATA CONSULENZA), null = da fissare.

import { slugFrank } from './consulenzeFrank'

export type ProntoConsulenza = {
  cliente: string
  azienda: string
  tutor: string
  consulenza: string | null
  ora?: string
  dataVendita?: string
  prezzo?: string
}

/** Slug stabile con cui un cliente «pronto per consulenza» compare nella pipeline. */
export const slugConsulenza = (i: number, c: { azienda?: string; cliente: string }) =>
  `pc-${i}-${slugFrank(c.azienda || c.cliente)}`

/** Pronto-consulenza raggruppati per tutor, con consulenza fissata / da fissare. */
export function pcPerTutor(): { tutor: string; fissate: ProntoConsulenza[]; daFissare: ProntoConsulenza[]; totale: number }[] {
  const map = new Map<string, ProntoConsulenza[]>()
  for (const c of PRONTO_CONSULENZA) {
    const t = (c.tutor || '(senza tutor)').trim()
    if (!map.has(t)) map.set(t, [])
    map.get(t)!.push(c)
  }
  return [...map.entries()]
    .map(([tutor, cl]) => ({ tutor, fissate: cl.filter((c) => c.consulenza), daFissare: cl.filter((c) => !c.consulenza), totale: cl.length }))
    .sort((a, b) => a.tutor.localeCompare(b.tutor))
}

export const PRONTO_CONSULENZA: ProntoConsulenza[] = [
  { cliente: 'ALESSANDRO IMBRIANO', azienda: 'VANDA OMEOPATICI SRL', tutor: 'ANISSIA CABIDDU', consulenza: null, dataVendita: '2025-05-20', prezzo: '€ 36.484,00 + 20.000,00' },
  { cliente: 'ALESSIO CORSI', azienda: 'ARREDO PARK SRL (parlare con Leonardo*)', tutor: 'LEONARDO MAZZON', consulenza: '2026-09-11', ora: '11:30', dataVendita: '2025-10-01', prezzo: '€ 18.696' },
  { cliente: 'ALEX CAREGNATO', azienda: 'PULKRA SRL - NORD RESINE SPA', tutor: 'THOMAS FARINELLI', consulenza: null, dataVendita: '2025-01-31', prezzo: '€ 11.981,00' },
  { cliente: 'ANDREA BUFFA (ORIANA BILLECI)', azienda: 'ANDREA BUFFA', tutor: 'MATTEO NOVATI', consulenza: '2026-08-27', ora: '09:30', dataVendita: '2026-03-16', prezzo: '€ 10.000.00' },
  { cliente: 'ANDREA CASINI', azienda: 'AMETISTA DI CASINI ANDREA', tutor: 'GIACOMO SAGGIN', consulenza: '2026-08-26', ora: '14:30', dataVendita: '2026-05-29', prezzo: '€ 12.000.00' },
  { cliente: 'ANDREA MACHEDA', azienda: 'LA LUPA SRL', tutor: 'FABIO VECCHIATO', consulenza: '2026-09-10', ora: '09:30', dataVendita: '2025-10-15', prezzo: '€ 13.000' },
  { cliente: 'ANDREA MOMBELLI', azienda: 'GAMMA MOTORI SRL', tutor: 'ELSA GALEOTTI', consulenza: null, dataVendita: '2026-02-19', prezzo: '€ 10.000,00' },
  { cliente: 'ANDREA QUERCIOLI', azienda: 'DRIVELAB SRL', tutor: 'SABRINA PIAZZOLLA', consulenza: '2026-09-30', ora: '09:30', dataVendita: '2025-07-25', prezzo: '€ 5000' },
  { cliente: 'ANTONIO CANNATA', azienda: 'STORMIND SRL', tutor: 'SILVIA ANDREANI', consulenza: '2026-10-12', ora: '09:30', dataVendita: '2026-02-26', prezzo: '€ 10.000,00' },
  { cliente: 'ANTONIO DE LILLA', azienda: 'VIRTUAL CAPITAL GROUP LLC', tutor: 'GIACOMO SAGGIN', consulenza: null, dataVendita: '2025-10-08', prezzo: '€ 16000 + 16000' },
  { cliente: 'ANTONIO NORCIA', azienda: 'KINDERDENTAL & FAMILY - DENTAL STUDIO TORINO', tutor: 'CRISTIAN FRIGERIO', consulenza: null, prezzo: '€ -' },
  { cliente: 'ANTONIO TUMMINELLO', azienda: 'ANTONIO TUMMINELLO', tutor: 'THOMAS FARINELLI', consulenza: null, dataVendita: '2025-07-25', prezzo: '€ 5000' },
  { cliente: 'BARBARA POGGI', azienda: 'REBA S.A.S DI POGGI BARBARA & C.', tutor: 'THOMAS FARINELLI', consulenza: '2026-10-12', ora: '16:30', dataVendita: '2025-09-24', prezzo: '€ 10.000' },
  { cliente: 'CLAUDIO DE VENERE', azienda: 'DE VENERE SRL', tutor: 'ELSA GALEOTTI', consulenza: null, dataVendita: '2025-08-28', prezzo: '€ 5.000' },
  { cliente: 'CLAUDIO NASINI', azienda: 'ATRAINING DI CLAUDIO NASINI', tutor: 'SILVIA ANDREANI', consulenza: '2026-10-01', ora: '14:30', dataVendita: '2026-01-15', prezzo: '€ 10.000' },
  { cliente: 'CRISTINA RADIN', azienda: 'THE ROYAL REAL ESTATE SRL', tutor: 'SILVIA ANDREANI', consulenza: '2026-10-01', ora: '11:30', dataVendita: '2025-11-20', prezzo: '€ 9.709' },
  { cliente: 'DANIELE GENSINI', azienda: 'VILLA CHIGI ODONTOIATRA STP SRL', tutor: 'FABIO VECCHIATO', consulenza: '2026-08-28', ora: '14:30', dataVendita: '2026-03-06', prezzo: '€ 12.000,00' },
  { cliente: 'DANIELE SCIANNIMANICO', azienda: 'SCIANNI SRL', tutor: 'SABRINA PIAZZOLLA', consulenza: null, dataVendita: '2025-12-15', prezzo: '€ 13.000.00' },
  { cliente: 'DAVIDE OCHNER', azienda: 'IMMOBILUX SRL', tutor: 'THOMAS FARINELLI', consulenza: null, dataVendita: '2025-09-26', prezzo: '€ 10.000' },
  { cliente: 'DAVIDE ROCCASALVA', azienda: 'CANDORE SRL', tutor: 'LEONARDO MAZZON', consulenza: '2026-06-30', ora: '16:30', dataVendita: '2025-11-21', prezzo: '€ 9.500' },
  { cliente: 'DEVIS BARCARO', azienda: 'CASA NO GAS SRL', tutor: 'SABRINA PIAZZOLLA', consulenza: null, dataVendita: '2026-03-11', prezzo: '€ 10.000.00' },
  { cliente: 'FABIO DE MARCO', azienda: 'LEARNING UP SRL', tutor: 'SILVIA ANDREANI', consulenza: '2026-10-12', ora: '11:30', dataVendita: '2025-08-21', prezzo: '€ 5.000' },
  { cliente: 'FABIO LEONE', azienda: 'F2XP.COM SRL', tutor: 'GIACOMO SAGGIN', consulenza: '2026-08-26', ora: '16:30', dataVendita: '2025-12-11', prezzo: '€ 10.000.00' },
  { cliente: 'FABRIZIO BARRA', azienda: 'E-COMM 2.0.2.0. DI BARRA FABRIZIO', tutor: 'ANDREA BUSELLU', consulenza: '2026-09-30', ora: '14:30', dataVendita: '2025-11-28', prezzo: '€ 10.000' },
  { cliente: 'FEDERICA SANDRI', azienda: 'SCUOLA ITALIANA TURISMO SRL', tutor: 'SABRINA PIAZZOLLA', consulenza: '2026-07-17', ora: '09:30', dataVendita: '2026-01-14', prezzo: '€ 18.987' },
  { cliente: 'FILIPPO CARLI', azienda: 'AMBULATORIO ODONTOIATRICO SRL', tutor: 'MATTEO NOVATI', consulenza: '2026-09-11', ora: '09:30', dataVendita: '2025-10-28', prezzo: '€ 20.500' },
  { cliente: 'GIAMPIERO SFORNA', azienda: 'ARDECO GROUP SRL', tutor: 'MATTEO NOVATI', consulenza: '2026-10-01', ora: '09:30', dataVendita: '2025-12-09', prezzo: '€ 00:01:00' },
  { cliente: 'GIANNI SANZO (MARIO IANNUZZI)', azienda: 'COMAGUS SRL', tutor: 'ELSA GALEOTTI', consulenza: '2026-08-28', ora: '09:30', dataVendita: '2025-07-02', prezzo: '€ 18.000,00' },
  { cliente: 'GIORGIO TRAPPOLINI', azienda: 'PLANET FITNESS ITALIA SRL', tutor: 'LEONARDO MAZZON', consulenza: '2026-08-26', ora: '09:30', dataVendita: '2026-02-27', prezzo: '€ 10.000,00' },
  { cliente: 'GIULIO CAVALLOTTI', azienda: 'G.C. REAL ESTATE S.R.L.', tutor: 'MATTEO NOVATI', consulenza: '2026-05-04', ora: '14:30', dataVendita: '2025-07-08', prezzo: '€ 2.500,00' },
  { cliente: 'GIUSEPPE ACCETTA', azienda: 'ITALGLO SRL', tutor: 'ELSA GALEOTTI', consulenza: '2026-09-09', ora: '14:30', dataVendita: '2025-09-03', prezzo: '€ 9.987' },
  { cliente: 'GIUSEPPE DI GUIDA', azienda: 'GRUPPO EGS SRL', tutor: 'CRISTIAN FRIGERIO', consulenza: '2026-11-27', ora: '14:30', dataVendita: '2026-02-19', prezzo: '€ 13.000,00' },
  { cliente: 'GIUSEPPE MERCURI', azienda: 'MERCURI ORTHODONTIE SARL', tutor: 'ANDREA BUSELLU', consulenza: null, dataVendita: '2026-03-06', prezzo: '€ 14.593,50' },
  { cliente: 'GUIDO TROIANELLI', azienda: 'GRUPPO MULTISERVIZI SRL', tutor: 'ELSA GALEOTTI', consulenza: '2026-09-11', ora: '11:30', dataVendita: '2025-07-23', prezzo: '€ 2.500 + 0' },
  { cliente: 'KATHARINA SIRCH', azienda: 'KATHARINA SIRCH', tutor: 'FABIO VECCHIATO', consulenza: null, dataVendita: '2025-07-17', prezzo: '€ 9.987,00' },
  { cliente: 'LAURA BARONE', azienda: '3A MEDICAL SRL SEMPLIFICATA', tutor: 'ANDREA BUSELLU', consulenza: '2026-08-28', ora: '16:30', dataVendita: '2026-01-16', prezzo: '€ 9.709' },
  { cliente: 'LORELLA DI BATTISTA', azienda: 'LORELLA DI BATTISTA', tutor: 'SABRINA PIAZZOLLA', consulenza: '2026-07-03', ora: '09:30', dataVendita: '2025-07-25', prezzo: '€ 5000' },
  { cliente: 'LUDOVICA LOMBARDO', azienda: 'G.L. COMPANY SRL', tutor: 'SABRINA PIAZZOLLA', consulenza: null, dataVendita: '2025-08-21', prezzo: '€ 6.026' },
  { cliente: 'MARCO BELLONI', azienda: 'MB IMPIANTI SRL', tutor: 'GIACOMO SAGGIN', consulenza: '2026-09-10', ora: '14:30', dataVendita: '2025-11-12', prezzo: '€ 20.000' },
  { cliente: 'MARCO CELESCHI', azienda: 'TENUTA CARMINELLO', tutor: 'THOMAS FARINELLI', consulenza: null, dataVendita: '2025-08-28', prezzo: '€ 6.000' },
  { cliente: 'MARCO GIAFERRI', azienda: 'AGMA SRL', tutor: 'LEONARDO MAZZON', consulenza: null, dataVendita: '2025-12-19', prezzo: '€ 10.000' },
  { cliente: 'MARCO ZICCA (TERESA ZICCA)', azienda: 'AL RE SRL', tutor: 'SILVIA ANDREANI', consulenza: null, dataVendita: '2025-12-23', prezzo: '€ 19.000' },
  { cliente: 'MARISA BENVEGNU\' FERRARIO', azienda: 'DEDI SRL', tutor: 'CRISTIAN FRIGERIO', consulenza: '2026-11-27', ora: '09:30', dataVendita: '2026-03-06', prezzo: '€ 10.000,00' },
  { cliente: 'MASSIMILIANO COLANTONI', azienda: 'EMMECI ANTINCENDIO', tutor: 'SABRINA PIAZZOLLA', consulenza: '2026-08-27', ora: '11:30', dataVendita: '2025-08-08', prezzo: '€ 5.816' },
  { cliente: 'MATTEO FAGO', azienda: 'EDITORIALENOVANTA SRL', tutor: 'ANISSIA CABIDDU', consulenza: null, dataVendita: '2025-08-28', prezzo: '€ 39.987' },
  { cliente: 'MATTEO INGROSSO', azienda: 'INGROLAB SRL', tutor: 'MATTEO NOVATI', consulenza: '2026-07-17', ora: '14:30', dataVendita: '2026-03-19', prezzo: '€ 10.000.00' },
  { cliente: 'MATTIA ZAPPAROLI', azienda: 'ZAPPAROLI MATTIA', tutor: 'SILVIA ANDREANI', consulenza: '2026-09-10', ora: '11:30', dataVendita: '2025-10-16', prezzo: '€ 19.000' },
  { cliente: 'MAURIZIO CASTAGNOLI', azienda: 'EURO COMPANY SPA SOCIETA', tutor: 'ANDREA BUSELLU', consulenza: '2026-08-27', ora: '14:30', dataVendita: '2026-01-14', prezzo: '€ 30.000' },
  { cliente: 'MIANMIAN WANG', azienda: 'PERLA MEDICINA SRL', tutor: 'FABIO VECCHIATO', consulenza: '2026-07-15', ora: '09:30', dataVendita: '2026-07-07', prezzo: '€ 12.000,00' },
  { cliente: 'MICHELE BRENTEGANI', azienda: 'BRENTEGANI PIPE', tutor: 'GIACOMO SAGGIN', consulenza: '2026-12-18', ora: '14:30', dataVendita: '2025-09-01', prezzo: '€ 5.000' },
  { cliente: 'MILENA DRESTI', azienda: 'DRES PLAST SRL', tutor: 'THOMAS FARINELLI', consulenza: '2026-09-09', ora: '11:30', dataVendita: '2025-12-10', prezzo: '€ 10.000.00' },
  { cliente: 'MONICA FIN', azienda: 'DETERSEA', tutor: 'ANDREA BUSELLU', consulenza: null, prezzo: '€ 8000' },
  { cliente: 'NICOLA BARCELLI', azienda: 'STUDIO DENTISTICO BARCELLI SRL', tutor: 'SABRINA PIAZZOLLA', consulenza: '2026-08-26', ora: '11:30', dataVendita: '2026-01-29', prezzo: '€ 19.987,00' },
  { cliente: 'NICOLO CORRENTE', azienda: 'CREA PUNTO COM SRLS', tutor: 'GIACOMO SAGGIN', consulenza: null, dataVendita: '2025-12-19', prezzo: '€ 9.000' },
  { cliente: 'PIERLUIGI CIPRIANI', azienda: 'GROW UP SRL', tutor: 'SABRINA PIAZZOLLA', consulenza: '2026-04-30', ora: '16:30', dataVendita: '2025-06-20', prezzo: '€ 49.987,00' },
  { cliente: 'REMUS GAITA', azienda: 'RGS SRL', tutor: 'ANDREA BUSELLU', consulenza: null, dataVendita: '2026-02-06', prezzo: '€ 14.997,00' },
  { cliente: 'ROBERTO GRANDIS', azienda: 'COLONY ITALIA SRL', tutor: 'ANDREA BUSELLU', consulenza: '2026-07-02', ora: '09:30', dataVendita: '2026-03-06', prezzo: '€ 12.000,00' },
  { cliente: 'SIMONE TOMASINI', azienda: 'TRILLO PARRUCCHIERI DI TOMASINI', tutor: 'MATTEO NOVATI', consulenza: null, dataVendita: '2025-10-01', prezzo: '€ 8.709' },
  { cliente: 'STEFANO NICOLI', azienda: 'I TECNICI DELLA LUCE SRL', tutor: 'GIACOMO SAGGIN', consulenza: '2026-07-17', ora: '11:30', dataVendita: '2025-12-19', prezzo: '€ 10.000' },
  { cliente: 'TIZIANO BAIOCCO', azienda: 'T.R.S. GROUP SRL', tutor: 'GIACOMO SAGGIN', consulenza: '2026-09-09', ora: '09:30', dataVendita: '2025-09-09', prezzo: '€ 10.000' },
  { cliente: 'VALERIO SARTI', azienda: 'SCHEMA CASA SRL', tutor: 'ANDREA BUSELLU', consulenza: '2026-10-12', ora: '14:30', dataVendita: '2025-10-27', prezzo: '€ 10.000' },
  { cliente: 'VERONICA VERTUA', azienda: 'SMILE.PRO SRL', tutor: 'CRISTIAN FRIGERIO', consulenza: '2026-08-28', ora: '11:30', dataVendita: '2025-11-25', prezzo: '€ 11.000' },
  { cliente: 'VITTORIO MONTORRO', azienda: 'VITTORIO MONTORRO', tutor: 'MATTEO NOVATI', consulenza: '2026-11-27', ora: '16:30', dataVendita: '2025-12-18', prezzo: '€ 19.000' },
]
