import { colors } from '@/theme';
import { ActionStatus, PermissionStatus } from '@/types';

// Status colors use fixed brand colors (not theme-dependent)
const c = colors.light;

export const getStatusText = (status: ActionStatus | PermissionStatus | string): string => {
  switch (status) {
    case ActionStatus.APPROVED:
    case PermissionStatus.APPROVED:
      return 'Aprobado';
    case ActionStatus.REJECTED:
    case PermissionStatus.REJECTED:
      return 'Rechazado';
    case PermissionStatus.EXPIRED:
      return 'Expirado';
    default:
      return 'Pendiente';
  }
};

export const getStatusColor = (status: ActionStatus | PermissionStatus | string): string => {
  switch (status) {
    case ActionStatus.APPROVED:
    case PermissionStatus.APPROVED:
      return c.success;
    case ActionStatus.REJECTED:
    case PermissionStatus.REJECTED:
      return c.error;
    default:
      return c.warning;
  }
};
