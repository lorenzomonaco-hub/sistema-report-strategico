// ─── Dati vendita dal foglio di elisa.mazza ───
// "CONSULENZE FRANK - Questionari ricevuti da elaborare" (fileId
// 1-QcOLPu9wTJla3cnNYmY3j71iyQZb8VqtTWl5SXgFMw). Per ogni cliente: data della
// vendita (colonna DATA FATTURA, prima data) e prezzo (colonna IMPORTO).
// Si abbinano ai clienti in piattaforma per COGNOME (match esatto sul token,
// per evitare falsi positivi tipo "andREA" → "REA").

export type VenditaElisa = {
  /** cognome/chiave che compare nel nome del cliente in piattaforma */
  chiave: string
  cliente: string
  azienda: string
  /** data vendita YYYY-MM-DD (prima DATA FATTURA) */
  dataVendita: string
  /** importo in fattura, così com'è sul foglio (ripulito) */
  prezzo: string
}

export const VENDITE_ELISA: VenditaElisa[] = [
  { chiave: 'imbriano', cliente: 'Alessandro Imbriano', azienda: 'Vanda Omeopatici SRL', dataVendita: '2025-05-20', prezzo: '€ 36.484 + 20.000' },
  { chiave: 'pessot', cliente: 'Agostino Pessot', azienda: 'Pessot Flli SRL', dataVendita: '2025-12-23', prezzo: '€ 12.303' },
  { chiave: 'barcello', cliente: 'Alessio Barcello', azienda: 'Barcello Rappresentanze SAS', dataVendita: '2026-03-30', prezzo: '€ 15.000' },
  { chiave: 'cazan', cliente: 'Gheorge Cazan', azienda: 'Compass In SRL', dataVendita: '2026-04-16', prezzo: '€ 19.500' },
  { chiave: 'novella', cliente: 'Andrea Novella', azienda: 'Stilogistica SRL', dataVendita: '2026-04-30', prezzo: '€ 10.000' },
  { chiave: 'rea', cliente: 'Massimiliano Rea', azienda: 'Erreesse SRL', dataVendita: '2026-06-25', prezzo: '€ 11.000' },
  { chiave: 'virdis', cliente: 'Claudio Virdis', azienda: 'Gruppoconsilia SRL', dataVendita: '2026-03-06', prezzo: '€ 23.987' },
  { chiave: 'lancia', cliente: 'Desirée Lancia', azienda: 'Garden House SRL', dataVendita: '2026-02-17', prezzo: '€ 10.000' },
  { chiave: 'banfi', cliente: 'Elia Banfi', azienda: 'Elia Banfi', dataVendita: '2025-08-19', prezzo: '€ 5.000' },
  { chiave: 'tamburini', cliente: 'Matteo Tamburini', azienda: 'MT Service SRL', dataVendita: '2025-10-23', prezzo: '€ 4.000' },
  { chiave: 'donnantuono', cliente: 'Nicolò Donnantuono', azienda: 'Pitwo SRL', dataVendita: '2026-03-18', prezzo: '€ 20.000' },
]

/** Ritorna la vendita che combacia col nome/azienda (match esatto su un token). */
export function venditaDaNome(...campi: string[]): VenditaElisa | null {
  const token = new Set(
    campi
      .join(' ')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
  )
  return VENDITE_ELISA.find((v) => token.has(v.chiave)) ?? null
}
