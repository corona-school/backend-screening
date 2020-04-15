# Screening Process System

## Getting Started

### Dependencies

To start the local environment you need 3 things:

- a locally or remote running redis store
- a locally or remore running postgres database
- a .env file with the connection urls

To install and start a local redis store:

```
brew update
brew install redis
brew services start redis
```

To install the postgress sql drivers and create the database:

```
brew install postgresql
ln -sfv /usr/local/opt/postgresql/*.plist ~/Library/LaunchAgents
psql
createdb dev_corona_school
```

Additionally create an ".env" file in the root of the project with the following variables:

```
DATABASE_URL=postgresql://localhost:5432/dev_corona_school
REDIS_URL=redis://127.0.0.1:6379
COOKIE_SESSION_SECRET=oYz2bYa2MBDqiqQE7T80bmoFikIpamkHvxEVnYPpAxlFTV5F5JWHbckS04Xd
CORONA_BACKEND_API_URL=http://localhost:5000/api/student/ (for locally running backend app) app
CORONA_BACKEND_API_TOKEN=[security token for screening api as provided in backend]

```

### Local Development

To start the local development use the following command:

```
yarn install
yarn run dev
```

#### Docker

To run temporary Redis and Postgres containers in Docker, use the following commands (the first two each in a separate terminal):

```
docker run --rm -it -p 6379:6379 redis
docker run --rm -it -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 postgres
psql -h localhost -p 5432 -U postgres -c "create database dev_corona_school"
```

Set your `DATABASE_URL` variable in `.env`:

```
DATABASE_URL=postgresql://postgres@localhost:5432/dev_corona_school
```

Then use `yarn install` and `yarn run dev` as usual.