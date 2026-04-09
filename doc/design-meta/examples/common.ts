export type Segment = {
  label: string;
  value?: string;
  kind: string;
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
