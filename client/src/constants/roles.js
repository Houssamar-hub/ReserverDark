export const ROLES = {
  CLIENT: 'client',
  OWNER: 'owner',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  [ROLES.CLIENT]: 'Client',
  [ROLES.OWNER]: 'Propriétaire',
  [ROLES.ADMIN]: 'Administrateur',
};

export const ROLE_ROUTES = {
  [ROLES.CLIENT]: '/client',
  [ROLES.OWNER]: '/owner',
  [ROLES.ADMIN]: '/admin',
};