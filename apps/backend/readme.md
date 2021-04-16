# Backend for Teams

## Requirements

 * JDK 16
 * Docker
 * Maven
 
 
### Build 
`mvn clean package`

## Config

### Azure bruker trenger tilgang til

#### Azure scopes:
- Mail.Send - Delegated
- User.Read.All - Application
#### Epostbruker
- teamkatalog@nav.no


## Consumers

Notify of breaking API changes

* [Team Service Management Verktøy](https://teamkatalog.nais.adeo.no/team/58e13f96-774e-4a0b-a608-aef6958bb9a4) - Jira integration