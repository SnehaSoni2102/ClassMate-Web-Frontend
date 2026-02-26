/** Quiz question shape from group active quizzes API */
export interface GroupQuizQuestion {
  text: string;
  options: string[];
  correctOption: string;
}

/** Payload for POST /quiz/create/group/:groupId */
export interface CreateGroupQuizPayload {
  title: string;
  description: string;
  title_hi?: string;
  description_hi?: string;
  totalQuestions: number;
  durationInMinutes: number;
  exam?: string;
  languageOptions: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  questions: string[];
}

/** Quiz item shape returned by GET /quiz/group/:groupId/active */
export interface GroupQuizListItem {
  _id: string;
  title: string;
  description: string;
  title_hi?: string;
  description_hi?: string;
  questions: GroupQuizQuestion[];
  createdBy: string;
  totalQuestions: number;
  durationInMinutes: number;
  totalMarks?: number;
  marksPerQuestion?: number;
  negativeMarks?: number;
  exam?: string;
  languageOptions?: string[];
  type: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  status: string;
  testType?: string;
  group: string[];
  attemptedUsers?: string[];
  isAllIndia?: boolean;
  createdAt: string;
  updatedAt: string;
  deletionAt?: string;
}
