import type { ResumeAnalysis, ChatMessage, InterviewFeedback } from "./ai-schemas";

export const resumesQueryKey = ["resumes"] as const;
export const coverLettersQueryKey = ["cover_letters"] as const;
export const interviewsQueryKey = ["interview_sessions"] as const;

export type Resume = {
  id: string;
  title: string;
  content: string;
  ats_score: number | null;
  analysis: ResumeAnalysis | null;
  created_at: string;
};

export type CoverLetter = {
  id: string;
  company: string;
  position: string;
  tone: string;
  content: string;
  created_at: string;
};

export type InterviewSession = {
  id: string;
  role_title: string;
  difficulty: string;
  messages: ChatMessage[];
  score: number | null;
  feedback: string | null;
  completed_at: string | null;
  created_at: string;
};

const KEYS = {
  resumes: "jobpilot-resumes",
  coverLetters: "jobpilot-cover-letters",
  interviews: "jobpilot-interviews",
};

function readStore<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeStore<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

async function userId() {
  if (typeof window === "undefined") return "local-user";

  try {
    const raw = window.localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    return user?.id ?? "local-user";
  } catch {
    return "local-user";
  }
}

export async function fetchResumes(): Promise<Resume[]> {
  return readStore<Resume>(KEYS.resumes);
}

export async function saveResume(input: {
  title: string;
  content: string;
  ats_score?: number | null;
  analysis?: ResumeAnalysis | null;
}) {
  const resumes = readStore<Resume>(KEYS.resumes);
  const item: Resume = {
    id: crypto.randomUUID(),
    title: input.title,
    content: input.content,
    ats_score: input.ats_score ?? null,
    analysis: input.analysis ?? null,
    created_at: new Date().toISOString(),
  };

  const next = [item, ...resumes];
  writeStore(KEYS.resumes, next);
  return item;
}

export async function deleteResume(id: string) {
  const resumes = readStore<Resume>(KEYS.resumes).filter((item) => item.id !== id);
  writeStore(KEYS.resumes, resumes);
}

export async function fetchCoverLetters(): Promise<CoverLetter[]> {
  return readStore<CoverLetter>(KEYS.coverLetters);
}

export async function saveCoverLetter(input: {
  company: string;
  position: string;
  tone: string;
  content: string;
}) {
  const letters = readStore<CoverLetter>(KEYS.coverLetters);
  const item: CoverLetter = {
    id: crypto.randomUUID(),
    company: input.company,
    position: input.position,
    tone: input.tone,
    content: input.content,
    created_at: new Date().toISOString(),
  };

  writeStore(KEYS.coverLetters, [item, ...letters]);
}

export async function deleteCoverLetter(id: string) {
  const letters = readStore<CoverLetter>(KEYS.coverLetters).filter((item) => item.id !== id);
  writeStore(KEYS.coverLetters, letters);
}

export async function fetchInterviews(): Promise<InterviewSession[]> {
  return readStore<InterviewSession>(KEYS.interviews);
}

export async function saveInterview(input: {
  role_title: string;
  difficulty: string;
  messages: ChatMessage[];
  result: InterviewFeedback;
}) {
  const interviews = readStore<InterviewSession>(KEYS.interviews);
  const item: InterviewSession = {
    id: crypto.randomUUID(),
    role_title: input.role_title,
    difficulty: input.difficulty,
    messages: input.messages,
    score: input.result.score,
    feedback: input.result.feedback,
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  writeStore(KEYS.interviews, [item, ...interviews]);
}
