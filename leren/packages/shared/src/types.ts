// Shared types between web and api

export type Role = 'USER' | 'TUTOR';
export type Plan = 'FREE' | 'PRO';

export interface User {
  id: string;
  email: string;
  plan: Plan;
  createdAt: string;
}

export interface Profile {
  userId: string;
  fullName: string | null;
  school: string | null;
  major: string | null;
  gradeLevel: string | null;
  nativeLanguage: string | null;
  targetLanguage: string | null;
}

export interface Settings {
  userId: string;
  uiLanguage: string;
  tutorLanguage: string;
  bilingualMode: boolean;
  voice: string;
  voiceSpeed: number;
  autoReplySeconds: number;
  storeHistory: boolean;
  notificationsEnabled: boolean;
}

export interface TutorSession {
  id: string;
  userId: string;
  title: string | null;
  startedAt: string;
  endedAt: string | null;
}

export interface TutorTurn {
  id: string;
  sessionId: string;
  role: Role;
  text: string;
  audioUrl: string | null;
  screenshotUrl: string | null;
  createdAt: string;
}

export interface SavedExplanation {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface PracticeSet {
  id: string;
  userId: string;
  subject: string;
  difficulty: string;
  createdAt: string;
}

export interface PracticeProblem {
  id: string;
  setId: string;
  prompt: string;
  solution: string;
  createdAt: string;
}

export interface Attempt {
  id: string;
  problemId: string;
  userId: string;
  answer: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface ApiError {
  error: { code: string; message: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
