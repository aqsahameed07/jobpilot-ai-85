import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileUp, Save, Trash2, Download, UserRound, FileText } from "lucide-react";

import {
  fetchProfile,
  getResumeFileUrl,
  profileQueryKey,
  removeResumeFile,
  saveMasterResume,
  updateProfile,
  uploadResumeFile,
  type ProfileInput,
} from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — JobPilot AI" },
      {
        name: "description",
        content:
          "Manage your JobPilot AI profile, job search preferences and your master resume used by every AI tool.",
      },
      { property: "og:title", content: "Profile & Settings — JobPilot AI" },
      {
        property: "og:description",
        content: "Update your profile and upload your master resume once.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: profileQueryKey,
    queryFn: fetchProfile,
  });

  const [form, setForm] = useState<ProfileInput>({
    full_name: "",
    headline: "",
    location: "",
    target_role: "",
  });
  const [resumeText, setResumeText] = useState("");

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      headline: profile.headline ?? "",
      location: profile.location ?? "",
      target_role: profile.target_role ?? "",
    });
    setResumeText(profile.resume_text ?? "");
  }, [profile]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: profileQueryKey });

  const profileMutation = useMutation({
    mutationFn: () => updateProfile(form),
    onSuccess: () => {
      toast.success("Profile updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resumeMutation = useMutation({
    mutationFn: () => saveMasterResume(resumeText),
    onSuccess: () => {
      toast.success("Master resume saved");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadResumeFile(file),
    onSuccess: () => {
      toast.success("Resume uploaded");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: (path: string) => removeResumeFile(path),
    onSuccess: () => {
      toast.success("Resume file removed");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function download(path: string) {
    try {
      const url = await getResumeFileUrl(path);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile & settings</h1>
        <p className="text-muted-foreground text-sm">
          Set up your details and master resume once — every AI tool reuses them.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="size-4" /> Your profile
            </CardTitle>
            <CardDescription>{profile?.email ?? "Signed in"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Ada Lovelace"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={form.headline}
                onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                placeholder="Senior Frontend Engineer · React, TypeScript"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Remote · Berlin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_role">Target role</Label>
                <Input
                  id="target_role"
                  value={form.target_role}
                  onChange={(e) => setForm((f) => ({ ...f, target_role: e.target.value }))}
                  placeholder="Staff Engineer"
                />
              </div>
            </div>
            <Button
              variant="hero"
              onClick={() => profileMutation.mutate()}
              disabled={profileMutation.isPending}
            >
              <Save className="size-4" />
              {profileMutation.isPending ? "Saving…" : "Save profile"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" /> Master resume
            </CardTitle>
            <CardDescription>
              Upload it once. The resume analyzer, cover letters and interview coach all use it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-border/60 bg-card/40 flex flex-wrap items-center gap-3 rounded-xl border border-dashed p-4">
              <input
                ref={fileInput}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md,.rtf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadMutation.mutate(file);
                  e.target.value = "";
                }}
              />
              <Button
                variant="glass"
                onClick={() => fileInput.current?.click()}
                disabled={uploadMutation.isPending}
              >
                <FileUp className="size-4" />
                {uploadMutation.isPending ? "Uploading…" : "Upload resume file"}
              </Button>
              {profile?.resume_file_path ? (
                <div className="flex min-w-0 items-center gap-2">
                  <Badge variant="secondary" className="max-w-[180px] truncate">
                    {profile.resume_file_name}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Download resume"
                    onClick={() => download(profile.resume_file_path!)}
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove resume file"
                    onClick={() => removeMutation.mutate(profile.resume_file_path!)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : (
                <span className="text-muted-foreground text-xs">PDF, DOCX, TXT — max 8 MB</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume_text">Resume text (used by the AI)</Label>
              <Textarea
                id="resume_text"
                className="min-h-[240px]"
                placeholder="Paste your resume text here so the AI can read it…"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Text files fill this in automatically. For PDFs, paste the text once.
              </p>
            </div>

            <Button onClick={() => resumeMutation.mutate()} disabled={resumeMutation.isPending}>
              <Save className="size-4" />
              {resumeMutation.isPending ? "Saving…" : "Save master resume"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
