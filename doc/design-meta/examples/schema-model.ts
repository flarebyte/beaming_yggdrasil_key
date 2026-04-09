export type SchemaValueType = 'id' | '_' | '~';

export type KeySchemaConfig = {
  maxDepth: number;
  minIdChars: number;
  maxIdChars: number;
  allowedIdPattern: string;
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

export const exampleSchema: KeySchema = {
  config: {
    maxDepth: 8,
    minIdChars: 1,
    maxIdChars: 64,
    allowedIdPattern: '^[A-Za-z0-9._-]+$',
  },
  rootLabels: ['dashboard', 'profile'],
  nodesByLabel: {
    tenant: { label: 'tenant', valueTypes: ['id'], childLabels: ['group', 'team', 'region', 'dashboard', 'profile'] },
    group: { label: 'group', valueTypes: ['id'], childLabels: ['dashboard', 'profile'] },
    dashboard: { label: 'dashboard', valueTypes: ['id'], childLabels: ['note', 'language', 'thumbnail', 'like', 'user'] },
    note: { label: 'note', valueTypes: ['id'], childLabels: ['text', 'language', 'thumbnail', 'like'] },
    like: { label: 'like', valueTypes: ['_'], childLabels: ['count', 'user', 'member', 'subscriber'] },
    text: { label: 'text', valueTypes: ['_'], childLabels: [], terminal: true },
    count: { label: 'count', valueTypes: ['_'], childLabels: [], terminal: true },
    language: { label: 'language', valueTypes: ['_'], childLabels: [], terminal: true },
    thumbnail: { label: 'thumbnail', valueTypes: ['_'], childLabels: [], terminal: true },
    user: { label: 'user', valueTypes: ['id', '~', '_'], childLabels: [] },
    member: { label: 'member', valueTypes: ['id', '_'], childLabels: [] },
    subscriber: { label: 'subscriber', valueTypes: ['id', '_'], childLabels: [] },
    profile: { label: 'profile', valueTypes: ['id'], childLabels: [] },
  },
};
