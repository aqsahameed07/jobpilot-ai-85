// frontend/src/routes/_authenticated/interview.tsx
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, Send, Trophy, User, Sparkles, Clock, CheckCircle, AlertCircle } from "lucide-react";

import { interviewTurn, scoreInterview } from "@/lib/ai-service";
import { fetchInterviews, interviewsQueryKey, saveInterview } from "@/lib/ai-data";
import { applicationsQueryKey, fetchApplications, STATUS_LABEL } from "@/lib/applications";
import type { ChatMessage, InterviewFeedback } from "@/lib/ai-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const LEVELS = ["junior", "mid", "senior"] as const;
type Level = (typeof LEVELS)[number];

export const Route = createFileRoute("/_authenticated/interview")({
  head: () => ({
    meta: [
      { title: "AI Interview Practice — JobPilot AI" },
      {
        name: "description",
        content: "Run realistic mock interviews with an AI interviewer and get scored feedback.",
      },
      { property: "og:title", content: "AI Interview Practice — JobPilot AI" },
      {
        property: "og:description",
        content: "Practice interviews, get a score and actionable feedback.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InterviewPage,
});

function InterviewPage() {
  const queryClient = useQueryClient();

  const [role, setRole] = useState("");
  const [source, setSource] = useState("custom");
  const [difficulty, setDifficulty] = useState<Level>("mid");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<InterviewFeedback | null>(null);
  const [questionCount, setQuestionCount] = useState(0);

  const { data: history } = useQuery({
    queryKey: interviewsQueryKey,
    queryFn: fetchInterviews,
  });

  const { data: applications } = useQuery({
    queryKey: applicationsQueryKey,
    queryFn: fetchApplications,
  });

  const appliedApplications = (applications ?? []).filter((a) => a.status === "applied");

  function onSourceChange(value: string) {
    setSource(value);
    if (value === "custom") {
      setRole("");
      return;
    }
    const app = appliedApplications.find((a) => a.id === value);
    if (app) {
      setRole(`${app.position} at ${app.company}`);
      toast.info(`Preparing interview for ${app.position} at ${app.company}`);
    }
  }

  const askMutation = useMutation({
    mutationFn: async (next: ChatMessage[]) => {
      const res = await interviewTurn({
        role: role.trim(),
        difficulty,
        messages: next
      });
      return res.content;
    },
    onSuccess: (content) => {
      setMessages((prev) => [...prev, { role: "assistant", content }]);
      setQuestionCount((prev) => prev + 1);
    },
    onError: (error: Error) => {
      toast.error(error.message || "The interviewer is unavailable");
    },
  });

  const finishMutation = useMutation({
    mutationFn: async () => {
      const feedback = await scoreInterview({
        role: role.trim(),
        messages
      });
      await saveInterview({
        role_title: role.trim(),
        difficulty,
        messages,
        result: feedback,
      });
      return feedback;
    },
    onSuccess: (feedback) => {
      setResult(feedback);
      setStarted(false);
      toast.success("Interview scored! Check your results.");
      queryClient.invalidateQueries({ queryKey: interviewsQueryKey });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Scoring failed");
    },
  });

  function start() {
    if (!role.trim()) {
      toast.error("Please enter a role or select an application");
      return;
    }
    setMessages([]);
    setResult(null);
    setQuestionCount(0);
    setStarted(true);
    toast.success(`Starting ${difficulty} level interview for ${role}`);
    // First question
    askMutation.mutate([]);
  }

  function send() {
    const text = answer.trim();
    if (!text) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setAnswer("");
    askMutation.mutate(next);
  }

  function resetInterview() {
    setStarted(false);
    setMessages([]);
    setResult(null);
    setQuestionCount(0);
    toast.info("Interview reset. Ready to start a new one.");
  }

  const busy = askMutation.isPending || finishMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Interview Practice</h1>
          <p className="text-muted-foreground text-sm">
            Live mock interviews with instant scoring and feedback.
          </p>
        </div>
        {started && (
          <Badge variant="outline" className="gap-2">
            <Clock className="size-3" />
            Question {questionCount}
          </Badge>
        )}
      </div>

      {/* Setup Section */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={source} onValueChange={onSourceChange} disabled={started}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Pick an application" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom role</SelectItem>
            {appliedApplications.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.position} · {a.company}
              </SelectItem>
            ))}
            {appliedApplications.length === 0 && (
              <SelectItem value="none" disabled>
                No applications in “Applied”
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        
        <Input
          className="min-w-[220px] flex-1"
          placeholder="Role, e.g. Senior Frontend Engineer"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setSource("custom");
          }}
          disabled={started}
        />

        <Select
          value={difficulty}
          onValueChange={(v) => setDifficulty(v as Level)}
          disabled={started}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((l) => (
              <SelectItem key={l} value={l} className="capitalize">
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {started ? (
          <>
            <Button
              variant="glass"
              disabled={messages.length < 2 || busy}
              onClick={() => finishMutation.mutate()}
            >
              <Trophy className="size-4" />
              {finishMutation.isPending ? "Scoring…" : "Finish & score"}
            </Button>
            <Button
              variant="ghost"
              onClick={resetInterview}
              disabled={busy}
            >
              Reset
            </Button>
          </>
        ) : (
          <Button 
            variant="hero" 
            disabled={!role.trim() || busy} 
            onClick={start}
            className="gap-2"
          >
            <Sparkles className="size-4" />
            Start interview
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <div className="glass min-h-[400px] max-h-[500px] space-y-4 overflow-y-auto rounded-2xl p-4">
            {messages.length === 0 && !busy && (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <Bot className="mb-4 size-12 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  Pick a role and start — the interviewer asks one question at a time.
                </p>
                <p className="text-muted-foreground/70 text-xs mt-2">
                  Answer each question naturally. The AI will adapt to your responses.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Bot className="size-4" />
                  </span>
                )}
                <div className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "assistant" 
                    ? "bg-primary/5" 
                    : "bg-primary/20"
                }`}>
                  {m.content}
                </div>
                {m.role === "user" && (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <User className="size-4" />
                  </span>
                )}
              </div>
            ))}
            {askMutation.isPending && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Bot className="size-4" />
                <p className="text-sm animate-pulse">Interviewer is thinking…</p>
              </div>
            )}
          </div>

          {started && (
            <div className="mt-3 flex gap-2">
              <Textarea
                className="min-h-[60px] max-h-[120px]"
                placeholder="Type your answer… (Press Ctrl+Enter to send)"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={busy}
              />
              <Button 
                onClick={send} 
                disabled={busy || !answer.trim()} 
                className="shrink-0"
                aria-label="Send answer"
              >
                <Send className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Results */}
          {result && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="size-4 text-yellow-500" />
                  Your Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className={`text-4xl font-semibold ${
                  result.score >= 80 ? "text-green-500" :
                  result.score >= 60 ? "text-yellow-500" :
                  "text-red-500"
                }`}>
                  {result.score}
                </p>
                <Progress value={result.score} className="h-2" />
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="glass rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Technical</p>
                    <p className={`font-semibold ${(result.technical_rating || 0) >= 70 ? "text-green-500" : "text-yellow-500"}`}>
                      {result.technical_rating || 0}%
                    </p>
                  </div>
                  <div className="glass rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Communication</p>
                    <p className={`font-semibold ${(result.communication_rating || 0) >= 70 ? "text-green-500" : "text-yellow-500"}`}>
                      {result.communication_rating || 0}%
                    </p>
                  </div>
                  <div className="glass rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Problem Solving</p>
                    <p className={`font-semibold ${(result.problem_solving_rating || 0) >= 70 ? "text-green-500" : "text-yellow-500"}`}>
                      {result.problem_solving_rating || 0}%
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-medium">Recommendation</p>
                  <p className={`text-sm font-semibold ${
                    result.recommendation?.includes("Yes") ? "text-green-500" :
                    result.recommendation?.includes("With training") ? "text-yellow-500" :
                    "text-red-500"
                  }`}>
                    {result.recommendation}
                  </p>
                </div>

                <p className="text-muted-foreground text-sm">{result.feedback}</p>
                
                {result.strengths && result.strengths.length > 0 && (
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2 text-green-500">
                      <CheckCircle className="size-4" />
                      Strengths
                    </p>
                    {result.strengths.map((s, i) => (
                      <p key={i} className="text-muted-foreground text-sm ml-6">
                        • {s}
                      </p>
                    ))}
                  </div>
                )}
                
                {result.improvements && result.improvements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2 text-red-500">
                      <AlertCircle className="size-4" />
                      Improve
                    </p>
                    {result.improvements.map((s, i) => (
                      <p key={i} className="text-muted-foreground text-sm ml-6">
                        • {s}
                      </p>
                    ))}
                  </div>
                )}

                {result.key_topics_covered && result.key_topics_covered.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Topics Covered</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.key_topics_covered.map((topic, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Past Sessions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Past Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[200px] overflow-y-auto">
              {(history?.length ?? 0) === 0 && (
                <p className="text-muted-foreground text-sm">No sessions yet.</p>
              )}
              {history?.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2 text-sm border-b border-border/50 pb-2 last:border-0">
                  <span className="truncate font-medium">{s.role_title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {s.difficulty}
                    </Badge>
                    <Badge variant={s.score && s.score >= 70 ? "default" : "destructive"}>
                      {s.score ?? "—"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}