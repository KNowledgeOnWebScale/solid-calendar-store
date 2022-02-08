# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

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


[0.0.18]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.0.17...v0.0.18
[0.0.17]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.0.16...v0.0.17
[0.0.16]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.0.15...v0.0.16
[0.0.15]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.0.14...v0.0.15
[0.0.14]: https://github.com/KNowledgeOnWebScale/solid-calendar-store/compare/v0.0.5...v0.0.14