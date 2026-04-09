# beaming_yggdrasil_key Design

Key-first Dart library spec for Yggdrasil logical key parsing and derived metadata.

## 01 Overview

Purpose, scope, and package boundary.

### 01 Intent

What the key package should own and why it stays separate from transport.

#### Key Library Overview

```markdown
# beaming_yggdrasil_key Overview

## Purpose

`beaming_yggdrasil_key` should provide Dart-side support for Yggdrasil logical keys without pulling transport code into the same package.

The package should answer questions like:

- is this `keyId` structurally valid for the supported grammar
- what are the scope, root, and path segments
- what kind hierarchy can be derived from this key
- is one key a descendant of another

## Main Responsibilities

- parse supported `keyId` strings into structured Dart values
- reject malformed or unsupported key shapes with stable errors
- expose derived fields such as root, path, terminal kind, and hierarchy
- serialize parsed keys back into a canonical string form
- provide practical helpers such as descendant checks

## Explicit Non-Goals

- do not make network calls
- do not embed HTTP status or envelope logic
- do not perform access-control decisions
- do not force every future product to use one serialized key format

## Relationship To `beaming_yggdrasil`

`beaming_yggdrasil` should be able to depend on this package, but should not require it for basic transport DTO usage.

That means:

- transport DTOs should still allow raw `keyId` strings
- apps that need richer key tooling can opt into `beaming_yggdrasil_key`
- the boundary between transport and key semantics stays explicit

## Practical API Direction

The eventual Dart package should likely provide:

- immutable parsed key types
- parsing and validation entrypoints
- derived-kind helpers
- relationship helpers like `isDescendantOf`
- stable error types or parse-result objects

It should avoid:

- trying to reproduce every possible future key grammar before needed
- combining parser logic with application storage logic
```

#### beaming_yggdrasil_key Specs

```markdown
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
```

### 02 Use Cases

Main parsing and key-relationship workflows.

#### Library Scope

| area | in_scope | out_of_scope |
| --- | --- | --- |
| key-parser | supported keyId grammar for current Yggdrasil examples | REST and websocket transport |
| derived-fields | root path principal scope hierarchy and terminal kind | server envelopes and admin commands |
| relationship-helpers | descendant checks root checks canonical equality | access policy evaluation |
| validation | stable parse failures for malformed key strings | HTTP status mapping |
| serialization | canonical keyId round-trip helpers | local database sync engine |

#### Use Cases

| minimum_library_support | priority | usecase | why_it_matters |
| --- | --- | --- | --- |
| parse into structured segments or return stable parse errors | 1 | parse supported keyIds | lets Dart code reason about keys without reimplementing ad hoc string logic |
| return root and path based hierarchy | 2 | derive kind hierarchy | lets app code inspect key meaning without trusting server hints |
| provide lightweight validation entrypoint | 3 | validate create and write inputs | lets app code reject obviously malformed keys before sending requests |
| provide descendant and same-root helpers | 4 | check root descendant relationships | lets app code organize data and subscriptions safely |
| serialize parsed key back to canonical keyId | 5 | keep canonical string form | lets app code compare and persist keys consistently |

## 02 Parsing Contract

Supported key grammar and acceptance boundaries.

### 01 Parsing Rules

Current supported key parsing rules.

#### Key Parsing Rules

| notes | rule | topic |
| --- | --- | --- |
| empty keyId is invalid | split keyId by colon | tokenization |
| keeps grammar narrow to supported examples | first scope segment must currently be tenant or department | scope-level-1 |
| only one optional level is supported today | optional second scope segment may be group team or region | scope-level-2 |
| principal sits after scope and before root | optional principal segment may be user member or subscriber | principal |
| root is required | root segment must currently be dashboard or profile | root |
| these are descendant container segments | path may include note or comment with explicit ids | path-id-segments |
| branch labels are limited to supported examples | path may include like language or thumbnail branches | path-branch-segments |
| terminal segments cannot have children | text and count are terminal labels | terminal-segments |
| this matches current supported like principal shape | user member or subscriber may follow like only with value underscore | like-principal |
| keeps alias usage narrow and explicit | underscore alias is only allowed after language or thumbnail | alias-underscore |

### 02 Acceptance Examples

Key examples that should parse successfully.

#### Key Acceptance Examples

| expected_root | expected_terminal_kind | key_id | notes |
| --- | --- | --- | --- |
| dashboard | dashboard | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07 | root key |
| dashboard | text | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:note:n7c401c2:text | note text leaf |
| dashboard | count | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:note:n7c401c2:like:count | derived count leaf |
| dashboard | thumbnail | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:note:n7c401c2:thumbnail:_ | thumbnail alias leaf |
| dashboard | language | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:note:n7c401c2:language:_ | language alias leaf |
| profile | profile | department:d1:team:t1:profile:p1 | alternate supported scope and root labels |

### 03 Rejection Examples

Key examples that should fail deterministically.

#### Key Rejection Examples

| expected_error_reason | key_id |
| --- | --- |
| invalid key: empty key |  |
| invalid key: incomplete key | tenant |
| invalid key because root id is missing | tenant:t8f3a1c2:dashboard |
| invalid key: unsupported label "missing" | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:missing:n1:text |
| invalid key because underscore alias must follow an explicit allowed label | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:_ |
| invalid key because terminal segment cannot have children | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:text:child |
| invalid key because principal labels are not allowed in that position | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:user:u1 |
| invalid key because like principal must use underscore | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:like:user:u1 |

## 03 Derived Data

Fields and helpers built from parsed keys.

### 01 Derived Fields

Structured and derived values exposed by the parser.

#### Common Key Types

```ts
export type Segment = {
  label: string;
  value?: string;
  kind: string;
};

export type ParsedKey = {
  canonical: string;
  kindPath: string[];
  scope: Segment[];
  principal?: Segment;
  root: Segment;
  path: Segment[];
  terminalKind: string;
};

export type DerivedKind = {
  hierarchy: string[];
};

export type ParseFailure = {
  message: string;
};
```

#### Derived Fields

| derived_field | meaning | source |
| --- | --- | --- |
| canonical | the canonical keyId string representation | original validated token sequence |
| scope | structured scope segments | leading id segments before principal or root |
| principal | optional structured principal segment | optional user member or subscriber segment |
| root | required structured root segment | first supported root label and id |
| path | structured descendant segments after root | remaining validated labels and ids |
| kind_path | label-only view of scope principal root and path | derived from parsed segments |
| terminal_kind | the last effective kind for the key | last path segment kind or root kind when no path exists |
| derived_kind_hierarchy | root plus path labels | same hierarchy concept used by current server responses |

### 02 Parser API

API-shape examples for the Dart package.

#### Parser API Example Shapes

```ts
import type { DerivedKind, ParsedKey } from './common';

export type ParseResult =
  | { ok: true; value: ParsedKey }
  | { ok: false; message: string };

export interface BeamingYggdrasilKeyParser {
  parse(keyId: string): ParseResult;
  mustParse(keyId: string): ParsedKey;
  isValid(keyId: string): boolean;
  isDescendantOf(rootKeyId: string, candidateKeyId: string): boolean;
  deriveKind(parsed: ParsedKey): DerivedKind;
  toCanonicalString(parsed: ParsedKey): string;
}

// Dart translation guidance:
// - prefer explicit result types over throwing for ordinary validation failures
// - keep error messages stable enough for tests and diagnostics
// - avoid coupling this package to HTTP DTOs or transport enums
```

