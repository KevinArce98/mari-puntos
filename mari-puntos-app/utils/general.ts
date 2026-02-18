import { colors } from '@/theme';

// Status colors use fixed brand colors (not theme-dependent)
const c = colors.light;

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
      return c.success;
    case 'rejected':
      return c.error;
    default:
      return c.warning;
  }
};
