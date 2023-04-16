# Screening Process System

**This App was deprovisioned on 16.04.2023**

With the Screening Backlog being replaced by appointment booking via Calendly, and the Support functionality being replaced by Retool, this application was no longer used and was thus shut down. Farewell, screening-backend!


## Getting Started

### Dependencies

To start the local environment you need 3 things:

- a locally or remote running redis store
- a locally or remore running postgres database
- a .env file with the connection urls

#### Instructions for MAC OS

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
CORONA_BACKEND_API_URL=http://localhost:5000/api/screening/ (example for locally running backend app)
CORONA_BACKEND_API_TOKEN=[security token for screening api as provided in backend]

```

#### Installation on debian based systems

To install and start a local redis store:

```
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl restart redis-server
```

To install the postgress sql drivers and create the database:

```
sudo apt-get install postgresql postgresql-client
# create psql user(s) and
psql
createdb dev_corona_school
```

Additionally create an ".env" file in the root of the project with the following variables:

```
DATABASE_URL=postgresql://localhost:5432/dev_corona_school
REDIS_URL=redis://127.0.0.1:6379
COOKIE_SESSION_SECRET=oYz2bYa2MBDqiqQE7T80bmoFikIpamkHvxEVnYPpAxlFTV5F5JWHbckS04Xd
CORONA_BACKEND_API_URL=http://localhost:5000/api/screening/ (example for locally running backend app)
CORONA_BACKEND_API_TOKEN=[security token for screening api as provided in backend]
```

#### Installation on debian based systems


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

## Contributing

### Folder Structur

**/controller**

All routes must be exposed in a `\*Controller.ts`-File. All routes should also be documenteted in Postman.

**/models**

All local interfaces are defined in the models folder. This will prevent large Files with multiple Interfaces. All interfaces should be assigned a meaningful name. Interfaces with similar semantics should be in the same file. Only externally used interfaces should be exported. Only named exports are allowed.

**/database**

This is a temporary folder for connecting with the database.
