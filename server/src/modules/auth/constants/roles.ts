export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  CONTRACTOR: 'contractor',
  ORGAN_CONTROL: 'organ_control'
} as const;

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];
