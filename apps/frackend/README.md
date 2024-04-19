# Frackend for teamkatalogen

### Hent secret

```bash
gcloud auth login

# Fra rot kjører du:
python setup_local_azure_secrets.py
```

### Installer pakker
`npm ci`

### Bygg Frackend
`npm run build`

### Kjør docker-compose
`docker-compose up -d --build`
Denne fyrer opp lokal Wonderwall + Frackend

### Debug Frackend som kjører i Docker
Når Express-serveren kjører lokalt i Docker så eksponerer den port 9229 som du kan koble en debugger til.

For å få til dette må du lage en debug configuration:
1. Edit configurations
2. Klikk + og velg `attach to Node.js/Chrome`
3. Host: `localhost` port `9229`
4. Kjør så konfigurasjonen og du er klar til å debugge!
