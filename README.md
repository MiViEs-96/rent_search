# VersaTemple

VersaTemple è uno strumento intelligente per la ricerca di case nell'area di Dublino, progettato per ottimizzare i tempi di percorrenza e la vicinanza ai servizi essenziali.

## Funzionalità

- **Ricerca basata sul pendolarismo**: Inserisci i posti di lavoro dei componenti del nucleo familiare (tramite Eircode o indirizzo) e il sito troverà le case con una distanza equilibrata (equidistante) per tutti i lavoratori.
- **Priorità Servizi**: Scegli l'importanza della vicinanza a scuole, ospedali, supermercati e mezzi pubblici.
- **Dati in tempo reale**: Ricerca effettuata direttamente su Daft.ie.
- **Mappa Interattiva**: Visualizza le proprietà e i posti di lavoro su una mappa interattiva.

## Come avviare il progetto

Per avviare il sito localmente, segui questi passaggi:

1. **Installa le dipendenze**:
   Assicurati di avere [Node.js](https://nodejs.org/) installato, quindi esegui:
   ```bash
   npm install
   ```

2. **Avvia il server di sviluppo**:
   Esegui il comando:
   ```bash
   npm run dev
   ```

3. **Apri il sito**:
   Apri il tuo browser e vai su [http://localhost:3000](http://localhost:3000).

## Struttura del Progetto

- `app/`: Contiene le pagine del sito (Home, Ricerca, Risultati).
- `app/actions/`: Server Actions per lo scraping di Daft.ie e il calcolo dei punteggi.
- `lib/`: Logica del motore di scoring, servizi geografici e integrazione con OpenStreetMap.
- `components/`: Componenti React (Mappa, UI).
