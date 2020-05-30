# GitHub action secrets CLI

GitHub actions secrets management CLI tool

## Setup

1. Generate a [GitHub personal access token](https://github.com/settings/tokens) with **repo** permissions
1. Save and update _.gh-secrets_ file in the user home directory: `cp .gh-secrets.example $HOME/.gh-secrets`

## Usage

```txt
Usage: gh-secrets <command> [options] <url>

Commands:
  gh-secrets list <url>                Lists all secrets available in a
                                       repository without revealing their
                                       encrypted values
  gh-secrets show <name> <url>         Gets a single secret without revealing
                                       its encrypted value
  gh-secrets set <name> <value> <url>  Creates or updates a secret with an
                                       encrypted value
  gh-secrets setAll <file> <url>       Creates or updates a batch of secrets
                                       with an encrypted values from a file
  gh-secrets delete <name> <url>       Deletes a secret in a repository using
                                       the secret name

Options:
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]

Examples:
  gh-secrets list https://github.com/owner/repository-name
  gh-secrets show SECRET_NAME https://github.com/owner/repository-name
  gh-secrets set SECRET_NAME value https://github.com/owner/repository-name
  gh-secrets setAll secrets.env https://github.com/owner/repository-name
  gh-secrets delete SECRET_NAME https://github.com/owner/repository-name
```

### Local

1. Install _gh-secrets_ globally: `npm install -g @kijart/gh-secrets`
1. Run examples:
    - help: `gh-secrets -h`
    - list: `gh-secrets list https://github.com/owner/repository-name`
    - setAll: `gh-secrets setAll /app/secrets.env https://github.com/owner/repository-name`

### Docker

1. Build from source: `docker pull kijart/gh-secrets`
1. Run examples:
    - help: `docker run --rm -it -v $HOME/.gh-secrets:/home/node/.gh-secrets gh-secrets -h`
    - list: `docker run --rm -it -v $HOME/.gh-secrets:/home/node/.gh-secrets gh-secrets list https://github.com/owner/repository-name`
    - setAll:

        ```bash
        docker run --rm -it \
        -v $HOME/.gh-secrets:/home/node/.gh-secrets \
        -v $(pwd)/secrets.env:/app/secrets.env \
        kijart/gh-secrets setAll /app/secrets.env https://github.com/owner/repository-name`
        ```

### Docker Compose

1. Build docker service: `docker-compose up --no-start`
1. Run examples:
    - help: `docker-compose run --rm gh-secrets -h`
    - list: `docker-compose run --rm gh-secrets list https://github.com/owner/repository-name`
    - setAll: `docker-compose run --rm gh-secrets setAll secrets.env https://github.com/owner/repository-name`

### Install from source

1. Install project dependencies: `npm install`
1. Install project binary globally: `npm install -g .`
1. Update _$HOME/.gh-secrets_ content with valid values
1. Run examples:
    - help: `gh-secrets -h`
    - list: `gh-secrets list https://github.com/owner/repository-name`
    - setAll: `gh-secrets setAll /app/secrets.env https://github.com/owner/repository-name`

## Documentation

- [GitHub actions secrets API](https://developer.github.com/v3/actions/secrets/)
