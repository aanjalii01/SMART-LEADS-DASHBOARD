import { Search, SlidersHorizontal } from 'lucide-react';
import { LeadFilters, LeadSource, LeadStatus, SortOrder } from '../../types';
import { Input, Select } from '../ui';

interface FilterBarProps {
  filters: LeadFilters;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: keyof LeadFilters, value: string) => void;
}

export function FilterBar({ filters, searchValue, onSearchChange, onFilterChange }: FilterBarProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          placeholder="Search name or email..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
        <Select
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          {(['New', 'Contacted', 'Qualified', 'Lost'] as LeadStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select
          value={filters.source || ''}
          onChange={(e) => onFilterChange('source', e.target.value)}
        >
          <option value="">All Sources</option>
          {(['Website', 'Instagram', 'Referral'] as LeadSource[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select
          value={filters.sort || 'latest'}
          onChange={(e) => onFilterChange('sort', e.target.value as SortOrder)}
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </Select>
      </div>
    </div>
  );
}
