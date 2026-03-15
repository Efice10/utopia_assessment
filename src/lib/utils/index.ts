export { formatCurrency } from './format-currency';

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
