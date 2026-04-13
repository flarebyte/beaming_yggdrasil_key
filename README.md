# beaming_yggdrasil_key

![beaming_yggdrasil_key hero](doc/beaming-yggdrasil-key-hero.png)

`beaming_yggdrasil_key` is a Dart library for working with Yggdrasil-style keys as structured data instead of ad hoc strings.

It is designed for applications that need to:

- parse and validate canonical `label:value` keys
- derive structured parts such as scope, anchor, and descendant path
- navigate parent and ancestor relationships
- check descendant relationships across collections of keys
- split keys into parallel label and value arrays and combine them back

## Why Use It

Yggdrasil-style keys are compact and expressive, but raw string handling becomes brittle once code needs validation, traversal, or relationship checks.

This library treats keys more like paths:

- a key is validated against a schema
- the first configured anchor segment becomes the navigation root
- everything before the anchor is scope
- everything after the anchor is path

That gives you deterministic parsing, stable canonical output, and reusable helpers for common key operations.

## Getting Started

Add the package to your `pubspec.yaml`:

```yaml
dependencies:
  beaming_yggdrasil_key: ^<latest-version>
```

Then import it in your Dart code:

```dart
import 'package:beaming_yggdrasil_key/beaming_yggdrasil_key.dart';
```

## Key Format

Keys use explicit `label:value` pairs:

```text
tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07
```

Supported values are:

- ordinary identifier values such as `a8f3a1c2`
- `_` for intrinsic values
- `~` for contextual self values

Examples:

```text
tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07
tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:text:_
tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:user:~
department:d1:team:a1:profile:b1
```

## Core Concepts

For a key like:

```text
tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:text:_
```

The parsed structure is:

- `scope`: `tenant:a8f3a1c2`, `group:b4b7d9e1`
- `anchor`: `dashboard:d1e52f07`
- `path`: `note:c7c401c2`, `text:_`
- `kindPath`: `tenant`, `group`, `dashboard`, `note`, `text`
- `terminalKind`: `text`

This model is what enables navigation helpers such as parent, ancestors, and descendant checks.

## Main Capabilities

The library is intended to expose a focused API around these operations:

- `parse(keyId)` to validate and turn a key into a `ParsedKey`
- `mustParse(keyId)` when invalid input should fail immediately
- `isValid(keyId)` for a lightweight yes/no check
- `splitKey(keyId)` and `splitKeys(keyIds)` to separate labels and values
- `combineKey(labels, values)` and `combineKeys(...)` to rebuild canonical keys
- `parentOf(keyId)` and `ancestorsOf(keyId)` for upward navigation
- `isAnchorKey(keyId)` to check whether a key ends exactly at the anchor
- `isDescendantOf(anchorKeyId, candidateKeyId)` and `descendantsOf(...)` for relationship queries
- `toCanonicalString(parsed)` to serialize validated data back to the canonical key form

## Schema-Driven Validation

Validation is schema-driven rather than hardcoded.

A schema defines:

- which labels may appear at the root
- which labels count as anchors
- which values each label accepts
- which child labels may follow each label
- identifier rules such as allowed characters and length bounds

Example schema shape:

```dart
const exampleSchema = {
  'config': {
    'maxDepth': 8,
    'minIdChars': 1,
    'maxIdChars': 64,
    'idAlphabet': 'lower-hex',
    'extraIdChars': ['-'],
  },
  'rootLabels': ['tenant', 'department', 'region'],
  'anchorLabels': ['dashboard', 'profile'],
  'nodesByLabel': {
    'tenant': {
      'label': 'tenant',
      'valueTypes': ['id'],
      'childLabels': ['group', 'department', 'region', 'dashboard', 'profile'],
    },
    'group': {
      'label': 'group',
      'valueTypes': ['id'],
      'childLabels': ['dashboard', 'profile'],
    },
    'dashboard': {
      'label': 'dashboard',
      'valueTypes': ['id'],
      'childLabels': ['note', 'language', 'thumbnail', 'like', 'user'],
    },
    'note': {
      'label': 'note',
      'valueTypes': ['id'],
      'childLabels': ['text', 'language', 'thumbnail', 'like'],
    },
    'text': {
      'label': 'text',
      'valueTypes': ['_'],
      'childLabels': [],
    },
    'user': {
      'label': 'user',
      'valueTypes': ['~', '_'],
      'childLabels': [],
    },
    'profile': {
      'label': 'profile',
      'valueTypes': ['id'],
      'childLabels': [],
    },
  },
};
```

## Typical Usage

```dart
final parser = BeamingYggdrasilKeyParser(schema: exampleSchema);

final result = parser.parse(
  'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:text:_',
);

if (result.ok) {
  final parsed = result.value;

  print(parsed.canonical);
  print(parsed.anchor.label);
  print(parsed.terminalKind);
  print(parsed.kindPath);
}
```

Expected parsed view:

```dart
{
  'canonical': 'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:text:_',
  'kindPath': ['tenant', 'group', 'dashboard', 'note', 'text'],
  'scope': [
    {'label': 'tenant', 'value': 'a8f3a1c2'},
    {'label': 'group', 'value': 'b4b7d9e1'},
  ],
  'anchor': {'label': 'dashboard', 'value': 'd1e52f07'},
  'path': [
    {'label': 'note', 'value': 'c7c401c2'},
    {'label': 'text', 'value': '_'},
  ],
  'terminalKind': 'text',
}
```

## Navigation Examples

```dart
final key =
    'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:text:_';

final parent = parser.parentOf(key);
final ancestors = parser.ancestorsOf(key);
final isAnchor = parser.isAnchorKey(
  'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07',
);
```

Typical results:

```dart
parent ==
    'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2'

ancestors == [
  'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2',
  'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07',
]

isAnchor == true
```

## Relationship Queries

You can also ask whether one key is below another anchor and filter descendants from a collection.

```dart
final anchor = 'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07';

final keys = [
  'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07',
  'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2',
  'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:text:_',
  'department:d1:team:a1:profile:b1',
];

final directOrNested = parser.descendantsOf(anchor, keys);
final directOnly = parser.descendantsOf(anchor, keys, query: {
  'maxDepth': 1,
});
```

## Split And Combine

For algorithms that work better on arrays than strings, keys can be split into parallel labels and values.

```dart
final split = parser.splitKey(
  'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07',
);

print(split.labels); // ['tenant', 'group', 'dashboard']
print(split.values); // ['a8f3a1c2', 'b4b7d9e1', 'd1e52f07']

final rebuilt = parser.combineKey(split.labels, split.values);
```

This is useful when you need to:

- compare label paths independently from values
- batch-process many keys
- transform selected values while preserving canonical serialization

## Validation Behavior

The library is intended to reject malformed or unsupported keys deterministically. Examples of invalid input include:

- empty keys
- incomplete `label:value` pairs
- unsupported labels
- invalid child transitions
- children under terminal labels
- identifier values that do not satisfy schema rules
- reserved-value misuse such as missing `_` or invalid use of `~`

Canonical serialization always emits explicit `label:value` pairs.

## When To Use This Library

This package is a good fit when your application needs lightweight key utilities without pulling in broader infrastructure concerns.

Use it when you want:

- one focused place for key parsing and validation
- path-like navigation over structured keys
- stable canonical strings for persistence and comparison
- schema-configurable validation instead of hardcoded key grammar

It intentionally stays out of:

- authorization decisions
- application-specific business meaning
- storage or synchronization logic
- workflow orchestration around keys
