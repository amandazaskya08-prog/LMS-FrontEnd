"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";

import type {
  LMSUser,
  UserRole,
  UserStatus,
} from "../../src/models/user";

interface UserFormModalProps {
  user: LMSUser | null;
  onClose: () => void;
  onSave: (
    data: Omit<LMSUser, "id" | "createdAt">
  ) => void;
}

export default function UserFormModal({
  user,
  onClose,
  onSave,
}: UserFormModalProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>(
    user?.role ?? "student"
  );
  const [status, setStatus] = useState<UserStatus>(
    user?.status ?? "active"
  );
  const [studentId, setStudentId] = useState(
    user?.studentId ?? ""
  );
  const [faculty, setFaculty] = useState(
    user?.faculty ?? ""
  );
  const [studyProgram, setStudyProgram] = useState(
    user?.studyProgram ?? ""
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    onSave({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      status,
      faculty: faculty.trim(),
      studentId: role === "student" ? studentId.trim() : undefined,
      studyProgram: studyProgram.trim() || undefined,
    });
  }

  return (
    <div className="modal-backdrop">
      <div className="user-form-modal">
        <div className="modal-header">
          <div>
            <div className="modal-heading-icon">
              <UserPlus size={21} />
            </div>

            <h2>{user ? "Edit User" : "Add New User"}</h2>

            <p>
              {user
                ? "Update the user's information."
                : "Create a new university account."}
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="user-form-grid">
            <div className="form-field full-width">
              <label htmlFor="user-name">Full Name *</label>

              <input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="user-email">Email Address *</label>

              <input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@campus.ac.id"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="user-role">User Role *</label>

              <select
                id="user-role"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as UserRole)
                }
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="user-status">Account Status</label>

              <select
                id="user-status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as UserStatus)
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {role === "student" && (
              <div className="form-field full-width">
                <label htmlFor="student-id">Student ID (NIM) *</label>

                <input
                  id="student-id"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter student ID"
                  required
                />
              </div>
            )}

            <div className="form-field full-width">
              <label htmlFor="user-faculty">Faculty *</label>

              <input
                id="user-faculty"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="Enter faculty"
                required
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="user-program">
                Study Program / Department
              </label>

              <input
                id="user-program"
                value={studyProgram}
                onChange={(e) =>
                  setStudyProgram(e.target.value)
                }
                placeholder="Enter study program"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="primary-action">
              {user ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}