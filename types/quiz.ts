export type EvidenceType = "quran" | "hadith";
export type Difficulty = "easy" | "medium" | "scholar";
export type QuestionType = "multiple-choice" | "true-false" | "finish-ayah";
export type VerificationStatus = "draft" | "needs-verification" | "verified" | "published";

export interface Evidence {
  type: EvidenceType;
  arabic: string;
  translation: string;
  reference: string;
  collection?: string;
  hadithNumber?: string;
  grade?: string;
}

export interface AnswerOption {
  id: string;
  text: string;
}

export interface Verification {
  status: VerificationStatus;
  quranReferenceChecked: boolean;
  arabicChecked: boolean;
  translationChecked: boolean;
  hadithReferenceChecked: boolean;
  hadithGradeChecked: boolean;
}

export interface Question {
  id: string;
  topicId: string;
  lessonId: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  evidence: Evidence;
  answers: AnswerOption[];
  correctAnswer: string;
  explanation: string;
  xp: number;
  verification: Verification;
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  description: string;
  questionIds: string[];
  order: number;
}

export interface Topic {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  accent: string;
  lessons: Lesson[];
}

export interface AttemptSummary {
  attempts: number;
  correct: number;
  lastAnsweredAt: string;
  nextReviewAt?: string;
}

export interface UserProgress {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  questionsAnswered: number;
  correctAnswers: number;
  ayatLearned: number;
  ahadithLearned: number;
  completedLessons: string[];
  reviewIds: string[];
  attempts: Record<string, AttemptSummary>;
  studyDates: string[];
  lastStudyDate?: string;
  theme: "light" | "dark";
  onboardingComplete: boolean;
  onboardingGoal?: "foundations" | "consistency" | "evidence";
  dailyMinutes?: 5 | 10 | 15;
  preferredTopicId?: string;
}
