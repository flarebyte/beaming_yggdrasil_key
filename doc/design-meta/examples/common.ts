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

export type DerivedKind = {
  hierarchy: string[];
};

export type ParseFailure = {
  message: string;
};
