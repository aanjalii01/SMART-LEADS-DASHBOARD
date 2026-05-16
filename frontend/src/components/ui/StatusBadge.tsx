import { LeadStatus } from '../../types';

interface StatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  New: { label: 'New', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  Contacted: { label: 'Contacted', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  Qualified: { label: 'Qualified', className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  Lost: { label: 'Lost', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {config.label}
    </span>
  );
}
