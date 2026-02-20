# Meteo Dashboard

Mini dashboard meteo realizzata come esercizio frontend con:

- ricerca città
- meteo attuale
- panoramica per 4 momenti della giornata
- dettaglio orario per momento selezionato
- dark mode
- persistenza ultima città cercata

## Tech Stack

- React 19
- TypeScript
- TanStack Query
- React Router
- Tailwind CSS + shadcn/ui
- lucide-react
- Zod
- OpenWeatherMap API

## Funzionalità implementate

- Ricerca città con suggerimenti (geocoding OpenWeather)
- Stato di loading durante fetch suggerimenti, meteo attuale e forecast
- Gestione errori di rete/API
- Card meteo attuale (temperatura, feels like, umidità, vento, condizione)
- 4 card per momenti giornata: morning / afternoon / evening / night
- Navigazione al dettaglio orario cliccando un momento
- Persistenza ultima città in `localStorage`
- Toggle tema light/dark con persistenza

## Struttura progetto

```txt
src/
  api/         # data layer: client fetch, schema zod, query options, endpoint
  hooks/       # hook condivisi (debounce, localStorage)
  pages/       # pagine (Dashboard, Detail)
  components/  # componenti UI (shadcn + tema)
  layout/      # layout applicativo
  app/         # providers e query client
```

## Requisiti

- Node.js 24
- npm 10+
- API key OpenWeatherMap

## Setup locale

1. Installa dipendenze:

```bash
npm install
```

2. Crea file `.env` nella root:

```bash
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

3. Avvia in development:

```bash
npm run dev
```

4. Build produzione:

```bash
npm run build
```

5. Lint:

```bash
npm run lint
```

## Script disponibili

- `npm run dev` avvio locale con Vite
- `npm run build` type-check + build
- `npm run lint` analisi ESLint
- `npm run preview` preview build locale

## Note implementative

- Il data layer usa Zod per validare le risposte API.
- Le chiamate sono orchestrate via TanStack Query (cache, retry, loading/error state).
- La pagina detail usa route params (`/detail/:lat/:lon/:moment`) per recuperare forecast.
- L’ultima città selezionata viene salvata in `localStorage` (`last-city`).

## Limiti attuali / Trade-off

- Le icone arrivano direttamente da OpenWeather.
- La classificazione in momenti giornata usa l’orario ricavato dal timestamp forecast, non ora per ora ma a slot di 3 ore per limiti delle api gratuite.

## Note

In dev dependecies sono presenti delle vulnerabiltà moderate dovute ad una dipendenza di eslint-> ajv. Non hanno ancora fixato ma è solo una devdependecies e quindi per produzione non risulta essere un errore.
Per lo scopo dell'esercizio non lo reputo importante da spenderci tempo.

## Licenza

Progetto realizzato a scopo di esercizio tecnico.
