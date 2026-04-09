# beaming_yggdrasil_key Specs

This folder contains draft specs for a Dart key library that complements `beaming_yggdrasil`.

Repository target:

- GitHub project: `beaming_yggdrasil_key`

Library goal:

- model Yggdrasil logical keys in Dart
- parse and validate supported `keyId` shapes
- expose derived key metadata in a Dart-friendly way
- stay separate from transport concerns such as REST clients and WebSocket sessions

## Design Intent

`beaming_yggdrasil_key` should be a key-first library.

It should own:

- `keyId` parsing
- key validation
- derived kind and hierarchy helpers
- structured key segments
- canonical serialization helpers

It should not own:

- HTTP request execution
- WebSocket sessions
- server envelope DTOs
- admin mock-server commands

## Folder Layout

- [overview.md](overview.md)
- [examples/usecases.csv](examples/usecases.csv)
- [examples/library-scope.csv](examples/library-scope.csv)
- [examples/key-parsing-rules.csv](examples/key-parsing-rules.csv)
- [examples/key-acceptance-examples.csv](examples/key-acceptance-examples.csv)
- [examples/key-rejection-examples.csv](examples/key-rejection-examples.csv)
- [examples/derived-fields.csv](examples/derived-fields.csv)
- [examples/common.ts](examples/common.ts)
- [examples/parser-api.ts](examples/parser-api.ts)

## Notes

- The `.ts` files are API-shape examples only.
- The CSV files are the main review surface.
- This library is intended to keep key logic out of the transport client package.
- The source protocol reference remains the mock-server design in the upstream transport repository.
