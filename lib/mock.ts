import { AppState } from './types'

// ─── Contenuti documento di esempio (demo) ───

export const QUESTIONARIO_MOCK = `QUESTIONARIO DI ANALISI — risposte del cliente

1. Settore e business model: sviluppo videogiochi horror e dark action premium per PC e console. Ricavi da cofinanziamento + revenue share.
2. Anni di attività: dal 2017. Team: circa 100 persone.
3. Obiettivo 12 mesi: ROI 3x, pipeline finanziata fino al 2029, 2 release/anno.
4. Obiettivo 3 anni: riconoscimento come top studio AA mondiale, label di publishing.
5. Posizionamento dichiarato: "The AA narrative horror studio with Hollywood IP experience and co-investment capability".
6. Competitor principali: Bloober Team (#1), Supermassive Games, Saber.
7. Canali marketing: networking GDC / Gamescom, pitch proattivi, HubSpot.
8. Fatturato: 5.5 mln (2023) → 3.2 mln (2024) → 3 mln (2025).
9. Round raccolto: 6 mln (ottobre 2025). Progetti attivi: 5, tutti in cofinanziamento.`

export const TRASCRIZIONE_MOCK = `TRASCRIZIONE DELLA SESSIONE DI ANALISI (estratto)

Consulente: In che settore operate e qual è il vostro business model?
Cliente: Sviluppiamo e pubblichiamo videogiochi horror e dark action premium... [risposta completa]

Consulente: Dove vuoi che sia l'azienda tra 12 mesi?
Cliente: Voglio che dimostri di saper generare videogiochi molto profittevoli (ROI 3x entro 12 mesi)...

Consulente: Qual è la cosa che ti fa svegliare la notte?
Cliente: Giochi che vendano molto più di quanto costano. E un flusso di deal che ci consente di resistere con la cassa...

[trascrizione integrale della sessione di 60 minuti]`

export const ASSESSFIRST_MOCK = (nome: string) => `ASSESSFIRST — Profilo di ${nome}

DRIVE (motivazioni): orientamento al risultato alto, bisogno di autonomia elevato.
SHAPE (personalità): visione strategica, propensione al rischio calcolato, bassa tolleranza per la routine.
BRAIN (ragionamento): capacità di analisi sopra la media, decisioni rapide in contesti incerti.

Sintesi: profilo imprenditoriale con forte spinta alla crescita. Punti di attenzione: delega e gestione operativa quotidiana.`

export const REPORT_IRENE_MOCK = `REPORT ASSESSFIRST — Sintesi del team (generato con prompt da Irene)

PANORAMICA
Il team analizzato mostra un profilo complementare: leadership visionaria affiancata da profili esecutivi solidi.

PUNTI DI FORZA DEL TEAM
- Decisione rapida e orientamento al risultato nella proprietà
- Buona copertura delle competenze tecniche
- Alta motivazione diffusa

RISCHI ORGANIZZATIVI
- Concentrazione delle decisioni strategiche su una sola persona
- Delega debole: i profili senior eseguono ma non proteggono la visione
- Possibile collo di bottiglia nel decision-making creativo con 5 progetti simultanei

INDICAZIONI PER LA CONSULENZA
Lavorare su: struttura di delega, secondo livello decisionale, KPI individuali collegati al ROI.

[Questo report è generato da Irene incollando i test AssessFirst in una chat con un prompt dedicato — passaggio da automatizzare nella piattaforma]`

export const DOC_UNIFICATO_MOCK = `DOCUMENTO UNIFICATO — Analisi Azienda

FONTI:
- Questionario di analisi (compilato dal cliente)
- Trascrizione della sessione di analisi
- Report AssessFirst del team (Irene)
- AssessFirst individuali dei dipendenti

DATI RACCOLTI:

1. AZIENDA E BUSINESS MODEL
Studio di sviluppo videogiochi horror e dark action premium per PC e console.
Attivi dal 2017, circa 100 persone tra dipendenti e collaboratori.
Partnership con major IP holder: Paramount, Take Two, AMC.

2. OBIETTIVI DICHIARATI
- 12 mesi: ROI 3x, pipeline finanziata fino al 2029, 2 release/anno
- 3 anni: riconoscimento come top studio AA mondiale, apertura label publishing

3. POSIZIONAMENTO
"The AA narrative horror studio with Hollywood IP experience and co-investment capability"
Percepiti come #2 mondiale nel segmento dopo Bloober Team.

4. PROFILO DEL TEAM (da AssessFirst)
Leadership visionaria con decisione rapida; rischio di collo di bottiglia decisionale;
delega debole sui profili senior.

5. NUMERI
Fatturato: 5.5 mln (2023) → 3.2 mln (2024) → 3 mln (2025).
Round di 6 mln raccolto a ottobre 2025. 5 progetti attivi in cofinanziamento.
Prime revenue dal nuovo modello: ottobre 2026.`

export const REPORT_AI_MOCK = `DIAGNOSI DELLA VERITÀ

RIASSUNTO ESECUTIVO
Uno studio che ha capito il gioco, ha fatto le mosse giuste, ma sta per affrontare il test più brutale della sua esistenza: dimostrare che può trasformare relazioni e capitale in profitti reali prima che finiscano i soldi.

1. ANALISI DEL POSIZIONAMENTO
Il posizionamento attuale è eccellente: chiaro, differenziante, credibile. Ma essere secondi significa che ogni volta che il numero uno è disponibile, perdete il deal.
La mossa di espandere in una seconda linea di prodotto è strategicamente pericolosa: state diluendo il focus proprio quando dovreste consolidarlo.
Verdetto: siete posizionati come specialisti emergenti, ma state per sabotare il vostro stesso positioning espandendovi orizzontalmente invece che verticalmente.

2. ANALISI MARKETING
Il vostro marketing B2B è eccellente nella forma ma pericolosamente passivo nella sostanza. Dipendete completamente da due eventi annuali per generare deal flow.
Il paradosso: avete KPI basati su ROI, ma non avete ancora un solo euro di revenue dal nuovo modello. Non avete controllo del ROI. Avete una scommessa sul ROI.

3. IL VINCOLO REALE
Collo di bottiglia dichiarato: il closing dei deal.
Collo di bottiglia REALE: la qualità dell'esecuzione. Potete scalare la capacità produttiva, non la capacità di decision-making creativo e strategico.
Il profilo AssessFirst del team lo conferma: le decisioni critiche dipendono da una sola persona.

4. LA VERITÀ DEI NUMERI
Fatturato in calo da tre anni. Il round raccolto copre 9-10 mesi di burn rate senza nuove revenue.
Il primo test del nuovo modello è tra 7 mesi. Ogni ritardo vi costringe a cercare bridge financing in posizione di debolezza.

5. I 3 AUTOINGANNI PRINCIPALI
1. "Il modello ci permette di scalare senza limiti" — potete scalare la produzione, non le decisioni.
2. "Il problema è solo trovare i fondi" — se gli IP holder credessero nel vostro potenziale, investirebbero direttamente.
3. "Il track record arriverà presto" — dopo 9 anni senza un successo conclamato, il problema non è il modello. È l'execution.

PIANO D'AZIONE (90 GIORNI)
1. Uccidi la brand dilution — oggi.
2. Accelera il deal flow — entro 60 giorni: outbound continuativo, non aspettare gli eventi.
3. Prepara il bridge plan — entro 30 giorni: scenario analysis sulle vendite del primo titolo.

PROVOCAZIONE FINALE
Hai costruito una macchina bellissima. Ma una Ferrari senza benzina è solo un soprammobile costoso.`

export const REPORT_VISUAL_MOCK = `${REPORT_AI_MOCK}

─────────────────────────────
ELEMENTI VISUAL INSERITI DAL SISTEMA:

[TABELLA 1 — Fatturato 2023-2025: confronto a barre con trend evidenziato]
[GRAFICO 1 — Runway di cassa: timeline mesi rimanenti vs data prima revenue]
[DIAGRAMMA 1 — I 3 autoinganni: schema visuale causa → conseguenza]
[TABELLA 2 — Piano d'azione 90 giorni: azione / scadenza / responsabile]
[INFOGRAFICA 1 — Posizionamento competitivo: mappa specialista vs generalista]`

// Nessuna pratica di esempio: i clienti reali arrivano dal backend condiviso
// e dalle registrazioni in area commerciale. I contenuti *_MOCK qui sopra
// restano come testo dimostrativo usato altrove nell'interfaccia.

export const SEED_STATE: AppState = {
  pratiche: [],

  apprendimenti: [],

  prompts: [
    {
      id: 'batteria-consulenza',
      nome: 'Batteria Consulenza — Report Strategico (20 prompt)',
      faseUso: 'Generazione AI — tipo di lavoro: Consulenza',
      versione: 'v1.2',
      ultimaModifica: '2026-06-10T10:05:00.000Z',
      changelog: [
        { versione: 'v1.0', data: '2026-05-01', descrizione: 'Importata dalla "Guida per Creazione Report Strategiche e Piani Marketing": START 0 → 0.1/0.2 → Piano fasi → Fasi 1-5 → lettere' },
        { versione: 'v1.1', data: '2026-05-20', descrizione: 'Migliorata la Fase 1 (Diagnosi & Vincoli): distinzione esplicita tra vincolo dichiarato e vincolo reale' },
        { versione: 'v1.2', data: '2026-06-10', descrizione: 'Da apprendimento ap-002: regola trattino corto obbligatorio in tutti i prompt' },
      ],
    },
    {
      id: 'batteria-branding',
      nome: 'Batteria Branding — Piano Marketing (21 prompt)',
      faseUso: 'Generazione AI — tipo di lavoro: Branding',
      versione: 'v1.1',
      ultimaModifica: '2026-06-10T10:05:00.000Z',
      changelog: [
        { versione: 'v1.0', data: '2026-05-01', descrizione: 'Come la batteria Consulenza + FASE 3.3: funnel pronto all\'uso (richiede lo studio di "Dot Com Secrets" di Russell Brunson)' },
        { versione: 'v1.1', data: '2026-06-10', descrizione: 'Da apprendimento ap-002: regola trattino corto obbligatorio in tutti i prompt' },
      ],
    },
    {
      id: 'report-af',
      nome: 'Agente Report AssessFirst (autonomo)',
      faseUso: 'Step 4a — un report PDF per dipendente + email al tutor (Irene supervisiona)',
      versione: 'v1.0',
      ultimaModifica: '2026-07-10T09:00:00.000Z',
      changelog: [{ versione: 'v1.0', data: '2026-07-10', descrizione: 'Passaggio reso autonomo: genera un report per dipendente dalla knowledge base AssessFirst, zero revisione umana' }],
    },
    {
      id: 'agente-visual',
      nome: 'Agente Visual — Tabelle e Diagrammi',
      faseUso: 'Inserimento elementi visivi',
      versione: 'v1.0',
      ultimaModifica: '2026-05-15T09:00:00.000Z',
      changelog: [{ versione: 'v1.0', data: '2026-05-15', descrizione: 'Trasforma blocchi di testo in tabelle, grafici e diagrammi comprensibili a chiunque' }],
    },
    {
      id: 'revisore-diagrammi',
      nome: 'Revisore Diagrammi (loop automatico)',
      faseUso: 'Rimanda al Visual finché i diagrammi non sono perfetti — e impara dai rimandi',
      versione: 'v1.0',
      ultimaModifica: '2026-07-10T09:00:00.000Z',
      changelog: [{ versione: 'v1.0', data: '2026-07-10', descrizione: 'Evoluzione del Revisore Leggibilità: loop automatico con il Visual + lezioni nel registro' }],
    },
    {
      id: 'specifica-impaginazione',
      nome: 'Specifica di impaginazione (fase 8)',
      faseUso: 'Impaginazione + revisione finale contro la knowledge base',
      versione: 'v1.0',
      ultimaModifica: '2026-07-08T09:00:00.000Z',
      changelog: [{ versione: 'v1.0', data: '2026-07-08', descrizione: 'Specifica a 29 sezioni derivata dal modello Macheda (repo conoscenza)' }],
    },
  ],
}
