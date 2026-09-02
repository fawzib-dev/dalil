"use client";
/* Static source labels use apostrophes as product copy. */
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Compass,
  Flame,
  GraduationCap,
  HandHeart,
  Heart,
  Home,
  Library as LibraryIcon,
  LockKeyhole,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  SunMedium,
  Target,
  Trophy,
  Users,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  getLesson,
  getQuestion,
  getQuestionsForLesson,
  getQuestionsForTopic,
  getTopic,
  isLearnerVisible,
  questions,
  topics,
} from "@/lib/data";
import { getLevelProgress, getReviewDate, prepareQuestions } from "@/lib/quiz";
import { defaultProgress, loadProgress, saveProgress } from "@/lib/storage";
import { AttemptSummary, Evidence, Lesson, Question, Topic, UserProgress } from "@/types/quiz";

type View = "landing" | "dashboard" | "topics" | "topic" | "lesson" | "quiz" | "results" | "review" | "library" | "profile" | "admin";
type EvidenceFilter = "all" | "quran" | "hadith";

interface QuizSession {
  questions: Question[];
  title: string;
  lessonId?: string;
  index: number;
  answers: Record<string, string>;
  earnedXp: number;
  correctCount: number;
  currentStreak: number;
  bestStreak: number;
  lastXp: number;
}

const topicIcons: Record<string, LucideIcon> = {
  sunna: SunMedium,
  compass: Compass,
  mosque: Sparkles,
  book: BookOpen,
  heart: Heart,
  sparkle: Sparkles,
  users: Users,
  graduation: GraduationCap,
  moon: Moon,
  crescent: Moon,
  "hand-heart": HandHeart,
  shield: ShieldCheck,
};

const accentClass: Record<string, string> = {
  emerald: "accent-emerald",
  gold: "accent-gold",
  blue: "accent-blue",
  violet: "accent-violet",
  rose: "accent-rose",
  amber: "accent-amber",
  teal: "accent-teal",
  indigo: "accent-indigo",
  cyan: "accent-cyan",
  orange: "accent-orange",
  green: "accent-green",
  slate: "accent-slate",
};

const navItems: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "topics", label: "Topics", icon: Compass },
  { id: "review", label: "Review", icon: CircleHelp },
  { id: "library", label: "Library", icon: LibraryIcon },
  { id: "profile", label: "Profile", icon: Users },
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      <span className="brand-mark">د</span>
      <span>
        <strong>Dalīl</strong>
        <small>evidence first</small>
      </span>
    </div>
  );
}

function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`progress-track ${className}`}>
      <span className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function TopicIcon({ topic, size = 20 }: { topic: Topic; size?: number }) {
  const Icon = topicIcons[topic.icon] ?? Sparkles;
  return <Icon size={size} strokeWidth={1.8} />;
}

function EvidenceCard({ evidence, compact = false }: { evidence: Evidence; compact?: boolean }) {
  return (
    <article className={`evidence-card ${compact ? "evidence-compact" : ""}`}>
      <div className="evidence-topline">
        <span className={`source-dot ${evidence.type}`} />
        <span>{evidence.type === "quran" ? "Qur'an" : "Hadith"}</span>
        <span className="evidence-verified"><Check size={12} /> Verified source</span>
      </div>
      <p className="arabic-text" dir="rtl" lang="ar">{evidence.arabic}</p>
      <p className="translation">“{evidence.translation}”</p>
      <div className="evidence-reference">
        <span>{evidence.reference}</span>
        {evidence.collection && <span>{evidence.collection} · {evidence.grade}</span>}
      </div>
    </article>
  );
}

function StatCard({ label, value, icon: Icon, detail }: { label: string; value: string; icon: LucideIcon; detail?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={18} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </div>
  );
}

export default function DalilApp() {
  const [view, setView] = useState<View>("landing");
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [todayLabel, setTodayLabel] = useState("Wednesday, 02 September");
  const [todayBadge, setTodayBadge] = useState("02 SEP");
  const [activeTopicId, setActiveTopicId] = useState("following-the-prophet");
  const [activeLessonId, setActiveLessonId] = useState("following-the-prophet-2");
  const [session, setSession] = useState<QuizSession | null>(null);
  const [libraryFilter, setLibraryFilter] = useState<EvidenceFilter>("all");
  const [librarySearch, setLibrarySearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    const now = new Date();
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(now);
    const day = new Intl.DateTimeFormat("en-US", { day: "2-digit", timeZone: "UTC" }).format(now);
    const month = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(now);
    const shortMonth = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(now);
    setTodayLabel(`${weekday}, ${day} ${month}`);
    setTodayBadge(`${day} ${shortMonth}`.toUpperCase());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveProgress(progress);
    document.documentElement.dataset.theme = progress.theme;
  }, [hydrated, progress]);

  const level = getLevelProgress(progress.xp);
  const accuracy = progress.questionsAnswered ? Math.round((progress.correctAnswers / progress.questionsAnswered) * 100) : 0;
  const activeTopic = getTopic(activeTopicId);
  const activeLesson = getLesson(activeLessonId) ?? activeTopic.lessons[0];

  function navigate(nextView: View) {
    setView(nextView);
    setMobileMenuOpen(false);
  }

  function openTopic(topicId: string) {
    const topic = getTopic(topicId);
    setActiveTopicId(topic.id);
    setActiveLessonId(topic.lessons[0].id);
    navigate("topic");
  }

  function openLesson(lesson: Lesson) {
    setActiveTopicId(lesson.topicId);
    setActiveLessonId(lesson.id);
    navigate("lesson");
  }

  function startQuiz(questionIds?: string[], title?: string, lessonId?: string) {
    let pool: Question[];
    if (questionIds) {
      pool = questionIds.map((id) => getQuestion(id)).filter((question): question is Question => Boolean(question));
    } else {
      const lesson = (lessonId ? getLesson(lessonId) : undefined) ?? activeLesson;
      const lessonQuestions = getQuestionsForLesson(lesson.id);
      const topicQuestions = getQuestionsForTopic(lesson.topicId);
      pool = [...lessonQuestions, ...topicQuestions.filter((question) => !lessonQuestions.some((item) => item.id === question.id))];
    }
    if (!pool.length) return;
    setSession({
      questions: prepareQuestions(pool, 10),
      title: title ?? (lessonId ? getTopic(getLesson(lessonId)?.topicId ?? activeTopic.id).title : activeTopic.title),
      lessonId,
      index: 0,
      answers: {},
      earnedXp: 0,
      correctCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastXp: 0,
    });
    navigate("quiz");
  }

  function answerQuestion(answerId: string) {
    if (!session) return;
    const question = session.questions[session.index];
    if (session.answers[question.id]) return;
    const isCorrect = answerId === question.correctAnswer;
    const previous = progress.attempts[question.id];
    const attemptNumber = (previous?.attempts ?? 0) + 1;
    const earnedXp = isCorrect ? question.xp + (attemptNumber === 1 ? 25 : 0) : 0;
    const nextStreak = isCorrect ? session.currentStreak + 1 : 0;
    const today = new Date().toISOString().slice(0, 10);

    setSession({
      ...session,
      answers: { ...session.answers, [question.id]: answerId },
      earnedXp: session.earnedXp + earnedXp,
      correctCount: session.correctCount + (isCorrect ? 1 : 0),
      currentStreak: nextStreak,
      bestStreak: Math.max(session.bestStreak, nextStreak),
      lastXp: earnedXp,
    });

    setProgress((current) => {
      const nextAttempt: AttemptSummary = {
        attempts: attemptNumber,
        correct: (previous?.correct ?? 0) + (isCorrect ? 1 : 0),
        lastAnsweredAt: new Date().toISOString(),
        nextReviewAt: getReviewDate(attemptNumber),
      };
      const nextReviewIds = isCorrect
        ? current.reviewIds.filter((id) => id !== question.id)
        : Array.from(new Set([...current.reviewIds, question.id]));
      const nextStreak = current.lastStudyDate === today ? current.currentStreak : current.currentStreak + 1;
      const nextXp = current.xp + earnedXp;
      return {
        ...current,
        xp: nextXp,
        level: getLevelProgress(nextXp).level,
        currentStreak: nextStreak,
        longestStreak: Math.max(current.longestStreak, nextStreak),
        questionsAnswered: current.questionsAnswered + 1,
        correctAnswers: current.correctAnswers + (isCorrect ? 1 : 0),
        ayatLearned: current.ayatLearned + (previous || question.evidence.type !== "quran" ? 0 : 1),
        ahadithLearned: current.ahadithLearned + (previous || question.evidence.type !== "hadith" ? 0 : 1),
        reviewIds: nextReviewIds,
        attempts: { ...current.attempts, [question.id]: nextAttempt },
        lastStudyDate: today,
      };
    });
  }

  function advanceQuiz() {
    if (!session) return;
    if (session.index === session.questions.length - 1) {
      if (session.lessonId && session.correctCount >= Math.ceil(session.questions.length * 0.7)) {
        setProgress((current) => ({
          ...current,
          completedLessons: current.completedLessons.includes(session.lessonId as string) ? current.completedLessons : [...current.completedLessons, session.lessonId as string],
        }));
      }
      navigate("results");
      return;
    }
    setSession({ ...session, index: session.index + 1, lastXp: 0 });
  }

  function returnToDashboard() {
    setSession(null);
    navigate("dashboard");
  }

  function renderView() {
    if (view === "dashboard") return <Dashboard />;
    if (view === "topics") return <Topics />;
    if (view === "topic") return <TopicDetail />;
    if (view === "lesson") return <LessonDetail />;
    if (view === "quiz") return <Quiz />;
    if (view === "results") return <Results />;
    if (view === "review") return <Review />;
    if (view === "library") return <Library />;
    if (view === "profile") return <Profile />;
    if (view === "admin") return <Admin />;
    return <Dashboard />;
  }

  function Dashboard() {
    const continueTopic = getTopic("following-the-prophet");
    const continueLesson = continueTopic.lessons[2];
    const topicProgress = Math.round((progress.completedLessons.filter((id) => continueTopic.lessons.some((lesson) => lesson.id === id)).length / continueTopic.lessons.length) * 100);
    return (
      <>
        <PageHeader eyebrow={todayLabel} title="Assalamu Alaikum, Student" description="A few minutes of learning can reshape an entire day." action={<button className="icon-button" aria-label="Open settings" onClick={() => navigate("profile")}><Settings2 size={18} /></button>} />
        <div className="dashboard-layout">
          <section className="dashboard-main">
            <div className="level-card">
              <div className="level-card-copy">
                <span className="eyebrow">YOUR LEARNING PATH</span>
                <h2>Keep walking with the evidence.</h2>
                <p>Small, consistent steps. Every answer brings you closer to understanding.</p>
                <div className="level-line"><span>Level {level.level}</span><span>{level.current} / {level.total} XP</span></div>
                <ProgressBar value={level.percentage} />
              </div>
              <div className="level-emblem"><span>04</span><small>level</small></div>
            </div>

            <div className="section-heading"><div><span className="eyebrow">CONTINUE LEARNING</span><h2>Pick up where you left off</h2></div><button className="text-button" onClick={() => navigate("topics")}>View all topics <ArrowRight size={15} /></button></div>
            <button className="continue-card" onClick={() => { setActiveLessonId(continueLesson.id); setActiveTopicId(continueTopic.id); startQuiz(undefined, continueTopic.title, continueLesson.id); }}>
              <div className="continue-art"><span className="art-arabic">وَقُل رَّبِّ زِدْنِي عِلْمًا</span><span className="art-reference">Taha 20:114</span></div>
              <div className="continue-copy"><div className="card-kicker"><span className="topic-pill"><SunMedium size={13} /> Sunnah</span><span>Lesson 03 / 10</span></div><h3>Holding to the Sunnah</h3><p>Discover how guidance becomes a way of life.</p><div className="continue-progress"><ProgressBar value={topicProgress || 30} /><span>{topicProgress || 30}%</span></div></div>
              <span className="circle-arrow"><ArrowRight size={19} /></span>
            </button>

            <div className="section-heading topics-heading"><div><span className="eyebrow">EXPLORE</span><h2>Choose a path</h2></div><button className="text-button" onClick={() => navigate("topics")}>All topics <ArrowRight size={15} /></button></div>
            <div className="topic-grid dashboard-topics">{topics.slice(0, 6).map((topic) => <TopicCard key={topic.id} topic={topic} onClick={() => openTopic(topic.id)} />)}</div>
          </section>
          <aside className="dashboard-aside">
            <div className="daily-card"><div className="daily-top"><span className="eyebrow">TODAY&apos;S DALĪL</span><span className="date-badge">{todayBadge}</span></div><h3>One āyah.<br /><em>One lasting lesson.</em></h3><p>A five-question reflection on following the Messenger ﷺ.</p><button className="button button-dark" onClick={() => startQuiz(["sunnah-001", "sunnah-002", "sunnah-003", "sunnah-004", "sunnah-005"], "Today's Dalīl")}>Begin challenge <ArrowRight size={16} /></button><div className="daily-footer"><Flame size={15} /> {progress.currentStreak} day learning streak</div></div>
            <div className="mini-stat-card"><div className="mini-stat-head"><span className="eyebrow">YOUR MOMENTUM</span><MoreHorizontal size={17} /></div><div className="momentum-number">{accuracy}<span>%</span></div><p>answer accuracy</p><div className="week-dots"><span className="active" /><span className="active" /><span className="active" /><span className="active" /><span className="active" /><span /><span /></div><div className="week-labels"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div>
          </aside>
        </div>
      </>
    );
  }

  function Topics() {
    return <><PageHeader eyebrow="THE LEARNING PATH" title="Choose a topic" description="Each path is built from evidence, reflection, and practice." /><div className="topic-intro-banner"><div><span className="eyebrow">12 PATHS TO EXPLORE</span><h2>Find the question your heart is ready for.</h2></div><span className="intro-mark">دليل</span></div><div className="topic-grid all-topics">{topics.map((topic) => <TopicCard key={topic.id} topic={topic} onClick={() => openTopic(topic.id)} />)}</div></>;
  }

  function TopicCard({ topic, onClick }: { topic: Topic; onClick: () => void }) {
    const completed = progress.completedLessons.filter((id) => topic.lessons.some((lesson) => lesson.id === id)).length;
    const percentage = Math.round((completed / topic.lessons.length) * 100);
    return <button className={`topic-card ${accentClass[topic.accent]}`} onClick={onClick}><div className="topic-card-top"><span className="topic-icon"><TopicIcon topic={topic} /></span><span className="topic-percent">{percentage ? `${percentage}%` : "Start"}</span></div><h3>{topic.shortTitle}</h3><p>{topic.description}</p><div className="topic-card-bottom"><ProgressBar value={percentage} /><ChevronRight size={16} /></div></button>;
  }

  function TopicDetail() {
    const completed = activeTopic.lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length;
    const percentage = Math.round((completed / activeTopic.lessons.length) * 100);
    return <><button className="back-button" onClick={() => navigate("topics")}><ArrowLeft size={16} /> All topics</button><div className={`topic-hero ${accentClass[activeTopic.accent]}`}><div className="topic-hero-icon"><TopicIcon topic={activeTopic} size={29} /></div><div><span className="eyebrow">TOPIC PATH</span><h1>{activeTopic.title}</h1><p>{activeTopic.description}</p></div><div className="topic-hero-progress"><strong>{percentage}%</strong><span>complete</span><ProgressBar value={percentage} /></div></div><div className="lesson-header"><div><span className="eyebrow">{activeTopic.lessons.length} LESSONS</span><h2>Build the foundation</h2></div><span className="muted-label">{getQuestionsForTopic(activeTopic.id).length} evidence questions</span></div><div className="lesson-list">{activeTopic.lessons.map((lesson, index) => { const isDone = progress.completedLessons.includes(lesson.id); const previousDone = index === 0 || progress.completedLessons.includes(activeTopic.lessons[index - 1].id); const locked = !previousDone; return <button key={lesson.id} className={`lesson-row ${isDone ? "is-done" : ""} ${locked ? "is-locked" : ""}`} disabled={locked} onClick={() => openLesson(lesson)}><span className="lesson-number">{isDone ? <Check size={16} /> : locked ? <LockKeyhole size={15} /> : String(index + 1).padStart(2, "0")}</span><span className="lesson-row-copy"><strong>{lesson.title}</strong><small>{lesson.description}</small></span><span className="lesson-row-meta">{getQuestionsForLesson(lesson.id).length || (index === 2 ? getQuestionsForTopic(activeTopic.id).length : 0)} questions</span><ChevronRight size={17} /></button>; })}</div></>;
  }

  function LessonDetail() {
    const sourceQuestions = getQuestionsForLesson(activeLesson.id).length ? getQuestionsForLesson(activeLesson.id) : getQuestionsForTopic(activeLesson.topicId);
    const evidence = Array.from(new Map(sourceQuestions.map((question) => [question.evidence.reference, question.evidence])).values()).slice(0, 2);
    return <><button className="back-button" onClick={() => navigate("topic")}><ArrowLeft size={16} /> {activeTopic.shortTitle}</button><div className="lesson-title-row"><div><span className="eyebrow">LESSON {String(activeLesson.order).padStart(2, "0")}</span><h1>{activeLesson.title}</h1><p>{activeLesson.description}</p></div><span className="lesson-time"><MessageCircle size={15} /> {Math.max(3, sourceQuestions.length * 2)} min</span></div><div className="learn-first"><div className="learn-first-heading"><span className="learn-number">01</span><div><span className="eyebrow">LEARN FIRST</span><h2>Read the evidence</h2></div></div><p className="learn-first-copy">Every question begins with something worth knowing. Take a moment with the sources before you practice.</p><div className="evidence-stack">{evidence.map((item) => <EvidenceCard evidence={item} key={item.reference} />)}</div></div><div className="lesson-start-row"><div><strong>{Math.min(10, sourceQuestions.length)} questions</strong><span>Immediate feedback · no lives</span></div><button className="button button-primary" onClick={() => startQuiz(undefined, activeTopic.title, activeLesson.id)}>Start lesson <ArrowRight size={17} /></button></div></>;
  }

  function Quiz() {
    if (!session) return null;
    const question = session.questions[session.index];
    const selected = session.answers[question.id];
    const answered = Boolean(selected);
    const isCorrect = selected === question.correctAnswer;
    return <div className="quiz-page"><div className="quiz-top"><button className="back-button" onClick={() => navigate("lesson")}><X size={17} /> Leave quiz</button><div className="quiz-streak"><Flame size={16} /> {session.currentStreak} streak</div></div><div className="quiz-meta"><span>Question {session.index + 1} of {session.questions.length}</span><span>{session.title}</span></div><ProgressBar value={((session.index + (answered ? 1 : 0)) / session.questions.length) * 100} className="quiz-progress" /><div className="question-layout"><main className="question-main"><div className="question-kicker"><span className={`type-badge ${question.type}`}>{question.type === "true-false" ? "True or false" : question.type === "finish-ayah" ? "Complete the āyah" : "Reflection"}</span><span>+{question.xp} XP</span></div><h1>{question.question}</h1><div className="question-evidence"><p className="arabic-text" dir="rtl" lang="ar">{question.evidence.arabic}</p><p className="translation">“{question.evidence.translation}”</p><span>{question.evidence.reference}</span></div><div className="answer-list">{question.answers.map((answer, index) => { const correct = answered && answer.id === question.correctAnswer; const wrong = answered && answer.id === selected && !isCorrect; return <button key={answer.id} className={`answer-option ${correct ? "is-correct" : ""} ${wrong ? "is-wrong" : ""}`} disabled={answered} onClick={() => answerQuestion(answer.id)}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{answer.text}</span>{correct && <CheckCircle2 size={19} />}{wrong && <XCircle size={19} />}</button>; })}</div>{answered && <div className={`feedback-panel ${isCorrect ? "feedback-correct" : "feedback-wrong"}`}><div className="feedback-icon">{isCorrect ? <CheckCircle2 size={21} /> : <XCircle size={21} />}</div><div><strong>{isCorrect ? "Correct" : "Not quite"}</strong><p>{isCorrect ? question.explanation : `The correct answer is: ${question.answers.find((answer) => answer.id === question.correctAnswer)?.text}`}</p><small>{isCorrect ? `+${session.lastXp} XP · ${question.evidence.reference}` : `You'll see this concept again in Review · ${question.evidence.reference}`}</small></div></div>}{answered && <button className="button button-primary next-button" onClick={advanceQuiz}>{session.index === session.questions.length - 1 ? "See results" : "Next question"} <ArrowRight size={17} /></button>}</main><aside className="quiz-side"><div className="quiz-side-note"><span className="eyebrow">WHY IT MATTERS</span><p>{question.explanation}</p><div className="side-source"><span className={`source-dot ${question.evidence.type}`} />{question.evidence.type === "quran" ? "Qur'an evidence" : "Prophetic evidence"}</div></div><div className="quiz-side-count"><span>YOUR PROGRESS</span><strong>{session.correctCount}<small> correct</small></strong><ProgressBar value={(session.correctCount / Math.max(1, session.index + (answered ? 1 : 0))) * 100} /></div></aside></div></div>;
  }

  function Results() {
    if (!session) return null;
    const score = Math.round((session.correctCount / session.questions.length) * 100);
    const mistakes = session.questions.filter((question) => session.answers[question.id] !== question.correctAnswer);
    return <div className="results-page"><div className="results-eyebrow"><Trophy size={17} /> LESSON COMPLETE</div><h1>{score >= 80 ? "A beautiful step forward." : "Keep returning to the evidence."}</h1><p className="results-subtitle">{session.title}</p><div className="score-orb"><div><strong>{session.correctCount}</strong><span>/{session.questions.length}</span><small>{score}%</small></div></div><div className="result-stats"><div><strong>+{session.earnedXp}</strong><span>XP earned</span></div><div><strong>{session.bestStreak}</strong><span>best streak</span></div><div><strong>{mistakes.length}</strong><span>to review</span></div></div><div className="results-evidence"><Sparkles size={17} /><span>{Array.from(new Set(session.questions.map((question) => question.evidence.reference))).length} pieces of evidence revisited</span></div><div className="results-actions">{mistakes.length > 0 && <button className="button button-secondary" onClick={() => startQuiz(mistakes.map((question) => question.id), "Review your mistakes")}>Review mistakes <CircleHelp size={16} /></button>}<button className="button button-primary" onClick={returnToDashboard}>Return home <ArrowRight size={16} /></button></div></div>;
  }

  function Review() {
    const reviewQuestions = progress.reviewIds.map((id) => getQuestion(id)).filter((question): question is Question => Boolean(question));
    return <><PageHeader eyebrow="SPACED REVIEW" title="Return to what you missed" description="Mistakes are not a dead end. They are the places where learning can take root." action={<div className="review-ready"><span>{reviewQuestions.length}</span> ready now</div>} /><div className="review-hero"><div className="review-hero-icon"><CircleHelp size={25} /></div><div><span className="eyebrow">YOUR REVIEW QUEUE</span><h2>Learn it once. Remember it longer.</h2><p>Dalīl brings missed concepts back after a few questions, then tomorrow, then later again.</p></div><button className="button button-primary" disabled={!reviewQuestions.length} onClick={() => startQuiz(reviewQuestions.map((question) => question.id), "Review queue")}>Start review <ArrowRight size={16} /></button></div>{reviewQuestions.length ? <div className="review-list">{reviewQuestions.map((question) => <button className="review-row" key={question.id} onClick={() => startQuiz([question.id], "Focused review")}><span className={`review-source ${question.evidence.type}`}>{question.evidence.type === "quran" ? <BookOpen size={16} /> : <MessageCircle size={16} />}</span><span><strong>{question.question}</strong><small>{question.evidence.reference} · ready to revisit</small></span><ArrowRight size={17} /></button>)}</div> : <div className="empty-state"><CheckCircle2 size={28} /><h2>Your review queue is clear.</h2><p>Keep exploring and new review items will appear when you need them.</p><button className="button button-secondary" onClick={() => navigate("topics")}>Explore topics <ArrowRight size={16} /></button></div>}</>;
  }

  function Library() {
    const filtered = questions.filter((question) => isLearnerVisible(question) && (libraryFilter === "all" || question.evidence.type === libraryFilter) && `${question.evidence.reference} ${question.evidence.translation} ${question.question}`.toLowerCase().includes(librarySearch.toLowerCase()));
    const unique = Array.from(new Map(filtered.map((question) => [question.evidence.reference, question])).values());
    return <><PageHeader eyebrow="EVIDENCE LIBRARY" title="Keep the sources close" description="Search the āyāt and aḥādīth behind your learning path." /><div className="library-toolbar"><div className="search-field"><Search size={17} /><input value={librarySearch} onChange={(event) => setLibrarySearch(event.target.value)} placeholder="Search evidence, reference, or meaning..." aria-label="Search evidence" /></div><div className="filter-pills">{(["all", "quran", "hadith"] as EvidenceFilter[]).map((filter) => <button key={filter} className={libraryFilter === filter ? "active" : ""} onClick={() => setLibraryFilter(filter)}>{filter === "all" ? "All sources" : filter === "quran" ? "Qur'an" : "Hadith"}</button>)}</div></div><div className="library-grid">{unique.map((question) => <article className="library-card" key={question.id}><EvidenceCard evidence={question.evidence} compact /><div className="library-card-footer"><span>{getTopic(question.topicId).shortTitle}</span><button className="text-button" onClick={() => startQuiz([question.id], "Practice this evidence")}>Practice <ArrowRight size={14} /></button></div></article>)}</div>{!unique.length && <div className="empty-state"><Search size={28} /><h2>No evidence found.</h2><p>Try a different word or switch source filters.</p></div>}</>;
  }

  function Profile() {
    const achievements = [{ icon: BookOpen, title: "First evidence", detail: "Learn your first āyah", done: progress.questionsAnswered > 0 }, { icon: Sun, title: "Sunnah student", detail: "Learn 10 aḥādīth", done: progress.ahadithLearned >= 10 }, { icon: Flame, title: "Consistent student", detail: "Study for 7 days", done: progress.longestStreak >= 7 }, { icon: Trophy, title: "Perfect lesson", detail: "Score 100%", done: false }];
    return <><PageHeader eyebrow="YOUR PROFILE" title="Your learning" description="A record of what you have practiced, not a measure of your worth." action={<button className="icon-button" aria-label="Toggle theme" onClick={() => setProgress({ ...progress, theme: progress.theme === "light" ? "dark" : "light" })}>{progress.theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>} /><div className="profile-grid"><div className="profile-card profile-summary"><div className="avatar">S</div><div><span className="eyebrow">LEVEL {level.level}</span><h2>Student</h2><p>Learning with purpose</p></div><div className="profile-xp"><strong>{progress.xp.toLocaleString()}</strong><span>total XP</span></div></div><div className="profile-stats"><StatCard label="Āyāt learned" value={String(progress.ayatLearned)} icon={BookOpen} /><StatCard label="Aḥādīth learned" value={String(progress.ahadithLearned)} icon={MessageCircle} /><StatCard label="Questions answered" value={String(progress.questionsAnswered)} icon={CircleHelp} /><StatCard label="Accuracy" value={`${accuracy}%`} icon={Target} /></div><div className="achievements-card"><div className="section-heading"><div><span className="eyebrow">MILESTONES</span><h2>Knowledge in motion</h2></div><span className="muted-label">{achievements.filter((item) => item.done).length} / {achievements.length} earned</span></div><div className="achievement-grid">{achievements.map(({ icon: Icon, title, detail, done }) => <div className={`achievement ${done ? "earned" : ""}`} key={title}><span className="achievement-icon"><Icon size={18} /></span><div><strong>{title}</strong><small>{detail}</small></div>{done && <CheckCircle2 size={16} />}</div>)}</div></div><button className="admin-link" onClick={() => navigate("admin")}><ShieldCheck size={18} /><span><strong>Content workspace</strong><small>Admin verification dashboard</small></span><ArrowRight size={17} /></button></div></>;
  }

  function Admin() {
    const verifiedCount = questions.filter((question) => question.verification.status === "verified").length;
    const pendingCount = questions.filter((question) => question.verification.status !== "verified").length;
    return <><PageHeader eyebrow="CONTENT WORKSPACE" title="Admin dashboard" description="Protect the trust behind every question. Draft first, verify carefully, publish last." action={<button className="button button-primary button-small"><span>+</span> New question</button>} /><div className="admin-tabs"><button className="active">Overview</button><button>Questions <span>{questions.length}</span></button><button>Lessons</button><button>Topics</button><button>Verification <span className="tab-alert">{pendingCount}</span></button></div><div className="admin-overview"><StatCard label="Total questions" value={String(questions.length)} icon={CircleHelp} detail="Starter content" /><StatCard label="Verified" value={String(verifiedCount)} icon={ShieldCheck} detail="Ready to publish" /><StatCard label="Needs review" value={String(pendingCount)} icon={MessageCircle} detail="Do not publish yet" /><StatCard label="Topics" value={String(topics.length)} icon={Compass} detail="Learning paths" /></div><div className="admin-table-card"><div className="table-heading"><div><span className="eyebrow">QUESTION MANAGER</span><h2>Content verification</h2></div><div className="search-field admin-search"><Search size={16} /><input placeholder="Search questions..." /></div></div><div className="question-table"><div className="table-row table-head"><span>Question</span><span>Topic</span><span>Evidence</span><span>Status</span></div>{questions.slice(0, 9).map((question) => <div className="table-row" key={question.id}><span className="question-cell"><strong>{question.question}</strong><small>{question.id}</small></span><span>{getTopic(question.topicId).shortTitle}</span><span className="table-evidence"><span className={`source-dot ${question.evidence.type}`} />{question.evidence.reference}</span><span className={`status ${question.verification.status === "verified" ? "status-verified" : "status-pending"}`}>{question.verification.status === "verified" ? <Check size={13} /> : <CircleHelp size={13} />}{question.verification.status === "verified" ? "Verified" : "Needs review"}</span></div>)}</div></div><div className="verification-note"><ShieldCheck size={19} /><p><strong>Content integrity is part of the product.</strong> Qur'an wording, hadith wording, references, translations, and grades should be checked by qualified reviewers before content moves from draft to published.</p></div></>;
  }

  function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
    return <header className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</header>;
  }

  function Landing() {
    return <div className="landing-page"><nav className="landing-nav"><Logo light /><div className="landing-nav-links"><span>Qur&apos;an</span><span>Sunnah</span><span>Learn with evidence</span></div><button className="landing-signin" onClick={() => navigate("dashboard")}>Open dashboard <ArrowRight size={15} /></button></nav><main className="landing-main"><div className="landing-copy"><span className="eyebrow landing-eyebrow">QUR&apos;AN · SUNNAH · KNOWLEDGE</span><h1>Build your faith,<br /><em>one proof</em> at a time.</h1><p>Dalīl turns Islamic learning into a calm, meaningful practice. Read the evidence. Test your understanding. Carry the lesson with you.</p><button className="button button-light landing-cta" onClick={() => navigate("dashboard")}>Start learning <ArrowRight size={17} /></button><div className="landing-trust"><div className="trust-avatars"><span>ف</span><span>ع</span><span>م</span><span>+</span></div><span>Learn at your own pace<br /><small>with the source always in view</small></span></div></div><div className="landing-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="evidence-float evidence-float-back"><span className="eyebrow">A LIVING GUIDE</span><p dir="rtl" lang="ar">وَقُل رَّبِّ زِدْنِي عِلْمًا</p><small>“My Lord, increase me in knowledge.”</small></div><div className="landing-evidence-card"><div className="landing-card-head"><span><span className="source-dot quran" /> QUR&apos;AN</span><span>20:114</span></div><p className="arabic-text" dir="rtl" lang="ar">وَقُل رَّبِّ زِدْنِي عِلْمًا</p><p className="translation">“And say, My Lord, increase me in knowledge.”</p><div className="card-rule" /><div className="landing-card-foot"><span>Read</span><span className="card-check"><Check size={13} /></span></div></div><div className="float-streak"><Flame size={16} /><div><strong>5</strong><span>day streak</span></div></div></div></main><footer className="landing-footer"><span>LEARN · REFLECT · REMEMBER</span><span>Crafted for the sincere student</span><span>Scroll to begin <ArrowRight size={14} /></span></footer></div>;
  }

  if (view === "landing") return <Landing />;

  return <div className="app-shell"><aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}><div className="sidebar-top"><Logo /><button className="mobile-close" onClick={() => setMobileMenuOpen(false)}><X size={19} /></button></div><div className="sidebar-label">LEARNING SPACE</div><nav className="sidebar-nav">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id || (id === "topics" && (view === "topic" || view === "lesson")) ? "active" : ""} onClick={() => navigate(id)}><Icon size={18} /><span>{label}</span>{id === "review" && progress.reviewIds.length > 0 && <b>{progress.reviewIds.length}</b>}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-streak"><Flame size={16} /><div><strong>{progress.currentStreak} days</strong><span>learning streak</span></div></div><button className="profile-mini" onClick={() => navigate("profile")}><span className="mini-avatar">S</span><span><strong>Student</strong><small>Level {level.level}</small></span><MoreHorizontal size={17} /></button></div></aside><div className="main-column"><header className="mobile-topbar"><button className="mobile-menu" onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button><Logo /><button className="icon-button" onClick={() => setProgress({ ...progress, theme: progress.theme === "light" ? "dark" : "light" })}>{progress.theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</button></header><main className="content-area">{renderView()}</main></div><nav className="bottom-nav">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id || (id === "topics" && (view === "topic" || view === "lesson")) ? "active" : ""} onClick={() => navigate(id)}><Icon size={18} /><span>{label}</span>{id === "review" && progress.reviewIds.length > 0 && <b />}</button>)}</nav></div>;
}
