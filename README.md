# Screening Process System


## Getting Started

### Dependencies

To start the local environment you need 3 things:

* a locally or remote  running redis store
* a locally or remore running postgres database
* a .env file with the connection urls

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

Additionally create a ".env" file in the root of the project with the following urls:
```
DATABASE_URL=postgresql://localhost:5432/dev_corona_school
REDIS_URL=redis://127.0.0.1:6379
```

### Local Development

To start the local development use the following command:
```
yarn install
yarn run dev
```