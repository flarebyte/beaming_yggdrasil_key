import type { ParsedKey } from './common';

export const dashboardRootKey = 'tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07';

export const dashboardRootParsed: ParsedKey = {
  canonical: dashboardRootKey,
  kindPath: ['tenant', 'group', 'dashboard'],
  scope: [
    { label: 'tenant', value: 't8f3a1c2' },
    { label: 'group', value: 'g4b7d9e1' },
  ],
  anchor: { label: 'dashboard', value: 'd1e52f07' },
  path: [],
  terminalKind: 'dashboard',
};

export const noteTextLeafKey = 'tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:note:n7c401c2:text:_';

export const noteTextLeafParsed: ParsedKey = {
  canonical: noteTextLeafKey,
  kindPath: ['tenant', 'group', 'dashboard', 'note', 'text'],
  scope: [
    { label: 'tenant', value: 't8f3a1c2' },
    { label: 'group', value: 'g4b7d9e1' },
  ],
  anchor: { label: 'dashboard', value: 'd1e52f07' },
  path: [
    { label: 'note', value: 'n7c401c2' },
    { label: 'text', value: '_' },
  ],
  terminalKind: 'text',
};

export const contextualUserKey = 'tenant:t8f3a1c2:group:g4b7d9e1:dashboard:d1e52f07:user:~';

export const contextualUserParsed: ParsedKey = {
  canonical: contextualUserKey,
  kindPath: ['tenant', 'group', 'dashboard', 'user'],
  scope: [
    { label: 'tenant', value: 't8f3a1c2' },
    { label: 'group', value: 'g4b7d9e1' },
  ],
  anchor: { label: 'dashboard', value: 'd1e52f07' },
  path: [
    { label: 'user', value: '~' },
  ],
  terminalKind: 'user',
};

export const profileRootKey = 'department:d1:team:t1:profile:p1';

export const profileRootParsed: ParsedKey = {
  canonical: profileRootKey,
  kindPath: ['department', 'team', 'profile'],
  scope: [
    { label: 'department', value: 'd1' },
    { label: 'team', value: 't1' },
  ],
  anchor: { label: 'profile', value: 'p1' },
  path: [],
  terminalKind: 'profile',
};

// ParsedKey shape guidance:
// - scope contains validated segments before the first schema anchor label
// - anchor is that first schema anchor-labeled segment and acts as the navigation anchor
// - path contains validated descendant segments after the anchor
