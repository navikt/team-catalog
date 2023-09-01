# Brukergrensesnitt for Teamkatalogen

For å bruke npm trenger du ha `node` installert.
Vi anbefaler at du bruker [asdf](https://asdf-vm.com/) slik at du automatisk kjører nødvendige pakker på støttet versjon.
`asdf` vil sette riktige versjoner for diverse pakker som trengs i dette repoet. Se `.tool-versions` i rot-folderen.

Etter at Node er installert kjører du følgende kommandoer for å starte:

```bash
npm install
npm run dev
```

Dette vil starte en vite-devserver på port `5173`.

## UI-DEV modus
Istedenfor å starte opp frackend lokalt, kan man heller midlertidig hoste vite-devserver på deployet frackend: 
1. Gå til `https://teamkatalog.dev.nav.no/toggle-devserver`
2. Logg inn med trygdeetaten bruker
