import { useState, useCallback } from "react";
import { Plus, Download, RefreshCw } from "lucide-react";
import { Lead, LeadFilters, LeadFormData } from "../types";
import { useLeads, useLeadStats, useCreateLead, useUpdateLead, useDeleteLead, useExportLeads } from "../hooks/useLeads";
import { useDebounce } from "../hooks/useDebounce";
import { useAuthStore } from "../store/authStore";
import { FilterBar } from "../components/leads/FilterBar";
import { LeadsGrid } from "../components/leads/LeadCard";
import { LeadForm } from "../components/leads/LeadForm";
import { StatsCards } from "../components/leads/StatsCards";
import { Button, Modal, EmptyState, Spinner } from "../components/ui";
import { Pagination } from "../components/ui/Pagination";

export function DashboardPage() {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<LeadFilters>({ sort: "latest", page: 1 });
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const activeFilters: LeadFilters = { ...filters, search: debouncedSearch || undefined };
  const { data: leadsData, isLoading, isFetching, refetch } = useLeads(activeFilters);
  const { data: statsData, isLoading: statsLoading } = useLeadStats();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const exportLeads = useExportLeads();
  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleFilterChange = useCallback((key: keyof LeadFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleCreate = async (data: LeadFormData) => {
    await createLead.mutateAsync(data);
    setCreateOpen(false);
  };

  const handleUpdate = async (data: LeadFormData) => {
    if (!editLead) return;
    await updateLead.mutateAsync({ id: editLead._id, data });
    setEditLead(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteLead.mutateAsync(deleteConfirm);
    setDeleteConfirm(null);
  };

  const leads = leadsData?.data || [];
  const meta = leadsData?.meta;
  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user?.role === "admin" ? "Managing all leads" : "Managing your leads"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching && !isLoading}>
            <RefreshCw className="w-4 h-4" /><span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportLeads.mutate({ status: filters.status, source: filters.source, search: debouncedSearch || undefined })} isLoading={exportLeads.isPending}>
            <Download className="w-4 h-4" /><span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Lead</span>
          </Button>
        </div>
      </div>
      <StatsCards stats={stats} isLoading={statsLoading} />
      <FilterBar filters={filters} searchValue={searchInput} onSearchChange={handleSearchChange} onFilterChange={handleFilterChange} />
      <div className="relative">
        {isLoading ? (
          <div className="py-24 flex items-center justify-center"><Spinner size="lg" /></div>
        ) : leads.length === 0 ? (
          <EmptyState title="No leads found"
            description={debouncedSearch || filters.status || filters.source ? "Try adjusting your filters." : "Get started by adding your first lead."}
            action={<Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Add First Lead</Button>} />
        ) : (
          <LeadsGrid leads={leads} onEdit={setEditLead} onDelete={(id) => setDeleteConfirm(id)} onView={setViewLead} isAdmin={user?.role === "admin"} />
        )}
      </div>
      {meta && meta.totalPages > 1 && (
        <Pagination meta={meta} onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))} />
      )}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add New Lead">
        <LeadForm onSubmit={handleCreate} isLoading={createLead.isPending} />
      </Modal>
      <Modal isOpen={!!editLead} onClose={() => setEditLead(null)} title="Edit Lead">
        {editLead && <LeadForm initialData={editLead} onSubmit={handleUpdate} isLoading={updateLead.isPending} />}
      </Modal>
      <Modal isOpen={!!viewLead} onClose={() => setViewLead(null)} title="Lead Details">
        {viewLead && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                {viewLead.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{viewLead.name}</h3>
                <p className="text-sm text-gray-500">{viewLead.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{ label: "Status", value: viewLead.status }, { label: "Source", value: viewLead.source },
                { label: "Created", value: new Date(viewLead.createdAt).toLocaleDateString() },
                { label: "Updated", value: new Date(viewLead.updatedAt).toLocaleDateString() }
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>
            {viewLead.notes && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Notes</p><p className="text-sm">{viewLead.notes}</p></div>}
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setViewLead(null); setEditLead(viewLead); }}>Edit</Button>
              <Button variant="danger" className="flex-1" onClick={() => { setViewLead(null); setDeleteConfirm(viewLead._id); }}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Are you sure you want to delete this lead? This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} isLoading={deleteLead.isPending}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
