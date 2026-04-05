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
