import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, Eye, Mail, Calendar } from 'lucide-react';
import { Lead } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

const SOURCE_ICONS: Record<string, string> = {
  Website: '🌐',
  Instagram: '📱',
  Referral: '🤝',
};

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onView: (lead: Lead) => void;
  canDelete?: boolean;
}

export function LeadCard({ lead, onEdit, onDelete, onView, canDelete = true }: LeadCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const createdBy = typeof lead.createdBy === 'object' ? lead.createdBy.name : 'Unknown';

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all group animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-brand-700 dark:text-brand-300 font-semibold text-sm">
            {lead.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{lead.name}</p>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <p className="text-xs truncate">{lead.email}</p>
            </div>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 py-1 animate-scale-in">
                <button onClick={() => { onView(lead); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Eye className="w-4 h-4" /> View
                </button>
                <button onClick={() => { onEdit(lead); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                {canDelete && (
                  <button onClick={() => { onDelete(lead._id); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusBadge status={lead.status} />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {SOURCE_ICONS[lead.source]} {lead.source}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>{createdBy}</span>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

// Leads grid container
interface LeadsGridProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onView: (lead: Lead) => void;
  isAdmin?: boolean;
}

export function LeadsGrid({ leads, onEdit, onDelete, onView, isAdmin = false }: LeadsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {leads.map((lead) => (
        <LeadCard
          key={lead._id}
          lead={lead}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          canDelete={isAdmin || true}
        />
      ))}
    </div>
  );
}
