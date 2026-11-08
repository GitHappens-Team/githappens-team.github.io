# Git Happens - Sito di documentazione

Sito web pubblico per la documentazione del team Git Happens SWE 2026-2027 | 1o Lotto.

_Il sito è un'applicazione statica che elenca i documenti (PDF) prodotti nel repository [`documents`](https://github.com/GitHappens-Team/documents). **Il contenuto non deve essere modificato a mano in questo repository**: la cartella `content/` viene aggiornata in automatico dalla CI di `documents`._

_Per ogni dubbio fare riferimento al doc. di Norme di Progetto_

## Utilizzo del repository

### 1. Preparazione dell'ambiente locale

1. Assicurarsi di disporre di un'installazione di git.
2. Clonare il repository corrente.
3. Installare [Node.js](https://nodejs.org/) (si consiglia la versione 24, usata dalla CI) e le dipendenze:

   ```bash
   npm ci
   ```

### 2. Comandi disponibili

| Comando            | Descrizione                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| `npm run dev`      | Rigenera il manifest e avvia il server di sviluppo Vite                               |
| `npm run build`    | Rigenera il manifest, controlla i tipi, compila il sito in `dist/` e copia `content/` |
| `npm run preview`  | Serve in locale la build presente in `dist/`                                          |
| `npm run lint`     | Esegue il linting con [oxlint](https://oxc.rs/docs/guide/usage/linter)                |
| `npm run manifest` | Rigenera solo `content/manifest.json`                                                 |

In sviluppo `content/` è servita da Vite sotto `<base>/content`; in produzione viene copiata in `dist/content/` al termine della build.

### 3. Struttura del repository

```text
.
├── content/            # PDF, metadata.json e manifest.json (aggiornati dalla CI di `documents`)
├── public/             # asset statici (favicon)
├── scripts/            # script di build (manifest, copia del contenuto)
├── src/
│   ├── components/     # componenti del sito (githappens/ e ui/ di shadcn)
│   ├── lib/            # utilità, hook e mappa dei membri del team
│   └── assets/brand/   # logo e mascotte
└── .github/workflows/  # deploy su GitHub Pages
```

#### Tecnologie

- [React](https://react.dev/) + [Vite](https://vite.dev/), in TypeScript;
- [Tailwind CSS](https://tailwindcss.com/) e [shadcn/ui](https://ui.shadcn.com/);
- [oxlint](https://oxc.rs/) per il linting.

### 4. Contenuto dei documenti

La cartella `content/` rispecchia la struttura del repository `documents`: ogni cartella root è una **categoria** (e.g. `candidatura`, `verbali`, `way_of_working`), ogni sotto cartella una sottocategoria e ogni documento un PDF accompagnato dal proprio `metadata.json`. Per le convenzioni di struttura e per i campi di `metadata.json` fare riferimento al README di `documents`.

#### manifest.json

Lo script `scripts/build-manifest.mjs` scandisce `content/` e genera `content/manifest.json`, letto dal sito a runtime (`<base>/content/manifest.json`). Per ogni PDF contenuto in una categoria il manifest riporta:

- `name`, `path` (relativo a `content/`), `folder`, `size` e `modified`;
- (se presente) `metadata`, ricavato dal `metadata.json` della cartella: `title`, `description`, `important`, `version`, `createdAt` e `approved` (data, approvatori, link e numero della PR).

I PDF fuori da una categoria vengono ignorati. Un `metadata.json` privo di `title` o non valido viene ignorato (con un _warning_ in caso di errore di lettura).

### 5. Funzionalità del sito

- elenco dei documenti per categoria, ordinati dal più recente;
- vista a righe (predefinita) o a schede, la scelta è ricordata sul dispositivo;
- barra di ricerca su titolo, descrizione e nomi;
- evidenza dei documenti importanti e visualizzazione di versione, data di creazione e approvazione con riferimento alla PR;
- etichette _new_ e _updated_ sui documenti aggiunti o aggiornati dall'ultima visita (basate su `localStorage`, nessun dato lascia il browser);
- sezione del team, con mappa degli username GitHub verso i nomi reali in `src/lib/team.ts`.

### 6. Contribuzione

Seguire la sezione di contribuzione del documento di norme del progetto, in particolare la procedura di branch-out, commit semantiche e creazione di PR.

Le modifiche al **codice del sito** si fanno in questo repository; le modifiche ai **documenti** si fanno nel repository `documents`.

Prima di aprire una PR verificare in locale che la build e il linting passino:

```bash
npm run lint
npm run build
```

Per aggiungere o aggiornare un membro del team modificare la mappa `members` in `src/lib/team.ts`.

## Automazioni nel dettaglio

### Aggiornamento del contenuto

A ogni merge su `main` di `documents` il suo workflow _Build documenti_ (job `publish`) sincronizza `content/` di questo repository e crea la commit `docs: update content from <repo>@<sha>` come `github-actions[bot]` sul branch `main`. Tale commit fa partire il deploy descritto sotto.

**I documenti rimossi da `documents` vengono rimossi anche da qui**: non modificare `content/` manualmente, le modifiche verrebbero sovrascritte.

### Deploy

Il workflow `.github/workflows/pages.yml` (nome: _Deploy to GitHub Pages_) si attiva a ogni `push` su `main` e manualmente (`workflow_dispatch`). Se arrivano più esecuzioni ravvicinate, quella in corso viene annullata a favore dell'ultima. È composto da due job in sequenza: `build` e `deploy`.

#### Job `build`

1. Checkout, installazione di Node.js 24 e `npm ci` (con cache di npm);
2. recupero dell'URL di GitHub Pages con `actions/configure-pages` e calcolo del percorso base (`BASE_PATH`), necessario perché un project site è servito da `/<nome-repository>/`;
3. `npm run build` con `BASE_PATH` impostato;
4. caricamento della cartella `dist` come _artifact_ di Pages.

#### Job `deploy`

Si esegue solo dopo un `build` riuscito e pubblica l'artifact sull'ambiente `github-pages` con `actions/deploy-pages`.

### In caso di problemi

- **Un documento non compare nel sito**: verificare che la PR in `documents` sia stata mergeata su `main`, che il job `publish` sia riuscito e che il PDF e il relativo `metadata.json` siano presenti in `content/`.
- **Il documento compare senza titolo, versione o approvazione**: il `metadata.json` manca o non è valido (il titolo è obbligatorio); controllare i _warning_ di `npm run manifest`.
- **Link o PDF non funzionanti dopo il deploy**: verificare che `BASE_PATH` corrisponda al percorso del sito (in locale è `/`); in CI è calcolato in automatico.
- **La build fallisce**: riprodurre in locale con `npm run build`, partendo dal primo errore di TypeScript o di Vite.
- **Il deploy non parte**: verificare che GitHub Pages sia abilitato con sorgente _GitHub Actions_ (_Settings → Pages_); servono permessi di amministrazione.
