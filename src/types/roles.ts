export enum UserRole {
  ADMIN = 'ADMIN',           // Dueño o administrador del salón
  STYLIST = 'STYLIST',       // Estilista/Profesional
  RECEPTIONIST = 'RECEPTIONIST', // Recepcionista
  CLIENT = 'CLIENT',         // Cliente regular
  GUEST = 'GUEST'           // Usuario no registrado
}

export interface RolePermissions {
  canManageProducts: boolean;
  canManageServices: boolean;
  canManageAppointments: boolean;
  canManageStaff: boolean;
  canViewReports: boolean;
  canManageClients: boolean;
  canMakeAppointments: boolean;
  canViewProducts: boolean;
  canViewServices: boolean;
  canCheckoutClients: boolean;
}

export const RolePermissionsMap: Record<UserRole, RolePermissions> = {
  [UserRole.ADMIN]: {
    canManageProducts: true,
    canManageServices: true,
    canManageAppointments: true,
    canManageStaff: true,
    canViewReports: true,
    canManageClients: true,
    canMakeAppointments: true,
    canViewProducts: true,
    canViewServices: true,
    canCheckoutClients: true
  },
  [UserRole.STYLIST]: {
    canManageProducts: false,
    canManageServices: false,
    canManageAppointments: true,
    canManageStaff: false,
    canViewReports: false,
    canManageClients: false,
    canMakeAppointments: true,
    canViewProducts: true,
    canViewServices: true,
    canCheckoutClients: true
  },
  [UserRole.RECEPTIONIST]: {
    canManageProducts: false,
    canManageServices: false,
    canManageAppointments: true,
    canManageStaff: false,
    canViewReports: false,
    canManageClients: true,
    canMakeAppointments: true,
    canViewProducts: true,
    canViewServices: true,
    canCheckoutClients: true
  },
  [UserRole.CLIENT]: {
    canManageProducts: false,
    canManageServices: false,
    canManageAppointments: false,
    canManageStaff: false,
    canViewReports: false,
    canManageClients: false,
    canMakeAppointments: true,
    canViewProducts: true,
    canViewServices: true,
    canCheckoutClients: false
  },
  [UserRole.GUEST]: {
    canManageProducts: false,
    canManageServices: false,
    canManageAppointments: false,
    canManageStaff: false,
    canViewReports: false,
    canManageClients: false,
    canMakeAppointments: false,
    canViewProducts: true,
    canViewServices: true,
    canCheckoutClients: false
  }
};
