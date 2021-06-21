# Solid Calendar

Solid Calendar is a plugin for [CSS](https://github.com/solid/community-server), it adds to possiblity to perform a list of calendar-based operations. For a concrete overview of all the possible transformations and conversions see `docs/`.

## Initial setup

Make sure to download [rmlmapper.jar](https://github.com/RMLio/rmlmapper-java/releases) and place it in the project root.

## How to run

```
$ npm i
$ node node_modules/@solid/community-server/bin/server.js -c config.json -m .
```

See the [CSS documentation](https://github.com/solid/community-server#configuring-the-server) for more information on what each parameter does.

### Disclaimers

1. Make sure you have the required packages to support typescript compiling installed on your machine.
2. It is important to run the server from the node module and not from a local version. This is because certain files can only be accessed local (due to how semver works for versions below 1.0.0).

## Endpoints

| Type | Name         | Used store        |
| ---- | ------------ | ----------------- |
| GET  | calendar     | CalendarStore     |
| GET  | busy         | BusyStore         |
| GET  | availability | AvailabilityStore |
| GET  | aggregate    | AggregateStore    |
