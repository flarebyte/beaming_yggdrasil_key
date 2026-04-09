# beaming_yggdrasil_key Design

Key-first Dart library spec for Yggdrasil logical key parsing and derived metadata.

## 01 Overview

Purpose, scope, and package boundary.

### 01 Purpose and Scope

Repository target, library goal, and key-first ownership boundaries.

#### Design Ownership

| area | should_not_own | should_own |
| --- | --- | --- |
| parsing | HTTP request execution | keyId parsing |
| validation | WebSocket sessions | key validation |
| derived-data | server envelope DTOs | derived kind and hierarchy helpers |
| structured-data | admin mock-server commands | structured key segments |
| serialization | transport-specific retry or session logic | canonical serialization helpers |

#### Library Goals

| goal | why_it_matters |
| --- | --- |
| model Yggdrasil logical keys in Dart | gives applications a structured local representation instead of ad hoc string handling |
| parse and validate supported keyId shapes | lets client code reject malformed keys deterministically |
| expose derived key metadata in a Dart-friendly way | makes hierarchy and traversal logic available without reparsing |
| stay separate from transport concerns | keeps the package reusable outside REST and websocket clients |

#### Explicit Non-Goals

| non_goal | why_out_of_scope |
| --- | --- |
| make network calls | this package should model keys not execute transport |
| embed HTTP status or envelope logic | transport concerns belong in another package |
| perform access-control decisions | authorization policy should stay in higher-level application logic |
| force every future product to use one serialized key format | the library should stay narrow to supported shapes and evolve deliberately |

#### Main Responsibilities

| outcome | responsibility |
| --- | --- |
| produce structured Dart values from supported keys | parse supported keyId strings |
| return stable validation failures for tests and diagnostics | reject malformed or unsupported key shapes |
| provide root path terminal kind and hierarchy data | expose derived fields |
| keep persisted and compared key strings stable | serialize parsed keys back to canonical form |
| support checks such as descendant relationships | provide relationship helpers |

### 02 Product Shape

Major library areas, package boundary, and preferred API direction.

#### Practical API Direction

| api_area | preferred_direction |
| --- | --- |
| parsed-key-types | prefer immutable parsed key types |
| parsing-entrypoints | provide parsing and validation entrypoints |
| derived-kind-helpers | expose helpers for hierarchy and terminal kind inspection |
| relationship-helpers | include helpers such as isDescendantOf |
| error-model | prefer stable error types or explicit parse-result objects |
| scope-control | avoid reproducing every possible future key grammar before needed |
| package-boundary | avoid combining parser logic with application storage logic |

#### Package Boundary

| boundary_point | expected_direction |
| --- | --- |
| transport DTOs | should still allow raw keyId strings |
| applications needing richer key tooling | should opt into beaming_yggdrasil_key explicitly |
| relationship between transport and key semantics | should remain explicit rather than hidden inside DTO parsing |
| dependency direction | beaming_yggdrasil should be able to depend on beaming_yggdrasil_key without requiring it for basic transport usage |

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

