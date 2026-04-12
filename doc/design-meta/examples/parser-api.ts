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
