<div align="center">
  <img alt="Stellar" src="https://github.com/stellar/.github/raw/master/stellar-logo.png" width="558" />
  <br/>
  <strong>Creating equitable access to the global financial system</strong>
  <h1>js-soroban-client</h1>
</div>

<p align="center">
  <a href="https://badge.fury.io/js/soroban-client"><img src="https://badge.fury.io/js/soroban-client.svg" alt="npm version" height="18"></a>
  <a href="https://github.com/stellar/js-soroban-client/actions/workflows/tests.yml"><img alt="Test Status" src="https://github.com/stellar/js-soroban-client/actions/workflows/tests.yml/badge.svg" /></a>
  <a href="https://coveralls.io/github/stellar/js-soroban-client?branch=master"><img alt="Coverage Status" src="https://coveralls.io/repos/stellar/js-soroban-client/badge.svg?branch=master&service=github" /></a>
</p>

# Deprecation Notice

**This repository has been deprecated** in favor of the [`stellar-sdk`](https://github.com/stellar/js-stellar-sdk) package. Please read the [migration guide](https://gist.github.com/Shaptic/5ce4f16d9cce7118f391fbde398c2f30) for how to upgrade to that package. Future changes will only be made there.

----------

js-soroban-client is a JavaScript library for communicating with a
[Soroban RPC server](https://soroban.stellar.org/api) and building Stellar apps. It provides:
- a networking layer API for soroban-rpc methods.
- facilities for building and signing transactions, for communicating with a
  soroban-rpc instance, and for submitting transactions or querying network
  state.

<details>

### soroban-client vs stellar-base

soroban-client is a high-level library that serves as client-side API for Horizon.
[stellar-base](https://github.com/stellar/js-stellar-base) is lower-level
library for creating Stellar primitive constructs via XDR helpers and wrappers.

**Most people will want soroban-client instead of stellar-base.** You should only
use stellar-base if you know what you're doing!

If you add `soroban-client` to a project, **do not add `stellar-base`!** Mis-matching
versions could cause weird, hard-to-find bugs. `soroban-client` automatically
installs `stellar-base` and exposes all of its exports in case you need them.

> **Important!** The Node.js version of the `stellar-base` (`soroban-client` dependency) package
> uses the [`sodium-native`](https://www.npmjs.com/package/sodium-native) package as
> an [optional dependency](https://docs.npmjs.com/files/package.json#optionaldependencies). `sodium-native` is
> a low level binding to [libsodium](https://github.com/jedisct1/libsodium),
> (an implementation of [Ed25519](https://ed25519.cr.yp.to/) signatures).
> If installation of `sodium-native` fails, or it is unavailable, `stellar-base` (and `soroban-client`) will
> fallback to using the [`tweetnacl`](https://www.npmjs.com/package/tweetnacl) package implementation.
>
> If you are using `soroban-client`/`stellar-base` in a browser you can ignore
> this. However, for production backend deployments you should be
> using `sodium-native`. If `sodium-native` is successfully installed and working the
> `SorobanClient.FastSigning` variable will return `true`.

## Quick start

Using npm to include js-soroban-client in your own project:

```shell
npm install --save soroban-client
```

Alternatively, you can use cdnjs in a browser:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/soroban-client/{version}/soroban-client.js"></script>
````

## Install

### To use as a module in a Node.js project

1. Install it using npm:

```shell
npm install --save soroban-client
```

2. require/import it in your JavaScript:

```js
var SorobanClient = require('soroban-client');
```

### To self host for use in the browser

1. Install it using [bower](http://bower.io):

```shell
bower install soroban-client
```

2. Include it in the browser:

```html
<script src="./bower_components/soroban-client/soroban-client.js"></script>
<script>
  console.log(SorobanClient);
</script>
```

If you don't want to use or install Bower, you can copy built JS files from the
[bower-js-soroban-client
repo](https://github.com/stellar/bower-js-soroban-client).

### To use the [cdnjs](https://cdnjs.com/libraries/soroban-client) hosted script in the browser

1. Instruct the browser to fetch the library from
   [cdnjs](https://cdnjs.com/libraries/soroban-client), a 3rd party service that
   hosts js libraries:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/soroban-client/{version}/soroban-client.js"></script>
<script>
  console.log(SorobanClient);
</script>
```

Note that this method relies using a third party to host the JS library. This
may not be entirely secure.

Make sure that you are using the latest version number. They can be found on the
[releases page in Github](https://github.com/stellar/js-soroban-client/releases).

### To develop and test js-soroban-client itself

1. Clone the repo:

```shell
git clone https://github.com/stellar/js-soroban-client.git
```

2. Install dependencies inside js-soroban-client folder:

```shell
cd js-soroban-client
yarn install
```

3. Install Node 16

Because we support the latest maintenance version of Node, please install and develop on Node 16 so you don't get surprised when your code works locally but breaks in CI.

Here's how to install `nvm` if you haven't: https://github.com/creationix/nvm

```shell
nvm install

# if you've never installed 16 before you'll want to re-install yarn
yarn install -g yarn
```

If you work on several projects that use different Node versions, you might it
helpful to install this automatic version manager:
https://github.com/wbyoung/avn

4. Observe the project's code style

While you're making changes, make sure to run the linter-watcher to catch any
   linting errors (in addition to making sure your text editor supports ESLint)

```shell
node_modules/.bin/gulp watch
````

## Usage

For information on how to use js-soroban-client, take a look at [the
documentation](https://stellar.github.io/js-soroban-client/), or [the
examples](https://github.com/stellar/js-soroban-client/tree/master/docs/reference).

## Testing

To run all tests:

```shell
gulp test
```

To run a specific set of tests:

```shell
gulp test:node
gulp test:browser
```

To generate and check the documentation site:

```shell
# install the `serve` command if you don't have it already
yarn install -g serve

# generate the docs files
yarn docs

# get these files working in a browser
cd jsdoc && serve .

# you'll be able to browse the docs at http://localhost:5000
```

## Documentation

Documentation for this repo lives in
[Developers site](https://github.com/stellar/js-soroban-client/blob/master/docs/reference/readme.md).

## Contributing

For information on how to contribute, please refer to our
[contribution guide](https://github.com/stellar/js-soroban-client/blob/master/CONTRIBUTING.md).

## Publishing to npm

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the detailed release process. Once a new release is published and CI passes, a new package will be published to npm by GitHub actions.

## License

js-soroban-client is licensed under an Apache-2.0 license. See the
[LICENSE](https://github.com/stellar/js-soroban-client/blob/master/LICENSE) file
for details.

</details>
