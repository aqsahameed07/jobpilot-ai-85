import { z } from "zod";
import api from "./api";

export const profileQueryKey = ["profile"] as const;

export type Profile = {
  id: string;
  email: string;
  name: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  location: string | null;
  target_role: string | null;
  resume_text: string | null;
  resume_file_path: string | null;
  resume_file_name: string | null;
};

export const profileSchema = z.object({
  full_name: z.string().trim().max(120).optional().or(z.literal("")),
  headline: z.string().trim().max(160).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  target_role: z.string().trim().max(120).optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export type Settings = {
  emailNotifications: boolean;
  jobAlerts: boolean;
  weeklyDigest: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
};

const RESUME_FILE_KEY = "jobpilot-resume-file";

/**
 * Fetch user profile from API
 */
export async function fetchProfile(): Promise<Profile & { email: string | null }> {
  try {
    const response = await api.get('/users/profile');
    if (response.data.success && response.data.user) {
      const user = response.data.user;
      return {
        id: user.id || user._id,
        email: user.email,
        name: user.name,
        full_name: user.full_name || null,
        avatar_url: user.avatar_url || null,
        headline: user.headline || null,
        location: user.location || null,
        target_role: user.target_role || null,
        resume_text: user.resume_text || null,
        resume_file_path: user.resume_file_path || null,
        resume_file_name: user.resume_file_name || null,
      };
    }
    throw new Error('Failed to fetch profile');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch profile');
  }
}

/**
 * Update user profile
 */
export async function updateProfile(input: ProfileInput) {
  try {
    const response = await api.put('/users/profile', {
      full_name: input.full_name?.trim() || null,
      headline: input.headline?.trim() || null,
      location: input.location?.trim() || null,
      target_role: input.target_role?.trim() || null,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update profile');
    }
    
    return response.data.user;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update profile');
  }
}

/**
 * Save master resume text to backend
 */
export async function saveMasterResume(text: string) {
  try {
    const response = await api.put('/users/profile/resume', {
      resume_text: text.trim() || null,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save resume');
    }
    
    return response.data.resume_text;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to save resume');
  }
}

const ACCEPTED = [".pdf", ".doc", ".docx", ".txt", ".md", ".rtf"];

/**
 * Upload resume file to backend
 */
export async function uploadResumeFile(file: File) {
  try {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!ACCEPTED.includes(ext)) {
      throw new Error("Upload a PDF, DOCX, TXT or RTF file.");
    }
    
    if (file.size > 8 * 1024 * 1024) {
      throw new Error("File must be smaller than 8 MB.");
    }

    // For text files, also extract the text content
    let resumeText = null;
    if (file.type.startsWith("text/") || ext === ".txt" || ext === ".md") {
      try {
        resumeText = await file.text();
        resumeText = resumeText.slice(0, 20000); // Limit to 20000 chars
      } catch (e) {
        console.warn("Could not extract text from file:", e);
      }
    }

    // Send both file metadata and text to backend
    const response = await api.post('/users/profile/resume-upload', {
      resume_file_name: file.name,
      resume_file_path: `resume-files/${file.name}`,
      resume_text: resumeText,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to upload resume');
    }

    // Store file info in local storage for reference
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        RESUME_FILE_KEY,
        JSON.stringify({
          path: response.data.resume_file_path,
          fileName: file.name,
          type: file.type || "application/octet-stream",
        }),
      );
    }

    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to upload resume');
  }
}

/**
 * Remove resume file from backend
 */
export async function removeResumeFile(path: string) {
  try {
    const response = await api.delete('/users/profile/resume');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to remove resume');
    }

    // Clear from local storage
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(RESUME_FILE_KEY);
    }

    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to remove resume');
  }
}

/**
 * Get resume file URL
 */
export async function getResumeFileUrl(path: string) {
  if (typeof window === "undefined") return path;

  try {
    const raw = window.localStorage.getItem(RESUME_FILE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    if (saved?.path === path) return saved.path;
  } catch {
    // ignore malformed local storage data
  }

  return path;
}

/**
 * Fetch user settings from backend
 */
export async function fetchSettings(): Promise<Settings> {
  try {
    const response = await api.get('/users/settings');
    if (response.data.success && response.data.settings) {
      return response.data.settings;
    }
    throw new Error('Failed to fetch settings');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch settings');
  }
}

/**
 * Update user settings on backend
 */
export async function updateSettings(settings: Partial<Settings>) {
  try {
    const response = await api.put('/users/settings', settings);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update settings');
    }
    
    return response.data.settings;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update settings');
  }
}
