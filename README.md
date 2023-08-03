# GitHub action secrets CLI

[![npm](https://img.shields.io/npm/v/@kijart/gh-secrets)](https://www.npmjs.com/package/@kijart/gh-secrets) [![Publish NPM package](https://github.com/kijart/gh-secrets/workflows/Publish%20NPM%20package/badge.svg)](https://www.npmjs.com/package/@kijart/gh-secrets) [![Publish Docker image](https://github.com/kijart/gh-secrets/workflows/Publish%20Docker%20image/badge.svg)](https://hub.docker.com/r/kijart/gh-secrets) [![License](https://img.shields.io/github/license/kijart/gh-secrets)](https://github.com/kijart/gh-secrets/blob/master/LICENSE)

> **⚠️ DEPRECATED: this project will not be longer maintained, instead, GitHub has published a [gh cli](https://cli.github.com/manual/gh) to [manage secrets](https://cli.github.com/manual/gh_secret) among other features of its ecosystem.**

GitHub actions secrets management CLI tool

Available in:

- Node (NPM registry): <https://www.npmjs.com/package/@kijart/gh-secrets>
- Node (GitHub registry): <https://github.com/kijart/gh-secrets/packages>
- Docker: <https://hub.docker.com/r/kijart/gh-secrets>

## Features

### Repository

- [x] List repository secrets
- [x] Get a repository secret
- [x] Create or update a repository secret
- [x] Create or update a batch of repository secrets
- [x] Delete a repository secret

### Organization

- [x] List organization secrets
- [x] Get an organization secret
- [x] Create or update an organization secret
- [x] Create or update a batch of organization secrets
- [x] Delete an organization secret
- [ ] List selected repositories for an organization secret
- [ ] Set selected repositories for an organization secret
- [ ] Add selected repository to an organization secret
- [ ] Remove selected repository from an organization secret

## Setup

1. Generate a [GitHub Personal Access Token](https://github.com/settings/tokens)
   - select **repo** scope permissions to manage repositories level secrets
   - select **admin:org** scope permissions to manage organization level secrets
   - select **repo, admin:org** scope permissions to manage repositories and organization level secrets
1. Save and update _.gh-secrets_ file in the user home directory: `cp .gh-secrets.example $HOME/.gh-secrets`

## Usage

```txt
Usage: gh-secrets <command> [options] <url> [parameters]

Commands:
  gh-secrets list <url>                     Lists all secrets available in a repository/organization without revealing their encrypted values
  gh-secrets get <name> <url>               Gets a single secret from a repository/organization without revealing its encrypted value
  gh-secrets set <name> <value> <url> [--visibility all | private | selected]  Creates or updates a secret in a repository/organization with an encrypted value
  gh-secrets setAll <file> <url> [--visibility all | private | selected] Creates or updates a batch of secrets in a repository/organization with an encrypted values from a file
  gh-secrets delete <name> <url>            Deletes a secret in a repository/organization using the secret name

Options:
  -h, --help     Show help            [boolean]
  -v, --version  Show version number  [boolean]

Examples:
  gh-secrets list https://github.com/owner/repository-name
  gh-secrets get SECRET_NAME https://github.com/owner/repository-name
  gh-secrets set SECRET_NAME value https://github.com/owner/repository-name
  gh-secrets setAll secrets.env https://github.com/owner/repository-name
  gh-secrets delete SECRET_NAME https://github.com/owner/repository-name
  gh-secrets list https://github.com/owner
  gh-secrets get SECRET_NAME https://github.com/owner
  gh-secrets set SECRET_NAME value https://github.com/owner
  gh-secrets set SECRET_NAME value https://github.com/owner --visibility all
  gh-secrets set SECRET_NAME value https://github.com/owner --visibility private
  gh-secrets set SECRET_NAME value https://github.com/owner --visibility selected
  gh-secrets setAll secrets.env https://github.com/owner
  gh-secrets setAll secrets.env https://github.com/owner --visibility all
  gh-secrets setAll secrets.env https://github.com/owner --visibility private
  gh-secrets setAll secrets.env https://github.com/owner --visibility selected
  gh-secrets delete SECRET_NAME https://github.com/owner
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
1. Update _\$HOME/.gh-secrets_ content with valid values
1. Run examples:
   - help: `gh-secrets -h`
   - list: `gh-secrets list https://github.com/owner/repository-name`
   - setAll: `gh-secrets setAll /app/secrets.env https://github.com/owner/repository-name`

## Documentation

- [GitHub actions secrets API](https://developer.github.com/v3/actions/secrets/)
