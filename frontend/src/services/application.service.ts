import api from '@/lib/api';

export interface Application {
  id: string;
  company: string;
  position: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  applied_at: string;
  salary?: string;
  location?: string;
  job_description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationInput {
  company: string;
  position: string;
  status?: 'applied' | 'interview' | 'offer' | 'rejected';
  salary?: string;
  location?: string;
  job_description?: string;
  notes?: string;
  applied_at?: string;
}

export interface ApplicationStats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  responseRate: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  applications?: T[];
  application?: T;
  stats?: T;
  count?: number;
}

export const STATUSES = ['applied', 'interview', 'offer', 'rejected'] as const;
export type Status = typeof STATUSES[number];

const normalizeApplication = (application: any): Application => ({
  ...application,
  id: application?.id ?? application?._id,
  createdAt: application?.createdAt ?? application?.created_at,
  updatedAt: application?.updatedAt ?? application?.updated_at,
  salary: application?.salary ?? undefined,
  job_description: application?.job_description ?? application?.jobDescription ?? undefined,
});

export const STATUS_LABEL: Record<Status, string> = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

export const STATUS_COLORS: Record<Status, string> = {
  applied: 'var(--primary)',
  interview: 'var(--accent)',
  offer: 'var(--success)',
  rejected: 'var(--destructive)',
};

export const STATUS_ICONS: Record<Status, string> = {
  applied: '📝',
  interview: '🗣️',
  offer: '🎉',
  rejected: '❌',
};

class ApplicationService {
  private baseUrl = '/applications';

  // Get all applications
  async getAllApplications(): Promise<Application[]> {
    try {
      const response = await api.get(this.baseUrl);
      return (response.data.applications || []).map(normalizeApplication);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      throw error;
    }
  }

  // Get single application
  async getApplicationById(id: string): Promise<Application> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return normalizeApplication(response.data.application);
    } catch (error) {
      console.error(`Failed to fetch application ${id}:`, error);
      throw error;
    }
  }

  // Create application
  async createApplication(data: ApplicationInput): Promise<Application> {
    try {
      const response = await api.post(this.baseUrl, data);
      return normalizeApplication(response.data.application);
    } catch (error) {
      console.error('Failed to create application:', error);
      throw error;
    }
  }

  // Update application
  async updateApplication(id: string, data: Partial<ApplicationInput>): Promise<Application> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return normalizeApplication(response.data.application);
    } catch (error) {
      console.error(`Failed to update application ${id}:`, error);
      throw error;
    }
  }

  // Delete application
  async deleteApplication(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to delete application ${id}:`, error);
      throw error;
    }
  }

  // Update application status
  async updateStatus(id: string, status: Status): Promise<Application> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/status`, { status });
      return normalizeApplication(response.data.application);
    } catch (error) {
      console.error(`Failed to update status for application ${id}:`, error);
      throw error;
    }
  }

  // Get applications by status
  async getApplicationsByStatus(status: Status): Promise<Application[]> {
    try {
      const response = await api.get(`${this.baseUrl}/status/${status}`);
      return response.data.applications || [];
    } catch (error) {
      console.error(`Failed to fetch applications with status ${status}:`, error);
      throw error;
    }
  }

  // Get application stats
  async getStats(): Promise<ApplicationStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return response.data.stats;
    } catch (error) {
      console.error('Failed to fetch application stats:', error);
      throw error;
    }
  }
}

export const applicationService = new ApplicationService();
export default applicationService;