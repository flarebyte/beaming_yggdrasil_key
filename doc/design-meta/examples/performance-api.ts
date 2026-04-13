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
