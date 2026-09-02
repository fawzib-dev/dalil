# Dalīl

Dalīl is a calm, evidence-first Qur'an and Sunnah learning game. Each lesson is a short loop of reading evidence, answering questions, receiving immediate explanation, and revisiting mistakes later.

## Step 1: Landing experience

* Present Dalīl as a focused learning companion with Qur'an, Sunnah, and knowledge positioning.
* Show a source-first visual language with Arabic evidence, translation, and a visible learning streak.
* Send visitors into the interactive dashboard through the primary call to action.

## Step 2: Learning dashboard

* Show the learner's level, XP progress, streak, accuracy, and next lesson.
* Provide quick access to twelve topic paths, the daily challenge, spaced review, and the evidence library.
* Keep demo progress in localStorage so the app works immediately without authentication.

## Step 3: Lessons and quizzes

* Start every lesson with readable Qur'an or hadith evidence and its reference.
* Support multiple-choice, true/false, and complete-the-ayah questions.
* Give immediate explanations, XP, streak feedback, and a results summary.
* Move missed questions into a spaced review queue.

## Step 4: Review, library, and profile

* Let learners revisit missed concepts through focused review sessions.
* Search and filter the evidence library by Qur'an or hadith.
* Show milestones, learning stats, dark mode, and the content verification workspace.

## Step 5: Content integrity

* Keep question content typed in `lib/data.ts` so the MVP runs without a database.
* Move every item through `draft`, `needs-verification`, `verified`, and `published` states.
* Require qualified human review for Qur'an wording, Arabic, translation, hadith wording, references, and grades.
* Use `supabase/schema.sql` as the production relational model when authentication and cloud persistence are added.

## Step 6: Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Step 7: Verify and deploy

```bash
npm run lint
npm run build
vercel --prod
```

The project is a Next.js app and is ready to deploy to Vercel. Optional Supabase settings are documented in `.env.example`.

Live deployment: [dalil-five.vercel.app](https://dalil-five.vercel.app/)

## Project map

* `app/` contains the Next.js shell and global design system.
* `components/dalil-app.tsx` contains the interactive MVP experience.
* `lib/data.ts` contains typed topic, lesson, evidence, and question seed data.
* `lib/quiz.ts` contains shuffle, XP level, and review scheduling logic.
* `lib/storage.ts` contains the local demo persistence adapter.
* `types/quiz.ts` is the shared content and progress model.
* `content/README.md` documents the content review workflow.
* `supabase/schema.sql` contains the production relational model and RLS policies.
