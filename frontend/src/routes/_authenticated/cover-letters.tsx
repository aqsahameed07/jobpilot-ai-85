// frontend/src/routes/_authenticated/cover-letters.tsx
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Download, FileText, PenLine, Trash2 } from "lucide-react";

import { generateCoverLetter } from "@/lib/ai-service";
import {
  coverLettersQueryKey,
  deleteCoverLetter,
  fetchCoverLetters,
  fetchResumes,
  resumesQueryKey,
  saveCoverLetter,
} from "@/lib/ai-data";
import { exportToPDF, exportToWord } from "@/lib/export-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeUploadButton } from "@/components/resume-upload-button";
import { fetchProfile, profileQueryKey } from "@/lib/profile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const TONES = ["professional", "enthusiastic", "concise", "storytelling"] as const;
type Tone = (typeof TONES)[number];

export const Route = createFileRoute("/_authenticated/cover-letters")({
  head: () => ({
    meta: [
      { title: "Cover Letter Generator — JobPilot AI" },
      {
        name: "description",
        content: "Generate tailored, human-sounding cover letters from your resume in seconds.",
      },
      { property: "og:title", content: "Cover Letter Generator — JobPilot AI" },
      {
        property: "og:description",
        content: "AI cover letters tailored to each company and role.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoverLettersPage,
});

function CoverLettersPage() {
  const queryClient = useQueryClient();
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeId, setResumeId] = useState<string>("profile");
  const [uploadedResume, setUploadedResume] = useState<{ name: string; text: string } | null>(null);
  const [content, setContent] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch resumes, profile, and saved letters
  const { data: resumes, isLoading: isLoadingResumes } = useQuery({
    queryKey: resumesQueryKey,
    queryFn: fetchResumes,
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: profileQueryKey,
    queryFn: fetchProfile,
  });

  const { data: letters, isLoading: isLoadingLetters } = useQuery({
    queryKey: coverLettersQueryKey,
    queryFn: fetchCoverLetters,
  });

  // Generate cover letter mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      // Determine which resume to use
      let resumeText = undefined;
      if (resumeId === "upload" && uploadedResume) {
        resumeText = uploadedResume.text;
      } else if (resumeId === "profile" && profile?.resume_text) {
        resumeText = profile.resume_text;
      } else if (resumeId !== "none" && resumeId !== "profile" && resumeId !== "upload") {
        const selectedResume = resumes?.find((r) => r.id === resumeId);
        resumeText = selectedResume?.content;
      }

      // Call the backend API
      const result = await generateCoverLetter({
        company: company.trim(),
        position: position.trim(),
        tone,
        resume: resumeText,
        jobDescription: jobDescription.trim() || undefined,
      });

      // Save the generated letter
      await saveCoverLetter({
        company: company.trim(),
        position: position.trim(),
        tone,
        content: result.content,
      });

      return result.content;
    },
    onSuccess: (text) => {
      setContent(text);
      toast.success("Cover letter generated successfully!");
      queryClient.invalidateQueries({ queryKey: coverLettersQueryKey });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate cover letter");
    },
  });

  // Delete cover letter mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCoverLetter,
    onSuccess: () => {
      toast.success("Cover letter deleted");
      queryClient.invalidateQueries({ queryKey: coverLettersQueryKey });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete cover letter");
    },
  });

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Export to PDF
  const handleExportPDF = async () => {
    if (!content) return;
    setIsExporting(true);
    try {
      await exportToPDF(content, company || "cover-letter", position || "position");
      toast.success("Cover letter exported as PDF!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Export to Word
  const handleExportWord = async () => {
    if (!content) return;
    setIsExporting(true);
    try {
      await exportToWord(content, company || "cover-letter", position || "position");
      toast.success("Cover letter exported as Word document!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export Word document");
    } finally {
      setIsExporting(false);
    }
  };

  // Check if generate button should be disabled
  const isGenerateDisabled = 
    !company.trim() || 
    !position.trim() || 
    generateMutation.isPending ||
    isLoadingResumes ||
    isLoadingProfile;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cover Letters</h1>
        <p className="text-muted-foreground text-sm">
          Generate tailored cover letters from your resume and job description.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Input Form */}
        <div className="space-y-4">
          {/* Company & Position */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={generateMutation.isPending}
            />
            <Input
              placeholder="Position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              disabled={generateMutation.isPending}
            />
          </div>

          {/* Tone & Resume Selection */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Select 
              value={tone} 
              onValueChange={(v) => setTone(v as Tone)}
              disabled={generateMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={resumeId} 
              onValueChange={setResumeId}
              disabled={generateMutation.isPending || (isLoadingResumes && isLoadingProfile)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resume" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profile" disabled={!profile?.resume_text}>
                  {profile?.resume_text ? "Profile Resume" : "No profile resume"}
                </SelectItem>
                {uploadedResume && (
                  <SelectItem value="upload">
                    Uploaded: {uploadedResume.name}
                  </SelectItem>
                )}
                <SelectItem value="none">No resume</SelectItem>
                {resumes?.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resume Upload */}
          <div className="flex flex-wrap items-center gap-2">
            <ResumeUploadButton
              label="Upload resume (PDF / Word)"
              onExtracted={(text, file) => {
                setUploadedResume({ name: file.name, text });
                setResumeId("upload");
                toast.success(`Resume "${file.name}" uploaded successfully!`);
              }}
              disabled={generateMutation.isPending}
            />
            <span className="text-muted-foreground text-xs">
              {profile?.resume_text
                ? "Or use the resume saved in your profile."
                : "No resume saved in your profile yet."}
            </span>
          </div>

          {/* Job Description */}
          <Textarea
            className="min-h-[160px]"
            placeholder="Optional: paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={generateMutation.isPending}
          />

          {/* Generate Button */}
          <Button
            variant="hero"
            className="w-full"
            disabled={isGenerateDisabled}
            onClick={() => generateMutation.mutate()}
          >
            <PenLine className="size-4 mr-2" />
            {generateMutation.isPending ? (
              <>
                <span className="animate-pulse">Writing...</span>
                <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              "Generate Cover Letter"
            )}
          </Button>

          {/* Saved Letters */}
          {isLoadingLetters ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Saved Letters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ) : (letters?.length ?? 0) > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Saved Letters</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {letters?.length} letter{letters?.length !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                {letters?.map((l) => (
                  <div 
                    key={l.id} 
                    className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <button
                      className="flex-1 truncate text-left"
                      onClick={() => {
                        setContent(l.content);
                        setCompany(l.company);
                        setPosition(l.position);
                        setTone(l.tone as Tone || "professional");
                      }}
                    >
                      <span className="font-medium">{l.position}</span>
                      <span className="text-muted-foreground mx-1">·</span>
                      <span className="text-muted-foreground">{l.company}</span>
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteMutation.mutate(l.id)}
                      disabled={deleteMutation.isPending}
                      aria-label="Delete cover letter"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Right Column - Generated Content */}
        <div className="space-y-3">
          {content ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-medium text-muted-foreground">Generated Cover Letter</h3>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(content)}
                    className="whitespace-nowrap"
                  >
                    <Copy className="size-4 mr-2" />
                    Copy
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        disabled={isExporting}
                        className="whitespace-nowrap"
                      >
                        <Download className="size-4 mr-2" />
                        {isExporting ? "Exporting..." : "Save As"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="cursor-pointer"
                      >
                        <FileText className="size-4 mr-2" />
                        <span>Save as PDF</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleExportWord}
                        disabled={isExporting}
                        className="cursor-pointer"
                      >
                        <FileText className="size-4 mr-2" />
                        <span>Save as Word</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <Textarea
                className="min-h-[420px] leading-relaxed font-serif resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Your generated cover letter will appear here..."
              />
            </>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <PenLine className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No Cover Letter Generated</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Fill in the company, position, and optional details on the left, then click "Generate Cover Letter" to create a tailored letter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}