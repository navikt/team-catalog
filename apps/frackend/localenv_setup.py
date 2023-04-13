import subprocess as sp
import json
import base64

set_context_command = "kubectl config use-context dev-gcp"
get_secret_name_command = "kubectl get azureapp -n org team-catalog-frackend -o go-template='{{.spec.secretName}}'"


def get_secret_command(secret_name):
    return f"kubectl get secret {secret_name} -n org -o json"


def run_command(command: str):
    return sp.run(command.split(" "), capture_output=True).stdout.decode("utf-8")


# Setter riktig context for kubectl
run_command(set_context_command)

secret_name = run_command(get_secret_name_command).replace("'", "")
secrets = run_command(get_secret_command(secret_name))
secrets_dict = json.loads(secrets)["data"]


def base64_decode(value, url=False):
    if url:
        return base64.urlsafe_b64decode(str(value)).decode("utf-8")
    else:
        return base64.b64decode(str(value)).decode("utf-8")

secrets_to_set = {
    "AZURE_APP_CLIENT_ID": base64_decode(secrets_dict["AZURE_APP_CLIENT_ID"]),
    "AZURE_APP_CLIENT_SECRET": base64_decode(secrets_dict["AZURE_APP_CLIENT_SECRET"], True),
    "AZURE_OPENID_CONFIG_ISSUER": base64_decode(secrets_dict["AZURE_OPENID_CONFIG_ISSUER"], True),
    "AZURE_OPENID_CONFIG_TOKEN_ENDPOINT": base64_decode(secrets_dict["AZURE_OPENID_CONFIG_TOKEN_ENDPOINT"], True),
    "AZURE_APP_WELL_KNOWN_URL": base64_decode(secrets_dict["AZURE_APP_WELL_KNOWN_URL"], True),
    "AZURE_APP_JWK": f"\'{base64_decode(secrets_dict['AZURE_APP_JWK'])}\'",
    "AZURE_OPENID_CONFIG_JWKS_URI": base64_decode(secrets_dict["AZURE_OPENID_CONFIG_JWKS_URI"], True),
}

tcat_info = {
    "HOST":"127.0.0.1",
    "PORT":"8080",
    "DEFAULT_BASE_URL":"http://localhost:8080",
    "NOM_API_SCOPE":"api://dev-gcp.nom.nom-api/.default",
    "NOM_API_URL":"https://nom-api.intern.dev.nav.no",
    "TEAM_CATALOG_SCOPE":"api://dev-fss.nom.team-catalog-backend/.default",
    "TEAM_CATALOG_BACKEND_URL":"https://teamkatalog-api.dev-fss-pub.nais.io",
}

with open(".localenv", "w+") as secrets_file:
    secrets_file.writelines([f"{key}={value}\n" for key, value in tcat_info.items()])
    secrets_file.write("\n")
    secrets_file.writelines([f"{key}={value}\n" for key, value in secrets_to_set.items()])


