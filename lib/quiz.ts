import { Question } from "@/types/quiz";

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function prepareQuestions(questions: Question[], limit = 10): Question[] {
  return shuffle(questions).slice(0, Math.min(limit, questions.length)).map((question) => ({
    ...question,
    answers: shuffle(question.answers),
  }));
}

export function getLevelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / 1000) + 1);
}

export function getLevelProgress(xp: number) {
  const level = getLevelFromXp(xp);
  const levelStart = (level - 1) * 1000;
  const levelEnd = level * 1000;
  return { level, current: xp - levelStart, total: levelEnd - levelStart, percentage: Math.min(100, Math.round(((xp - levelStart) / (levelEnd - levelStart)) * 100)) };
}

export function getReviewDate(attempts: number): string {
  const days = attempts <= 1 ? 0 : attempts === 2 ? 1 : attempts === 3 ? 3 : 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
