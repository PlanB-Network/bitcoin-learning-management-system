# The Sovereign University

This is the repository for the Sovereign University website, a project by [Découvre Bitcoin](https://decouvrebitcoin.fr) and the community. The goal of this project is to create a free, open-source, and community-driven university to learn about Bitcoin.

The repository holding the data for this project is [here](https://github.com/DecouvreBitcoin/sovereign-university-data).

We are looking for contributors! If you want to help or learn more about the project, please reach out to us on [Twitter](https://twitter.com/louneskmt) or [Matrix](https://matrix.to/#/@louneskmt:bitcoinlightningandcamembert.org).

## Development

We use [Nx](https://nx.dev) to manage the monorepo and Docker to run the development environment.

To start the development environment, run :

1. `pnpm i`
2. `pnpm nx run-many --target=build`
3. `docker compose up --build -V`

This will start all the necessary containers.

On the first run, you will need to run the migrations. To do so, run `pnpm nx run database:migrations:run`. If at any moment you need to rerun the migrations (for example, if you change the database schema), you can run the same command adding the `--drop` flag to drop the database before running the migrations.

NB: You may need to build all the packages the very first time you run the project. To do so, run `pnpm nx run-many --target=build`.

Once the containers are up and running, you can access the front at `http://localhost:4200`. The app will automatically reload if you change any of the source files.

In order to sync the database with the data from the data repository, you can make a request to the API with `curl -X POST http://localhost:3000/api/github/sync` (until we have a proper Nx command for that). This will import all the data from the data repository into the database. Note that for some unknown reason, it may fail with a git error. If that happens, just run the command again. Just haven't had the time to investigate why it happens.
