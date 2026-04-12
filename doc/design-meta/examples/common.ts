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
};

export type KeySchema = {
  config: KeySchemaConfig;
  rootLabels: string[];
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
  isAnchorKey(parsed: ParsedKey): boolean;
  parentOf(parsed: ParsedKey): ParsedKey | null;
  ancestorsOf(parsed: ParsedKey): ParsedKey[];
  isDescendantOf(anchor: ParsedKey, candidate: ParsedKey): boolean;
  descendantsOf(anchor: ParsedKey, candidateKeys: ParsedKey[], query?: DescendantQuery): ParsedKey[];
}

export type DerivedKind = {
  anchorPath: string[];
};

export type ParseFailure = {
  message: string;
};
