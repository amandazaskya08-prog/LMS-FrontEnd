
export type AcademicStatus = "active" | "inactive";

export interface Faculty {
  id: string;
  name: string;
  code: string;
  dean: string;
  email: string;
  description: string;
  status: AcademicStatus;
  createdAt: string;
}

export interface StudyProgram {
  id: string;
  facultyId: string;
  name: string;
  code: string;
  degree: "D3" | "D4" | "S1" | "S2" | "S3";
  headOfProgram: string;
  status: AcademicStatus;
  createdAt: string;
}
