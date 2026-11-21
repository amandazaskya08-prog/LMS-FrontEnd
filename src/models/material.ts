
export type MaterialType =
  | "PDF"
  | "Video"
  | "Document"
  | "Presentation";

export type MaterialStatus = "active" | "inactive" | "draft";

export interface Material {
  id: string;
  title: string;
  description: string;

  courseId: string;
  courseCode: string;
  courseName: string;

  lecturerId: string;
  lecturerName: string;

  type: MaterialType;
  category: string;
  fileSize: string;
  fileUrl: string;

  downloads: number;
  status: MaterialStatus;

  uploadedAt: string;
  updatedAt: string;
}

export interface MaterialFormData {
  title: string;
  description: string;
  courseId: string;
  type: MaterialType;
  category: string;
  fileSize: string;
  fileUrl: string;
  status: MaterialStatus;
}

export interface CourseOption {
  id: string;
  code: string;
  name: string;
  lecturerId: string;
  lecturerName: string;
}
