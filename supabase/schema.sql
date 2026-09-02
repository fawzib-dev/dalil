-- Dalil production schema.
-- Keep content reviewable: a question is not public merely because it exists.

create extension if not exists "pgcrypto";

create type public.evidence_type as enum ('quran', 'hadith');
create type public.question_type as enum ('multiple-choice', 'true-false', 'finish-ayah');
create type public.difficulty as enum ('easy', 'medium', 'scholar');
create type public.content_status as enum ('draft', 'needs-verification', 'verified', 'published');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Student',
  xp integer not null default 0 check (xp >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  questions_answered integer not null default 0 check (questions_answered >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  last_study_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.topics (
  id text primary key,
  title text not null,
  short_title text not null,
  description text not null,
  icon text not null,
  accent text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id text primary key,
  topic_id text not null references public.topics(id) on delete cascade,
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  type public.evidence_type not null,
  arabic text not null,
  translation text not null,
  reference text not null,
  collection text,
  hadith_number text,
  grade text,
  verification jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.questions (
  id text primary key,
  topic_id text not null references public.topics(id) on delete restrict,
  lesson_id text not null references public.lessons(id) on delete restrict,
  evidence_id uuid not null references public.evidence(id) on delete restrict,
  difficulty public.difficulty not null,
  type public.question_type not null,
  question text not null,
  answers jsonb not null,
  correct_answer text not null,
  explanation text not null,
  xp integer not null default 100 check (xp > 0),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  best_score integer not null default 0 check (best_score between 0 and 100),
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null references public.questions(id) on delete restrict,
  answer text not null,
  correct boolean not null,
  attempt_number integer not null check (attempt_number > 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  answered_at timestamptz not null default now()
);

create table public.review_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null references public.questions(id) on delete cascade,
  due_at timestamptz not null default now(),
  interval_days integer not null default 0 check (interval_days >= 0),
  ease integer not null default 0 check (ease >= 0),
  mastered boolean not null default false,
  primary key (user_id, question_id)
);

create table public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null
);

create table public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table public.daily_challenges (
  challenge_date date primary key,
  title text not null,
  question_ids text[] not null,
  reward_xp integer not null default 300 check (reward_xp >= 0)
);

create index questions_topic_idx on public.questions(topic_id);
create index questions_lesson_idx on public.questions(lesson_id);
create index questions_status_idx on public.questions(status);
create index attempts_user_question_idx on public.question_attempts(user_id, question_id);
create index review_due_idx on public.review_items(user_id, due_at) where mastered = false;

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.question_attempts enable row level security;
alter table public.review_items enable row level security;
alter table public.user_achievements enable row level security;

alter table public.topics enable row level security;
alter table public.lessons enable row level security;
alter table public.evidence enable row level security;
alter table public.questions enable row level security;
alter table public.achievements enable row level security;
alter table public.daily_challenges enable row level security;

create policy "Students can read their profile" on public.profiles for select using (auth.uid() = id);
create policy "Students can update their profile" on public.profiles for update using (auth.uid() = id);
create policy "Students own lesson progress" on public.lesson_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Students own attempts" on public.question_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Students own review items" on public.review_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Students own achievements" on public.user_achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Published topics are readable" on public.topics for select using (true);
create policy "Published lessons are readable" on public.lessons for select using (true);
create policy "Evidence for published questions is readable" on public.evidence for select using (
  exists (select 1 from public.questions q where q.evidence_id = evidence.id and q.status = 'published')
);
create policy "Published questions are readable" on public.questions for select using (status = 'published');
create policy "Achievements are readable" on public.achievements for select using (true);
create policy "Daily challenges are readable" on public.daily_challenges for select using (true);

-- Content manager policies should be added with a server-side admin role.
-- Never grant students write access to evidence or questions.
