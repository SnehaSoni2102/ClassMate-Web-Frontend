export type TestStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled' | 'published';
export type QuestionType = 'mcq' | 'text' | 'numeric' | 'boolean';
export type ParticipantStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';

/** Section shape returned by group tests list API */
export interface GroupTestSection {
  sectionId: string;
  questionIds: string[];
  name: string;
  name_hi: string;
  order: number;
  timeLimit: number;
}

/** Creator user object in group test list API */
export interface GroupTestCreator {
  _id: string;
  phoneNumber?: string;
  role?: string;
  Name?: string;
  email?: string;
  [key: string]: unknown;
}

/** Test item shape returned by group tests list API (GET /group/group-tests/:id) */
export interface GroupTestListItem {
  _id: string;
  user: GroupTestCreator;
  title: string;
  title_hi?: string;
  totalQuestions: number;
  totalSections: number;
  durationInMinutes: number;
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarks?: number;
  description: string;
  description_hi?: string;
  languageOptions?: string[];
  sections: GroupTestSection[];
  type: 'mock' | 'live';
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  status: TestStatus;
  exam?: string;
  testType?: string;
  group: string[];
  attemptedUsers?: string[];
  isAllIndia?: boolean;
  createdAt: string;
  updatedAt: string;
  /** When the test is scheduled for deletion/expiry (ISO date string) */
  deletionAt?: string;
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  groupId: string;
  createdBy: string;
  createdByName: string;
  status: TestStatus;
  startTime: string;
  endTime: string;
  durationInMinutes: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  passingMarks?: number;
  instructions?: string;
  settings: TestSettings;
  questions: Question[];
  participants: TestParticipant[];
  results?: TestResults;
  createdAt: string;
  updatedAt: string;
}

export interface TestSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean;
  allowReview: boolean;
  preventCheating: boolean;
  timeLimit: number; // in minutes
  attemptsAllowed: number;
  negativeMarking: boolean;
  negativeMarkingValue?: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | number | boolean;
  points: number;
  negativePoints?: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  imageUrl?: string;
  order: number;
}

export interface Answer {
  questionId: string;
  answer: string | number | boolean;
  isCorrect?: boolean;
  pointsEarned?: number;
  timeSpent?: number; // in seconds
}

export interface TestParticipant {
  id: string;
  userId: string;
  testId: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    email?: string;
    avatar?: string;
  };
  startedAt?: string;
  submittedAt?: string;
  score?: number;
  percentage?: number;
  rank?: number;
  answers: Answer[];
  status: ParticipantStatus;
  timeSpent?: number; // in minutes
  attemptNumber: number;
  isPassed?: boolean;
}

export interface TestResults {
  testId: string;
  totalParticipants: number;
  completedParticipants: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  averageTimeSpent: number;
  questionAnalytics: QuestionAnalytics[];
  participantRankings: ParticipantRanking[];
  publishedAt?: string;
  publishedBy?: string;
}

export interface QuestionAnalytics {
  questionId: string;
  question: string;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  skippedAttempts: number;
  accuracyRate: number;
  averageTimeSpent: number;
  difficulty: 'easy' | 'medium' | 'hard';
  optionAnalytics?: OptionAnalytics[];
}

export interface OptionAnalytics {
  option: string;
  selectedCount: number;
  percentage: number;
  isCorrect: boolean;
}

export interface ParticipantRanking {
  userId: string;
  userName: string;
  score: number;
  percentage: number;
  rank: number;
  timeSpent: number;
  submittedAt: string;
}

export interface CreateTestData {
  title: string;
  description: string;
  groupId: string;
  startTime: string;
  endTime: string;
  duration: number;
  instructions?: string;
  settings: TestSettings;
  questions: Omit<Question, 'id'>[];
}

export interface UpdateTestData {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  instructions?: string;
  settings?: Partial<TestSettings>;
  questions?: Question[];
}

export interface TestFilters {
  groupId?: string;
  status?: TestStatus;
  createdBy?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'startTime' | 'endTime' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TestSubmission {
  testId: string;
  answers: Answer[];
  submittedAt: string;
  timeSpent: number;
}