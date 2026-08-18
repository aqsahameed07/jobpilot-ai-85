import { z } from 'zod';
import api from './api';

export const STATUSES = ['applied', 'interview', 'offer', 'rejected'] as const;
export type Status = (typeof STATUSES)[number];
export type ApplicationStatus = Status;

export const applicationSchema = z.object({
  company: z.string().trim().min(1, 'Company is required'),
  position: z.string().trim().min(1, 'Position is required'),
  location: z.string().trim().optional().or(z.literal('')),
  salary: z.string().trim().optional().or(z.literal('')),
  applied_at: z.string().trim().min(1, 'Date is required'),
  job_description: z.string().trim().optional().or(z.literal('')),
  notes: z.string().trim().optional().or(z.literal('')),
  status: z.enum(STATUSES),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export interface Application {
  id: string;
  company: string;
  position: string;
  status: Status;
  applied_at: string;
  salary?: string;
  location?: string;
  job_description?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: 'var(--primary)',
  interview: 'var(--accent)',
  offer: 'var(--success)',
  rejected: 'var(--destructive)',
};

export const applicationsQueryKey = ['applications'];

const normalizeApplication = (application: any): Application => ({
  ...application,
  id: application?.id ?? application?._id,
  createdAt: application?.createdAt ?? application?.created_at,
  updatedAt: application?.updatedAt ?? application?.updated_at,
  salary: application?.salary ?? undefined,
  job_description: application?.job_description ?? application?.jobDescription ?? undefined,
});

// ✅ NO SUPABASE - Using custom API

export const fetchApplications = async (): Promise<Application[]> => {
  try {
    const response = await api.get('/applications');
    return (response.data.applications || []).map(normalizeApplication);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return [];
  }
};

export const createApplication = async (data: Partial<Application>): Promise<Application> => {
  const response = await api.post('/applications', data);
  return normalizeApplication(response.data.application);
};

export const updateApplication = async (id: string, data: Partial<Application>): Promise<Application> => {
  const response = await api.put(`/applications/${id}`, data);
  return normalizeApplication(response.data.application);
};

export const deleteApplication = async (id: string): Promise<void> => {
  await api.delete(`/applications/${id}`);
};

export const updateStatus = async (
  id: string,
  status: ApplicationStatus,
  updatedAt: number = Date.now(),
): Promise<Application> => {
  const response = await api.patch(`/applications/${id}/status`, { status, updatedAt });
  return normalizeApplication(response.data.application);
};

export const updateApplicationStatus = updateStatus;
