# Teamkatalog

Dokumentasjon: https://navikt.github.io/team-catalog

## Oppsett for pre-commit trigger
Sett opp slik at pre-commit trigger kjøres lokalt på din maskin ved commit for å søke etter secrets, credentials og personinfo i endringer som sjekkes inn.

### Installering
Installer pre-commit på maskinen (trenger kun å kjøres én gang) (https://pre-commit.com/#install)
```shell
pip install pre-commit
```
Installer GitLeaks på maskinen (trenger kun å kjøres én gang) (https://github.com/gitleaks/gitleaks)
Eksempel:
```shell
brew install gitleaks
```
#### Installasjon med nix
```shell
nix profile add nixpkgs#pre-commit
nix profile add nixpkgs#gitleaks
```
### Verifiser installering
```shell
pre-commit --version
gitleaks version
```

### Aktivere pre-commit i prosjektet
Installer pre-commit hooks i github-prosjektet (trenger kun å kjøres én gang per prosjekt)
```shell
pre-commit install
```
Nå skal GitLeaks kjøre på alle endringer som forsøkes å commit'es. Finner den noe mistenkelig vil den stoppe commit'en og vise hva som er funnet.

Commit output skal vise noe slikt som dette:

    Detect hardcoded secrets using Gitleaks..................................Passed

### Testdekning
[![Test Coverage](https://navikt.github.io/team-catalog/test-coverage/backend/badges/backend-jacoco.svg)](https://navikt.github.io/team-catalog/test-coverage/backend/)
[![Branches](https://navikt.github.io/team-catalog/test-coverage/backend/badges/backend-branches.svg)](https://navikt.github.io/team-catalog/test-coverage/backend/)