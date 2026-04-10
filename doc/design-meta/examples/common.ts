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

export type ValidationMode = 'stop-first' | 'collect-invalids';

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

export type SchemaValidationSeverity = 'error' | 'warning';

export type SchemaValidationMode = 'strict' | 'tolerant';

export interface SchemaValidationOptions {
  mode?: SchemaValidationMode;
  maxChildLabelsWarning?: number;
  maxRootLabelsWarning?: number;
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
