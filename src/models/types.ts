export type UserRole = "admin" | "student" | "lecturer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  faculty?: string;
  studyProgram?: string;
  avatar?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  credits: number;
  progress: number;
  color: string;
  semester: string;
}

export interface Material {
  id: string;
  title: string;
  course: string;
  type: "PDF" | "Video" | "Document";
  size: string;
  uploadedAt: string;
}

export interface QuestionItem {
  id?: string;
  text: string;
  options: string[];
  answerIndex?: number;
  points: number;
}

export interface ApiQuiz {
  id: string;
  courseId: string;
  courseName?: string;
  studyProgramId?: string;
  studyProgramName?: string;
  lecturerId?: string;
  lecturerName?: string;
  title: string;
  type: "Kuis" | "UTS" | "UAS";
  description: string;
  startAt?: string;
  endAt?: string;
  durationMinutes: number;
  published: boolean;
  questionCount?: number;
  totalPoints?: number;
  attemptCount?: number;
  questions?: QuestionItem[];
  myAttempt?: {
    id: string;
    score: number | null;
    maxScore: number;
    submittedAt: string | null;
    isFinished: boolean;
  } | null;
  createdAt?: string;
}

export interface ApiSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentNim?: string;
  content: string;
  link?: string;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
  gradedBy: string | null;
}

export interface ApiAssignment {
  id: string;
  courseId: string;
  courseName?: string;
  studyProgramId?: string;
  studyProgramName?: string;
  lecturerId: string;
  lecturerName?: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  attachmentLink?: string;
  createdAt: string;
  submissionCount?: number;
  mySubmission?: ApiSubmission | null;
}

export interface AppNotification {
  id: string;
  recipientUserId?: string | null;
  recipientRole?: UserRole | "all";
  recipientStudyProgramId?: string | null;
  title: string;
  message: string;
  type: "quiz" | "assignment" | "ukt" | "submission" | "grade" | "calendar" | "system";
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface QuizAttemptResult {
  id: string;
  studentId: string;
  studentNim: string;
  studentName: string;
  score: number | null;
  maxScore: number;
  percentage: number;
  submittedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  course: string;
  deadline: string;
  duration: number;
  status: "upcoming" | "completed" | "missed";
}

export interface AcademicEvent {
  id: string;
  title: string;
  date: string;
  type: "exam" | "holiday" | "academic" | "other";
}

export interface ApiCalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category: "KRS" | "Perkuliahan" | "Ujian" | "Libur" | "UKT" | "Yudisium" | string;
  semesterId: string;
  authorName?: string;
  createdAt?: string;
}

export interface Payment {
  id: string;
  semester: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
}

/** Standard API response envelope. */
export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, unknown>;
}

/** Authenticated user returned by /auth/login and /auth/me (no password). */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  refId: string | null;
}

export interface StudentDirectoryItem {
  id: string;
  nim: string;
  name: string;
  email: string;
  studyProgramId: string;
  studyProgramName: string;
  studyProgramCode: string;
  facultyName: string;
  currentSemester: number;
  angkatan: number;
  uktGroup: number;
  status: string;
  advisorId: string | null;
  advisorName?: string;
  gpa?: number;
  phone?: string;
  isAdvisee?: boolean;
}