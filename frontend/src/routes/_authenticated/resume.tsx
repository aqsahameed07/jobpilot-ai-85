// frontend/src/routes/_authenticated/resume.tsx
import { useEffect, useState } from "react";
import { fetchProfile, profileQueryKey } from "@/lib/profile";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Trash2, FileText, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";

import { analyzeResume } from "@/lib/ai-service";
import {
  deleteResume,
  fetchResumes,
  resumesQueryKey,
  saveResume,
  type Resume,
} from "@/lib/ai-data";
import { fetchApplications, applicationsQueryKey, STATUS_LABEL } from "@/lib/applications";
import type { ResumeAnalysis, SkillGap } from "@/lib/ai-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResumeUploadButton } from "@/components/resume-upload-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({
    meta: [
      { title: "Resume Analyzer — JobPilot AI" },
      {
        name: "description",
        content:
          "Score your resume against ATS filters, uncover skill gaps, and get targeted rewrites.",
      },
      { property: "og:title", content: "Resume Analyzer — JobPilot AI" },
      {
        property: "og:description",
        content: "ATS scoring and skill gap analysis powered by AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResumePage,
});

function ScoreRing({ label, value, subtext }: { label: string; value: number; subtext?: string }) {
  const getColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-muted-foreground text-xs tracking-wide uppercase">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${getColor(value)}`}>{value}</p>
      <Progress value={value} className="mt-3" />
      {subtext && <p className="text-muted-foreground mt-1 text-xs">{subtext}</p>}
    </div>
  );
}

/**
 * Normalize analysis data to ensure consistent structure
 */
function normalizeAnalysis(analysis: any): ResumeAnalysis {
  // Ensure strengths is always an array
  let strengths: string[] = [];
  if (Array.isArray(analysis.strengths)) {
    strengths = analysis.strengths;
  } else if (analysis.strengths) {
    if (analysis.strengths.overall && Array.isArray(analysis.strengths.overall)) {
      strengths = analysis.strengths.overall;
    } else if (analysis.strengths.technical && Array.isArray(analysis.strengths.technical)) {
      strengths = [
        ...(analysis.strengths.technical || []),
        ...(analysis.strengths.professional || []),
        ...(analysis.strengths.educational || [])
      ];
    } else {
      // Try to extract any string arrays
      const values = Object.values(analysis.strengths);
      for (const val of values) {
        if (Array.isArray(val) && val.every((item: any) => typeof item === 'string')) {
          strengths = strengths.concat(val);
        }
      }
    }
  }

  // Ensure weaknesses is always an array
  let weaknesses: string[] = [];
  if (Array.isArray(analysis.weaknesses)) {
    weaknesses = analysis.weaknesses;
  } else if (analysis.weaknesses) {
    if (analysis.weaknesses.critical && Array.isArray(analysis.weaknesses.critical)) {
      weaknesses = [
        ...(analysis.weaknesses.critical || []),
        ...(analysis.weaknesses.moderate || []),
        ...(analysis.weaknesses.minor || [])
      ];
    } else {
      const values = Object.values(analysis.weaknesses);
      for (const val of values) {
        if (Array.isArray(val) && val.every((item: any) => typeof item === 'string')) {
          weaknesses = weaknesses.concat(val);
        }
      }
    }
  }

  // Ensure missing_keywords is always an array
  const missingKeywords = Array.isArray(analysis.missing_keywords) 
    ? analysis.missing_keywords 
    : [];

  // Ensure skill_gaps is always an array
  const skillGaps: SkillGap[] = Array.isArray(analysis.skill_gaps) 
    ? analysis.skill_gaps.map((g: any) => ({
        skill: g.skill || '',
        importance: g.importance || 'medium',
        how_to_close: g.how_to_close || g.howToClose || ''
      }))
    : [];

  // Ensure actionable_advice is always an array of strings
  let actionableAdvice: string[] = [];
  if (Array.isArray(analysis.actionable_advice)) {
    if (analysis.actionable_advice.length > 0 && typeof analysis.actionable_advice[0] === 'string') {
      actionableAdvice = analysis.actionable_advice;
    } else if (analysis.actionable_advice.length > 0 && typeof analysis.actionable_advice[0] === 'object') {
      actionableAdvice = analysis.actionable_advice.map((item: any) => 
        item.action || item.suggestion || JSON.stringify(item)
      );
    }
  }

  // Ensure suggested_rewrites is always an array of strings
  let suggestedRewrites: string[] = [];
  if (Array.isArray(analysis.suggested_rewrites)) {
    if (analysis.suggested_rewrites.length > 0 && typeof analysis.suggested_rewrites[0] === 'string') {
      suggestedRewrites = analysis.suggested_rewrites;
    } else if (analysis.suggested_rewrites.length > 0 && typeof analysis.suggested_rewrites[0] === 'object') {
      suggestedRewrites = analysis.suggested_rewrites.map((item: any) => 
        item.rewritten || item.suggestion || item.original || JSON.stringify(item)
      );
    }
  }

  // Ensure improvements has the right structure
  const improvements = {
    formatting: Array.isArray(analysis.improvements?.formatting) 
      ? analysis.improvements.formatting
      : analysis.improvements?.formatting?.issues || [],
    content: Array.isArray(analysis.improvements?.content)
      ? analysis.improvements.content
      : analysis.improvements?.content?.issues || [],
    keywords: Array.isArray(analysis.improvements?.keywords)
      ? analysis.improvements.keywords
      : analysis.improvements?.keywords?.issues || [],
    achievements: Array.isArray(analysis.improvements?.achievements)
      ? analysis.improvements.achievements
      : analysis.improvements?.achievements?.issues || []
  };

  return {
    ats_score: analysis.ats_score || 0,
    match_score: analysis.match_score ?? null,
    job_description_provided: analysis.job_description_provided || false,
    summary: analysis.summary || analysis.analysis_summary?.overall_assessment || "Analysis complete",
    strengths,
    weaknesses,
    missing_keywords: missingKeywords,
    skill_gaps: skillGaps,
    improvements,
    actionable_advice: actionableAdvice,
    suggested_rewrites: suggestedRewrites,
    // Optional fields with defaults
    analysis_summary: analysis.analysis_summary || {
      overall_assessment: analysis.summary || "Analysis complete",
      strength_count: strengths.length,
      weakness_count: weaknesses.length,
      critical_issues: []
    },
    scores: analysis.scores || {
      experience_score: 0,
      technical_skills_score: 0,
      keyword_match_score: 0,
      achievements_score: 0,
      formatting_score: 0
    }
  };
}

function AnalysisPanel({ analysis }: { analysis: any }) {
  // Normalize the analysis data to ensure consistent structure
  const normalized = normalizeAnalysis(analysis);
  
  return (
    <div className="space-y-5">
      {/* Score Section */}
      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreRing 
          label="ATS Score" 
          value={normalized.ats_score} 
          subtext={normalized.ats_score >= 80 ? "Great! Your resume is ATS-friendly" : "Needs improvement for ATS"} 
        />
        {typeof normalized.match_score === "number" && (
          <ScoreRing 
            label="Job Match" 
            value={normalized.match_score} 
            subtext={normalized.match_score >= 70 ? "Good alignment" : "Needs more keywords"} 
          />
        )}
      </div>

      <p className="text-muted-foreground text-sm">{normalized.summary}</p>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Strengths</p>
          <p className="text-lg font-semibold text-green-500">{normalized.strengths?.length || 0}</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Weaknesses</p>
          <p className="text-lg font-semibold text-red-500">{normalized.weaknesses?.length || 0}</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Missing Keywords</p>
          <p className="text-lg font-semibold text-yellow-500">{normalized.missing_keywords?.length || 0}</p>
        </div>
      </div>

      {/* Main Analysis Tabs */}
      <Tabs defaultValue="improvements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="improvements">
            <TrendingUp className="mr-2 size-4" />
            Improvements
          </TabsTrigger>
          <TabsTrigger value="strengths">
            <CheckCircle className="mr-2 size-4" />
            Strengths
          </TabsTrigger>
          <TabsTrigger value="weaknesses">
            <AlertCircle className="mr-2 size-4" />
            Weaknesses
          </TabsTrigger>
        </TabsList>

        {/* Improvements Tab */}
        <TabsContent value="improvements" className="space-y-4 pt-4">
          {normalized.actionable_advice && normalized.actionable_advice.length > 0 && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-sm">
                  <Lightbulb className="mr-2 size-4 text-yellow-500" />
                  Quick Wins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {normalized.actionable_advice.map((advice: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 text-blue-500">•</span>
                    <span className="text-muted-foreground">{advice}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {normalized.improvements?.formatting && normalized.improvements.formatting.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Formatting Improvements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {normalized.improvements.formatting.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500">📝</span>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {normalized.improvements?.content && normalized.improvements.content.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Content Improvements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {normalized.improvements.content.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500">✍️</span>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {normalized.improvements?.keywords && normalized.improvements.keywords.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Keyword Improvements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {normalized.improvements.keywords.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-500">🔑</span>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {normalized.improvements?.achievements && normalized.improvements.achievements.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Achievement Improvements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {normalized.improvements.achievements.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-purple-500">🏆</span>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {normalized.suggested_rewrites && normalized.suggested_rewrites.length > 0 && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Suggested Rewrites</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {normalized.suggested_rewrites.map((rewrite: string, index: number) => (
                  <div key={index} className="rounded-lg bg-muted/50 p-3 text-sm">
                    {rewrite}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Strengths Tab */}
        <TabsContent value="strengths" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {normalized.strengths.map((s: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-500" />
                    <span className="text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weaknesses Tab */}
        <TabsContent value="weaknesses" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {normalized.weaknesses.map((w: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                    <span className="text-sm">{w}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {normalized.missing_keywords && normalized.missing_keywords.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Missing Keywords to Add</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {normalized.missing_keywords.map((k: string) => (
                <Badge key={k} variant="secondary" className="text-xs">
                  {k}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {normalized.skill_gaps && normalized.skill_gaps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Skill Gaps to Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {normalized.skill_gaps.map((g: SkillGap, index: number) => (
              <div key={index} className="border-border/60 border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{g.skill}</span>
                  <Badge variant={g.importance === "high" ? "destructive" : "outline"}>
                    {g.importance}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{g.how_to_close}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Overall Assessment</p>
              <p className="text-sm font-medium">
                {normalized.ats_score >= 80 
                  ? "🌟 Strong resume! Ready for applications." 
                  : normalized.ats_score >= 60 
                  ? "📈 Good foundation. Some improvements needed." 
                  : "📝 Needs significant revision for ATS."}
              </p>
            </div>
            <Badge variant={normalized.ats_score >= 80 ? "default" : "secondary"}>
              {normalized.ats_score >= 80 ? "Recommended" : "Needs Work"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResumePage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("My resume");
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>("");

  const { data: saved } = useQuery({ queryKey: resumesQueryKey, queryFn: fetchResumes });
  const { data: profile } = useQuery({ queryKey: profileQueryKey, queryFn: fetchProfile });
  const { data: applications = [] } = useQuery({
    queryKey: applicationsQueryKey,
    queryFn: fetchApplications,
  });

  useEffect(() => {
    if (profile?.resume_text && !resume) setResume(profile.resume_text);
  }, [profile?.resume_text]);

  useEffect(() => {
    if (selectedApplicationId) {
      const app = applications.find((a) => a.id === selectedApplicationId);
      if (app) {
        setJobDescription(app.job_description || `Company: ${app.company}\nPosition: ${app.position}\nStatus: ${app.status}`);
      }
    }
  }, [selectedApplicationId, applications]);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const selectedApp = applications.find((a) => a.id === selectedApplicationId);
      
      const result = await analyzeResume({
        resume,
        jobDescription: jobDescription.trim() || undefined,
        applicationContext: selectedApp ? {
          id: selectedApp.id,
          position: selectedApp.position,
          company: selectedApp.company,
          status: selectedApp.status,
        } : null,
      });
      
      // Normalize the result before saving
      const normalizedResult = normalizeAnalysis(result);
      
      await saveResume({
        title: title.trim() || "Untitled resume",
        content: resume,
        ats_score: normalizedResult.ats_score,
        analysis: normalizedResult,
      });
      
      return normalizedResult;
    },
    onSuccess: (result) => {
      setAnalysis(result);
      toast.success("Resume analyzed successfully!");
      queryClient.invalidateQueries({ queryKey: resumesQueryKey });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Analysis failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      toast.success("Resume deleted");
      queryClient.invalidateQueries({ queryKey: resumesQueryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function loadSaved(resume: Resume) {
    setTitle(resume.title);
    setResume(resume.content);
    setAnalysis(resume.analysis);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resume Analyzer</h1>
        <p className="text-muted-foreground text-sm">
          Get ATS scoring, skill gap analysis, and actionable improvements powered by AI.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Resume name" 
          />

          <div className="flex flex-wrap items-center gap-2">
            <ResumeUploadButton
              onExtracted={(text, file) => {
                setResume(text);
                if (!title.trim() || title === "My resume")
                  setTitle(file.name.replace(/\.[^.]+$/, ""));
              }}
            />
            {profile?.resume_text && (
              <Button variant="ghost" onClick={() => setResume(profile.resume_text!)}>
                Use saved resume
              </Button>
            )}
            <span className="text-muted-foreground text-xs">PDF, DOCX, TXT or RTF</span>
          </div>

          <Textarea
            className="min-h-[220px]"
            placeholder="Paste your resume text here…"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Or select a job application
            </label>
            <Select value={selectedApplicationId} onValueChange={setSelectedApplicationId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an application..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Clear selection</SelectItem>
                {applications.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    <div className="flex items-center gap-2">
                      <span>{app.position}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{app.company}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({STATUS_LABEL[app.status]})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Textarea
            className="min-h-[140px]"
            placeholder="Optional: paste the job description for targeted analysis"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          
          <Button
            variant="hero"
            className="w-full"
            disabled={resume.trim().length < 50 || analyzeMutation.isPending}
            onClick={() => analyzeMutation.mutate()}
          >
            <Sparkles className="size-4 mr-2" />
            {analyzeMutation.isPending ? (
              <>
                <span className="animate-pulse">Analyzing...</span>
                <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              "Analyze with AI"
            )}
          </Button>

          {(saved?.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Saved Analyses</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {saved?.length} resume{saved?.length !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {saved?.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <button
                      className="hover:text-primary flex flex-1 items-center gap-2 text-left text-sm"
                      onClick={() => loadSaved(r)}
                    >
                      <FileText className="size-4 shrink-0" />
                      <span className="truncate">{r.title}</span>
                      {r.ats_score !== null && (
                        <Badge variant="secondary" className="ml-auto">
                          {r.ats_score}
                        </Badge>
                      )}
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(r.id)}
                      aria-label="Delete resume"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {analyzeMutation.isPending ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-sm text-muted-foreground">Analyzing your resume with AI...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a few seconds</p>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {selectedApplicationId && (
                <div className="glass rounded-lg border-l-4 border-l-primary p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Analyzing for
                  </p>
                  <div className="space-y-1">
                    {applications
                      .filter((a) => a.id === selectedApplicationId)
                      .map((app) => (
                        <div key={app.id}>
                          <p className="font-semibold">{app.position}</p>
                          <p className="text-sm text-muted-foreground">{app.company}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Status: {STATUS_LABEL[app.status]}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              <AnalysisPanel analysis={analysis} />
            </div>
          ) : (
            <div className="glass text-muted-foreground flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl p-8 text-center">
              <FileText className="mb-4 size-12 text-muted-foreground/50" />
              <p className="text-sm">
                Paste your resume above and click "Analyze with AI" to get:
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                <li>• ATS Score (0-100)</li>
                <li>• Job Match Percentage</li>
                <li>• Strengths & Weaknesses</li>
                <li>• Missing Keywords</li>
                <li>• Skill Gaps with Solutions</li>
                <li>• Actionable Improvements</li>
                <li>• Suggested Rewrites</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}