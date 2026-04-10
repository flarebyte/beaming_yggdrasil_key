import type { KeySchema, ParsedKey } from './common';

export interface ValidationStrategy {
  name: string;
  validate(keyId: string): boolean;
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

  // Allow the implementation to swap strategies as dataset size changes.
  withValidationStrategy(name: 'streaming' | 'token-array' | 'compiled-schema' | 'prefix-cached' | 'two-phase-batch'): BeamingYggdrasilKeyPerformanceApi;

  // Scan a large list and return validated direct or nested children.
  childrenOf(rootKeyId: string, candidateKeyIds: string[], query?: KeySetQuery): string[];

  // Parsed-key variant to avoid reparsing when callers already hold validated keys.
  childrenOfParsed(root: ParsedKey, candidateKeys: ParsedKey[], query?: KeySetQuery): ParsedKey[];
}

// Performance guidance:
// - keep label:value and even-token constraints because they enable cheap structural checks
// - avoid one function that reparses, revalidates, and rescans everything for every workload
// - pick validation and scan strategy based on key count and prefix sharing, not by one fixed algorithm
