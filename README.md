# Diswantin Web

The web app for Diswantin, a productivity app that shows you the one thing to do
right now.

## Development

### Requirements

- [NodeJS](https://nodejs.org)
- [Docker](https://www.docker.com)

### Setup

Copy [.env.example](./.env.example) into .env and fill in the values.

To setup the local postgres database run:

```sh
docker-compose up -d
npm run db:migrate
```

### Dev server

```sh
npm run dev
```

## License

Copyright © 2024 Evawere Ogbe

Distributed under the MIT License. See LICENSE or
http://opensource.org/licenses/MIT.
