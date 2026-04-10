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
