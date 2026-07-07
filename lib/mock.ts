import { AppState, DocumentoAllegato, Pratica } from './types'

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

// ─── Helper per allegati seed ───

const alQuestionario = (data: string): DocumentoAllegato => ({
  id: `al-q-${data}`, nome: 'Questionario compilato.pdf', tipo: 'questionario', caricatoDa: 'Giulia T. (Tutor)', dataCaricamento: data, contenuto: QUESTIONARIO_MOCK,
})
const alTrascrizione = (data: string): DocumentoAllegato => ({
  id: `al-t-${data}`, nome: 'Trascrizione analisi.pdf', tipo: 'trascrizione', caricatoDa: 'Giulia T. (Tutor)', dataCaricamento: data, contenuto: TRASCRIZIONE_MOCK,
})
const alAssess = (dip: string, data: string): DocumentoAllegato => ({
  id: `al-a-${dip}-${data}`, nome: `AssessFirst - ${dip}.pdf`, tipo: 'assessfirst', caricatoDa: 'Elisa', dataCaricamento: data, dipendente: dip, contenuto: ASSESSFIRST_MOCK(dip),
})
const alReportIrene = (data: string): DocumentoAllegato => ({
  id: `al-r-${data}`, nome: 'Report AssessFirst del team.pdf', tipo: 'report-irene', caricatoDa: 'Irene', dataCaricamento: data, contenuto: REPORT_IRENE_MOCK,
})

// ─── Pratiche di esempio ───

const p = (
  id: string,
  azienda: string,
  cliente: string,
  email: string,
  dipendenti: string[],
  faseCorrente: Pratica['faseCorrente'],
  dataCreazione: string,
  extra: Partial<Pratica> = {}
): Pratica => ({
  id,
  azienda,
  cliente,
  email,
  venditore: 'Marco V.',
  tutor: 'Giulia T.',
  dipendenti,
  tipoLavoro: null,
  faseCorrente,
  dataCreazione,
  allegati: [],
  versioni: [],
  storico: [{ fase: 'vendita', azione: 'Pratica creata dal venditore', autore: 'Marco V.', dataOra: dataCreazione }],
  ...extra,
})

const cartellaCompleta = (dipendenti: string[], data: string): DocumentoAllegato[] => [
  alQuestionario(data),
  alTrascrizione(data),
  ...dipendenti.map((d) => alAssess(d, data)),
  alReportIrene(data),
]

export const SEED_STATE: AppState = {
  pratiche: [
    p('pr-001', 'TechnoService SRL', 'Paolo Bianchi', 'p.bianchi@technoservice.it', ['Paolo Bianchi', 'Sara Colombo'], 'vendita', '2026-07-03T09:15:00.000Z'),

    p('pr-002', 'Rossi Costruzioni', 'Andrea Rossi', 'a.rossi@rossicostruzioni.it', ['Andrea Rossi', 'Luca Neri', 'Marta Villa'], 'raccolta-documenti', '2026-06-28T11:00:00.000Z', {
      // solo il questionario: mancano trascrizione, assessfirst e report Irene
      allegati: [alQuestionario('2026-07-04T10:00:00.000Z')],
      storico: [
        { fase: 'vendita', azione: 'Pratica creata dal venditore', autore: 'Marco V.', dataOra: '2026-06-28T11:00:00.000Z' },
        { fase: 'vendita', azione: 'Assessment e questionario inviati al cliente', autore: 'Marco V.', dataOra: '2026-06-28T11:30:00.000Z' },
        { fase: 'raccolta-documenti', azione: 'Questionario caricato', autore: 'Giulia T. (Tutor)', dataOra: '2026-07-04T10:00:00.000Z' },
      ],
    }),

    p('pr-003', 'Bella Napoli Ristoranti', 'Ciro Esposito', 'ciro@bellanapoli.it', ['Ciro Esposito', 'Anna Russo'], 'raccolta-documenti', '2026-06-20T10:00:00.000Z', {
      // manca solo il report di Irene
      allegati: [
        alQuestionario('2026-07-01T09:00:00.000Z'),
        alTrascrizione('2026-07-01T09:05:00.000Z'),
        alAssess('Ciro Esposito', '2026-07-03T15:00:00.000Z'),
        alAssess('Anna Russo', '2026-07-03T15:05:00.000Z'),
      ],
      storico: [
        { fase: 'vendita', azione: 'Pratica creata dal venditore', autore: 'Marco V.', dataOra: '2026-06-20T10:00:00.000Z' },
        { fase: 'raccolta-documenti', azione: 'Questionario e trascrizione caricati', autore: 'Giulia T. (Tutor)', dataOra: '2026-07-01T09:05:00.000Z' },
        { fase: 'raccolta-documenti', azione: 'AssessFirst caricati per 2 dipendenti', autore: 'Elisa', dataOra: '2026-07-03T15:05:00.000Z' },
      ],
    }),

    p('pr-004', 'Orizzonte Games', 'Andrea Conti', 'a.conti@orizzontegames.it', ['Andrea Conti', 'Fabio Landi'], 'revisione-carlo', '2026-06-10T09:00:00.000Z', {
      tipoLavoro: 'consulenza',
      allegati: cartellaCompleta(['Andrea Conti', 'Fabio Landi'], '2026-06-15T14:30:00.000Z'),
      versioni: [
        { id: 'v-1', fase: 'generazione', autore: 'Carlo', dataOra: '2026-07-05T10:00:00.000Z', contenuto: DOC_UNIFICATO_MOCK, tipo: 'umano', etichetta: 'Documento unificato' },
        { id: 'v-2', fase: 'generazione', autore: 'Sistema (batteria 20 prompt)', dataOra: '2026-07-05T10:25:00.000Z', contenuto: REPORT_AI_MOCK, tipo: 'ai', etichetta: "Report generato dall'AI" },
      ],
      storico: [
        { fase: 'vendita', azione: 'Pratica creata dal venditore', autore: 'Marco V.', dataOra: '2026-06-10T09:00:00.000Z' },
        { fase: 'raccolta-documenti', azione: 'Cartella cliente completata', autore: 'Elisa', dataOra: '2026-06-15T14:35:00.000Z' },
        { fase: 'raccolta-documenti', azione: 'Passata a Erogazione Copy — Carlo notificato', autore: 'Elisa', dataOra: '2026-06-15T14:36:00.000Z' },
        { fase: 'generazione', azione: 'Documenti unificati in un documento unico', autore: 'Carlo', dataOra: '2026-07-05T10:00:00.000Z' },
        { fase: 'generazione', azione: 'Report generato con la batteria di 20 prompt', autore: 'Sistema', dataOra: '2026-07-05T10:25:00.000Z' },
      ],
    }),

    p('pr-005', 'Conti Consulting', 'Andrea Conti', 'info@conticonsulting.it', ['Andrea Conti'], 'revisione-1', '2026-06-05T09:00:00.000Z', {
      tipoLavoro: 'consulenza',
      allegati: cartellaCompleta(['Andrea Conti'], '2026-06-12T10:00:00.000Z'),
      versioni: [
        { id: 'v-3', fase: 'generazione', autore: 'Sistema (batteria 20 prompt)', dataOra: '2026-06-30T11:00:00.000Z', contenuto: REPORT_AI_MOCK, tipo: 'ai', etichetta: "Report generato dall'AI" },
        { id: 'v-4', fase: 'revisione-carlo', autore: 'Carlo', dataOra: '2026-07-01T09:30:00.000Z', contenuto: REPORT_AI_MOCK.replace('RIASSUNTO ESECUTIVO', 'RIASSUNTO ESECUTIVO (rivisto da Carlo)'), tipo: 'umano', etichetta: 'Revisione di Carlo' },
      ],
      storico: [
        { fase: 'vendita', azione: 'Pratica creata dal venditore', autore: 'Marco V.', dataOra: '2026-06-05T09:00:00.000Z' },
        { fase: 'generazione', azione: 'Report generato con la batteria di 20 prompt', autore: 'Sistema', dataOra: '2026-06-30T11:00:00.000Z' },
        { fase: 'revisione-carlo', azione: 'Documento revisionato e accettato', autore: 'Carlo', dataOra: '2026-07-01T09:35:00.000Z' },
      ],
    }),

    p('pr-006', 'Meccanica Precisione SpA', 'Luca Ferrari', 'l.ferrari@meccanicaprecisione.it', ['Luca Ferrari', 'Paola Conti', 'Dario Riva'], 'leggibilita', '2026-05-25T09:00:00.000Z', {
      tipoLavoro: 'branding',
      allegati: cartellaCompleta(['Luca Ferrari', 'Paola Conti', 'Dario Riva'], '2026-06-02T10:00:00.000Z'),
      versioni: [
        { id: 'v-5', fase: 'generazione', autore: 'Sistema (batteria 20 prompt)', dataOra: '2026-06-20T10:00:00.000Z', contenuto: REPORT_AI_MOCK, tipo: 'ai', etichetta: "Report generato dall'AI" },
        { id: 'v-6', fase: 'visual', autore: 'Agente Visual', dataOra: '2026-07-02T15:00:00.000Z', contenuto: REPORT_VISUAL_MOCK, tipo: 'ai', etichetta: 'Report con elementi visual' },
      ],
      storico: [
        { fase: 'vendita', azione: 'Pratica creata dal venditore', autore: 'Marco V.', dataOra: '2026-05-25T09:00:00.000Z' },
        { fase: 'revisione-2', azione: 'Documento accettato', autore: 'Revisore 2', dataOra: '2026-07-02T14:00:00.000Z' },
        { fase: 'visual', azione: 'Elementi visual inseriti automaticamente', autore: 'Agente Visual', dataOra: '2026-07-02T15:00:00.000Z' },
      ],
    }),

    p('pr-007', 'Studio Legale Ferri', 'Elena Ferri', 'e.ferri@studioferri.it', ['Elena Ferri'], 'completata', '2026-05-02T09:00:00.000Z', {
      tipoLavoro: 'consulenza',
      allegati: cartellaCompleta(['Elena Ferri'], '2026-05-10T10:00:00.000Z'),
      versioni: [
        { id: 'v-7', fase: 'grafica', autore: 'Collega Grafica', dataOra: '2026-06-18T12:00:00.000Z', contenuto: REPORT_VISUAL_MOCK, tipo: 'umano', etichetta: 'Versione finale impaginata' },
      ],
      storico: [
        { fase: 'vendita', azione: 'Pratica creata dal venditore', autore: 'Marco V.', dataOra: '2026-05-02T09:00:00.000Z' },
        { fase: 'grafica', azione: 'Impaginazione completata — report consegnato', autore: 'Collega Grafica', dataOra: '2026-06-18T12:00:00.000Z' },
      ],
    }),
  ],

  apprendimenti: [
    {
      id: 'ap-001',
      praticaId: 'pr-005',
      praticaNome: 'Conti Consulting',
      fase: 'revisione-carlo',
      dataOra: '2026-07-01T09:35:00.000Z',
      autoreRevisione: 'Carlo',
      lezione: 'Il report generato usava la seconda persona plurale in alcune sezioni. Lo standard richiede la prima persona singolare (voce del consulente).',
      promptTargetId: 'batteria-consulenza',
      promptTargetNome: 'Batteria Consulenza — Report Strategico (20 prompt)',
      miglioramentoProposto: 'Aggiungere al prompt P7 (sezione Marketing) il vincolo esplicito: "Scrivi SEMPRE in prima persona singolare. La voce narrante è quella del consulente che parla direttamente all\'imprenditore."',
      testoPrima: 'Avete strutturato KPI basati su ROI, monitorate le wishlist mensili...',
      testoDopo: 'Hai strutturato KPI basati su ROI, monitori le wishlist mensili...',
      note: 'Voce narrante incoerente nella sezione marketing',
      stato: 'in_attesa',
    },
    {
      id: 'ap-002',
      praticaId: 'pr-007',
      praticaNome: 'Studio Legale Ferri',
      fase: 'revisione-1',
      dataOra: '2026-06-10T10:00:00.000Z',
      autoreRevisione: 'Revisore 1',
      lezione: 'Il report conteneva trattini lunghi (—) invece dei trattini corti (-) richiesti dallo standard editoriale.',
      promptTargetId: 'batteria-consulenza',
      promptTargetNome: 'Batteria Consulenza — Report Strategico (20 prompt)',
      miglioramentoProposto: 'Aggiungere a tutti i prompt di generazione la regola: "Usa esclusivamente il trattino corto (-). Mai il trattino lungo (—)."',
      testoPrima: 'Il posizionamento — quello vero — si costruisce nella mente del cliente.',
      testoDopo: 'Il posizionamento - quello vero - si costruisce nella mente del cliente.',
      note: 'Standard tipografico non rispettato',
      stato: 'approvato',
    },
    {
      id: 'ap-003',
      praticaId: 'pr-006',
      praticaNome: 'Meccanica Precisione SpA',
      fase: 'revisione-2',
      dataOra: '2026-07-01T16:20:00.000Z',
      autoreRevisione: 'Revisore 2',
      lezione: 'Il Revisore 1 ha lasciato passare due blocchi di testo troppo densi (oltre 8 righe senza spazi). Lo standard copy richiede testo arioso.',
      promptTargetId: 'revisore-1',
      promptTargetNome: 'Revisore 1 — Editor Metodo (5 Fasi)',
      miglioramentoProposto: 'Rafforzare la FASE 3 del prompt del Revisore 1: "Nessun paragrafo può superare le 5 righe. Se supera, spezzalo SEMPRE in due paragrafi con una riga vuota."',
      testoPrima: '[blocco di 10 righe consecutive nella sezione numeri]',
      testoDopo: '[stesso contenuto spezzato in 3 paragrafi ariosi]',
      note: 'Blocchi densi sfuggiti alla revisione 1',
      stato: 'in_attesa',
    },
  ],

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
      id: 'prompt-irene',
      nome: 'Prompt Report AssessFirst (Irene)',
      faseUso: 'Raccolta documenti — sintesi team',
      versione: 'v1.0',
      ultimaModifica: '2026-05-15T09:00:00.000Z',
      changelog: [{ versione: 'v1.0', data: '2026-05-15', descrizione: 'Prompt usato da Irene per sintetizzare i test AssessFirst in un report del team — da automatizzare' }],
    },
    {
      id: 'revisore-1',
      nome: 'Revisore 1 — Editor Metodo (5 Fasi)',
      faseUso: 'Revisione editoriale',
      versione: 'v1.1',
      ultimaModifica: '2026-05-28T09:00:00.000Z',
      changelog: [
        { versione: 'v1.0', data: '2026-05-01', descrizione: 'Prompt Editor Senior: 5 fasi (logica, grammatica, copy, formattazione, output)' },
        { versione: 'v1.1', data: '2026-05-28', descrizione: 'Integrata skill humanizer per naturalezza del testo' },
      ],
    },
    {
      id: 'revisore-2',
      nome: 'Revisore 2 — Supervisore Qualità',
      faseUso: 'Controllo del Revisore 1',
      versione: 'v1.0',
      ultimaModifica: '2026-05-15T09:00:00.000Z',
      changelog: [{ versione: 'v1.0', data: '2026-05-15', descrizione: 'Generato con skill prompt-master: verifica standard su tono, coerenza e formattazione' }],
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
      id: 'revisore-leggibilita',
      nome: 'Revisore Leggibilità',
      faseUso: 'Verifica leggibilità dei visual',
      versione: 'v1.0',
      ultimaModifica: '2026-05-15T09:00:00.000Z',
      changelog: [{ versione: 'v1.0', data: '2026-05-15', descrizione: 'Generato con skill prompt-master: verifica che ogni visual migliori davvero la comprensione' }],
    },
  ],
}
