import { colors } from '@/theme';
import {
  formatDateWithTime as formatDateWithTimeUTC6,
  formatDateOnly as formatDateOnlyUTC6,
} from './dateUtils';

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

export const formatDate = formatDateWithTimeUTC6;

export const formatDateOnly = formatDateOnlyUTC6;
