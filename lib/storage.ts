import { UserProgress } from "@/types/quiz";

export const STORAGE_KEY = "dalil-progress-v2";

export const defaultProgress: UserProgress = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  ayatLearned: 0,
  ahadithLearned: 0,
  completedLessons: [],
  reviewIds: [],
  attempts: {},
  studyDates: [],
  lastStudyDate: undefined,
  theme: "light",
  onboardingComplete: false,
};

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(stored) } as UserProgress;
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: UserProgress) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
