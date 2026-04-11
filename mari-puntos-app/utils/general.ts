import { colors } from '@/theme';
import { ActionStatus, PermissionStatus } from '@/types';

export const getStatusText = (
  status: ActionStatus | PermissionStatus | string
): string => {
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

export const getStatusColor = (
  status: ActionStatus | PermissionStatus | string,
  scheme?: string | null
): string => {
  const c = scheme === 'dark' ? colors.dark : colors.light;
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
