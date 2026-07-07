# Sistema Report Strategico

Piattaforma web per la produzione di report strategici aziendali con pipeline AI, checkpoint umani e apprendimento continuo.

> **Stato attuale: prototipo frontend.** Tutti i dati sono simulati da uno store client-side (`lib/store.tsx`) persistito in localStorage. Il backend (Supabase + Claude API) verrà collegato in seguito, un pezzo alla volta.

## I due mondi

```
AREA COMMERCIALE                     EROGAZIONE COPY
├── Venditore: crea pratica,        ├── Board kanban (drag & drop)
│   invia assessment+questionario   │   colonne = fasi di produzione
├── Tutor: carica questionario      ├── Da lavorare → unifica + batteria 20 prompt
│   + trascrizione                  ├── Revisione Carlo → Revisore 1 → Revisore 2
├── Elisa: carica AssessFirst       ├── Visual (auto) → Leggibilità → Grafica
│   (uno per dipendente)            └── Completato
└── Irene: genera Report            
    AssessFirst col prompt          Click su una card = scheda progetto con
                                    TUTTA la cartella cliente visibile (per le call)
CARTELLA COMPLETA → Elisa clicca
"Passa a Erogazione Copy"
```

Le due aree non si vedono mai tra loro.

## I due principi fondanti

1. **Ogni checkpoint umano ha due soli bottoni:** *Accetta documento* e *Revisiona e modifica*.
2. **Ogni revisione è apprendimento:** quando un revisore modifica un documento, il sistema confronta prima/dopo, estrae la lezione e propone un miglioramento ai prompt dei passaggi precedenti. **Nessun miglioramento diventa attivo senza l'approvazione di Carlo** nel Centro Apprendimento.

## Separazione dei ruoli

Ogni ruolo vede solo la propria area. Il venditore non vede mai la pipeline interna; Carlo non vede l'area vendite.

## Avvio

```bash
npm install
npm run dev
# apri http://localhost:3000
```

## Struttura

| Percorso | Contenuto |
|---|---|
| `app/page.tsx` | Home: due portali (Commerciale / Erogazione Copy) |
| `app/commerciale` | Selettore persona + aree Venditore, Tutor, Irene, Elisa |
| `app/erogazione` | Board kanban drag & drop + scheda progetto `[id]` |
| `app/apprendimento` | Centro Apprendimento (prompt versionati, proposte da approvare) |
| `lib/store.tsx` | Store client-side: pratiche, cartelle, apprendimenti, prompt |
| `lib/fasi.ts` | Le 10 fasi + `statoCartella()` (checklist documenti cliente) |
| `lib/mock.ts` | Dati demo |
| `components/ReviewPanel.tsx` | Pannello unico Accetta / Revisiona con hook di apprendimento |

## Prossimi passi (backend)

- [ ] Supabase: tabelle pratiche, versioni, apprendimenti, prompt + storage documenti
- [ ] Claude API: batteria 20 prompt reale (dal file Word di Carlo), Revisore 1 (5 fasi + humanizer), Revisore 2 (prompt-master), Agente Visual, Revisore Leggibilità
- [ ] Motore di apprendimento reale: diff → analisi AI → proposta modifica prompt
- [ ] Login e permessi per ruolo
- [ ] Export .docx
