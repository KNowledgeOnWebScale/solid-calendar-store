# Stores

## RDFStore

_type: RDFStore_

## CalendarStore

_type: RepresentationConvertingStore_

[![](https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggTFJcbiAgICBBW1Jlc291cmNlSWRlbnRpZmllcl0gLS0-fEhUVFBHZXR8IEIodGV4dC9jYWxlbmRhcilcbiAgICBCIC0tPiB8UmVwcmVzZW50YXRpb25Db252ZXJ0ZXJ8IEMoUmVwcmVzZW50YXRpb248dGV4dC9jYWxlbmRhcj4pIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRlZmF1bHQifSwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)](https://mermaid-js.github.io/mermaid-live-editor/edit/##eyJjb2RlIjoiZ3JhcGggTFJcbiAgICBBW1Jlc291cmNlSWRlbnRpZmllcl0gLS0-fEhUVFBHZXR8IEIodGV4dC9jYWxlbmRhcilcbiAgICBCIC0tPiB8UmVwcmVzZW50YXRpb25Db252ZXJ0ZXJ8IEMoUmVwcmVzZW50YXRpb248dGV4dC9jYWxlbmRhcikiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGVmYXVsdFwiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)

Converts an URL to its `text/calendar` representation. (More information about representations: [page 3](https://rubenverborgh.github.io/solid-server-architecture/solid-architecture-v1-3-0.pdf))

## AvailibilityStore

_type: AvailabilityStore_

[![](https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggTFJcbiAgICBBW1Jlc291cmNlSWRlbnRpZmllcl0gLS0-IHxDYWxlbmRhclN0b3JlfEIoUmVwcmVzZW50YXRpb248dGV4dC9jYWxlbmRhcj4pXG4gICAgQiAtLT4gfEF2YWlsYWJpbGl0eVN0b3JlfEMoUmVwcmVzZW50YXRpb248SlNPTj4pIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRlZmF1bHQifSwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)](https://mermaid-js.github.io/mermaid-live-editor/edit/##eyJjb2RlIjoiZ3JhcGggTFJcbiAgICBBW1Jlc291cmNlSWRlbnRpZmllcl0gLS0-IHxDYWxlbmRhclN0b3JlfEIoUmVwcmVzZW50YXRpb248dGV4dC9jYWxlbmRhcj4pXG4gICAgQiAtLT4gfEF2YWlsYWJpbGl0eVN0b3JlfEMiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGVmYXVsdFwiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)

AvailibilityStore asks for a `JSON` representation.  
It first reads the yaml file specified in `config.json`, then generates the available timeslots in a 14-day period based upon the configurations specified in this yaml. The summary of each timeslot is: `Available for meetings`.

No timeslots are generated on a weekend and on a holiday.

### Internalisation

There are 2 optional fields, `weekend` and `timezone`. Their default values are resp. `[0, 6]` (Sunday and Saturday in UTC) and `Europe/Brussels`.
The times written in `availabilitySlots` are written in the specified timezone, these will then be converted to UTC. See [this](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for a list of all the possible timezones.

## TransformationStore

_type: TransformationStore_

TransformationStore takes a list of allowed rules as an argument and applies these to each event's title.

A list of all the possible rules are defined in `my-settings.yaml`.

## KeepEventsStore

_type: KeepEventsStore_

KeepEventsStore keeps all events of which their titles matches a given regex.

## BusyStore

_type: TransformationStore_

[![](https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggTFJcbiAgICBBW1Jlc291cmNlSWRlbnRpZmllcl0gLS0-IHxDYWxlbmRhclN0b3JlfEIoUmVwcmVzZW50YXRpb248dGV4dC9jYWxlbmRhcj4pXG4gICAgQiAtLT4gfEJ1c3lTdG9yZXxDKFJlcHJlc2VudGF0aW9uPEpTT04-KSIsIm1lcm1haWQiOnsidGhlbWUiOiJkZWZhdWx0In0sInVwZGF0ZUVkaXRvciI6ZmFsc2UsImF1dG9TeW5jIjp0cnVlLCJ1cGRhdGVEaWFncmFtIjpmYWxzZX0)](https://mermaid-js.github.io/mermaid-live-editor/edit/##eyJjb2RlIjoiZ3JhcGggTFJcbiAgICBBW1Jlc291cmNlSWRlbnRpZmllcl0gLS0-IHxDYWxlbmRhclN0b3JlfEIoUmVwcmVzZW50YXRpb248dGV4dC9jYWxlbmRhcj4pXG4gICAgQiAtLT4gfEF2YWlsYWJpbGl0eVN0b3JlfEMoUmVwcmVzZW50YXRpb248SlNPTj4pIiwibWVybWFpZCI6IntcbiAgXCJ0aGVtZVwiOiBcImRlZmF1bHRcIlxufSIsInVwZGF0ZUVkaXRvciI6ZmFsc2UsImF1dG9TeW5jIjp0cnVlLCJ1cGRhdGVEaWFncmFtIjpmYWxzZX0)

Asks for a `JSON` representation and applies the rules with the name `busy`.

## AggregateStore

_type: AggregateStore_

[![](https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggTFJcbiAgICBBW1Jlc291cmNlSWRlbnRpZmllcl0gLS0-IHxDYWxlbmRhclN0b3JlfEIoUmVwcmVzZW50YXRpb248dGV4dC9jYWxlbmRhcj4pXG4gICAgQiAtLT4gfEFnZ3JlZ2F0ZVN0b3JlfEMoUmVwcmVzZW50YXRpb248SlNPTj4pXG4gICAgRFtSZXNvdXJjZUlkZW50aWZpZXJdIC0tPiB8Q2FsZW5kYXJTdG9yZXxFKFJlcHJlc2VudGF0aW9uPHRleHQvY2FsZW5kYXI-KVxuICAgIEUgLS0-IEMiLCJtZXJtYWlkIjp7InRoZW1lIjoiZGVmYXVsdCJ9LCJ1cGRhdGVFZGl0b3IiOmZhbHNlLCJhdXRvU3luYyI6dHJ1ZSwidXBkYXRlRGlhZ3JhbSI6ZmFsc2V9)](https://mermaid-js.github.io/mermaid-live-editor/edit/##eyJjb2RlIjoiZ3JhcGggTFJcbiAgICBBW1Jlc291cmNlSWRlbnRpZmllcl0gLS0-IHxDYWxlbmRhclN0b3JlfEIoUmVwcmVzZW50YXRpb248dGV4dC9jYWxlbmRhcj4pXG4gICAgQiAtLT4gfEFnZ3JlZ2F0ZVN0b3JlfEMoUmVwcmVzZW50YXRpb248SlNPTj4pXG4gICAgRFtSZXNvdXJjZUlkZW50aWZpZXJdIC0tPiB8Q2FsZW5kYXJTdG9yZXxFKFJlcHJlc2VudGF0aW9uPHRleHQvY2FsZW5kYXI-KVxuICAgIEUgLS0-IENcbiAgICAiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGVmYXVsdFwiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)

Converts 2 representations to `JSON` and concats them. The title of each now also has the calendar name prepended to it, e.g. `[name] event`.
Default aggregated calendar name is: `Aggregated calendar of ${source1} and ${source2}`, but this can be overwritten.

## HolidayStore

_type: HolidayStore_

Generates a list of holidays from a given json file. These can then, for example, be used in conjunction with BusyStore to also show holidays on which the user isn't available.

## GoogleCalendarGetStore

GoogleCalendarGetStore gets the events of a Google Calendar of an authenticated user.

## ChangeDurationStore

Changes the duration of an event: 
add minutes to start or end of an event.
Below you find how it is configured.

```json
{
  "@type": "ChangeDurationStore",
  "ChangeDurationStore:_source": {
    "@id": "my:OriginalCalendar"
  },
  "ChangeDurationStore:_options_settingsPaths": [
    "test/configs/change-duration.yaml"
  ],
  "ChangeDurationStore:_options_rules": [
     "inEvent"
  ]
}
```

- `settingsPaths`: paths to the YAML files with settings.
- `rules`:  which rule in the YAML files is used.

The contents of `change-duration.yaml` is

```yaml
transformation:
  all:
    - before: 15 #minutes
      after: 15 #minutes

  selected:
    - match: ".*with car.*" #regex that the title of an event needs to match
      before: 30 #minutes
      after: 30 #minutes

  inEvent:
    - prefix: 🚗 # 🚗10,15 in the title of an event means "add 10 min. before the event and 15 min. after"

  inEventRemovePrefix:
    - prefix: 🚗 # 🚗10,15 in the title of an event means "add 10 min. before the event and 15 min. after"
      removeDuration: true #default is false
```

- `before`: amount of minutes added at start of event.
- `after`: amount of minutes add to end of event.
- `match`: regex the title of the event needs to match before the change is applied.
- `prefix`: text that prefixes a custom duration. 
- `removeDuration`: if true the information about the change in duration is removed from the title of the event.

## VacationStore

Generate vacation calendar and days based on existing calendar.
Below you find how it is configured.

```json
{
  "@id": "solid-calendar-store:VacationStore",
  "@type": "VacationStore",
  "VacationStore:_source": {
    "@id": "ex:ExistingCalendarStore"
  }
}
```

- `source`: the existing calendar.
- `name`: name of the vacation calendar. Default is "Vacation calendar".
- `vacationTag`: tag used to recognize vacation days. Default is "[vacation]".
- `morningTag`: tag used to recognized vacation days that are only in the morning. Default is "AM".
- `afternoonTag`: tag used to recognized vacation days that are only in the afternoon. Default is "PM".