import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, Send, Trophy, User } from "lucide-react";

import { interviewTurn, scoreInterview } from "@/lib/ai.functions";
import { fetchInterviews, interviewsQueryKey, saveInterview } from "@/lib/ai-data";
import { applicationsQueryKey, fetchApplications } from "@/lib/applications";
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
  const turn = useServerFn(interviewTurn);
  const grade = useServerFn(scoreInterview);

  const [role, setRole] = useState("");
  const [source, setSource] = useState("custom");
  const [difficulty, setDifficulty] = useState<Level>("mid");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<InterviewFeedback | null>(null);

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
    if (value === "custom") return;
    const app = appliedApplications.find((a) => a.id === value);
    if (app) setRole(`${app.position} at ${app.company}`);
  }


  const askMutation = useMutation({
    mutationFn: async (next: ChatMessage[]) => {
      const res = await turn({ data: { role: role.trim(), difficulty, messages: next } });
      return res.content;
    },
    onSuccess: (content) =>
      setMessages((prev) => [...prev, { role: "assistant", content }]),
    onError: (e: Error) => toast.error(e.message || "The interviewer is unavailable"),
  });

  const finishMutation = useMutation({
    mutationFn: async () => {
      const feedback = await grade({ data: { role: role.trim(), messages } });
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
      toast.success("Interview scored");
      queryClient.invalidateQueries({ queryKey: interviewsQueryKey });
    },
    onError: (e: Error) => toast.error(e.message || "Scoring failed"),
  });

  function start() {
    setMessages([]);
    setResult(null);
    setStarted(true);
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

  const busy = askMutation.isPending || finishMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Interview practice</h1>
        <p className="text-muted-foreground text-sm">
          Live mock interviews with instant scoring and feedback.
        </p>
      </div>

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
          <Button
            variant="glass"
            disabled={messages.length < 2 || busy}
            onClick={() => finishMutation.mutate()}
          >
            <Trophy className="size-4" />
            {finishMutation.isPending ? "Scoring…" : "Finish & score"}
          </Button>
        ) : (
          <Button variant="hero" disabled={!role.trim() || busy} onClick={start}>
            Start interview
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="glass min-h-[360px] space-y-4 rounded-2xl p-4">
            {messages.length === 0 && !busy && (
              <p className="text-muted-foreground py-16 text-center text-sm">
                Pick a role and start — the interviewer asks one question at a time.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className="flex gap-3">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                    m.role === "assistant"
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {m.role === "assistant" ? <Bot className="size-4" /> : <User className="size-4" />}
                </span>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
            {askMutation.isPending && (
              <p className="text-muted-foreground text-sm">Interviewer is thinking…</p>
            )}
          </div>

          {started && (
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Type your answer…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={busy}
              />
              <Button onClick={send} disabled={busy || !answer.trim()} aria-label="Send answer">
                <Send className="size-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {result && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Your score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gradient text-4xl font-semibold">{result.score}</p>
                <Progress value={result.score} />
                <p className="text-muted-foreground text-sm">{result.feedback}</p>
                {result.strengths.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Strengths</p>
                    {result.strengths.map((s) => (
                      <p key={s} className="text-muted-foreground text-sm">
                        • {s}
                      </p>
                    ))}
                  </div>
                )}
                {result.improvements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Improve</p>
                    {result.improvements.map((s) => (
                      <p key={s} className="text-muted-foreground text-sm">
                        • {s}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Past sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(history?.length ?? 0) === 0 && (
                <p className="text-muted-foreground text-sm">No sessions yet.</p>
              )}
              {history?.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{s.role_title}</span>
                  <Badge variant="secondary">{s.score ?? "—"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
