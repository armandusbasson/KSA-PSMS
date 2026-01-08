export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount?: number | null): string => {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const truncate = (text: string, length: number = 100): string => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

export const formatFullName = (name?: string, surname?: string) => {
  if (!name && !surname) return '';
  return [name, surname].filter(Boolean).join(' ').trim();
};
