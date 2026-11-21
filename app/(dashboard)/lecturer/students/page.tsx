import StudentDirectoryManager from "@/components/students/student-directory";

export const metadata = {
  title: "Mahasiswa Saya | LMS Kuliah",
  description: "Direktori mahasiswa dan bimbingan akademik program studi dosen.",
};

export default function LecturerStudentsPage() {
  return <StudentDirectoryManager />;
}
