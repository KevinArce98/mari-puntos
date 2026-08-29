import i18n from '@/i18n';
import { colors } from '@/theme';
import { ActionStatus, PermissionStatus } from '@/types';

export const getStatusText = (
  status: ActionStatus | PermissionStatus | string
): string => {
  switch (status) {
    case ActionStatus.APPROVED:
    case PermissionStatus.APPROVED:
      return i18n.t('common:status.approved');
    case ActionStatus.REJECTED:
    case PermissionStatus.REJECTED:
      return i18n.t('common:status.rejected');
    case PermissionStatus.EXPIRED:
      return i18n.t('common:status.expired');
    default:
      return i18n.t('common:status.pending');
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
