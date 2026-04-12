import type { ParsedKey } from './common';

export const dashboardRootKey = 'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07';

export const dashboardRootParsed: ParsedKey = {
  canonical: dashboardRootKey,
  kindPath: ['tenant', 'group', 'dashboard'],
  scope: [
    { label: 'tenant', value: 'a8f3a1c2' },
    { label: 'group', value: 'b4b7d9e1' },
  ],
  anchor: { label: 'dashboard', value: 'd1e52f07' },
  path: [],
  terminalKind: 'dashboard',
};

export const noteTextLeafKey = 'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:note:c7c401c2:text:_';

export const noteTextLeafParsed: ParsedKey = {
  canonical: noteTextLeafKey,
  kindPath: ['tenant', 'group', 'dashboard', 'note', 'text'],
  scope: [
    { label: 'tenant', value: 'a8f3a1c2' },
    { label: 'group', value: 'b4b7d9e1' },
  ],
  anchor: { label: 'dashboard', value: 'd1e52f07' },
  path: [
    { label: 'note', value: 'c7c401c2' },
    { label: 'text', value: '_' },
  ],
  terminalKind: 'text',
};

export const contextualUserKey = 'tenant:a8f3a1c2:group:b4b7d9e1:dashboard:d1e52f07:user:~';

export const contextualUserParsed: ParsedKey = {
  canonical: contextualUserKey,
  kindPath: ['tenant', 'group', 'dashboard', 'user'],
  scope: [
    { label: 'tenant', value: 'a8f3a1c2' },
    { label: 'group', value: 'b4b7d9e1' },
  ],
  anchor: { label: 'dashboard', value: 'd1e52f07' },
  path: [
    { label: 'user', value: '~' },
  ],
  terminalKind: 'user',
};

export const profileRootKey = 'department:d1:team:a1:profile:b1';

export const profileRootParsed: ParsedKey = {
  canonical: profileRootKey,
  kindPath: ['department', 'team', 'profile'],
  scope: [
    { label: 'department', value: 'd1' },
    { label: 'team', value: 'a1' },
  ],
  anchor: { label: 'profile', value: 'b1' },
  path: [],
  terminalKind: 'profile',
};

// ParsedKey shape guidance:
// - scope contains validated segments before the first schema anchor label
// - anchor is that first schema anchor-labeled segment and acts as the navigation anchor
// - path contains validated descendant segments after the anchor
