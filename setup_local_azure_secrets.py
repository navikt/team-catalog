import subprocess as sp
import json
import yaml
import base64
from dataclasses import dataclass
import argparse


@dataclass
class AppInfo:
    sub_project_dir_name: str
    kubernetes_name: str
    name_space: str


def get_secrets_name(application_name, name_space):
    return run_command(
        f"kubectl get azureapp -n {name_space} {application_name} -o go-template='{'{{.spec.secretName}}'}'"
    ).replace("'", "")


def get_secrets(secret_name, name_space):
    return run_command(f"kubectl get secret {secret_name} -n {name_space} -o json")


def run_command(command: str):
    return sp.run(command.split(" "), capture_output=True).stdout.decode("utf-8")


def read_existing_env(file_path):
    try:
        with open(file_path, "r") as env:
            env_vars = [line.split("=", 1) for line in env.read().splitlines() if line]
            return {key: value for key, value in env_vars}
    except FileNotFoundError:
        return {}


def read_existing_local_properties(file_path) -> dict:
    try:
        with open(file_path, "r") as local_props_file:
            return yaml.safe_load(local_props_file)
    except FileNotFoundError:
        return {}


def base64_decode(value, url=False):
    if url:
        return base64.urlsafe_b64decode(str(value)).decode("utf-8")
    else:
        return base64.b64decode(str(value)).decode("utf-8")


def get_application_secrets(app_info: AppInfo):
    secret_name = get_secrets_name(app_info.kubernetes_name, app_info.name_space)
    secrets = get_secrets(secret_name, app_info.name_space)
    return json.loads(secrets)["data"]


def setup_spring_app_secrets(app_info: AppInfo):
    local_properties_filepath = f"apps/{app_info.sub_project_dir_name}/src/main/resources/application-local.yaml"

    print(f"Setting up secrets for {local_properties_filepath}")

    secrets = get_application_secrets(app_info)

    properties_object = read_existing_local_properties(local_properties_filepath) or read_existing_local_properties(f"{local_properties_filepath}.template")

    properties_object.update(
        {
            "AZURE_APP_CLIENT_ID": base64_decode(secrets["AZURE_APP_CLIENT_ID"]),
            "AZURE_APP_TENANT_ID": base64_decode(secrets["AZURE_APP_TENANT_ID"]),
            "AZURE_APP_CLIENT_SECRET": base64_decode(secrets["AZURE_APP_CLIENT_SECRET"]),
            "AZURE_APP_JWK": base64_decode(secrets["AZURE_APP_JWK"]),
        }
    )

    with open(local_properties_filepath, "w+") as properties_file:
        properties_file.write(yaml.safe_dump(properties_object))
        print(f"Successfully written new secrets to {local_properties_filepath}")


def setup_node_backend_secrets(app_info: AppInfo):
    env_file_path = f"apps/{app_info.sub_project_dir_name}/.env"
    template_env_file_path = f"apps/{app_info.sub_project_dir_name}/template.localenv"

    print(f"Setting up secrets for {env_file_path}")

    secrets = get_application_secrets(app_info)

    env_object = read_existing_env(env_file_path) or read_existing_env(template_env_file_path)

    env_object.update(
        {
            "AZURE_APP_CLIENT_ID": base64_decode(secrets["AZURE_APP_CLIENT_ID"]),
            "AZURE_OPENID_CONFIG_ISSUER": base64_decode(secrets["AZURE_OPENID_CONFIG_ISSUER"], True),
            "AZURE_OPENID_CONFIG_TOKEN_ENDPOINT": base64_decode(secrets["AZURE_OPENID_CONFIG_TOKEN_ENDPOINT"], True),
            "AZURE_APP_WELL_KNOWN_URL": base64_decode(secrets["AZURE_APP_WELL_KNOWN_URL"], True),
            "AZURE_APP_JWK": f"\'{base64_decode(secrets['AZURE_APP_JWK'])}\'",
            "AZURE_OPENID_CONFIG_JWKS_URI": base64_decode(secrets["AZURE_OPENID_CONFIG_JWKS_URI"], True),
        }
    )

    with open(env_file_path, "w+") as env_file:
        env_file.writelines([f"{key}={value}\n" for key, value in env_object.items()])
        print(f"Successfully written new secrets to {env_file_path}")


def setup_secrets(apps_filter: list, env: str):

    run_command(f"kubectl config use-context {env}-gcp")

    spring_apps = [
    ]

    node_apps = [
        AppInfo("frackend", "team-catalog-frackend", "org")
    ]

    if apps_filter:
        spring_apps = [app for app in spring_apps if app.kubernetes_name in apps_filter]
        node_apps = [app for app in node_apps if app.kubernetes_name in apps_filter]

    [setup_spring_app_secrets(app_info) for app_info in spring_apps]
    [setup_node_backend_secrets(app_info) for app_info in node_apps]


if __name__ == "__main__":
    argument_parser = argparse.ArgumentParser()
    argument_parser.add_argument("--env", type=str, required=False, default="dev", choices=["dev", "prod"])
    argument_parser.add_argument("--apps", type=str, required=False)
    arguments = argument_parser.parse_args()

    app_filter = []
    if arguments.apps:
        app_filter = arguments.apps.split(",")

    setup_secrets(app_filter, arguments.env)
