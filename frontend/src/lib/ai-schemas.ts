// frontend/src/lib/ai-schemas.ts
export interface ResumeAnalysis {
  ats_score: number;
  match_score: number | null;
  job_description_provided?: boolean;
  analysis_summary?: {
    overall_assessment: string;
    strength_count: number;
    weakness_count: number;
    critical_issues: string[];
  };
  scores?: {
    experience_score: number;
    technical_skills_score: number;
    keyword_match_score: number;
    achievements_score: number;
    formatting_score: number;
  };
  experience_analysis?: {
    total_experience_years: number;
    required_experience_years: number | null;
    experience_gap_years: number;
    experience_status: string;
    recommendation: string;
    equivalent_experience: string;
  };
  technical_skills?: {
    present_skills: string[];
    missing_skills: string[];
    skill_match_percentage: number;
  };
  keywords_analysis?: {
    total_keywords_found: number;
    total_keywords_required: number;
    matched_keywords: string[];
    missing_keywords: string[];
    keyword_match_percentage: number;
  };
  strengths: string[] | {
    technical: string[];
    professional: string[];
    educational: string[];
    overall: string[];
  };
  weaknesses: string[] | {
    critical: string[];
    moderate: string[];
    minor: string[];
  };
  missing_keywords: string[];
  skill_gaps: SkillGap[];
  improvements: {
    formatting: { issues: string[]; suggestions: string[] } | string[];
    content: { issues: string[]; suggestions: string[] } | string[];
    keywords: { issues: string[]; suggestions: string[] } | string[];
    achievements: { issues: string[]; suggestions: string[] } | string[];
  };
  actionable_advice: string[] | { priority: string; action: string; reason: string; expected_impact: string }[];
  suggested_rewrites: string[] | { original: string; rewritten: string; reason: string }[];
  ats_optimization?: {
    current_ats_friendliness: string;
    recommendations: string[];
    format_check: {
      file_format: string;
      recommended_format: string;
      heading_check: string;
      keyword_density: string;
    };
  };
  overall_recommendation?: {
    should_apply: string;
    reason: string;
    next_steps: string[];
    estimated_success_rate: string;
  };
}

export interface SkillGap {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  how_to_close: string;
}

