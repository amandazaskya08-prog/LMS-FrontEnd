import StudentDirectoryManager from "@/components/students/student-directory";

export const metadata = {
  title: "Direktori Mahasiswa | LMS Kuliah",
  description: "Direktori mahasiswa dan bimbingan akademik perkuliahan.",
};

export default function StudentsPage() {
  return <StudentDirectoryManager />;
}
