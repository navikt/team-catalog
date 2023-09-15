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
- Gi tilgang til epostbruker: teamkatalog@nav.no til app (dev-gcp:org:team-catalog-backend)
- Gi tilgang til epostinnlogging i azure
    - App-registrations -> finn app -> Authentication
        - Advanced settings -> Allow public client flows -> Enable the following mobile and desktop flows: Yes


## Consumers

Notify of breaking API changes

* [#teamkatalogen](https://nav-it.slack.com/archives/CG2S8D25D) - (#Slack)