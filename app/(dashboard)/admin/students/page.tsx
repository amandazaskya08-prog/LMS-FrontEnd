import StudentDirectoryManager from "@/components/students/student-directory";

export const metadata = {
  title: "Data Mahasiswa | LMS Kuliah",
  description: "Direktori dan manajemen seluruh mahasiswa per program studi universitas.",
};

export default function AdminStudentsPage() {
  return <StudentDirectoryManager />;
}
