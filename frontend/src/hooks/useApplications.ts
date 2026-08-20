import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { applicationService, Application, ApplicationInput, Status, ApplicationStats } from '@/services/application.service';

// Query keys
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters: any) => [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  stats: () => [...applicationKeys.all, 'stats'] as const,
  byStatus: (status: Status) => [...applicationKeys.all, 'status', status] as const,
};

// Get all applications
export const useApplications = () => {
  return useQuery({
    queryKey: applicationKeys.lists(),
    queryFn: () => applicationService.getAllApplications(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single application
export const useApplication = (id: string) => {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationService.getApplicationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get applications by status
export const useApplicationsByStatus = (status: Status) => {
  return useQuery({
    queryKey: applicationKeys.byStatus(status),
    queryFn: () => applicationService.getApplicationsByStatus(status),
    enabled: !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Get application stats
export const useApplicationStats = () => {
  return useQuery({
    queryKey: applicationKeys.stats(),
    queryFn: () => applicationService.getStats(),
    staleTime: 5 * 60 * 1000,
  });
};

// Create application mutation
export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApplicationInput) => applicationService.createApplication(data),
    onSuccess: () => {
      toast.success('Application added successfully! 🎉');
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.stats() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create application');
    },
  });
};

// Update application mutation
export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApplicationInput> }) =>
      applicationService.updateApplication(id, data),
    onSuccess: (data) => {
      toast.success('Application updated successfully! ✅');
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.stats() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update application');
    },
  });
};

// Delete application mutation
export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applicationService.deleteApplication(id),
    onSuccess: () => {
      toast.success('Application deleted successfully! 🗑️');
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.stats() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete application');
    },
  });
};

// Update status mutation
export const useUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      applicationService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: applicationKeys.lists() });

      // Snapshot the previous value
      const previousApplications = queryClient.getQueryData<Application[]>(applicationKeys.lists());

      // Optimistically update
      queryClient.setQueryData<Application[]>(applicationKeys.lists(), (old) => {
        if (!old) return [];
        return old.map((app) =>
          app.id === id ? { ...app, status } : app
        );
      });

      return { previousApplications };
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousApplications) {
        queryClient.setQueryData(applicationKeys.lists(), context.previousApplications);
      }
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
    onSuccess: () => {
      toast.success('Status updated successfully! 🔄');
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.stats() });
    },
  });
};

// Combined hook for dashboard stats
export const useDashboardData = () => {
  const applicationsQuery = useApplications();
  const statsQuery = useApplicationStats();

  return {
    applications: applicationsQuery.data || [],
    stats: statsQuery.data,
    isLoading: applicationsQuery.isLoading || statsQuery.isLoading,
    isError: applicationsQuery.isError || statsQuery.isError,
    error: applicationsQuery.error || statsQuery.error,
    refetch: () => {
      applicationsQuery.refetch();
      statsQuery.refetch();
    },
  };
};