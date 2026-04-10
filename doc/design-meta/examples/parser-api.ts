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
