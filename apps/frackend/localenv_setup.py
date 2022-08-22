import subprocess as sp
import json
import base64

# Setter riktig context for kubectl
sp.run(["kubectl", "config", "use-context", "dev-gcp"])

# Henter secretname for frackenden
secretname = sp.getoutput("kubectl get azureapp -n org team-catalog-frackend -o go-template='{{.spec.secretName}}'")
# Henter alle secretene i JSON format 
azureInfo = json.loads(sp.getoutput("kubectl -n org get secret " + secretname + " -o json"))

# Henter og decoder data fra Json variabelen.
# Returnerer en liste med key'en til secreten og selve secreten
def base64Decode(key, url):
    if url == True:
        x = base64.urlsafe_b64decode(str(azureInfo["data"][key])).decode("utf-8")
    else:
        x = base64.b64decode(str(azureInfo["data"][key])).decode("utf-8") 
    
    return [key, "'" + x + "'"]

    

# Henter secretene vi er ute etter fra azureInfo
# FORMAT - [key, secret]
AZURE_APP_CLIENT_ID=base64Decode("AZURE_APP_CLIENT_ID", False) 
AZURE_APP_WELL_KNOWN_URL=base64Decode("AZURE_APP_WELL_KNOWN_URL", True)
AZURE_OPENID_CONFIG_ISSUER=base64Decode("AZURE_OPENID_CONFIG_ISSUER", True)
AZURE_OPENID_CONFIG_TOKEN_ENDPOINT=base64Decode("AZURE_OPENID_CONFIG_TOKEN_ENDPOINT", True)
AZURE_APP_CERTIFICATE_KEY_ID=base64Decode("AZURE_APP_CERTIFICATE_KEY_ID", False)
AZURE_APP_TENANT_ID=base64Decode("AZURE_APP_TENANT_ID", False)
AZURE_APP_CLIENT_SECRET=base64Decode("AZURE_APP_CLIENT_SECRET", False)
AZURE_APP_JWK=base64Decode("AZURE_APP_JWK", False)

# En liste med alle secretene vi er ute etter
# For å legge til disse i destinasjonsfilen må variabelen leggs til i listen her
kubectlSecrets = [AZURE_APP_CLIENT_ID, AZURE_APP_WELL_KNOWN_URL, AZURE_OPENID_CONFIG_ISSUER, AZURE_OPENID_CONFIG_TOKEN_ENDPOINT, AZURE_APP_CERTIFICATE_KEY_ID, AZURE_APP_TENANT_ID, AZURE_APP_CLIENT_SECRET, AZURE_APP_JWK]

# Brukes for å huske hvilke linjer i .localenv som skal redigeres
kubectlSecretIndexes = []



# Filnavn på template fila og på hva navnet på fila skal være
startFile = "template.localenv"
destinationFile = ".localenv"
sp.run(["cp", startFile, destinationFile])

# Redigering av detinationFile
envFile = open(destinationFile)
# Henter innholdet fra fila og lagrer det i en liste
stringList = envFile.readlines()
envFile.close()

# Må endres på hvis vi endrer på template fila for localenv
lineEnding = "=<replace me>\n"

# Finner linjene hvor vi skal sette inn secrets
for key, value in kubectlSecrets:
    kubectlSecretIndexes.append(stringList.index(key + lineEnding))

#Legger inn secretene i stringList 
for index, value in enumerate(kubectlSecretIndexes):
    stringList[value] = kubectlSecrets[index][0] + "=" + kubectlSecrets[index][1] + "\n"


envFile = open(destinationFile, "w")
# Sletter template kommentaren på toppen
del stringList[0]
# Slår sammen listen med innhold og skriver den til destinationFile
new_StringList = "".join(stringList)
envFile.write(new_StringList)
envFile.close
