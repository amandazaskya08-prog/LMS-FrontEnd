
export type CourseStatus = "active" | "inactive" | "draft";

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;

  facultyId: string;
  programId: string;

  lecturerId: string;
  lecturerName: string;

  semester: number;
  academicYear: string;
  credits: number;
  maxStudents: number;

  enrolledStudents: number;
  status: CourseStatus;

  createdAt: string;
  updatedAt: string;
}

export interface LecturerOption {
  id: string;
  name: string;
  email: string;
  facultyId: string;
}

export interface CourseFormData {
  code: string;
  name: string;
  description: string;
  facultyId: string;
  programId: string;
  lecturerId: string;
  semester: number;
  academicYear: string;
  credits: number;
  maxStudents: number;
  status: CourseStatus;
}
