import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import {
  Sparkles,
  KanbanSquare,
  LineChart,
  FileSearch,
  MessagesSquare,
  ShieldCheck,
  ArrowRight,
  Check,
  Zap,
  Clock,
  Target,
  Brain,
  Lock,
  Briefcase,
  FileText,
  TrendingUp,
  Github,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import step1Img from "@/assets/step-1-add-role.png";
import step2Img from "@/assets/step-2-ai-prep.png";
import step3Img from "@/assets/step-3-track.png";

// ✅ NO SUPABASE IMPORTS - Using custom auth

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JobPilot AI — AI Job Application Tracker" },
      {
        name: "description",
        content:
          "Track applications, analyze resumes, and practice interviews with AI. JobPilot AI turns a messy job hunt into a clear pipeline.",
      },
      { property: "og:title", content: "JobPilot AI — AI Job Application Tracker" },
      {
        property: "og:description",
        content:
          "Track applications, analyze resumes, and practice interviews with AI. JobPilot AI turns a messy job hunt into a clear pipeline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: KanbanSquare,
    title: "Pipeline that moves",
    body: "Drag roles across applied, interview, offer and rejected. Board or table, your call.",
  },
  {
    icon: LineChart,
    title: "Analytics that matter",
    body: "Response rate, momentum over time and stage breakdown — no spreadsheet gymnastics.",
  },
  {
    icon: FileSearch,
    title: "ATS resume scoring",
    body: "Score your resume against a job description and see the exact skill gaps to close.",
  },
  {
    icon: Sparkles,
    title: "Cover letters in seconds",
    body: "Tailored letters generated from the role, the company and your own history.",
  },
  {
    icon: MessagesSquare,
    title: "Interview practice",
    body: "Run mock interviews with scored feedback so the real one feels like a rerun.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Your data is scoped to your account with row-level security. Nobody else sees it.",
  },
];

const reasons = [
  {
    icon: Brain,
    title: "AI that reads the job, not just your resume",
    body: "Every score, letter and interview question is generated from the actual job description you paste — not a generic template library.",
  },
  {
    icon: Clock,
    title: "Set up once, reuse everywhere",
    body: "Upload your master resume a single time. The analyzer, cover letter writer and interview coach all pull from it automatically.",
  },
  {
    icon: Target,
    title: "One source of truth",
    body: "Applications, resume versions, letters and interview transcripts live together, so you always know what you sent and when.",
  },
  {
    icon: Lock,
    title: "Your data stays yours",
    body: "Row-level security on every table, private resume storage, and no selling of your job search to recruiters.",
  },
];

const steps = [
  {
    n: "01",
    title: "Add the role",
    body: "Paste a job link or type the company and position. Takes ten seconds.",
    img: step1Img,
    icon: Briefcase,
    label: "Capture",
  },
  {
    n: "02",
    title: "Let AI prep you",
    body: "Score your resume, generate a letter, and rehearse the interview.",
    img: step2Img,
    icon: FileText,
    label: "Prepare",
  },
  {
    n: "03",
    title: "Track to offer",
    body: "Move the card through your pipeline and watch the analytics build.",
    img: step3Img,
    icon: TrendingUp,
    label: "Convert",
  },
];

const stats = [
  { value: "4 stages", label: "Applied → Offer pipeline" },
  { value: "< 10s", label: "To a tailored cover letter" },
  { value: "100%", label: "Private to your account" },
];

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#steps" },
    { label: "Pricing", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
};

function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-line", {
        y: 34,
        opacity: 0,
        filter: "blur(8px)",
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
      });
      gsap.from(".hero-stat", {
        y: 20,
        opacity: 0,
        scale: 0.96,
        duration: 0.7,
        delay: 0.7,
        ease: "back.out(1.6)",
        stagger: 0.12,
      });
      gsap.to(".orb", {
        y: -32,
        x: 18,
        duration: 7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 1.4,
      });
      gsap.to(".orb", {
        scale: 1.12,
        duration: 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.9,
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <header
        className={`fixed top-0 right-0 left-0 z-40 transition-all duration-500 ${
          scrolled ? "glass border-border/60 border-b" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between px-5 transition-all duration-500 ${
            scrolled ? "h-14" : "h-20"
          }`}
        >
          <span className="text-gradient text-lg font-semibold tracking-tight">JobPilot AI</span>
          <nav className="flex items-center gap-2">
            <a
              href="#why"
              className="text-muted-foreground hover:text-foreground story-link hidden px-3 text-sm transition-colors sm:block"
            >
              Why us
            </a>
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground story-link hidden px-3 text-sm transition-colors sm:block"
            >
              Features
            </a>
            <a
              href="#steps"
              className="text-muted-foreground hover:text-foreground story-link hidden px-3 text-sm transition-colors sm:block"
            >
              How it works
            </a>
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth" search={{ mode: "login" }}>
                Sign in
              </Link>
            </Button>
            <Button asChild variant="hero" size="sm">
              <Link to="/auth" search={{ mode: "register" }}>
                Get started
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section ref={heroRef} className="bg-hero relative overflow-hidden px-5 pt-36 pb-24 sm:pt-44 sm:pb-32">
        <div className="bg-primary/25 orb pointer-events-none absolute -top-24 -left-24 size-[420px] rounded-full blur-[130px]" />
        <div className="bg-accent/20 orb pointer-events-none absolute top-24 -right-32 size-[460px] rounded-full blur-[140px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklab, var(--primary) 30%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--primary) 30%, transparent) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at 50% 0%, black 10%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="hero-line border-border/60 bg-card/50 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
            <Sparkles className="text-primary size-3.5 animate-pulse" />
            AI copilot for your job search
          </span>
          <h1 className="hero-line mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Stop losing track of <span className="text-gradient">where you applied</span>
          </h1>
          <p className="hero-line text-muted-foreground mx-auto mt-5 max-w-xl text-base text-balance sm:text-lg">
            JobPilot AI keeps every application, resume version and interview note in one pipeline —
            and uses AI to tell you what to fix before you hit send.
          </p>
          <div className="hero-line mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="lg" className="hover-scale">
              <Link to="/auth" search={{ mode: "register" }}>
                Start tracking free <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg" className="hover-scale">
              <Link to="/auth" search={{ mode: "login" }}>
                I already have an account
              </Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="hero-stat glass shadow-card hover:border-primary/40 rounded-2xl px-4 py-5 text-center transition-colors"
              >
                <p className="text-gradient text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="text-muted-foreground mt-1 text-xs">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="relative mx-auto max-w-6xl px-5 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-primary text-xs font-medium tracking-[0.2em] uppercase">
            Why choose us
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Built for the way a real job search actually goes
          </h2>
          <p className="text-muted-foreground mt-4 text-sm text-balance sm:text-base">
            Most trackers are a spreadsheet with rounded corners. JobPilot AI does the thinking
            between the rows.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass shadow-card hover:border-primary/40 group relative overflow-hidden rounded-3xl p-7 transition-colors"
            >
              <div className="bg-primary/10 pointer-events-none absolute -top-16 -right-16 size-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="bg-gradient-to-br from-primary/25 to-accent/25 text-primary relative flex size-11 items-center justify-center rounded-2xl">
                <reason.icon className="size-5" />
              </span>
              <h3 className="relative mt-5 text-lg font-medium tracking-tight">{reason.title}</h3>
              <p className="text-muted-foreground relative mt-2 text-sm leading-relaxed">
                {reason.body}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {["No credit card", "Unlimited applications", "Export anytime", "Dark mode native"].map(
            (item) => (
              <span
                key={item}
                className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm"
              >
                <Check className="text-success size-4" /> {item}
              </span>
            ),
          )}
        </div>
      </section>

      <section id="steps" className="border-border/60 relative overflow-hidden border-y">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-primary text-xs font-medium tracking-[0.2em] uppercase">
              How it works
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              From job post to offer in three moves
            </h2>
            <p className="text-muted-foreground mt-4 text-sm text-balance sm:text-base">
              No onboarding marathon. Just add a role, let AI prep you, and track everything to the finish line.
            </p>
          </div>

          <div className="mt-16 flex flex-col gap-10 md:gap-16">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col items-center gap-8 lg:flex-row lg:items-center ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="group relative w-full flex-1 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--card)_80%,transparent),color-mix(in_oklab,var(--primary)_8%,transparent))] shadow-card"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--primary)_20%,transparent),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative p-5 sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="bg-gradient-to-br from-primary/25 to-accent/25 text-primary flex size-9 items-center justify-center rounded-xl">
                        <step.icon className="size-4.5" />
                      </span>
                      <span className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
                        {step.label}
                      </span>
                    </div>
                    <img
                      src={step.img}
                      alt={step.title}
                      width={1024}
                      height={768}
                      loading="lazy"
                      className="mt-5 aspect-[4/3] w-full rounded-2xl object-cover shadow-lg transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 1 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex-1 lg:max-w-md"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gradient text-5xl font-semibold tracking-tight">{step.n}</span>
                    <div className="bg-gradient-to-r from-primary/60 to-transparent h-px w-20" />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{step.title}</h3>
                  <p className="text-muted-foreground mt-3 text-base leading-relaxed">{step.body}</p>
                  {i === 0 && (
                    <p className="text-muted-foreground mt-3 text-sm">
                      Paste the URL, drop the JD, or enter manually. We'll pull the company, title, and location automatically.
                    </p>
                  )}
                  {i === 1 && (
                    <p className="text-muted-foreground mt-3 text-sm">
                      AI scores your resume against the job, drafts a personalized cover letter, and builds a mock interview around the role.
                    </p>
                  )}
                  {i === 2 && (
                    <p className="text-muted-foreground mt-3 text-sm">
                      Drag the card forward as you progress. Watch response-rate and pipeline analytics update in real time.
                    </p>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-primary text-xs font-medium tracking-[0.2em] uppercase">
            Everything included
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            One workspace from first application to signed offer
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass shadow-card hover:border-primary/40 hover:shadow-glow group relative overflow-hidden rounded-2xl p-6 transition-all duration-300"
            >
              <div className="bg-primary/10 pointer-events-none absolute -top-20 -right-20 size-44 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              <span className="from-primary/20 to-accent/20 text-primary relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="size-5" />
              </span>
              <h3 className="relative mt-4 font-medium tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground relative mt-2 text-sm">{feature.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="glass shadow-glow relative overflow-hidden rounded-3xl p-10 text-center"
        >
          <div className="bg-accent/20 pointer-events-none absolute -bottom-24 left-1/2 size-72 -translate-x-1/2 rounded-full blur-[120px]" />
          <span className="bg-primary/15 text-primary relative mx-auto flex size-11 items-center justify-center rounded-2xl">
            <Zap className="size-5" />
          </span>
          <h2 className="relative mt-5 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Your next offer starts with a better system
          </h2>
          <p className="text-muted-foreground relative mx-auto mt-3 max-w-lg text-sm">
            Set up your pipeline in under a minute. No credit card, no spreadsheet.
          </p>
          <Button asChild variant="hero" size="lg" className="relative mt-7">
            <Link to="/auth" search={{ mode: "register" }}>
              Create your account <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      <footer className="border-border/60 border-t bg-[linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--card)_40%,var(--background)))]">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <span className="text-gradient text-lg font-semibold tracking-tight">JobPilot AI</span>
              <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
                The AI-powered job application tracker that turns a messy job hunt into a clear, focused pipeline.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="#"
                  className="hover:bg-primary/10 text-muted-foreground hover:text-primary flex size-9 items-center justify-center rounded-full border border-white/10 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="size-4" />
                </a>
                <a
                  href="#"
                  className="hover:bg-primary/10 text-muted-foreground hover:text-primary flex size-9 items-center justify-center rounded-full border border-white/10 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="size-4" />
                </a>
                <a
                  href="#"
                  className="hover:bg-primary/10 text-muted-foreground hover:text-primary flex size-9 items-center justify-center rounded-full border border-white/10 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="size-4" />
                </a>
                <a
                  href="#"
                  className="hover:bg-primary/10 text-muted-foreground hover:text-primary flex size-9 items-center justify-center rounded-full border border-white/10 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="size-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium">Product</h4>
              <ul className="mt-4 space-y-2.5">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium">Company</h4>
              <ul className="mt-4 space-y-2.5">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium">Legal</h4>
              <ul className="mt-4 space-y-2.5">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-border/60 mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} JobPilot AI. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs">
              Built for job seekers who mean business.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}