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

#### Glossary

| meaning | term |
| --- | --- |
| canonical string representation of a key using explicit label:value pairs | keyId |
| one atomic label:value pair inside a key | segment |
| the schema-side name of a segment such as tenant dashboard note or user | label |
| the value-side content of a segment which is either an opaque id or a reserved sentinel | value |
| a special non-id segment value such as underscore for intrinsic or tilde for contextual self | reserved value |
| the declarative grammar definition used by the parser instead of hardcoded path rules | schema |
| the normalized schema map keyed by label that stores node definitions | nodesByLabel |
| a label listed in schema anchorLabels that may act as the parsed anchor of a key | anchor label |
| the first segment in a validated key whose label is in schema anchorLabels and which anchors navigation | anchor |
| validated segments before the anchor | scope |
| validated segments after the anchor | path |
| serialization of a validated key back into its stable explicit label:value form | canonicalization |
| the structured representation of a validated key with canonical kindPath scope anchor path and terminalKind | parsed key |
| a representation of a key as parallel labels and values arrays of equal length | split key |
| batch validation behavior such as stop-first or collect-invalids | validation mode |
| validation of the schema itself for referential integrity duplicates reachability cycles and risky shapes | schema validation |

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
| stop large validation runs on the first invalid key by default | support fail-fast batch validation |
| optionally report all invalid keys for debugging without burdening the fast path | support diagnostic invalid collection |
| provide anchor path terminal kind and hierarchy data derived from labels and segment position | expose derived fields |
| support operations such as parent ancestor chain and anchor checks on strings and ParsedKey values | provide upward traversal helpers |
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
| schema-graph | allow shared child definitions across parents but validate schema edges so loops are always rejected |
| schema-config | keep max depth min and max id length plus explicit id character policy in schema config rather than parser constants |
| schema-validation | validate schemas with explicit options for cycles undefined child links unreachable nodes and risky shapes before using them for parsing |
| repetition-model | derive repeatability from whether a label appears in its own childLabels set instead of storing a separate flag |
| parsing-entrypoints | provide parsing and validation entrypoints that traverse schema data rather than hardcoded grammar logic |
| split-combine-helpers | provide explicit helpers to split keys into label and value arrays and combine them back for single keys and batches |
| validation-mode | default batch validation to stop-first and make full invalid collection an explicit debugging mode |
| security-model | treat raw keys and externally supplied schemas as untrusted until validated and fail closed on corruption |
| parsed-key-operations | provide navigation helpers that operate directly on ParsedKey values |
| navigation-helpers | expose helpers for parent anchor ancestor and hierarchy inspection |
| relationship-helpers | include helpers such as isDescendantOf and descendant filtering across candidate keys |
| collection-helpers | support utility operations over lists of keys including optional inclusion of the anchor key maximum depth and split batch processing |
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

export type IdAlphabet =
  | 'lower-alpha'
  | 'alpha'
  | 'digit'
  | 'lower-alnum'
  | 'alnum'
  | 'lower-hex'
  | 'upper-hex'
  | 'hex';

export type KeySchemaConfig = {
  maxDepth: number;
  minIdChars: number;
  maxIdChars: number;
  idAlphabet: IdAlphabet;
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
  anchorLabels: string[];
  nodesByLabel: Record<string, KeySchemaNode>;
};

export const exampleSchema: KeySchema = {
  config: {
    maxDepth: 8,
    minIdChars: 1,
    maxIdChars: 64,
    idAlphabet: 'lower-hex',
    extraIdChars: ['-'],
  },
  anchorLabels: ['dashboard', 'profile'],
  nodesByLabel: {
    tenant: { label: 'tenant', valueTypes: ['id'], childLabels: ['group', 'department', 'region', 'dashboard', 'profile'] },
    group: { label: 'group', valueTypes: ['id'], childLabels: ['dashboard', 'profile'] },
    department: { label: 'department', valueTypes: ['id'], childLabels: ['team', 'profile'] },
    team: { label: 'team', valueTypes: ['id'], childLabels: ['dashboard', 'profile'] },
    region: { label: 'region', valueTypes: ['id'], childLabels: ['dashboard', 'profile'] },
    dashboard: { label: 'dashboard', valueTypes: ['id'], childLabels: ['note', 'language', 'thumbnail', 'like', 'user'] },
    note: { label: 'note', valueTypes: ['id'], childLabels: ['text', 'language', 'thumbnail', 'like'] },
    like: { label: 'like', valueTypes: ['_'], childLabels: ['count', 'user', 'member', 'subscriber'] },
    text: { label: 'text', valueTypes: ['_'], childLabels: [], terminal: true },
    count: { label: 'count', valueTypes: ['_'], childLabels: [], terminal: true },
    language: { label: 'language', valueTypes: ['_'], childLabels: [], terminal: true },
    thumbnail: { label: 'thumbnail', valueTypes: ['_'], childLabels: [], terminal: true },
    user: { label: 'user', valueTypes: ['~', '_'], childLabels: [] },
    member: { label: 'member', valueTypes: ['id', '_'], childLabels: [] },
    subscriber: { label: 'subscriber', valueTypes: ['id', '_'], childLabels: [] },
    profile: { label: 'profile', valueTypes: ['id'], childLabels: [] },
  },
};
```

#### Schema Model Decision Summary

| alternative | rank | scenario | score |
| --- | --- | --- | --- |
| normalized_map | 1 | baseline | 0.907606 |
| adjacency_list | 2 | baseline | 0.092394 |
| normalized_map | 1 | overall | 0.907606 |
| adjacency_list | 2 | overall | 0.092394 |

#### Schema Validation

```ts
import type { KeySchema, SchemaValidationIssue, SchemaValidationOptions, SchemaValidationResult } from './common';

export interface BeamingYggdrasilSchemaValidator {
  validateSchema(schema: KeySchema, options?: SchemaValidationOptions): SchemaValidationResult;
}

export const schemaValidationChecks = [
  'anchorLabels should not be empty',
  'anchorLabels must exist in nodesByLabel',
  'anchorLabels should not contain duplicates',
  'each nodesByLabel key should match the node label field',
  'every child label must reference an existing node',
  'childLabels should not contain duplicates within the same node',
  'shared descendants are allowed, so the schema may be a DAG',
  'cycles must be reported as errors, including self-loops and longer loops',
  'terminal nodes should not declare childLabels',
  'unreachable nodes should be reported at least as warnings',
  'risky shapes such as very broad fan-out or excessive configured depth may be warnings in tolerant mode',
];

export const schemaValidationAlgorithms = [
  'referential-integrity pass: verify every anchorLabels entry and every childLabels entry points to a defined node',
  'node-identity pass: verify each nodesByLabel map key matches the embedded node label',
  'duplicate-entry pass: detect repeated anchorLabels and repeated childLabels within a node before traversal begins',
  'reachability pass: traverse from anchorLabels and warn for any node never reached',
  'cycle-detection pass: run DFS with visiting and visited states so DAG reuse is accepted but loops are rejected',
  'shape-risk pass: emit warnings for unusual fan-out anchor count or reachable-node volume based on configured thresholds',
];

export const exampleIssues: SchemaValidationIssue[] = [
  {
    severity: 'error',
    code: 'schema.cycle',
    message: 'Cycle detected: dashboard -> note -> dashboard',
    path: ['dashboard', 'note', 'dashboard'],
  },
  {
    severity: 'error',
    code: 'schema.undefined_child',
    message: 'Node like references undefined child label reaction',
    label: 'like',
  },
  {
    severity: 'warning',
    code: 'schema.unreachable',
    message: 'Node audit is not reachable from any configured anchor label',
    label: 'audit',
  },
  {
    severity: 'warning',
    code: 'schema.excessive_fan_out',
    message: 'Node dashboard declares 48 child labels which exceeds the warning threshold',
    label: 'dashboard',
  },
  {
    severity: 'error',
    code: 'schema.duplicate_child',
    message: 'Node dashboard declares child label note more than once',
    label: 'dashboard',
  },
  {
    severity: 'error',
    code: 'schema.label_mismatch',
    message: 'Schema entry keyed by dashboard embeds node label dashbord',
    label: 'dashboard',
  },
];

// Validation guidance:
// - strict mode should fail when any error is present
// - tolerant mode may return warnings for risky but still parseable shapes
// - schema validation should happen before parser construction or before accepting an externally supplied schema
// - structural errors must stay errors in every mode; tolerant mode only relaxes risky-shape reporting
```

#### Library Scope

| area | in_scope | out_of_scope |
| --- | --- | --- |
| key-parser | schema-driven parsing of supported keyId grammar for current Yggdrasil examples | hardcoded path ordering or child rules inside parser code |
| schema-definition | normalized schema map keyed by label with child and value constraints plus schema config for depth and identifier validation | ad hoc grammar branches spread across parser implementation |
| schema-validation | cycle checks broken child reference checks unreachable-node checks and risky-shape warnings | trusting unvalidated schema input in security-sensitive paths |
| schema-safety | allow DAG-style schema reuse but reject loops and incompatible terminal-child declarations | treating every graph shape as equally safe |
| derived-fields | anchor path scope hierarchy and terminal kind derived from labels and schema position | application-specific meaning inferred from key kinds |
| navigation-helpers | parent anchor and ancestor helpers over one key string or ParsedKey | resource loading or tree persistence |
| relationship-helpers | descendant checks and descendant filtering on strings or ParsedKey values | access policy evaluation |
| validation | stable parse failures for malformed key strings including depth and identifier min max and character policy failures | UI form frameworks or remote validation protocols |
| security | bounded validation and traversal rules for corrupted keys and untrusted schema input | turning the package into a general sandbox or policy engine |
| serialization | canonical keyId round-trip helpers | local database sync engine |

#### Use Cases

| minimum_library_support | priority | usecase | why_it_matters |
| --- | --- | --- | --- |
| report cycles broken child links unreachable labels and risky shapes with severity | 1 | validate schemas before use | lets applications reject or warn on dangerous grammar definitions before parsing starts |
| allow warnings for risky but still parseable models while still rejecting structural errors | 2 | validate externally supplied schema with warnings | lets applications screen config supplied schemas before enabling them at runtime |
| parse into structured segments while traversing schema node definitions | 3 | parse supported keyIds with a schema | lets Dart code validate grammar without hardcoding path rules |
| return equal-length labels and values arrays for one key | 4 | split a key into schema and value arrays | lets algorithms work on labels and values separately without reparsing |
| return parallel label and value arrays for each key in a batch | 5 | split a list of keys into schema and value arrays | lets batch algorithms reuse tokenized structure across many keys |
| combine equal-length label and value arrays back into canonical keys | 6 | rebuild keys from split parts | lets callers transform or compare separated parts and then recover canonical strings |
| provide parent and isAnchor helpers for string inputs after schema validation | 7 | get the parent or anchor status of a key string | lets app code navigate raw keys like paths |
| provide ParsedKey-based parent and ancestor helpers | 8 | get parent or ancestors from a parsed key | lets app code avoid re-parsing when a ParsedKey is already available |
| provide descendant filtering with include-self and max-depth options for strings and ParsedKey values | 9 | check descendant relationships within a list of keys | lets app code find related keys without building custom traversal code |
| accept a normalized schema map keyed by label with explicit config | 10 | configure grammar through schema data | lets the package adapt to allowed labels child ordering value rules and validation limits without parser rewrites |
| validate max depth in segment units plus id min length max length and explicit character policy from schema config | 11 | enforce bounded depth and identifier constraints | lets applications reject pathological or malformed keys consistently |
| provide stop-first as the default validation mode | 12 | stop batch validation on first failure by default | lets large validation runs abort quickly when the input set is already known to be bad |
| provide an explicit collect-invalids mode without changing the fast default | 13 | collect all invalid keys when debugging | lets developers inspect the full set of failures when needed |
| avoid partial parse helpers and use bounded validation and traversal | 14 | fail safely on corrupted keys | lets applications reject corrupted or attacker-shaped input without poisoning derived results |
| serialize parsed key back to canonical keyId | 15 | keep canonical string form | lets app code compare and persist keys consistently |

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
| cycles must still be rejected during schema validation | the schema may be a DAG because different parents may reference the same child label | schema-graph-shape |
| no separate repeatability flag is required | a label is repeatable only when it appears in its own childLabels set | repetition-rules |
| the parser counts label:value pairs rather than raw colon-delimited tokens | maximum depth is defined in schema config in segment units | depth-limits |
| this applies only to id values and not to labels or reserved values underscore or tilde | identifier values must satisfy schema-level minimum length maximum length and identifier alphabet policy | id-constraints |
| this avoids regex-based policy evaluation and supports common forms such as lowercase hexadecimal UUID values | identifier character validation should use direct code-unit checks against the configured idAlphabet preset and explicit extra characters | id-char-checks |
| labels are schema tokens and should use a tighter parser-defined rule than the configurable identifier alphabet | schema labels are validated independently from id values | label-validation |
| no hardcoded terminal label checks are required in parser code | terminal nodes are determined by schema and must reject children | terminal-segments |
| the serializer does not need shape-specific exceptions | canonical serialization always emits explicit label:value pairs | canonicalization |

### 02 Acceptance Examples

Key examples that should parse successfully.

#### Key Acceptance Examples

| expected_anchor | expected_terminal_kind | key_id | notes |
| --- | --- | --- | --- |
| dashboard | dashboard | tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07 | anchor key |
| dashboard | text | tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:text:_ | note text leaf with explicit intrinsic value |
| dashboard | count | tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:like:_:count:_ | derived count leaf with explicit intrinsic segments |
| dashboard | thumbnail | tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:thumbnail:_ | thumbnail intrinsic leaf |
| dashboard | language | tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:language:_ | language intrinsic leaf |
| dashboard | user | tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:user:~ | contextual self segment using reserved tilde |
| profile | profile | department:d1:team:a1:profile:b1 | alternate supported scope and anchor labels |

### 03 Rejection Examples

Key examples that should fail deterministically.

#### Key Rejection Examples

| expected_error_reason | key_id |
| --- | --- |
| invalid key: empty key |  |
| invalid key: incomplete key | tenant |
| invalid key because anchor id is missing | tenant:a8f3a1c2:dashboard |
| invalid key because every segment must include label and value | tenant:a8f3a1c2:group |
| invalid key because intrinsic terminal segments must use explicit underscore value | tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:text |
| invalid key: unsupported label "missing" | tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:missing:a1:text |
| invalid key because underscore alias must follow an explicit allowed label | tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:_ |
| invalid key because terminal segment cannot have children | tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:text:_:child:c1 |
| invalid key because user only allows reserved contextual or intrinsic values in that position | tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:user:a1 |
| invalid key because user only allows reserved contextual or intrinsic values under like | tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:like:_:user:a1 |

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
  anchor: Segment;
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

export type ValidationMode = 'stop-first' | 'collect-invalids';

export type DescendantQuery = {
  includeSelf?: boolean;
  maxDepth?: number;
};

export type SchemaValueType = 'id' | '_' | '~';

export type IdAlphabet =
  | 'lower-alpha'
  | 'alpha'
  | 'digit'
  | 'lower-alnum'
  | 'alnum'
  | 'lower-hex'
  | 'upper-hex'
  | 'hex';

export type KeySchemaConfig = {
  maxDepth: number;
  minIdChars: number;
  maxIdChars: number;
  idAlphabet: IdAlphabet;
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
  anchorLabels: string[];
  nodesByLabel: Record<string, KeySchemaNode>;
};

export type SchemaValidationSeverity = 'error' | 'warning';

export type SchemaValidationMode = 'strict' | 'tolerant';

export interface SchemaValidationOptions {
  mode?: SchemaValidationMode;
  maxChildLabelsWarning?: number;
  maxAnchorLabelsWarning?: number;
  maxReachableNodesWarning?: number;
}

export interface SchemaValidationIssue {
  severity: SchemaValidationSeverity;
  code: string;
  message: string;
  label?: string;
  path?: string[];
}

export interface SchemaValidationResult {
  ok: boolean;
  issues: SchemaValidationIssue[];
}

export interface ParsedKeyNavigator {
  isAnchor(parsed: ParsedKey): boolean;
  parentOf(parsed: ParsedKey): ParsedKey | null;
  ancestorsOf(parsed: ParsedKey): ParsedKey[];
  isDescendantOf(anchor: ParsedKey, candidate: ParsedKey): boolean;
  descendantsOf(anchor: ParsedKey, candidateKeys: ParsedKey[], query?: DescendantQuery): ParsedKey[];
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
| scope | structured scope segments | leading id segments before the anchor, all validated segments before the first schema anchor label |
| anchor | required structured anchor segment | first supported anchor label and id that anchors navigation within the key |
| path | structured descendant segments after the anchor | remaining validated labels and ids after the anchored segment |
| parent_key | canonical key of the immediate validated ancestor when one exists | derived by removing the final descendant segment and returning null when the key is already at anchor depth |
| ancestor_keys | ordered canonical keys from closest validated ancestor back to the anchor root | derived by repeated parent traversal without producing scope-only non-key strings |
| kind_path | label-only view of scope anchor and path | derived by reading each segment label in order after schema validation |
| terminal_kind | the last effective kind for the key | derived from the label of the final validated path segment or from the anchor label when no path exists |
| derived_kind_hierarchy | anchor plus path labels | derived from labels segment position and schema-validated path structure |

#### ParsedKey Examples

```ts
import type { ParsedKey } from './common';

export const dashboardRootKey = 'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07';

export const dashboardRootParsed: ParsedKey = {
  canonical: dashboardRootKey,
  kindPath: ['tenant', 'group', 'dashboard'],
  scope: [
    { label: 'tenant', value: 'a8f3a1c2' },
    { label: 'group', value: 'b4b7d9e1' },
  ],
  anchor: { label: 'dashboard', value: 'd1e52f07' },
  path: [],
  terminalKind: 'dashboard',
};

export const noteTextLeafKey = 'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:text:_';

export const noteTextLeafParsed: ParsedKey = {
  canonical: noteTextLeafKey,
  kindPath: ['tenant', 'group', 'dashboard', 'note', 'text'],
  scope: [
    { label: 'tenant', value: 'a8f3a1c2' },
    { label: 'group', value: 'b4b7d9e1' },
  ],
  anchor: { label: 'dashboard', value: 'd1e52f07' },
  path: [
    { label: 'note', value: 'c7c401c2' },
    { label: 'text', value: '_' },
  ],
  terminalKind: 'text',
};

export const contextualUserKey = 'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:user:~';

export const contextualUserParsed: ParsedKey = {
  canonical: contextualUserKey,
  kindPath: ['tenant', 'group', 'dashboard', 'user'],
  scope: [
    { label: 'tenant', value: 'a8f3a1c2' },
    { label: 'group', value: 'b4b7d9e1' },
  ],
  anchor: { label: 'dashboard', value: 'd1e52f07' },
  path: [
    { label: 'user', value: '~' },
  ],
  terminalKind: 'user',
};

export const profileRootKey = 'department:d1:team:a1:profile:b1';

export const profileRootParsed: ParsedKey = {
  canonical: profileRootKey,
  kindPath: ['department', 'team', 'profile'],
  scope: [
    { label: 'department', value: 'd1' },
    { label: 'team', value: 'a1' },
  ],
  anchor: { label: 'profile', value: 'b1' },
  path: [],
  terminalKind: 'profile',
};

// ParsedKey shape guidance:
// - scope contains validated segments before the first schema anchor label
// - anchor is that first schema anchor-labeled segment and acts as the navigation anchor
// - path contains validated descendant segments after the anchor
```

### 02 Parser API

API-shape examples for the Dart package.

#### Parser API Example Shapes

```ts
import type { DescendantQuery, DerivedKind, KeySchema, ParsedKey, ParsedKeyNavigator, SchemaValidationOptions, SchemaValidationResult, SplitKey, SplitKeyBatch, ValidationMode } from './common';

export type ParseResult =
  | { ok: true; value: ParsedKey }
  | { ok: false; message: string };

export interface BeamingYggdrasilKeyParser {
  schema: KeySchema;
  validateSchema(schema: KeySchema, options?: SchemaValidationOptions): SchemaValidationResult;
  parse(keyId: string): ParseResult;
  mustParse(keyId: string): ParsedKey;
  isValid(keyId: string): boolean;
  validationMode?: ValidationMode;
  splitKey(keyId: string): SplitKey;
  splitKeys(keyIds: string[]): SplitKeyBatch;
  combineKey(labels: string[], values: string[]): string;
  combineKeys(labelsByKey: string[][], valuesByKey: string[][]): string[];
  // Returns null when the validated key is already at anchor depth.
  parentOf(keyId: string): string | null;
  // Ordered from the closest validated ancestor back to the anchor root.
  ancestorsOf(keyId: string): string[];
  isAnchor(keyId: string): boolean;
  isDescendantOf(anchorKeyId: string, candidateKeyId: string): boolean;
  descendantsOf(anchorKeyId: string, candidateKeyIds: string[], query?: DescendantQuery): string[];
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
// - ParsedKey should distinguish scope from anchor from path: scope is before the first schema anchor label, anchor is that first anchor-labeled segment, and path is everything after it
// - structure validation should traverse the schema instead of hardcoding allowed label order in parser code
// - schema config should define max depth in segment units plus id minimum length maximum length and an idAlphabet preset
// - repeatability should be derived from schema childLabels rather than a separate node flag
// - identifier checks should map idAlphabet to direct code-unit predicates plus a small extra-character whitelist instead of regex
// - labels should be validated separately from id values because labels are schema tokens, not user-configured opaque identifiers
// - lowercase hexadecimal with dash should be a first-class implementation path because it matches common UUID-style identifiers
// - split/combine helpers should expose labels and values as parallel arrays of equal size for single keys and batches
// - batch validation should default to stop-first, with collect-invalids reserved for debugging workflows
// - schema validation should detect cycles broken child references unreachable nodes and risky shapes before key parsing begins
// - shared descendants are allowed so nodesByLabel may describe a DAG, but cycles must always be rejected
// - schema validation options should tune warning thresholds without weakening structural error checks
// - duplicate anchor labels or duplicate child labels should be rejected before any schema traversal begins
// - parent and ancestor helpers should operate only on validated ancestor keys and should return null instead of scope-only non-key prefixes when the input is already at anchor depth
// - treat raw keys as untrusted input until full validation succeeds and never expose derived navigation from partial parses
// - prefer bounded iterative traversal over recursive parsing or recursive relationship walks on attacker-controlled input
// - only cache validated results and keep caches bounded so hostile batches cannot cause unbounded memory growth
```

### 03 Performance API

Validation and scanning strategies for large key sets.

#### Performance API Example Shapes

```ts
import type { DescendantQuery, KeySchema, ParsedKey, SplitKey, SplitKeyBatch, ValidationMode } from './common';

export interface ValidationStrategy {
  name: string;
  validate(keyId: string): boolean;
}

export interface SplitValidationStrategy {
  name: string;
  validate(split: SplitKey): boolean;
}

export interface InvalidKeyRecord {
  keyId: string;
  message: string;
}

export interface BatchValidationResult {
  mode: ValidationMode;
  stoppedEarly: boolean;
  firstInvalid?: InvalidKeyRecord;
  invalids?: InvalidKeyRecord[];
}

export interface BeamingYggdrasilKeyPerformanceApi {
  schema: KeySchema;
  validationMode: ValidationMode;

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
  withSplitValidationStrategy(name: 'split-array-schema-walk' | 'deduplicated-split' | 'compiled-split' | 'prefix-state-split' | 'two-phase-split'): BeamingYggdrasilKeyPerformanceApi;
  withValidationMode(mode: ValidationMode): BeamingYggdrasilKeyPerformanceApi;

  // Scan a large list and return validated descendants. Use maxDepth: 1 for direct children only.
  descendantsOf(anchorKeyId: string, candidateKeyIds: string[], query?: DescendantQuery): string[];

  // Parsed-key variant to avoid reparsing when callers already hold validated keys.
  descendantsOfParsed(anchor: ParsedKey, candidateKeys: ParsedKey[], query?: DescendantQuery): ParsedKey[];
}

// Performance guidance:
// - keep label:value and even-token constraints because they enable cheap structural checks
// - avoid one function that reparses, revalidates, and rescans everything for every workload
// - pick validation and scan strategy based on key count and prefix sharing, not by one fixed algorithm
// - split label/value arrays can support additional algorithms without forcing full ParsedKey construction
// - split-key validation can bypass separator scanning and operate directly on segment-indexed arrays
// - compile idAlphabet presets to small branchy predicates instead of generic regex so hot-path id checks stay cheap
// - batch validation should stop at the first invalid key by default
// - collect-invalids mode is useful for debugging but should be treated as a slower diagnostic path
// - batch results should not echo the list of valid keys because callers already hold the input set
// - deduplicated split validation is useful when many identical keys appear in the same batch
```

#### Validation Strategies

| core_idea | strategy | tradeoff | when_to_use |
| --- | --- | --- | --- |
| scan code units once and validate alternating label:value pairs while traversing schema | streaming-validator | lowest abstraction and less reusable intermediate state | default single-key validation |
| split once and walk tokens two at a time for simple readable validation | token-array-validator | more allocations than a streaming path | reference implementation and moderate workloads |
| walk parallel labels and values arrays while checking schema child rules and value constraints | split-array-schema-walk | still pays repeated string lookups unless schema is compiled | default validation once a key is already split |
| use a set or hash map over split-key representations so each unique split key is schema-validated only once | deduplicated-split-validator | needs projection from unique results back to original batch positions | large batches containing many identical keys |
| convert labels to compact ids and validate with precomputed child and value tables | compiled-split-validator | adds compilation and translation cost | large batches of pre-split keys |
| reuse cached schema traversal state for validated label prefixes | prefix-state-split-validator | cache invalidation and memory use add complexity | many split keys sharing long prefixes |
| run cheap length and character checks before full schema traversal | two-phase-split-validator | duplicates part of the validation pipeline | large noisy batches of split keys |
| precompute label ids child lookups and value rules to reduce repeated map and string work | compiled-schema-validator | adds setup cost and more internal machinery | large batches of keys |
| reuse validated prefix states so related keys do not restart schema traversal from the anchor | prefix-cached-validator | cache management adds memory overhead | many keys sharing common prefixes |
| run cheap structural checks before full schema traversal to reject bad keys early | two-phase-batch-validator | duplicates part of validation logic across phases | large noisy input sets |
| compare validated segment prefixes instead of reparsing full candidates every time | prefix-scan-descendants | may still be linear without a dedicated index | find descendants by scanning many keys |
| build an index keyed by canonical parent or validated prefix for faster repeated queries | indexed-descendants-lookup | index build and update cost may not pay off for small sets | repeated descendant retrieval over large stable sets |

#### Performance Test Suggestions

| fixture_shape | goal | main_assertions | test_kind |
| --- | --- | --- | --- |
| same valid key repeated many times | compare single-key validator overhead | streaming path stays at least as fast as token-array for ordinary validation | micro-benchmark-single-key |
| thousands to tens of thousands of valid unique keys | measure scaling on large distinct batches | compiled or split-based batch strategies reduce per-key overhead as batch size grows | batch-benchmark-unique-keys |
| large batch with many identical keys | measure benefit of duplicate elimination | deduplicated-split strategy validates fewer unique items than input batch size and outperforms naive repeated validation | batch-benchmark-duplicate-keys |
| many keys sharing long common prefixes | measure prefix reuse | prefix-cached and prefix-state-split strategies outperform restart-from-anchor validation | batch-benchmark-shared-prefixes |
| batches with an invalid key early middle and late in the list | measure stop-first versus collect-invalids cost | stop-first exits earlier and allocates less than collect-invalids | mixed-validity-benchmark |
| large batches of canonical keys | measure split and combine overhead | split helpers preserve equal label/value lengths and combine helpers round-trip back to canonical strings | split-helper-benchmark |
| one anchor with thousands of candidate keys | compare descendant retrieval by scan | prefix-scan descendant lookup returns the same result set as a trusted baseline | descendants-scan-benchmark |
| repeated descendant queries over a stable large key set | measure indexed descendant retrieval payoff | index build cost is visible but repeated lookups become faster than repeated scans after enough queries | descendants-index-benchmark |
| stable representative datasets checked into test fixtures | catch accidental slowdowns | wall-clock or operation-count thresholds fail when a strategy regresses materially | regression-threshold-test |

### 04 Security

Implementation guidance for corrupted keys and untrusted schema inputs.

#### Security Guidance

| concern | recommendation | why_it_matters |
| --- | --- | --- |
| untrusted-key-input | treat every incoming key string as untrusted until it passes full validation | corrupted keys should not be allowed to influence navigation or derived results |
| partial-parse-use | do not expose parent ancestor descendant or kind helpers on partially validated data | partial success can leak inconsistent state into higher-level logic |
| structural-bounds | reject odd token counts empty segments and depth overflows before any deeper traversal | cheap structural guards prevent malformed inputs from triggering unnecessary work |
| bounded-iteration | prefer iterative loops with explicit segment counters over open-ended recursion on key input | bounded traversal prevents stack growth and non-terminating behavior on corrupted inputs |
| schema-before-keys | validate schema integrity before accepting it for key parsing or traversal | broken schema graphs can otherwise create incorrect results or infinite traversal risks |
| cycle-defense | reject schema cycles and keep traversal helpers working only on validated acyclic schema state | ancestor and descendant logic must never depend on graph shapes that can loop forever |
| terminal-defense | reject terminal nodes that still declare children and fail closed on impossible parent child transitions | inconsistent schema edges should not be silently tolerated |
| fail-closed | when a key fails validation return failure and do not try to salvage derived fields or canonical strings | fail-closed behavior avoids corrupted results that look valid enough to reuse |
| canonical-output | only serialize from validated parsed data and always emit canonical label:value pairs | this prevents ambiguous or attacker-shaped strings from being reintroduced downstream |
| identifier-policy | apply idAlphabet only to id values and validate labels with a separate stricter rule | mixing label validation with identifier validation can accidentally broaden accepted schema tokens |
| alphabet-implementation | use direct code-unit predicates for each idAlphabet preset and explicit extraIdChars membership checks | preset-based checks are easier to audit than ad hoc regex and make hex oriented policies unambiguous |
| cache-safety | do not cache unvalidated parse results and keep validation or prefix caches scoped and bounded | untrusted inputs should not be able to grow caches without limit |
| batch-safety | default batch validation to stop-first and only enable collect-invalids intentionally for debugging | large hostile batches should be cheap to reject |
| descendant-scan-safety | when scanning candidate keys for descendants compare bounded validated segment arrays and enforce maxDepth filters | relationship queries should not depend on reparsing or unchecked prefix math |

