import type { DescendantQuery, DerivedKind, ParsedKey } from './common';

export type ParseResult =
  | { ok: true; value: ParsedKey }
  | { ok: false; message: string };

export interface BeamingYggdrasilKeyParser {
  parse(keyId: string): ParseResult;
  mustParse(keyId: string): ParsedKey;
  isValid(keyId: string): boolean;
  parentOf(keyId: string): string | null;
  ancestorsOf(keyId: string): string[];
  isRoot(keyId: string): boolean;
  isDescendantOf(rootKeyId: string, candidateKeyId: string): boolean;
  descendantsOf(rootKeyId: string, candidateKeyIds: string[], query?: DescendantQuery): string[];
  deriveKind(parsed: ParsedKey): DerivedKind;
  toCanonicalString(parsed: ParsedKey): string;
}

// Dart translation guidance:
// - prefer explicit result types over throwing for ordinary validation failures
// - keep error messages stable enough for tests and diagnostics
// - keep the package lightweight, closer to a path utility than a framework
