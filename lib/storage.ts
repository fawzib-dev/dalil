import { UserProgress } from "@/types/quiz";

export const STORAGE_KEY = "dalil-progress-v1";

export const defaultProgress: UserProgress = {
  xp: 3820,
  level: 4,
  currentStreak: 5,
  longestStreak: 12,
  questionsAnswered: 284,
  correctAnswers: 247,
  ayatLearned: 48,
  ahadithLearned: 31,
  completedLessons: ["following-the-prophet-1", "following-the-prophet-2"],
  reviewIds: ["sunnah-003", "sunnah-006", "parents-001"],
  attempts: {},
  lastStudyDate: undefined,
  theme: "light",
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
