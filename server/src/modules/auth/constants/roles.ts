export const SYSTEM_ROLES = {
  ADMIN: 'ADMIN',
  CONTRACTOR: 'CONTRACTOR',
  INSPECTOR: 'INSPECTOR'
} as const;

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];
