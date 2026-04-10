# beaming_yggdrasil_key Design

Dart key utility spec for parsing, navigation, and relationship checks on Yggdrasil-style keys.

## 01 Overview

Purpose, scope, and intended lightweight usage.

### 01 Purpose and Scope

Repository target, library goal, and the narrow responsibilities of a key utility package.

#### Design Ownership

| area | should_not_own | should_own |
| --- | --- | --- |
| parsing | application workflow orchestration | keyId parsing |
| validation | authorization or policy decisions | key validation |
| navigation | data fetching or indexing | parent ancestor and descendant helpers |
| structured-data | domain-specific business rules unrelated to keys | structured key segments |
| serialization | storage engines or sync logic | canonical serialization helpers |

#### Library Goals

| goal | why_it_matters |
| --- | --- |
| model Yggdrasil logical keys in Dart | gives applications a structured alternative to ad hoc string handling |
| parse and validate supported keyId shapes | lets client code reject malformed keys deterministically |
| behave like an advanced path utility for keys | makes parent ancestor and descendant operations available from one focused package |
| stay lightweight to import and understand | keeps the package easy to adopt without bringing in unrelated concerns |

#### Explicit Non-Goals

| non_goal | why_out_of_scope |
| --- | --- |
| make product-level decisions from keys alone | key interpretation beyond structural helpers belongs in higher-level application logic |
| perform access-control decisions | authorization policy should stay outside the key utility package |
| embed storage or synchronization behavior | the package should stay focused on parsing and key relationship operations |
| force every future product to use one serialized key format | the library should stay narrow to supported shapes and evolve deliberately |

#### Main Responsibilities

| outcome | responsibility |
| --- | --- |
| produce structured Dart values from supported keys | parse supported keyId strings |
| return stable validation failures for tests and diagnostics | reject malformed or unsupported key shapes |
| provide equal-length schema-side and value-side arrays for algorithms and transformations | split canonical keys into label and value parts |
| allow callers to combine validated labels and values back into stable key strings | rebuild canonical keys from split parts |
| provide root path terminal kind and hierarchy data derived from labels and segment position | expose derived fields |
| support operations such as parent ancestor chain and root checks on strings and ParsedKey values | provide upward traversal helpers |
| support descendant checks across candidate keys with optional depth limits on strings and ParsedKey values | provide downward relationship helpers |
| keep persisted and compared key strings stable | serialize parsed keys back to canonical form |

### 02 Product Shape

Main capability areas and preferred API direction.

#### Practical API Direction

| api_area | preferred_direction |
| --- | --- |
| parsed-key-types | prefer immutable parsed key types |
| segment-model | represent segments minimally as label plus value and keep semantic interpretation in derived helpers |
| schema-input | accept a schema that defines allowed labels value types child labels and terminal behavior |
| schema-config | keep max depth min and max id length plus explicit id character policy in schema config rather than parser constants |
| repetition-model | derive repeatability from whether a label appears in its own childLabels set instead of storing a separate flag |
| parsing-entrypoints | provide parsing and validation entrypoints that traverse schema data rather than hardcoded grammar logic |
| split-combine-helpers | provide explicit helpers to split keys into label and value arrays and combine them back for single keys and batches |
| parsed-key-operations | provide navigation helpers that operate directly on ParsedKey values |
| navigation-helpers | expose helpers for parent root ancestor and hierarchy inspection |
| relationship-helpers | include helpers such as isDescendantOf and descendant filtering across candidate keys |
| collection-helpers | support utility operations over lists of keys including optional inclusion of the root key maximum depth and split batch processing |
| error-model | prefer stable error types or explicit parse-result objects |
| scope-control | avoid reproducing every possible future key grammar in parser code and let schema configuration carry grammar variation |
| package-boundary | avoid combining key utilities with unrelated application infrastructure |

#### Package Boundary

| boundary_point | expected_direction |
| --- | --- |
| plain string usage | applications should still be free to keep raw key strings where richer helpers are unnecessary |
| applications needing richer key tooling | should opt into beaming_yggdrasil_key explicitly |
| relationship between raw strings and parsed keys | should remain explicit rather than hidden behind implicit conversions |
| dependency direction | packages can depend on beaming_yggdrasil_key when they want path-like key utilities without pulling broader concerns |

#### Schema Model

```ts
export type SchemaValueType = 'id' | '_' | '~';

export type KeySchemaConfig = {
  maxDepth: number;
  minIdChars: number;
  maxIdChars: number;
  allowAsciiLetters: boolean;
  allowDigits: boolean;
  extraIdChars: string[];
};

export type KeySchemaNode = {
  label: string;
  valueTypes: SchemaValueType[];
  childLabels: string[];
  terminal?: boolean;
};

export type KeySchema = {
  config: KeySchemaConfig;
  rootLabels: string[];
  nodesByLabel: Record<string, KeySchemaNode>;
};

export const exampleSchema: KeySchema = {
  config: {
    maxDepth: 8,
    minIdChars: 1,
    maxIdChars: 64,
    allowAsciiLetters: true,
    allowDigits: true,
    extraIdChars: ['.', '_', '-'],
  },
  rootLabels: ['dashboard', 'profile'],
  nodesByLabel: {
    tenant: { label: 'tenant', valueTypes: ['id'], childLabels: ['group', 'team', 'region', 'dashboard', 'profile'] },
    group: { label: 'group', valueTypes: ['id'], childLabels: ['dashboard', 'profile'] },
    dashboard: { label: 'dashboard', valueTypes: ['id'], childLabels: ['note', 'language', 'thumbnail', 'like', 'user'] },
    note: { label: 'note', valueTypes: ['id'], childLabels: ['text', 'language', 'thumbnail', 'like'] },
    like: { label: 'like', valueTypes: ['_'], childLabels: ['count', 'user', 'member', 'subscriber'] },
    text: { label: 'text', valueTypes: ['_'], childLabels: [], terminal: true },
    count: { label: 'count', valueTypes: ['_'], childLabels: [], terminal: true },
    language: { label: 'language', valueTypes: ['_'], childLabels: [], terminal: true },
    thumbnail: { label: 'thumbnail', valueTypes: ['_'], childLabels: [], terminal: true },
    user: { label: 'user', valueTypes: ['id', '~', '_'], childLabels: [] },
    member: { label: 'member', valueTypes: ['id', '_'], childLabels: [] },
    subscriber: { label: 'subscriber', valueTypes: ['id', '_'], childLabels: [] },
    profile: { label: 'profile', valueTypes: ['id'], childLabels: [] },
  },
};
```

#### Library Scope

| area | in_scope | out_of_scope |
| --- | --- | --- |
| key-parser | schema-driven parsing of supported keyId grammar for current Yggdrasil examples | hardcoded path ordering or child rules inside parser code |
| schema-definition | normalized schema map keyed by label with child and value constraints plus schema config for depth and identifier validation | ad hoc grammar branches spread across parser implementation |
| derived-fields | root path principal scope hierarchy and terminal kind derived from labels and schema position | application-specific meaning inferred from key kinds |
| navigation-helpers | parent root and ancestor helpers over one key string or ParsedKey | resource loading or tree persistence |
| relationship-helpers | descendant checks descendant filtering canonical equality and same-root checks on strings or ParsedKey values | access policy evaluation |
| validation | stable parse failures for malformed key strings including depth and identifier min max and character policy failures | UI form frameworks or remote validation protocols |
| serialization | canonical keyId round-trip helpers | local database sync engine |

#### Use Cases

| minimum_library_support | priority | usecase | why_it_matters |
| --- | --- | --- | --- |
| parse into structured segments while traversing schema node definitions | 1 | parse supported keyIds with a schema | lets Dart code validate grammar without hardcoding path rules |
| return equal-length labels and values arrays for one key | 2 | split a key into schema and value arrays | lets algorithms work on labels and values separately without reparsing |
| return parallel label and value arrays for each key in a batch | 3 | split a list of keys into schema and value arrays | lets batch algorithms reuse tokenized structure across many keys |
| combine equal-length label and value arrays back into canonical keys | 4 | rebuild keys from split parts | lets callers transform or compare separated parts and then recover canonical strings |
| provide parent and isRoot helpers for string inputs after schema validation | 5 | get the parent or root of a key string | lets app code navigate raw keys like paths |
| provide ParsedKey-based parent and ancestor helpers | 6 | get parent or ancestors from a parsed key | lets app code avoid re-parsing when a ParsedKey is already available |
| provide descendant filtering with include-self and max-depth options for strings and ParsedKey values | 7 | check descendant relationships within a list of keys | lets app code find related keys without building custom traversal code |
| accept a normalized schema map keyed by label with explicit config | 8 | configure grammar through schema data | lets the package adapt to allowed labels child ordering value rules and validation limits without parser rewrites |
| validate max depth in segment units plus id min length max length and explicit character policy from schema config | 9 | enforce bounded depth and identifier constraints | lets applications reject pathological or malformed keys consistently |
| serialize parsed key back to canonical keyId | 10 | keep canonical string form | lets app code compare and persist keys consistently |

## 02 Parsing Contract

Supported key grammar and acceptance boundaries.

### 01 Parsing Rules

Current supported key parsing rules.

#### Key Parsing Rules

| notes | rule | topic |
| --- | --- | --- |
| empty keyId is invalid and token count must be even | split keyId by colon into label value pairs | tokenization |
| this removes ambiguity from bare labels | every segment must use the form label:value | uniform-segments |
| all other values are opaque identifiers | underscore means intrinsic and tilde means contextual self reference | reserved-values |
| semantic interpretation comes from labels and position instead of a duplicated segment kind field | each label:value pair is one atomic segment | segment-model |
| path ordering and child rules are declarative rather than hardcoded | the parser must validate by traversing a schema from parent label to allowed child labels | schema-driven-validation |
| this keeps grammar logic in data instead of parser branches | each schema node defines allowed value types child labels and whether the node is terminal | schema-node-rules |
| no separate repeatability flag is required | a label is repeatable only when it appears in its own childLabels set | repetition-rules |
| the parser counts label:value pairs rather than raw colon-delimited tokens | maximum depth is defined in schema config in segment units | depth-limits |
| this applies only to id values and not to reserved values underscore or tilde | identifier values must satisfy schema-level minimum length maximum length and allowed character policy | id-constraints |
| this avoids regex-based policy evaluation | identifier character validation should use direct code-unit checks against configured ASCII categories and explicit extra characters | id-char-checks |
| no hardcoded terminal label checks are required in parser code | terminal nodes are determined by schema and must reject children | terminal-segments |
| the serializer does not need shape-specific exceptions | canonical serialization always emits explicit label:value pairs | canonicalization |

### 02 Acceptance Examples

Key examples that should parse successfully.

#### Key Acceptance Examples

| expected_root | expected_terminal_kind | key_id | notes |
| --- | --- | --- | --- |
| dashboard | dashboard | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07 | root key |
| dashboard | text | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:note:n7c401c2:text:_ | note text leaf with explicit intrinsic value |
| dashboard | count | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:note:n7c401c2:like:_:count:_ | derived count leaf with explicit intrinsic segments |
| dashboard | thumbnail | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:note:n7c401c2:thumbnail:_ | thumbnail intrinsic leaf |
| dashboard | language | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:note:n7c401c2:language:_ | language intrinsic leaf |
| dashboard | dashboard | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:user:~ | contextual self principal using reserved tilde |
| profile | profile | department:d1:team:t1:profile:p1 | alternate supported scope and root labels |

### 03 Rejection Examples

Key examples that should fail deterministically.

#### Key Rejection Examples

| expected_error_reason | key_id |
| --- | --- |
| invalid key: empty key |  |
| invalid key: incomplete key | tenant |
| invalid key because root id is missing | tenant:t8f3a1c2:dashboard |
| invalid key because every segment must include label and value | tenant:t8f3a1c2:group |
| invalid key because intrinsic terminal segments must use explicit underscore value | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:note:n7c401c2:text |
| invalid key: unsupported label "missing" | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:missing:n1:text |
| invalid key because underscore alias must follow an explicit allowed label | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:_ |
| invalid key because terminal segment cannot have children | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:text:_:child:c1 |
| invalid key because principal labels are not allowed in that position | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:user:u1 |
| invalid key because like principal must use reserved intrinsic or contextual values | tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:like:_:user:u1 |

## 03 Derived Data

Fields and helpers built from parsed keys.

### 01 Derived Fields

Structured and derived values exposed by the parser.

#### Common Key Types

```ts
export type Segment = {
  label: string;
  value: string;
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

export type SplitKey = {
  labels: string[];
  values: string[];
};

export type SplitKeyBatch = {
  labelsByKey: string[][];
  valuesByKey: string[][];
};

export type DescendantQuery = {
  includeSelf?: boolean;
  maxDepth?: number;
};

export type SchemaValueType = 'id' | '_' | '~';

export type KeySchemaConfig = {
  maxDepth: number;
  minIdChars: number;
  maxIdChars: number;
  allowAsciiLetters: boolean;
  allowDigits: boolean;
  extraIdChars: string[];
};

export type KeySchemaNode = {
  label: string;
  valueTypes: SchemaValueType[];
  childLabels: string[];
  terminal?: boolean;
};

export type KeySchema = {
  config: KeySchemaConfig;
  rootLabels: string[];
  nodesByLabel: Record<string, KeySchemaNode>;
};

export interface ParsedKeyNavigator {
  isRoot(parsed: ParsedKey): boolean;
  parentOf(parsed: ParsedKey): ParsedKey | null;
  ancestorsOf(parsed: ParsedKey): ParsedKey[];
  isDescendantOf(root: ParsedKey, candidate: ParsedKey): boolean;
  descendantsOf(root: ParsedKey, candidateKeys: ParsedKey[], query?: DescendantQuery): ParsedKey[];
}

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
| canonical | the canonical keyId string representation using explicit label:value pairs | original validated token sequence after deterministic serialization |
| scope | structured scope segments | leading id segments before principal or root |
| principal | optional structured principal segment | optional user member or subscriber segment |
| root | required structured root segment | first supported root label and id |
| path | structured descendant segments after root | remaining validated labels and ids |
| parent_key | canonical key of the immediate parent when one exists | derived by removing the final effective segment from a parsed key |
| ancestor_keys | ordered canonical keys from closest parent up to the root | derived by repeated parent traversal |
| kind_path | label-only view of scope principal root and path | derived by reading each segment label in order after schema validation |
| terminal_kind | the last effective kind for the key | derived from the label of the final validated path segment or from the root label when no path exists |
| derived_kind_hierarchy | root plus path labels | derived from labels segment position and schema-validated path structure |

### 02 Parser API

API-shape examples for the Dart package.

#### Parser API Example Shapes

```ts
import type { DescendantQuery, DerivedKind, KeySchema, ParsedKey, ParsedKeyNavigator, SplitKey, SplitKeyBatch } from './common';

export type ParseResult =
  | { ok: true; value: ParsedKey }
  | { ok: false; message: string };

export interface BeamingYggdrasilKeyParser {
  schema: KeySchema;
  parse(keyId: string): ParseResult;
  mustParse(keyId: string): ParsedKey;
  isValid(keyId: string): boolean;
  splitKey(keyId: string): SplitKey;
  splitKeys(keyIds: string[]): SplitKeyBatch;
  combineKey(labels: string[], values: string[]): string;
  combineKeys(labelsByKey: string[][], valuesByKey: string[][]): string[];
  parentOf(keyId: string): string | null;
  ancestorsOf(keyId: string): string[];
  isRoot(keyId: string): boolean;
  isDescendantOf(rootKeyId: string, candidateKeyId: string): boolean;
  descendantsOf(rootKeyId: string, candidateKeyIds: string[], query?: DescendantQuery): string[];
  deriveKind(parsed: ParsedKey): DerivedKind;
  toCanonicalString(parsed: ParsedKey): string;
}

export interface BeamingYggdrasilParsedKeyOps extends ParsedKeyNavigator {}

// Dart translation guidance:
// - prefer explicit result types over throwing for ordinary validation failures
// - keep error messages stable enough for tests and diagnostics
// - keep the package lightweight, closer to a path utility than a framework
// - parsed-key helpers should work directly on ParsedKey values without forcing a string round trip
// - canonical string form should always use explicit label:value pairs
// - semantic helpers such as terminalKind and kindPath should be derived from labels and position, not stored redundantly on each segment
// - structure validation should traverse the schema instead of hardcoding allowed label order in parser code
// - schema config should define max depth in segment units plus id minimum length maximum length and explicit character policy
// - repeatability should be derived from schema childLabels rather than a separate node flag
// - Dart identifier checks can use direct code-unit comparisons and a small extra-character whitelist instead of regex
// - split/combine helpers should expose labels and values as parallel arrays of equal size for single keys and batches
```

### 03 Performance API

Validation and scanning strategies for large key sets.

#### Performance API Example Shapes

```ts
import type { KeySchema, ParsedKey, SplitKey, SplitKeyBatch } from './common';

export interface ValidationStrategy {
  name: string;
  validate(keyId: string): boolean;
}

export interface SplitValidationStrategy {
  name: string;
  validate(split: SplitKey): boolean;
}

export interface BatchValidationResult {
  valid: string[];
  invalid: Array<{ keyId: string; message: string }>;
}

export interface KeySetQuery {
  includeSelf?: boolean;
  maxDepth?: number;
}

export interface BeamingYggdrasilKeyPerformanceApi {
  schema: KeySchema;

  // Default single-key fast path using the current preferred strategy.
  validateFast(keyId: string): boolean;

  // Validate many keys without forcing the same algorithm for all workloads.
  validateBatch(keyIds: string[]): BatchValidationResult;

  // Validate using already split schema-side and value-side arrays.
  validateSplit(split: SplitKey): boolean;
  validateSplitBatch(splitBatch: SplitKeyBatch): BatchValidationResult;

  // Split validated or candidate keys into parallel label and value arrays for algorithmic reuse.
  splitKeyFast(keyId: string): SplitKey;
  splitKeysFast(keyIds: string[]): SplitKeyBatch;

  // Rebuild canonical keys from already separated schema/value parts.
  combineKeyFast(labels: string[], values: string[]): string;
  combineKeysFast(labelsByKey: string[][], valuesByKey: string[][]): string[];

  // Allow the implementation to swap strategies as dataset size changes.
  withValidationStrategy(name: 'streaming' | 'token-array' | 'compiled-schema' | 'prefix-cached' | 'two-phase-batch'): BeamingYggdrasilKeyPerformanceApi;
  withSplitValidationStrategy(name: 'split-array-schema-walk' | 'compiled-split' | 'prefix-state-split' | 'two-phase-split'): BeamingYggdrasilKeyPerformanceApi;

  // Scan a large list and return validated direct or nested children.
  childrenOf(rootKeyId: string, candidateKeyIds: string[], query?: KeySetQuery): string[];

  // Parsed-key variant to avoid reparsing when callers already hold validated keys.
  childrenOfParsed(root: ParsedKey, candidateKeys: ParsedKey[], query?: KeySetQuery): ParsedKey[];
}

// Performance guidance:
// - keep label:value and even-token constraints because they enable cheap structural checks
// - avoid one function that reparses, revalidates, and rescans everything for every workload
// - pick validation and scan strategy based on key count and prefix sharing, not by one fixed algorithm
// - split label/value arrays can support additional algorithms without forcing full ParsedKey construction
// - split-key validation can bypass separator scanning and operate directly on segment-indexed arrays
```

#### Validation Strategies

| core_idea | strategy | tradeoff | when_to_use |
| --- | --- | --- | --- |
| scan code units once and validate alternating label:value pairs while traversing schema | streaming-validator | lowest abstraction and less reusable intermediate state | default single-key validation |
| split once and walk tokens two at a time for simple readable validation | token-array-validator | more allocations than a streaming path | reference implementation and moderate workloads |
| walk parallel labels and values arrays while checking schema child rules and value constraints | split-array-schema-walk | still pays repeated string lookups unless schema is compiled | default validation once a key is already split |
| convert labels to compact ids and validate with precomputed child and value tables | compiled-split-validator | adds compilation and translation cost | large batches of pre-split keys |
| reuse cached schema traversal state for validated label prefixes | prefix-state-split-validator | cache invalidation and memory use add complexity | many split keys sharing long prefixes |
| run cheap length and character checks before full schema traversal | two-phase-split-validator | duplicates part of the validation pipeline | large noisy batches of split keys |
| precompute label ids child lookups and value rules to reduce repeated map and string work | compiled-schema-validator | adds setup cost and more internal machinery | large batches of keys |
| reuse validated prefix states so related keys do not restart schema traversal from the root | prefix-cached-validator | cache management adds memory overhead | many keys sharing common prefixes |
| run cheap structural checks before full schema traversal to reject bad keys early | two-phase-batch-validator | duplicates part of validation logic across phases | large noisy input sets |
| compare validated segment prefixes instead of reparsing full candidates every time | prefix-scan-children | may still be linear without a dedicated index | find children or descendants by scanning many keys |
| build an index keyed by canonical parent or validated prefix for faster repeated queries | indexed-children-lookup | index build and update cost may not pay off for small sets | repeated child retrieval over large stable sets |

