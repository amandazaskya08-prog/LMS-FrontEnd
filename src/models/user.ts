export type UserRole = "admin" | "student" | "lecturer";

export type UserStatus = "active" | "inactive";

export interface LMSUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  studentId?: string;
  nidn?: string;
  faculty?: string;
  studyProgram?: string;
  studyProgramId?: string;
  angkatan?: number;
  currentSemester?: number;
  uktGroup?: number;
  position?: string;
  expertise?: string;
  password?: string;
  createdAt: string;
}
