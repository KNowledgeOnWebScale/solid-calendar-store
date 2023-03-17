# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.6.1] - 2023-02-13

### Changed
- Update deps

## [0.6.0] - 2023-02-13

### Changed
- Replaced `ical.js` with `node-ical`

### Removed
- Option to remove Apple-specific fields

## [0.5.3] - 2023-02-09

### Fixed
- `\r\n` in remove `X-APPLE-STRUCTURED-LOCATION` in `ics-to-json-converter`

## [0.5.2] - 2023-02-09

### Added
- Option to remove `X-APPLE-STRUCTURED-LOCATION` in `ics-to-json-converter`

## [0.5.1] - 2022-09-22

### Added
- Store to merge overlapping events

## [0.5.0] - 2022-07-08

### Added
- Extra tests for vacation store

### Changed
- Use CSS v4 instead of v3

### Fixed
- Import chai exclude in tests

## [0.4.0] - 2022-05-02

### Added
- Add vacation store

### Fixed
- Update example config to v3 (see [issue 28](https://github.com/KNowledgeOnWebScale/solid-calendar-store/issues/28))

### Changed
- Pre-generation as separate component (see [issue 24](https://github.com/KNowledgeOnWebScale/solid-calendar-store/issues/24))

## [0.3.0] - 2022-03-23

### Added
- Add store to manipulate duration of events (see [issue 10](https://github.com/KNowledgeOnWebScale/solid-calendar-store/issues/10))

## [0.2.2] - 2022-03-09

### Fixed
- Availability calendar: pre-generate data and not representation.

## [0.2.1] - 2022-03-08

### Added
- Availability calendar: option to pre-generate calendar every given amount of time.

## [0.2.0] - 2022-03-02

### Changed
- Use CSS v3 instead of v2

## [0.1.0] - 2022-02-23

### Changed
- File structure
- Documentation on how to run the store

## [0.0.19] - 2022-02-16

### Fixed
- Default start date of availability calendar

## [0.0.18] - 2022-02-08

### Fixed
- Do not send bad request error when event doesn't have summary (see [issue 16](https://github.com/KNowledgeOnWebScale/solid-calendar-store/issues/16))

## [0.0.17] - 2022-02-08

### Fixed
- ICS to JSON converter: events removed from original calendar are still present (see [issue 14](https://github.com/KNowledgeOnWebScale/solid-calendar-store/issues/14))

## [0.0.16] - 2022-02-01

### Fixed
- Recurring events and daylight saving time

## [0.0.15] - 2022-01-28

### Added
- Option to Keep Store to remove past events

### Fixed
- Clarify instructions wrt Google Calendar (see [issue 8](https://github.com/KNowledgeOnWebScale/solid-calendar-store/issues/8))
- Converting recurring events in ICS to JSON

### Changed
- Use CSS v2

## [0.0.14] - 2021-11-02

### Added
- Support for authenticated Google Calendars


[0.6.1]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.5.3...v0.6.0
[0.5.3]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.0.19...v0.1.0
[0.0.19]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.0.18...v0.0.19
[0.0.18]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.0.17...v0.0.18
[0.0.17]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.0.16...v0.0.17
[0.0.16]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.0.15...v0.0.16
[0.0.15]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.0.14...v0.0.15
[0.0.14]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.0.5...v0.0.14
