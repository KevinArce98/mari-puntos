import { colors } from '@/theme';

export const getStatusText = (status: string) => {
  switch (status) {
    case 'approved':
      return 'Aprobado';
    case 'rejected':
      return 'Rechazado';
    default:
      return 'Pendiente';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return colors.success;
    case 'rejected':
      return colors.error;
    default:
      return colors.warning;
  }
};
