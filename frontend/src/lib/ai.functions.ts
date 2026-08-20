import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

import { AI_MODEL, getGateway } from "./ai-gateway.server";
import {
  COVER_LETTER_SYSTEM,
  RESUME_SYSTEM,
  chatMessageSchema,
  interviewFeedbackSchema,
  interviewSystem,
  resumeAnalysisSchema,
} from "./ai-schemas";

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        resume: z.string().trim().min(50).max(20000),
        jobDescription: z.string().trim().max(20000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const result = await generateText({
      model: gateway(AI_MODEL),
      system: RESUME_SYSTEM,
      output: Output.object({ schema: resumeAnalysisSchema }),
      prompt: [
        `RESUME:\n${data.resume}`,
        data.jobDescription ? `\n\nJOB DESCRIPTION:\n${data.jobDescription}` : "",
      ].join(""),
    });
    return result.output;
  });

export const generateCoverLetter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        resume: z.string().trim().max(20000).optional(),
        company: z.string().trim().min(1).max(120),
        position: z.string().trim().min(1).max(120),
        jobDescription: z.string().trim().max(20000).optional(),
        tone: z.enum(["professional", "enthusiastic", "concise", "storytelling"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const result = await generateText({
      model: gateway(AI_MODEL),
      system: COVER_LETTER_SYSTEM,
      prompt: `Tone: ${data.tone}
Company: ${data.company}
Role: ${data.position}
${data.jobDescription ? `Job description:\n${data.jobDescription}\n` : ""}
${data.resume ? `Candidate resume:\n${data.resume}` : "No resume provided; write a strong general letter."}`,
    });
    return { content: await result.text };
  });

export const interviewTurn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        role: z.string().trim().min(1).max(120),
        difficulty: z.enum(["junior", "mid", "senior"]),
        messages: z.array(chatMessageSchema).max(60),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const result = await generateText({
      model: gateway(AI_MODEL),
      system: interviewSystem(data.role, data.difficulty),
      messages: data.messages.length
        ? data.messages
        : [{ role: "user" as const, content: "Start the interview with your first question." }],
    });
    return { content: await result.text };
  });

export const scoreInterview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        role: z.string().trim().min(1).max(120),
        messages: z.array(chatMessageSchema).min(2).max(60),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const transcript = data.messages
      .map((m) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`)
      .join("\n\n");
    const result = await generateText({
      model: gateway(AI_MODEL),
      system: `You grade mock interviews for the role of ${data.role}. Be fair but demanding.`,
      output: Output.object({ schema: interviewFeedbackSchema }),
      prompt: `Grade this interview transcript.\n\n${transcript}`,
    });
    return result.output;
  });
