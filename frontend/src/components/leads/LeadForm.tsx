import { useState, FormEvent } from 'react';
import { Lead, LeadFormData, LeadSource, LeadStatus } from '../../types';
import { Button, Input, Select } from '../ui';

interface LeadFormProps {
  initialData?: Lead;
  onSubmit: (data: LeadFormData) => Promise<void>;
  isLoading?: boolean;
}

const EMPTY_FORM: LeadFormData = {
  name: '',
  email: '',
  status: 'New',
  source: 'Website',
  notes: '',
};

interface FormErrors {
  name?: string;
  email?: string;
  source?: string;
}

export function LeadForm({ initialData, onSubmit, isLoading }: LeadFormProps) {
  const [form, setForm] = useState<LeadFormData>(
    initialData
      ? {
          name: initialData.name,
          email: initialData.email,
          status: initialData.status,
          source: initialData.source,
          notes: initialData.notes || '',
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim() || form.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Valid email is required';
    if (!form.source) newErrors.source = 'Source is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        label="Full Name"
        placeholder="Rahul Sharma"
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        error={errors.name}
        required
      />
      <Input
        id="email"
        label="Email Address"
        type="email"
        placeholder="rahul@example.com"
        value={form.email}
        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        error={errors.email}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          id="status"
          label="Status"
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as LeadStatus }))}
        >
          {(['New', 'Contacted', 'Qualified', 'Lost'] as LeadStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select
          id="source"
          label="Source"
          value={form.source}
          onChange={(e) => setForm((p) => ({ ...p, source: e.target.value as LeadSource }))}
          error={errors.source}
        >
          {(['Website', 'Instagram', 'Referral'] as LeadSource[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          placeholder="Any additional context about this lead..."
          className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 text-sm px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
        />
      </div>
      <Button type="submit" className="w-full" isLoading={isLoading}>
        {initialData ? 'Update Lead' : 'Create Lead'}
      </Button>
    </form>
  );
}
