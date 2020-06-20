#!/usr/bin/env node

const argv = require('yargs');
const chalk = require('chalk');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const fs = require('fs');
const sodium = require('tweetsodium');

// load app environment variables
dotenv.config({
  path: `${process.env.HOME}/.gh-secrets`
});

const cli = () => {
  argv
    .usage('Usage: $0 <command> [options] <url>')
    .command({
      command: 'list <url>',
      desc: 'Lists all secrets available in a repository/organization without revealing their encrypted values',
      handler: (argv) => getSecrets(argv)
    })
    .command({
      command: 'show <name> <url>',
      desc: 'Gets a single secret from a repository/organization without revealing its encrypted value',
      handler: (argv) => getSecret(argv)
    })
    .command({
      command: 'set <name> <value> <url>',
      desc: 'Creates or updates a secret in a repository/organization with an encrypted value',
      handler: (argv) => setSecret(argv)
    })
    .command({
      command: 'setAll <file> <url>',
      desc: 'Creates or updates a batch of secrets in a repository/organization with an encrypted values from a file',
      handler: (argv) => setSecrets(argv)
    })
    .command({
      command: 'delete <name> <url>',
      desc: 'Deletes a secret in a repository/organization using the secret name',
      handler: (argv) => deleteSecret(argv)
    })
    .example('$0 list https://github.com/owner/repository-name')
    .example('$0 show SECRET_NAME https://github.com/owner/repository-name')
    .example('$0 set SECRET_NAME value https://github.com/owner/repository-name')
    .example('$0 setAll secrets.env https://github.com/owner/repository-name')
    .example('$0 delete SECRET_NAME https://github.com/owner/repository-name')
    .demandCommand(1, 1, 'Use one command before moving on')
    .recommendCommands()
    .scriptName('gh-secrets')
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version').argv;
};

const getSecrets = async (args) => {
  const resGetSecrets = await _getSecrets(args);

  if (resGetSecrets.status === 'ok') {
    _printJSON(resGetSecrets);
  } else {
    // error
    console.log(chalk.bold.red('Error on get secrets:'));
    _printJSON(resGetSecrets);
  }
};

const getSecret = async (args) => {
  const resGetSecret = await _getSecret(args);

  if (resGetSecret.status === 'ok') {
    _printJSON(resGetSecret);
  } else {
    // error
    console.log(chalk.bold.red('Error on get secret:'));
    _printJSON(resGetSecret);
  }
};

const setSecret = async (args) => {
  const { name, value, url } = args;
  const resGetPublicKey = await _getPublicKey(args);

  if (resGetPublicKey.status === 'ok') {
    const publicKey = resGetPublicKey.result.key;
    const publicKeyId = resGetPublicKey.result.key_id;
    const encryptedValue = _encrypt(value, publicKey);
    const resSetSecret = await _setSecret({ name, encryptedValue, publicKeyId, url });

    if (resSetSecret.status === 'ok') {
      console.log(chalk.bold.green(name), 'setted');
    } else {
      // error
      console.log(chalk.bold.red('Error on set secret:'));
      _printJSON(resSetSecret);
    }
  } else {
    // error
    console.log(chalk.bold.red('Error on get public key:'));
    _printJSON(resGetPublicKey);
  }
};

const setSecrets = async (args) => {
  const { file, url } = args;

  if (fs.existsSync(file)) {
    secrets = dotenv.parse(fs.readFileSync(file));

    for (const key in secrets) {
      setSecret({
        url,
        name: key,
        value: secrets[key]
      });
    }
  } else {
    console.error(`The file does not exists: ${file}`);
  }
};

const deleteSecret = async (args) => {
  const { name } = args;
  const resDeleteSecret = await _deleteSecret(args);

  if (resDeleteSecret.status === 'ok') {
    console.log(chalk.bold.blue(name), 'deleted');
  } else {
    // error
    console.log(chalk.bold.red('Error on delete:'));
    _printJSON(resDeleteSecret);
  }
};

// UTILS

// encrypts value string using public key
const _encrypt = (value, publicKey) => {
  // convert the message and key to Uint8Array's
  const messageBytes = Buffer.from(value);
  const keyBytes = Buffer.from(publicKey, 'base64');
  // encrypt using LibSodium
  const encryptedBytes = sodium.seal(messageBytes, keyBytes);

  // base64 the encrypted secret
  return Buffer.from(encryptedBytes).toString('base64');
};

const _getRequestHeaders = () => {
  return {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.GH_USERNAME}:${process.env.GH_PERSONAL_ACCESS_TOKEN}`
      ).toString('base64')}`,
      'Content-Type': 'application/json'
    }
  };
};

const _getPathSlice = (url) => {
  const regex = /^https:\/\/github\.com\/([a-zA-Z0-9-_.]+)\/?([a-zA-Z0-9-_.]+)?\/?/g;
  const regexMatch = regex.exec(url);

  if (!regexMatch) {
    throw chalk.bold.red(
      'Error: wrong URL, expected URLs: https://github.com/owner or https://github.com/owner/repository-name'
    );
  }

  const owner = regexMatch[1];
  const repo = regexMatch[2];

  return {
    isOrgPath: !repo,
    pathSlice: repo ? `repos/${owner}/${repo}` : `orgs/${owner}`
  };
};

const _printJSON = (input) => {
  console.log(JSON.stringify(input, null, 2));
};

// REQUESTS

const _processResponse = async (response) => {
  let result;
  const contentType = response.headers.get('content-type');
  const status = response.ok ? 'ok' : 'ko';
  const statusCode = response.status;

  if (contentType && contentType.includes('application/json')) {
    result = await response.json();
  } else {
    result = await response.text();
  }

  return {
    result,
    status,
    statusCode
  };
};

const _getPublicKey = (args) => {
  const { url } = args;
  const { pathSlice } = _getPathSlice(url);
  const options = _getRequestHeaders();

  return fetch(`https://api.github.com/${pathSlice}/actions/secrets/public-key`, options).then((response) =>
    _processResponse(response)
  );
};

const _getSecrets = (args) => {
  const { url } = args;
  const { pathSlice } = _getPathSlice(url);
  const options = _getRequestHeaders();

  return fetch(`https://api.github.com/${pathSlice}/actions/secrets`, options).then((response) =>
    _processResponse(response)
  );
};

const _getSecret = (args) => {
  const { name, url } = args;
  const { pathSlice } = _getPathSlice(url);
  const options = _getRequestHeaders();

  return fetch(`https://api.github.com/${pathSlice}/actions/secrets/${name}`, options).then((response) =>
    _processResponse(response)
  );
};

const _setSecret = (args) => {
  const { name, encryptedValue, publicKeyId, url } = args;
  const { isOrgPath, pathSlice } = _getPathSlice(url);
  const options = {
    ..._getRequestHeaders(),
    ...{
      method: 'put',
      body: JSON.stringify({
        encrypted_value: encryptedValue,
        key_id: publicKeyId
      })
    }
  };

  return fetch(`https://api.github.com/${pathSlice}/actions/secrets/${name}`, options).then((response) =>
    _processResponse(response)
  );
};

const _deleteSecret = (args) => {
  const { name, url } = args;
  const { pathSlice } = _getPathSlice(url);
  const options = {
    ..._getRequestHeaders(),
    ...{
      method: 'delete'
    }
  };

  return fetch(`https://api.github.com/${pathSlice}/actions/secrets/${name}`, options).then((response) =>
    _processResponse(response)
  );
};

// run

cli();
