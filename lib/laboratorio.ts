// ─── Laboratorio — motore dei compartimenti di test ───
// Chiama l'API Anthropic direttamente dal browser (streaming SSE).
// La chiave API resta nel browser dell'utente (localStorage) e viaggia
// solo verso api.anthropic.com: nessun server nostro la vede.

export const MODELLI_LAB = [
  { id: 'claude-opus-4-8', nome: 'Claude Opus 4.8 (consigliato)' },
  { id: 'claude-sonnet-5', nome: 'Claude Sonnet 5 (più rapido)' },
] as const

export const CHIAVE_STORAGE_API = 'laboratorio-chiave-api'

/** Prompt del Revisore 1 — Editor Senior Metodo (5 fasi), adattato all'esecuzione automatica:
 *  la FASE 0 (domanda sul destinatario) è sostituita dal parametro, e l'output è solo il testo. */
export function promptRevisore1(destinatario: string): string {
  return `Agisci come un Editor Senior di Metodo Merenda. Il tuo compito è revisionare e correggere i report e i piani di marketing preparati dai copywriter per le consulenze di Frank Merenda. Ricevi in input il testo su cui lavorare. Esegui il tuo compito seguendo rigorosamente queste 5 Fasi.

DESTINATARIO DEL REPORT: ${destinatario}. Usa il nome del destinatario per contestualizzare l'introduzione o la chiusura del documento se necessario. Non fare domande: hai già tutte le informazioni.

FASE 1: Revisione Logica e di Comprensibilità
Analizza il testo per assicurarti che tutti i concetti siano chiari, diretti e facilmente comprensibili. Verifica che l'intero report abbia un senso logico ferreo, valutando la solidità delle argomentazioni.

FASE 2: Controllo Grammaticale e Tone of Voice
Correggi la grammatica: il testo finale deve essere scritto in una lingua italiana perfetta.
- Sostituisci tutti i trattini lunghi (come — o –) usando esclusivamente il trattino corto "-".
- Controlla e applica una punteggiatura impeccabile.
- Elimina qualsiasi ripetizione inutile.
Regola fondamentale: assicurati che tutto il testo sia scritto rigorosamente in PRIMA PERSONA SINGOLARE (io). La voce narrante deve essere esclusivamente quella di Frank Merenda. Modifica ogni frase che non rispetti questo parametro.

FASE 3: Formattazione in stile Copy
Struttura il testo affinché sia arioso, leggibile e distanziato. Se noti blocchi di testo troppo densi o ritieni che tra due frasi debba esserci uno spazio vuoto, aggiungilo senza esitare.

FASE 4: Analisi Tecnica e Formattazione Visiva
Esegui un controllo di qualità sulla formattazione. Verifica la coerenza del testo:
- Assicurati che i grassetti siano usati per enfatizzare concetti chiave e i punti salienti del copy.
- Verifica l'uso corretto dei corsivi per termini tecnici o per dare enfasi.
- Correggi eventuali mancanze di formattazione che rendono il testo meno leggibile o meno incisivo.

REGOLA DI NATURALEZZA: il testo revisionato deve suonare scritto da un essere umano, non da una macchina. Elimina costruzioni robotiche, formule ripetitive e frasi da intelligenza artificiale. Il ritmo deve essere quello del parlato diretto di Frank.

FASE 5: Output Finale
Applica tutte le correzioni individuate nelle fasi precedenti e restituisci SOLTANTO il testo completo revisionato e formattato in markdown (grassetti con **, corsivi con *, titoli con #). Nessuna premessa, nessun commento, nessuna spiegazione delle modifiche: solo il documento finito, pronto per essere copiato.`
}

export interface EsitoRevisione {
  testo: string
  tokenInput: number
  tokenOutput: number
}

export interface ParametriRevisione {
  chiaveApi: string
  modello: string
  destinatario: string
  documento: string
  onTesto: (frammento: string) => void
  segnale?: AbortSignal
}

/** Esegue la revisione in streaming contro l'API Anthropic (diretta dal browser). */
export async function eseguiRevisione({
  chiaveApi,
  modello,
  destinatario,
  documento,
  onTesto,
  segnale,
}: ParametriRevisione): Promise<EsitoRevisione> {
  const risposta = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: segnale,
    headers: {
      'content-type': 'application/json',
      'x-api-key': chiaveApi,
      'anthropic-version': '2023-06-01',
      // necessario per le chiamate dirette dal browser (CORS)
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: modello,
      max_tokens: 64000,
      stream: true,
      thinking: { type: 'adaptive' },
      system: promptRevisore1(destinatario),
      messages: [
        {
          role: 'user',
          content: `Ecco il documento da revisionare seguendo le 5 fasi:\n\n${documento}`,
        },
      ],
    }),
  })

  if (!risposta.ok) {
    let messaggio = `Errore API (HTTP ${risposta.status})`
    try {
      const corpo = await risposta.json()
      if (corpo?.error?.message) messaggio = corpo.error.message
    } catch {
      // corpo non JSON: si tiene il messaggio generico
    }
    throw new Error(messaggio)
  }

  const lettore = risposta.body!.getReader()
  const decodificatore = new TextDecoder()
  let residuo = ''
  let testo = ''
  let tokenInput = 0
  let tokenOutput = 0

  for (;;) {
    const { done, value } = await lettore.read()
    if (done) break
    residuo += decodificatore.decode(value, { stream: true })

    const righe = residuo.split('\n')
    residuo = righe.pop() ?? ''

    for (const riga of righe) {
      if (!riga.startsWith('data: ')) continue
      const dati = riga.slice(6).trim()
      if (!dati || dati === '[DONE]') continue

      let evento: Record<string, unknown>
      try {
        evento = JSON.parse(dati)
      } catch {
        continue
      }

      const tipo = evento.type as string
      if (tipo === 'content_block_delta') {
        const delta = (evento as { delta?: { type?: string; text?: string } }).delta
        if (delta?.type === 'text_delta' && delta.text) {
          testo += delta.text
          onTesto(delta.text)
        }
      } else if (tipo === 'message_start') {
        const uso = (evento as { message?: { usage?: { input_tokens?: number } } }).message?.usage
        if (uso?.input_tokens) tokenInput = uso.input_tokens
      } else if (tipo === 'message_delta') {
        const uso = (evento as { usage?: { output_tokens?: number } }).usage
        if (uso?.output_tokens) tokenOutput = uso.output_tokens
      } else if (tipo === 'error') {
        const err = (evento as { error?: { message?: string } }).error
        throw new Error(err?.message ?? 'Errore durante lo streaming')
      }
    }
  }

  return { testo, tokenInput, tokenOutput }
}
