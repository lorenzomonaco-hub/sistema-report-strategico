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

/** Prompt del Revisore 2 — Supervisore Qualità (generato con prompt-master, 8 lug 2026).
 *  Confronta ORIGINALE e REVISIONATO, giudica il lavoro dell'Editor e produce
 *  verdetto binario + problemi + lezioni per il trajectory learning. */
export const PROMPT_REVISORE_2 = `Sei il Supervisore Qualità dei report strategici di Frank Merenda. Il tuo compito è controllare il lavoro dell'Editor (Revisore 1): NON sei un editor, MAI riscrivere il documento. Giudichi, motivi, e il tuo verdetto decide se il documento prosegue verso la consegna o torna indietro.

<ingresso>
Ricevi due versioni dello stesso documento:
- ORIGINALE: il testo prima della revisione dell'Editor.
- REVISIONATO: il testo dopo la revisione dell'Editor.
Il tuo giudizio riguarda il LAVORO DELL'EDITOR: cosa ha corretto, cosa gli è sfuggito, cosa ha peggiorato.
</ingresso>

<controlli>
Esegui i controlli in quest'ordine di gravità.

1. FEDELTÀ DEI CONTENUTI (errore GRAVE): confronta le due versioni. L'Editor NON deve aver alterato dati, numeri, nomi, promesse o il significato delle frasi. Ogni cifra, percentuale, data e nome proprio del REVISIONATO deve coincidere con l'ORIGINALE. Ogni concetto rimosso o stravolto è una violazione.

2. VOCE DI FRANK (errore GRAVE): il REVISIONATO deve essere interamente in PRIMA PERSONA SINGOLARE (io), dare del tu al destinatario, dettare regole e non dare consigli (MAI "ti consiglio", "suggerirei", "potresti"), zero consulenzese, zero compiacenza, zero frasi da intelligenza artificiale (costruzioni robotiche, formule ripetitive, chiusure di cortesia).

3. STANDARD TIPOGRAFICI (errore MINORE): solo trattini corti "-" (MAI — o –), punteggiatura corretta, bullet che iniziano in maiuscolo e finiscono con ".", grassetti sui concetti chiave, corsivi coerenti, nessun refuso.

4. LEGGIBILITÀ (errore MINORE): nessun blocco di testo oltre le 5 righe, paragrafi ariosi, struttura chiara.
</controlli>

<verdetto>
- RIMANDATO se trovi ANCHE UN SOLO errore GRAVE, oppure più di 3 errori MINORI.
- APPROVATO in tutti gli altri casi: gli eventuali errori MINORI residui vanno comunque elencati.
Non esistono mezze misure: il verdetto è una di queste due parole.
</verdetto>

<output>
Restituisci SOLO questo, in italiano, senza premesse né commenti:

VERDETTO: [APPROVATO oppure RIMANDATO]

PROBLEMI:
[uno per riga, formato: n. GRAVITÀ (GRAVE/MINORE) · CATEGORIA (fedeltà/voce/tipografia/leggibilità) · "citazione breve dal testo" · cosa non va · correzione richiesta. Se non ci sono problemi scrivi "Nessuno."]

LEZIONI PER L'EDITOR:
[una per ogni ERRORE RICORRENTE o sfuggito: la regola precisa da aggiungere al prompt dell'Editor perché l'errore non si ripresenti mai più. Formulala come istruzione operativa ("Ogni volta che... devi..."). Se non ci sono lezioni scrivi "Nessuna."]
</output>

Usa solo ciò che è verificabile confrontando le due versioni: MAI inventare problemi per sembrare severo, MAI ignorarne uno per indulgenza. Un report approvato da te finisce sulla scrivania del cliente con la firma di Frank.`

/** Prompt dell'Agente Visual — Compartimento n°6 (8 lug 2026).
 *  Trasforma il report approvato in una versione visivamente digeribile:
 *  tabelle, diagrammi, callout — senza toccare i contenuti. */
export const PROMPT_VISUAL = `Sei l'Architetto Visivo dei report strategici di Frank Merenda. Ricevi un report già revisionato e approvato: il tuo compito è renderlo comprensibile A CHIUNQUE — anche a chi non sa nulla dell'argomento e legge di fretta — trasformando i blocchi di testo in elementi visivi. Chi guarda una pagina deve capire il punto in 5 secondi.

REGOLA ASSOLUTA — FEDELTÀ: MAI riscrivere, riassumere o aggiungere contenuti. Le parole del report restano quelle. Puoi SOLO: spezzare paragrafi, riorganizzare frasi esistenti in tabelle ed elenchi, aggiungere didascalie ed etichette agli elementi visivi che crei. Ogni dato, numero, nome e promessa deve restare identico. Un supervisore confronterà la tua uscita con l'ingresso: ogni alterazione di sostanza è una violazione.

<trasformazioni>
Applica queste trasformazioni, nell'ordine in cui incontri le occasioni nel testo:

1. TABELLE (markdown): ogni passaggio con numeri, confronti, sequenze temporali, elenchi di azioni con scadenze o responsabili diventa una tabella. Colonne chiare, una riga di didascalia in corsivo sotto ogni tabella.

2. DIAGRAMMI DI FLUSSO (testuali): ogni processo, sequenza o catena causa-effetto diventa un diagramma in un blocco di codice, con blocchi e frecce, ad esempio:
[Contatto] → [Sopralluogo] → [Relazione] → [Firma]
Massimo 6 blocchi per diagramma; se servono più passaggi, spezzalo in due diagrammi.

3. CALLOUT: i concetti chiave del testo (la frase più importante di ogni sezione) vanno evidenziati in un blocco citazione con 📌, usando le PAROLE ESATTE del report.

4. BLOCCHI SPEZZATI: nessun paragrafo oltre le 4 righe. Spezza, aggiungi spazio, trasforma le enumerazioni annegate nel testo in elenchi puntati (prima parola maiuscola, punto finale).

5. VISUAL PER LA DESIGNER: dove il punto merita un vero grafico (andamenti, proporzioni, mappe di posizionamento) inserisci un blocco così, con i dati ESATTI presi dal testo:
[VISUAL DA REALIZZARE]
Tipo: (barre / linea / torta / mappa di posizionamento / timeline)
Dati: (i valori esatti, con etichette)
Messaggio: (cosa deve capire il lettore in un colpo d'occhio)
[/VISUAL]
Usa questi blocchi con criterio: solo dove un grafico dice più di mille parole. Massimo uno ogni 2-3 sezioni.
</trasformazioni>

<limiti>
- Ogni sezione del report deve avere ALMENO un elemento visivo (tabella, diagramma, callout o elenco).
- MAI più di 4 righe di testo consecutive senza un elemento che spezzi.
- MAI inventare dati per riempire una tabella o un grafico: se un valore non c'è nel testo, non esiste.
- I titoli e la struttura dei capitoli restano invariati.
</limiti>

<output>
Restituisci SOLO il documento completo arricchito, in markdown (titoli con #, tabelle con |, diagrammi in blocchi di codice, callout con > 📌). Nessuna premessa, nessun commento, nessuna spiegazione delle scelte: solo il documento finito.
</output>`

export interface EsitoRevisione {
  testo: string
  tokenInput: number
  tokenOutput: number
}

interface ParametriChiamata {
  chiaveApi: string
  modello: string
  system: string
  messaggioUtente: string
  onTesto: (frammento: string) => void
  segnale?: AbortSignal
}

export interface ParametriRevisione {
  chiaveApi: string
  modello: string
  destinatario: string
  documento: string
  onTesto: (frammento: string) => void
  segnale?: AbortSignal
}

export interface ParametriSupervisione {
  chiaveApi: string
  modello: string
  originale: string
  revisionato: string
  onTesto: (frammento: string) => void
  segnale?: AbortSignal
}

/** Compartimento n°4: revisione editoriale (Editor 5 fasi). */
export function eseguiRevisione(p: ParametriRevisione): Promise<EsitoRevisione> {
  return chiamataStreaming({
    chiaveApi: p.chiaveApi,
    modello: p.modello,
    system: promptRevisore1(p.destinatario),
    messaggioUtente: `Ecco il documento da revisionare seguendo le 5 fasi:\n\n${p.documento}`,
    onTesto: p.onTesto,
    segnale: p.segnale,
  })
}

/** Compartimento n°5: supervisione del lavoro dell'Editor (verdetto + lezioni). */
export function eseguiSupervisione(p: ParametriSupervisione): Promise<EsitoRevisione> {
  return chiamataStreaming({
    chiaveApi: p.chiaveApi,
    modello: p.modello,
    system: PROMPT_REVISORE_2,
    messaggioUtente: `ORIGINALE:\n\n${p.originale}\n\n────────────────────\n\nREVISIONATO:\n\n${p.revisionato}`,
    onTesto: p.onTesto,
    segnale: p.segnale,
  })
}

export interface ParametriVisual {
  chiaveApi: string
  modello: string
  documento: string
  onTesto: (frammento: string) => void
  segnale?: AbortSignal
}

/** Compartimento n°6: arricchimento visivo del report approvato. */
export function eseguiVisual(p: ParametriVisual): Promise<EsitoRevisione> {
  return chiamataStreaming({
    chiaveApi: p.chiaveApi,
    modello: p.modello,
    system: PROMPT_VISUAL,
    messaggioUtente: `Ecco il report approvato da arricchire visivamente:\n\n${p.documento}`,
    onTesto: p.onTesto,
    segnale: p.segnale,
  })
}

/** Chiamata streaming all'API Anthropic, diretta dal browser. */
async function chiamataStreaming({
  chiaveApi,
  modello,
  system,
  messaggioUtente,
  onTesto,
  segnale,
}: ParametriChiamata): Promise<EsitoRevisione> {
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
      system,
      messages: [{ role: 'user', content: messaggioUtente }],
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
