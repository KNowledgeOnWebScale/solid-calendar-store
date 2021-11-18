# Solid Calendar Store

This library allows users to perform a list of calendar operations via the [Community Solid Server](https://github.com/solid/community-server) (CSS).
This is achieved by offering stores and converters for CSS.
For an overview of all possible transformations and 
conversions see [the documentation](docs).

## How to run

1. Install dependencies via `npm i`.
2. Rename `config/config-calendar-example.json` to `config/config-calendar.json`.
3. Optional: configure use of Google Calendar. If you do not do this, calls involving Calendar will fail.
   1. Update calendar id of Google Calendar in `config/config-calendar.json`.
   2. Give Solid Calendar Store access to Google Calendar API via `node scripts/get-google-access-token.js`. 
4. Run server via `npx community-solid-server -c config.json -m .`.

See the [Community Solid Server documentation](https://github.com/solid/community-server#configuring-the-server) 
for more information on what each parameter does.

Note that the latest version of the [RMLMapper](https://github.com/RMLio/rmlmapper-java/) is downloaded when you first run the server.
You have the option to provide a custom version by putting it in the project and calling it `rmlmapper.jar`.

### Remarks

1. Make sure you have the required packages to support typescript compiling installed on your machine.
2. Run the server via `npx` to ensure you are running local packages as opposed to global packages.

## Endpoints

These endpoints are the default provided ones.
See `config/config-calendar.json` to see how they are set up and 
how you can customize them.

| Type | Name           | Used store          |
| ---- | -------------- | ------------------- |
| GET  | calendar       | CalendarStore       |
| GET  | busy           | TransformationStore |
| GET  | availability   | AvailabilityStore   |
| GET  | aggregate      | AggregateStore      |
| GET  | transformation | TransformationStore |
| GET  | holidays       | HolidayStore        |
| GET  | holidays/busy  | ExtendedBusyStore   |
| GET  | gcal           | GoogleCalendarGetStore |

## Examples

### Availability Store

You find an example of the settings for this store in `/examples/availability-store-settings.yaml`. 
In this file, you define the availability slots via `availabilitySlots` 
and the minimum duration in minutes of a single slot via `minimumSlotDuration`.

### Transformation Store

You find an example of the settings for this store in `/examples/transformation-store-settings.yaml`.
In this file, you define all rules via `transformation`. 
Each rule is of the following format:

```yaml
[name]:
  match: [regex]
  replace: [string]
  removeFields: [string array]
```

- `name` is the name of the rules and does not have to be unique.
For example, it is possible to define multiple rules with the name "busy" and let them all be applied when navigating to `/busy`.
- `match` should be a valid JavaScript regex, excluding the `//`. 
It is important that when regex characters are escaped, e.g. `\*`, you place the match text in `''` and not `""`.
- `replace` is the string that will replace all the matched parts. 
- `removeFields` is an optional string array that defines the to-be-removed fields of an event. 
  If you do not provide this attribute, then only the title, start date and end date are kept.

### Holiday Store

You find an example of the settings for this store in `/examples/holiday-store-settings.yaml`.
You can define 3 types of holidays:

- `constant`: Holidays that are always on the same day (example: New Year)
- `shifting`: Holidays that fall on the nth day of a month (example: Mothers Day)
- `fluid`: Holidays that are not exactly possible to be strictly defined (example: Easter)

You structure them in a JSON file like this:

```yaml
constant:
  - name: [holiday name]
    date:
      day: [UTC day]
      month: [UTC month]
shifting:
  - name: [holiday name]
    date:
      n: [the nth it falls on]
      weekday: [which UTC weekday]
      month: [UTC month]
fluid:
  [holiday name]: [date (incl. year)]
```

See `docs/stores.md` for places where you can use the holidays.

## Calendar JSON format used by the stores

For the calendar name the `X-WR-CALNAME` field is used.  
Not all possible event fields of an ICS calendar are used. 
The following are required: `summary`, `dtstart` and `dtend`.
tTese are optional: `description` and `location`.

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
