import ModulePage from "../../../components/ui/module-page";
import { courses } from "../../../src/data/mock-data";
import { BookOpen } from "lucide-react";

export default function CoursesPage() {
  return (
    <ModulePage
      title="My Courses"
      description="View your registered university courses."
      icon={BookOpen}
      items={courses.map((course) => ({
        title: course.name,
        description: `${course.lecturer} · ${course.credits} credits`,
        detail: `${course.code} · ${course.progress}% completed`,
      }))}
    />
  );
}