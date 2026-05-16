import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '../services/leadsService';
import { LeadFilters, LeadFormData } from '../types';
import toast from 'react-hot-toast';

export const LEADS_QUERY_KEY = 'leads';
export const STATS_QUERY_KEY = 'leads-stats';

export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, filters],
    queryFn: () => leadsService.getLeads(filters),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, id],
    queryFn: () => leadsService.getLead(id),
    enabled: !!id,
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: [STATS_QUERY_KEY],
    queryFn: () => leadsService.getStats(),
    staleTime: 60_000,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LeadFormData) => leadsService.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [STATS_QUERY_KEY] });
      toast.success('Lead created successfully!');
    },
    onError: () => toast.error('Failed to create lead.'),
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadFormData> }) =>
      leadsService.updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [STATS_QUERY_KEY] });
      toast.success('Lead updated successfully!');
    },
    onError: () => toast.error('Failed to update lead.'),
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [STATS_QUERY_KEY] });
      toast.success('Lead deleted.');
    },
    onError: () => toast.error('Failed to delete lead.'),
  });
}

export function useExportLeads() {
  return useMutation({
    mutationFn: (filters: Omit<LeadFilters, 'page'>) => leadsService.exportCSV(filters),
    onSuccess: () => toast.success('CSV exported successfully!'),
    onError: () => toast.error('Failed to export CSV.'),
  });
}
