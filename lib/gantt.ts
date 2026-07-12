// ─── Motore del Gantt amministrativo ───
// Avanzamento REALE (dai timbri del server nel blocco dati) + tempi PREVISTI
// (durate standard per fase, modificabili dal quadro amministrativo: sono da
// tarare insieme una volta che il processo è a regime).

import { CronologiaFasi, TimbroFase } from './datiblocco'
import { FASI } from './fasi'
import { FaseId, Pratica } from './types'

/** Durate attese per fase, in giorni. PRIMA STIMA da tarare con Lorenzo:
 *  il quadro amministrativo le può modificare (salvate nel browser). */
export const DURATE_STANDARD: Record<FaseId, number> = {
  'vendita': 1,
  'raccolta-documenti': 7,
  'generazione': 1,
  'revisione': 2,
  'visual': 1,
  'revisione-diagrammi': 1,
  'checkpoint-copy': 2,
  'impaginazione': 1,
  'revisione-impaginazione': 1,
  'approvazione-finale': 2,
  'completata': 0,
}

const CHIAVE_DURATE = 'gantt-durate-v1'

export function leggiDurate(): Record<FaseId, number> {
  if (typeof localStorage === 'undefined') return { ...DURATE_STANDARD }
  try {
    const salvate = JSON.parse(localStorage.getItem(CHIAVE_DURATE) ?? '{}')
    return { ...DURATE_STANDARD, ...salvate }
  } catch {
    return { ...DURATE_STANDARD }
  }
}

export function salvaDurate(durate: Record<FaseId, number>) {
  localStorage.setItem(CHIAVE_DURATE, JSON.stringify(durate))
}

const GIORNO_MS = 86_400_000

/** Un tratto della barra del Gantt. */
export interface TrattoGantt {
  fase: FaseId
  label: string
  /** classe Tailwind del pallino della fase (bg-*) riusata come colore */
  dot: string
  inizio: number // epoch ms
  fine: number
  /** true = fase già percorsa o in corso (reale); false = prevista */
  reale: boolean
  inCorso: boolean
}

export interface GanttPratica {
  pratica: Pratica
  tratti: TrattoGantt[]
  /** consegna prevista ricalcolata da oggi (reale + fasi restanti) */
  consegnaPrevista: number
  /** consegna che era attesa alla creazione (creazione + durate standard) */
  consegnaOriginale: number
  /** giorni di ritardo rispetto al piano (0 se in linea o in anticipo) */
  giorniRitardo: number
  /** da quanti giorni è ferma nella fase corrente */
  giorniInFase: number
  /** true se la fase corrente ha superato la sua durata prevista */
  faseInRitardo: boolean
  completata: boolean
}

/** Ricostruisce i tratti reali dai timbri del server; se mancano (blocco
 *  irraggiungibile) ripiega sulla dataCreazione + fase corrente. */
export function calcolaGantt(
  pratica: Pratica,
  cronologia: CronologiaFasi,
  durate: Record<FaseId, number>,
  adesso = Date.now()
): GanttPratica {
  const ordine = FASI.map((f) => f.id)
  const idxCorrente = ordine.indexOf(pratica.faseCorrente)
  const completata = pratica.faseCorrente === 'completata'

  let timbri: TimbroFase[] = cronologia[pratica.id] ?? []
  if (timbri.length === 0) {
    timbri = [{ fase: pratica.faseCorrente, dataOra: pratica.dataCreazione }]
  }

  // tratti REALI: ogni timbro dura fino al timbro successivo (o fino a oggi)
  const tratti: TrattoGantt[] = []
  for (let i = 0; i < timbri.length; i++) {
    const t = timbri[i]
    const fase = FASI.find((f) => f.id === t.fase)
    if (!fase) continue
    const inizio = Date.parse(t.dataOra)
    const fine = i + 1 < timbri.length ? Date.parse(timbri[i + 1].dataOra) : adesso
    const inCorso = i === timbri.length - 1 && !completata
    if (fase.id === 'completata') continue
    tratti.push({
      fase: fase.id, label: fase.label, dot: fase.dot,
      inizio, fine: Math.max(fine, inizio + GIORNO_MS / 8), reale: true, inCorso,
    })
  }

  // tratti PREVISTI: le fasi ancora da percorrere, da oggi in avanti
  let cursore = adesso
  if (!completata) {
    for (let i = idxCorrente + 1; i < ordine.length; i++) {
      const fase = FASI[i]
      if (fase.id === 'completata') break
      const durata = (durate[fase.id] ?? 1) * GIORNO_MS
      tratti.push({
        fase: fase.id, label: fase.label, dot: fase.dot,
        inizio: cursore, fine: cursore + durata, reale: false, inCorso: false,
      })
      cursore += durata
    }
  }

  const consegnaPrevista = completata
    ? (tratti.length ? tratti[tratti.length - 1].fine : adesso)
    : cursore
  const creazione = Date.parse(pratica.dataCreazione)
  const durataTotale = ordine.reduce((s, id) => s + (durate[id] ?? 0), 0) * GIORNO_MS
  const consegnaOriginale = creazione + durataTotale
  const giorniRitardo = completata ? 0 : Math.max(0, Math.round((consegnaPrevista - consegnaOriginale) / GIORNO_MS))

  const ultimoTimbro = timbri[timbri.length - 1]
  const giorniInFase = Math.max(0, Math.floor((adesso - Date.parse(ultimoTimbro.dataOra)) / GIORNO_MS))
  const faseInRitardo = !completata && giorniInFase > (durate[pratica.faseCorrente] ?? 1)

  return { pratica, tratti, consegnaPrevista, consegnaOriginale, giorniRitardo, giorniInFase, faseInRitardo, completata }
}
