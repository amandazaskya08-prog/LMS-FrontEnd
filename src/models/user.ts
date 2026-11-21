export type UserRole = "admin" | "student" | "lecturer";

export type UserStatus = "active" | "inactive";

export interface LMSUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  studentId?: string;
  faculty: string;
  studyProgram?: string;
  createdAt: string;
}