# Solid Calendar Store

Solid Calendar is a plugin for [CSS](https://github.com/solid/community-server).
It adds the possibility to perform a list of calendar-based operations.
For a concrete overview of all the possible transformations and conversions see `docs/`.

## Initial setup

Make sure to download [rmlmapper.jar](https://github.com/RMLio/rmlmapper-java/releases) and place it in the project root. This is not necessary, if the jar isn't there when it's needed it will be downloaded and placed there.

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

These endpoints are the default provided ones, see `config/config-calendar.json` to see how they're set up and to add your own.

| Type | Name           | Used store          |
| ---- | -------------- | ------------------- |
| GET  | calendar       | CalendarStore       |
| GET  | busy           | TransformationStore |
| GET  | availability   | AvailabilityStore   |
| GET  | aggregate      | AggregateStore      |
| GET  | transformation | TransformationStore |
| GET  | holidays       | HolidayStore        |
| GET  | holidays/busy  | ExtendedBusyStore   |

## my-settings.yaml

A couple of things are defined in the `my-settings.yaml`. Firstly the `availabilitySlots` are defined, furthermore `minimumSlotDuration` defines the minimum slot dureation (in minutes) of a slot. Both are used in `AvailabilityStore`.

`transformation` defines all the possible rules that can be applied. Each rule is of the following format:

```yaml
[name]:
  match: [regex]
  replace: [string]
  removeFields: [string array]
```

The name is not unique, i.e. it is possible to define multiple rules with the name "busy" and let them all be applied when navigating to `/busy`.

Match should be a valid JavaScript regex, excluding the `//`. It is important that when regex characters are escaped, e.g. `\*`, the match text is placed in `''` and not `""`.

The string defined in `replace` will replace all the matched parts.

RemoveFields is an optional string array that defines the to be removed fields of an event. If this line isn't provided only the title, start date and end date are kept.

## Holidays

Currently 3 types of holidays are defined:

1. Constant: Holidays that are always on the same day (example: New Year)
2. Shifting: Holidays that fall on the nth day of a month (example: Mothers Day)
3. Fluid: Holidays that aren't exactly possible to be strictly defined (example: Easter)

These are then structured in a json file like this:

```json
{
    "constant": [
        {
            "name": [holiday name],
            "date": {
                "day": [UTC day],
                "month": [UTC month]
            }
        },
    ],
    "shifting": [
        {
            "name": [holiday name],
            "date": {
                "n": [the nth it falls on],
                "weekday": [which UTC weekday],
                "month": [UTC month]
            }
        }
    ],
    "fluid": {
        [holiday name]: [date (incl. year)]
    }
}
```

See `docs/stores.md` for places where the holidays are used.

## Calendar JSON format

For the calendar name the `X-WR-CALNAME` field is used.  
Not all possible event fields of an ICS calendar are used. The following are required: `summary`, `dtstart` and `dtend`, these are optional: `description` and `location`.

This results in the following format:

```ts
{
    name: string,
    events: [
        {
            title: string,
            startDate: Date,
            endDate: Date,
            location?: string,
            description?: string
        }
    ]
}
```
