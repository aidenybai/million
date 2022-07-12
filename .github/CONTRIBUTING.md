# Contributing to Million

### Initial Steps:

1. Fork this repository and clone it to your local machine
2. Make sure you have [`pnpm`](https://pnpm.io/) installed. If you don't, run `npm i -g pnpm`
3. Install all packages with the `pnpm install` command.
4. Run `pnpm run welcome` to get onboarded.
5. Read the [wiki](https://github.com/aidenybai/million/wiki) to understand the internals.

## Required Steps:

- Write tests for all of your code and ignore any lines that do not need to be tested.
- Do not commit your `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml` files from NPM
- Before submitting a pull request run `pnpm run cleanup`, `pnpm run lint`, and `pnpm run test`

## Next Steps:

- If you are using [VSCode](https://code.visualstudio.com/), install all recommended workspace extensions.
- Make sure you are up to date by doing `git pull` here and there.
- Submit a [pull request](https://github.com/aidenybai/million/pulls)!

## Scripts:

Listed is a series of scripts and their descriptions that can be run with `pnpm run`.

- `dev`: Spins up a dev environment with Vite
- `build`: Builds distribution files under `/dist`
- `lint`: Lint all files in the project with `eslint`
- `cleanup`: Formats TypeScript files under `/packages` with Prettier.
- `test`: Runs unit tests via `vitest`
- `bench`: Opens a local benchmark testing environment with Vite.
- `typecheck`: Uses TypeScript to typecheck files under `/packages`
- `release`: Builds and prepares distributions for release.
- `bump`: Publishes a new release to NPM.
- `welcome`: Runs the dev environemtn onboarding CLI "RPG"
- `prepare`: Installs Git hooks into your local clone of the repository.
