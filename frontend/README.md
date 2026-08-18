# AI Job Navigator

Build a modern AI-powered Job Application Tracker called "JobPilot AI" using Next.js 16 App Router, TypeScript, MongoDB, Mongoose, Tailwind CSS, Shadcn UI, React Query, React Hook Form, Zod, Recharts, Framer Motion, GSAP, Cloudinary, and Gemini/OpenAI API.

The application is designed for individual job seekers to manage and optimize their job search process. It is NOT a job board or recruiter platform. Users manually add and track applications they have submitted.

==================================================

CORE OBJECTIVE

==================================================

Help users:

- Track job applications

- Organize application statuses

- Analyze resumes

- Measure resume-job compatibility

- Generate cover letters

- Practice interviews with AI

- Improve interview performance

- View job search analytics

==================================================

AUTHENTICATION

==================================================

Implement complete authentication.

Features:

- Register

- Login

- Logout

- Forgot Password

- Protected Routes

- JWT Authentication

- HttpOnly Cookies

- User Profile

Registration:

- Full Name

- Email

- Password

- Confirm Password

Login:

- Email

- Password

==================================================

LANDING PAGE

==================================================

Create a beautiful SaaS landing page.

Include:

- Animated Hero Section

- AI-themed design

- Floating elements

- Gradient backgrounds

- Animated counters

- Framer Motion animations

- GSAP scroll animations

- Features section

- Testimonials

- FAQ

- Pricing section

- Call To Action section

- Dark Mode

The landing page should feel modern and premium like a successful AI startup.

==================================================

DASHBOARD

==================================================

Display statistics:

- Total Applications

- Interviews

- Offers

- Rejections

- Success Rate

Charts:

- Applications Per Month

- Status Distribution

- Interview Conversion Rate

- Offer Rate

Show recent activity.

==================================================

JOB APPLICATION TRACKER

==================================================

Users manually add jobs they have applied for.

Fields:

- Company Name

- Position

- Location

- Salary

- Application Date

- Job Description

- Notes

- Status

Statuses:

- Applied

- Interview

- Rejected

- Offer

Features:

- Create Application

- Edit Application

- Delete Application

- Search Applications

- Filter Applications

- Sort Applications

Views:

1. Kanban Board

2. Table View

Implement drag-and-drop Kanban functionality.

==================================================

RESUME MANAGER

==================================================

Users can:

- Upload Resume PDF

- Store Multiple Resume Versions

- View Resume

- Download Resume

- Delete Resume

Use Cloudinary for file storage.

==================================================

AI RESUME ANALYZER

==================================================

User uploads a resume.

AI should return:

- ATS Score

- Strengths

- Weaknesses

- Missing Skills

- Improvement Suggestions

Display results using modern cards, charts, and progress indicators.

==================================================

AI JOB MATCH ANALYZER

==================================================

For every application:

Compare:

Resume

+

Job Description

Return:

- Match Score (%)

- Missing Skills

- Skill Gap Analysis

- Recommendations

- Hiring Probability

Store results with the application.

Display a visual score gauge.

==================================================

AI COVER LETTER GENERATOR

==================================================

Generate personalized cover letters using:

- Resume

- Company Name

- Position

- Job Description

Features:

- Generate

- Save

- Copy

- Download

==================================================

AI INTERVIEW PREP

==================================================

User selects an application.

AI generates:

- Technical Questions

- Behavioral Questions

- Scenario-Based Questions

Interactive Practice Mode:

Step 1:

AI asks Question 1

Step 2:

User submits answer

Step 3:

AI evaluates answer and returns:

- Score out of 100

- Strengths

- Weaknesses

- Improvement Suggestions

- Better Example Answer

Step 4:

Next Question

Continue until all questions are completed.

Final Report:

- Average Score

- Best Answer

- Weak Areas

- Strong Areas

- Interview Readiness Score

- Personalized Improvement Plan

Save interview history.

==================================================

ANALYTICS

==================================================

Show:

- Applications Over Time

- Match Score Trends

- Interview Success Rate

- Offer Rate

- Most Applied Roles

- Most Common Missing Skills

Use Recharts.

==================================================

UI REQUIREMENTS

==================================================

- Premium SaaS Design

- Fully Responsive

- Mobile Friendly

- Dark Mode

- Framer Motion Animations

- GSAP Animations

- Beautiful Cards

- Sidebar Navigation

- Skeleton Loaders

- Empty States

- Toast Notifications

- Reusable Components

- Modern AI Startup Styling

==================================================

DATABASE MODELS

==================================================

User

Application

Resume

ResumeAnalysis

CoverLetter

InterviewSession

InterviewQuestion

MatchAnalysis

==================================================

CODE REQUIREMENTS

==================================================

- TypeScript Everywhere

- Clean Architecture

- API Routes

- Error Handling

- Zod Validation

- Reusable Components

- Environment Variables Setup

- Seed Data

- Complete README

- Production Ready

- Mobile Responsive

Generate the complete application including all pages, API routes, MongoDB models, authentication system, dashboard, analytics, AI integrations, interview scoring system, resume upload system, and setup instructions.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://jobpilot-ai-85.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3f22fecc-e0bc-4caa-b6fc-2c93274422c1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
