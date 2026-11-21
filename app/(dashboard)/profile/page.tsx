import { currentUser } from "../../../src/data/mock-data";
import { getInitials } from "../../../src/lib/utils";
import PageHeader from "../../../components/ui/page-header";

export default function ProfilePage() {
  return (
    <div className="page-container">
      <PageHeader
        title="My Profile"
        description="View your personal and academic information."
      />

      <section className="content-card profile-card">
        <div className="profile-avatar">
          {getInitials(currentUser.name)}
        </div>

        <h2>{currentUser.name}</h2>
        <p>{currentUser.email}</p>

        <div className="academic-details">
          <div>
            <span>Student ID</span>
            <strong>{currentUser.studentId}</strong>
          </div>

          <div>
            <span>Role</span>
            <strong>{currentUser.role}</strong>
          </div>

          <div>
            <span>Faculty</span>
            <strong>{currentUser.faculty}</strong>
          </div>

          <div>
            <span>Study Program</span>
            <strong>{currentUser.studyProgram}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}