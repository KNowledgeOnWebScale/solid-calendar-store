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

| Type | Name           | Used store          |
| ---- | -------------- | ------------------- |
| GET  | calendar       | CalendarStore       |
| GET  | busy           | TransformationStore |
| GET  | availability   | AvailabilityStore   |
| GET  | aggregate      | AggregateStore      |
| GET  | transformation | TransformationStore |

## my-settings.yaml

A couple of things are defined in the `my-settings.yaml`. Firstly the `availabilitySlots` are defined, furthermore `minimumSlotDuration` defines the minimum slot dureation (in minutes) of a slot. Both are used in `AvailabilityStore`.

`transformation` defines all the possible rules that can be applied. Each rule is of the following format:

```yaml
[name]:
  match: [regex]
  replace: [string]
```

The name is not unique, i.e. it is possible to define multiple rules with the name "busy" and let them all be applied when navigating to `/busy`.

Match should be a valid JavaScript regex, excluding the `//`. It is important that when regex characters are escaped, e.g. `\*`, the match text is placed in `''` and not `""`.

The string defined in `replace` will replace all the matched parts.
