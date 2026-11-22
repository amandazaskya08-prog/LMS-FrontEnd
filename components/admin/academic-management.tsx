
"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Building2,
  GraduationCap,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  BookOpen,
  MoreHorizontal,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import type {
  Faculty,
  StudyProgram,
  AcademicStatus,
} from "../../src/models/academic";

import { authFetch } from "../../src/services/api-clients";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ========================================
// DEMO DATA
// ========================================

const initialFaculties: Faculty[] = [
  {
    id: "FAC001",
    name: "Faculty of Computer Science",
    code: "FCS",
    dean: "Dr. Ahmad Wijaya",
    email: "fcs@campus.ac.id",
    description: "Faculty focused on computing and information technology.",
    status: "active",
    createdAt: "2026-01-01",
  },
  {
    id: "FAC002",
    name: "Faculty of Engineering",
    code: "FE",
    dean: "Dr. Budi Santoso",
    email: "engineering@campus.ac.id",
    description: "Faculty focused on engineering and applied sciences.",
    status: "active",
    createdAt: "2026-01-02",
  },
  {
    id: "FAC003",
    name: "Faculty of Economics",
    code: "FECO",
    dean: "Dr. Citra Maharani",
    email: "economics@campus.ac.id",
    description: "Faculty focused on business and economics.",
    status: "active",
    createdAt: "2026-01-03",
  },
];

const initialPrograms: StudyProgram[] = [
  {
    id: "PROG001",
    facultyId: "FAC001",
    name: "Informatics",
    code: "IF",
    degree: "S1",
    headOfProgram: "Dr. Budi Santoso",
    status: "active",
    createdAt: "2026-01-05",
  },
  {
    id: "PROG002",
    facultyId: "FAC001",
    name: "Information Systems",
    code: "SI",
    degree: "S1",
    headOfProgram: "Dr. Rina Putri",
    status: "active",
    createdAt: "2026-01-05",
  },
  {
    id: "PROG003",
    facultyId: "FAC002",
    name: "Civil Engineering",
    code: "TS",
    degree: "S1",
    headOfProgram: "Dr. Andi Pratama",
    status: "active",
    createdAt: "2026-01-06",
  },
  {
    id: "PROG004",
    facultyId: "FAC003",
    name: "Management",
    code: "MN",
    degree: "S1",
    headOfProgram: "Dr. Siti Rahma",
    status: "active",
    createdAt: "2026-01-07",
  },
];

// ========================================
// COMPONENT TYPES
// ========================================

type Tab = "faculties" | "programs";

type FacultyForm = Omit<Faculty, "id" | "createdAt">;

type ProgramForm = Omit<StudyProgram, "id" | "createdAt">;

type ModalState =
  | { type: "faculty"; data: Faculty | null }
  | { type: "program"; data: StudyProgram | null }
  | null;

  
export default function AcademicManagement() {
  const [faculties, setFaculties] =
    useState<Faculty[]>(initialFaculties);

  const [programs, setPrograms] =
    useState<StudyProgram[]>(initialPrograms);

  const [tab, setTab] = useState<Tab>("faculties");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");

  const [modal, setModal] = useState<ModalState>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: Tab;
    id: string;
    name: string;
  } | null>(null);

  // Fetch academic data from backend database
  const fetchAcademicData = async () => {
    try {
      const [facRes, progRes] = await Promise.all([
        authFetch(`${API_URL}/faculties`),
        authFetch(`${API_URL}/faculties/programs`),
      ]);

      if (facRes.ok) {
        const facJson = await facRes.json();
        if (facJson.success && Array.isArray(facJson.data) && facJson.data.length > 0) {
          setFaculties(facJson.data);
        }
      }

      if (progRes.ok) {
        const progJson = await progRes.json();
        if (progJson.success && Array.isArray(progJson.data) && progJson.data.length > 0) {
          setPrograms(progJson.data);
        }
      }
    } catch {
      // Ignore network blip, retain local state
    }
  };

  useEffect(() => {
    fetchAcademicData();
  }, []);

  // Statistics

  const facultyCount = faculties.length;
  const programCount = programs.length;

  const activeFacultyCount = faculties.filter(
    (item) => item.status === "active"
  ).length;

  const activeProgramCount = programs.filter(
    (item) => item.status === "active"
  ).length;

  // Faculty filtering

  const filteredFaculties = useMemo(() => {
    const keyword = search.toLowerCase();

    return faculties.filter((faculty) => {
      const matchesSearch =
        faculty.name.toLowerCase().includes(keyword) ||
        faculty.code.toLowerCase().includes(keyword) ||
        faculty.dean.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        faculty.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [faculties, search, statusFilter]);

  // Program filtering

  const filteredPrograms = useMemo(() => {
    const keyword = search.toLowerCase();

    return programs.filter((program) => {
      const faculty = faculties.find(
        (item) => item.id === program.facultyId
      );

      const matchesSearch =
        program.name.toLowerCase().includes(keyword) ||
        program.code.toLowerCase().includes(keyword) ||
        program.headOfProgram.toLowerCase().includes(keyword) ||
        (faculty?.name.toLowerCase().includes(keyword) ?? false);

      const matchesStatus =
        statusFilter === "all" ||
        program.status === statusFilter;

      const matchesFaculty =
        facultyFilter === "all" ||
        program.facultyId === facultyFilter;

      return matchesSearch && matchesStatus && matchesFaculty;
    });
  }, [programs, faculties, search, statusFilter, facultyFilter]);

  // Save faculty
  async function saveFaculty(data: FacultyForm) {
    if (modal?.type !== "faculty") return;

    if (modal.data) {
      setFaculties((previous) =>
        previous.map((item) =>
          item.id === modal.data!.id
            ? { ...item, ...data }
            : item
        )
      );

      try {
        await authFetch(`${API_URL}/faculties/${modal.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch {
        // Handled
      }
    } else {
      const tempId = `FAC${Date.now()}`;
      setFaculties((previous) => [
        {
          ...data,
          id: tempId,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...previous,
      ]);

      try {
        const res = await authFetch(`${API_URL}/faculties`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setFaculties((prev) => prev.map((f) => (f.id === tempId ? { ...f, id: json.data.id } : f)));
        }
      } catch {
        // Handled
      }
    }

    setModal(null);
  }

  // Save program
  async function saveProgram(data: ProgramForm) {
    if (modal?.type !== "program") return;

    // VALIDASI: Fakultas wajib berstatus aktif!
    const targetFaculty = faculties.find((f) => f.id === data.facultyId);
    if (!targetFaculty || targetFaculty.status !== "active") {
      alert("Fakultas yang dipilih sedang NONAKTIF. Program studi hanya dapat ditempatkan pada fakultas yang aktif.");
      return;
    }

    if (modal.data) {
      setPrograms((previous) =>
        previous.map((item) =>
          item.id === modal.data!.id
            ? { ...item, ...data }
            : item
        )
      );

      try {
        await authFetch(`${API_URL}/faculties/programs/${modal.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch {
        // Handled
      }
    } else {
      const tempId = `PROG${Date.now()}`;
      setPrograms((previous) => [
        {
          ...data,
          id: tempId,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...previous,
      ]);

      try {
        const res = await authFetch(`${API_URL}/faculties/programs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setPrograms((prev) => prev.map((p) => (p.id === tempId ? { ...p, id: json.data.id } : p)));
        }
      } catch {
        // Handled
      }
    }

    setModal(null);
  }

  // Toggle active status (Faculties & Programs)
  async function toggleStatus(type: Tab, id: string) {
    if (type === "faculties") {
      const target = faculties.find((f) => f.id === id);
      const nextStatus = target?.status === "active" ? "inactive" : "active";

      setFaculties((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        )
      );

      try {
        await authFetch(`${API_URL}/faculties/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
      } catch {
        // Handled
      }
    } else {
      const target = programs.find((p) => p.id === id);
      const nextStatus = target?.status === "active" ? "inactive" : "active";

      setPrograms((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        )
      );

      try {
        await authFetch(`${API_URL}/faculties/programs/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
      } catch {
        // Handled
      }
    }

    setMenuId(null);
  }

  // Delete record
  async function confirmDelete() {
    if (!deleteTarget) return;

    if (deleteTarget.type === "faculties") {
      const hasPrograms = programs.some(
        (item) => item.facultyId === deleteTarget.id
      );

      if (hasPrograms) {
        alert(
          "Fakultas ini masih memiliki program studi terdaftar. Harap hapus atau pindahkan program studi terlebih dahulu."
        );

        setDeleteTarget(null);
        return;
      }

      setFaculties((previous) =>
        previous.filter((item) => item.id !== deleteTarget.id)
      );

      try {
        await authFetch(`${API_URL}/faculties/${deleteTarget.id}`, {
          method: "DELETE",
        });
      } catch {
        // Handled
      }
    } else {
      setPrograms((previous) =>
        previous.filter((item) => item.id !== deleteTarget.id)
      );

      try {
        await authFetch(`${API_URL}/faculties/programs/${deleteTarget.id}`, {
          method: "DELETE",
        });
      } catch {
        // Handled
      }
    }

    setDeleteTarget(null);
  }

  function getFacultyName(id: string) {
    return (
      faculties.find((item) => item.id === id)?.name ??
      "Unknown faculty"
    );
  }

  
  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>Faculty & Study Programs</h1>
          <p>
            Manage university faculties and academic programs.
          </p>
        </div>

        <button
          className="primary-action"
          onClick={() =>
            setModal({
              type: tab === "faculties" ? "faculty" : "program",
              data: null,
            })
          }
        >
          <Plus size={18} />
          Add {tab === "faculties" ? "Faculty" : "Program"}
        </button>
      </div>

      <div className="user-stats-grid">
        <StatCard
          icon={<Building2 size={21} />}
          label="Total Faculties"
          value={facultyCount}
          color="blue"
        />

        <StatCard
          icon={<GraduationCap size={21} />}
          label="Study Programs"
          value={programCount}
          color="purple"
        />

        <StatCard
          icon={<Users size={21} />}
          label="Active Faculties"
          value={activeFacultyCount}
          color="green"
        />

        <StatCard
          icon={<BookOpen size={21} />}
          label="Active Programs"
          value={activeProgramCount}
          color="orange"
        />
      </div>

      <section className="content-card academic-card">

        <div className="academic-tabs">
          <button
            className={tab === "faculties" ? "active" : ""}
            onClick={() => {
              setTab("faculties");
              setSearch("");
              setStatusFilter("all");
              setFacultyFilter("all");
            }}
          >
            <Building2 size={17} />
            Faculties
            <span>{facultyCount}</span>
          </button>

          <button
            className={tab === "programs" ? "active" : ""}
            onClick={() => {
              setTab("programs");
              setSearch("");
              setStatusFilter("all");
            }}
          >
            <GraduationCap size={17} />
            Study Programs
            <span>{programCount}</span>
          </button>
        </div>

        <div className="academic-toolbar">
          <div>
            <h2>
              {tab === "faculties"
                ? "All Faculties"
                : "All Study Programs"}
            </h2>
            <p>
              {tab === "faculties"
                ? "Manage university faculty information."
                : "Manage academic programs and their faculties."}
            </p>
          </div>

          <div className="user-filters">
            <div className="user-search">
              <Search size={18} />
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {tab === "programs" && (
              <select
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
              >
                <option value="all">All Faculties</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="user-table-wrapper">
          <table className="user-table">

            {tab === "faculties" ? (
              <>
                <thead>
                  <tr>
                    <th>Faculty</th>
                    <th>Code</th>
                    <th>Dean</th>
                    <th>Programs</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFaculties.map((faculty) => (
                    <tr key={faculty.id}>
                      <td>
                        <div className="academic-name">
                          <div className="academic-avatar">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <strong>{faculty.name}</strong>
                            <span>{faculty.email}</span>
                          </div>
                        </div>
                      </td>

                      <td><strong>{faculty.code}</strong></td>
                      <td>{faculty.dean}</td>

                      <td>
                        {programs.filter(
                          (item) => item.facultyId === faculty.id
                        ).length}
                      </td>

                      <td>
                        <StatusBadge status={faculty.status} />
                      </td>

                      <td>
                        <ActionMenu
                          id={faculty.id}
                          menuId={menuId}
                          setMenuId={setMenuId}
                          onEdit={() => setModal({
                            type: "faculty",
                            data: faculty,
                          })}
                          onToggle={() => toggleStatus(
                            "faculties",
                            faculty.id
                          )}
                          onDelete={() => setDeleteTarget({
                            type: "faculties",
                            id: faculty.id,
                            name: faculty.name,
                          })}
                          status={faculty.status}
                        />
                      </td>
                    </tr>
                  ))}

                  {filteredFaculties.length === 0 && <EmptyRow />}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th>Study Program</th>
                    <th>Code</th>
                    <th>Faculty</th>
                    <th>Degree</th>
                    <th>Head of Program</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPrograms.map((program) => (
                    <tr key={program.id}>
                      <td>
                        <div className="academic-name">
                          <div className="academic-avatar program-avatar">
                            <GraduationCap size={18} />
                          </div>
                          <div>
                            <strong>{program.name}</strong>
                            <span>{program.id}</span>
                          </div>
                        </div>
                      </td>

                      <td><strong>{program.code}</strong></td>
                      <td>{getFacultyName(program.facultyId)}</td>

                      <td>
                        <span className="degree-badge">
                          {program.degree}
                        </span>
                      </td>

                      <td>{program.headOfProgram}</td>

                      <td>
                        <StatusBadge status={program.status} />
                      </td>

                      <td>
                        <ActionMenu
                          id={program.id}
                          menuId={menuId}
                          setMenuId={setMenuId}
                          onEdit={() => setModal({
                            type: "program",
                            data: program,
                          })}
                          onToggle={() => toggleStatus(
                            "programs",
                            program.id
                          )}
                          onDelete={() => setDeleteTarget({
                            type: "programs",
                            id: program.id,
                            name: program.name,
                          })}
                          status={program.status}
                        />
                      </td>
                    </tr>
                  ))}

                  {filteredPrograms.length === 0 && <EmptyRow />}
                </tbody>
              </>
            )}

          </table>
        </div>

        <div className="user-table-footer">
          Showing{" "}
          {tab === "faculties"
            ? filteredFaculties.length
            : filteredPrograms.length}{" "}
          records
        </div>
      </section>

      {modal?.type === "faculty" && (
        <FacultyModal
          faculty={modal.data}
          onClose={() => setModal(null)}
          onSave={saveFaculty}
        />
      )}

      {modal?.type === "program" && (
        <ProgramModal
          program={modal.data}
          faculties={faculties}
          onClose={() => setModal(null)}
          onSave={saveProgram}
        />
      )}

      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="confirmation-modal">
            <button
              className="modal-close"
              onClick={() => setDeleteTarget(null)}
              aria-label="Close"
            >
              <X size={19} />
            </button>

            <div className="confirmation-icon">
              <Trash2 size={23} />
            </div>

            <h2>Delete record?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>?
            </p>

            <div className="modal-actions">
              <button
                className="secondary-action"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                className="danger-action"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="user-stat-card">
      <div className={`user-stat-icon ${color}`}>
        {icon}
      </div>
      <div>
        <span>{label}</span>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AcademicStatus }) {
  return (
    <span className={`status-badge ${status}`}>
      <span />
      {status}
    </span>
  );
}

function ActionMenu({
  id,
  menuId,
  setMenuId,
  onEdit,
  onToggle,
  onDelete,
  status,
}: {
  id: string;
  menuId: string | null;
  setMenuId: (id: string | null) => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  status: AcademicStatus;
}) {
  return (
    <div className="user-action-wrapper">
      <button
        className="user-action-button"
        onClick={() => setMenuId(menuId === id ? null : id)}
        aria-label="Open actions"
      >
        <MoreHorizontal size={19} />
      </button>

      {menuId === id && (
        <div className="user-action-menu">
          <button onClick={onEdit}>
            <Pencil size={15} /> Edit
          </button>

          <button onClick={onToggle}>
            {status === "active" ? "Deactivate" : "Activate"}
          </button>

          <button className="delete-action" onClick={onDelete}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyRow() {
  return (
    <tr>
      <td colSpan={7} className="user-empty">
        No records found.
      </td>
    </tr>
  );
}

// FACULTY MODAL

function FacultyModal({
  faculty,
  onClose,
  onSave,
}: {
  faculty: Faculty | null;
  onClose: () => void;
  onSave: (data: FacultyForm) => void;
}) {
  const [name, setName] = useState(faculty?.name ?? "");
  const [code, setCode] = useState(faculty?.code ?? "");
  const [dean, setDean] = useState(faculty?.dean ?? "");
  const [email, setEmail] = useState(faculty?.email ?? "");
  const [description, setDescription] = useState(
    faculty?.description ?? ""
  );
  const [status, setStatus] = useState<AcademicStatus>(
    faculty?.status ?? "active"
  );

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    onSave({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      dean: dean.trim(),
      email: email.trim().toLowerCase(),
      description: description.trim(),
      status,
    });
  }

  return (
    <ModalFrame
      title={faculty ? "Edit Faculty" : "Add Faculty"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="academic-form-grid">
          <FormField label="Faculty Name *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Faculty Code *">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Dean Name *">
            <input
              value={dean}
              onChange={(e) => setDean(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Faculty Email *">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Status">
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as AcademicStatus)
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>

          <FormField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </FormField>
        </div>

        <ModalActions
          onClose={onClose}
          submitLabel={faculty ? "Save Changes" : "Create Faculty"}
        />
      </form>
    </ModalFrame>
  );
}

// PROGRAM MODAL

function ProgramModal({
  program,
  faculties,
  onClose,
  onSave,
}: {
  program: StudyProgram | null;
  faculties: Faculty[];
  onClose: () => void;
  onSave: (data: ProgramForm) => void;
}) {
  // FILTER KETAT: Hanya fakultas yang aktif yang boleh dipilih!
  const activeFaculties = useMemo(() => {
    return faculties.filter((f) => f.status === "active");
  }, [faculties]);

  // Jika sedang edit prodi lama tapi fakultasnya nonaktif, kita deteksi
  const currentFaculty = faculties.find((f) => f.id === program?.facultyId);
  const isCurrentFacultyInactive = currentFaculty && currentFaculty.status === "inactive";

  const defaultFacultyId =
    program?.facultyId && currentFaculty?.status === "active"
      ? program.facultyId
      : activeFaculties[0]?.id ?? "";

  const [facultyId, setFacultyId] = useState(defaultFacultyId);
  const [name, setName] = useState(program?.name ?? "");
  const [code, setCode] = useState(program?.code ?? "");
  const [degree, setDegree] = useState<
    StudyProgram["degree"]
  >(program?.degree ?? "S1");
  const [headOfProgram, setHeadOfProgram] = useState(
    program?.headOfProgram ?? ""
  );
  const [status, setStatus] = useState<AcademicStatus>(
    program?.status ?? "active"
  );

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const chosenFaculty = faculties.find((f) => f.id === facultyId);
    if (!chosenFaculty || chosenFaculty.status !== "active") {
      alert("Fakultas yang dipilih sedang NONAKTIF (deactivated). Program studi hanya dapat ditempatkan pada fakultas yang berstatus aktif!");
      return;
    }

    onSave({
      facultyId,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      degree,
      headOfProgram: headOfProgram.trim(),
      status,
    });
  }

  return (
    <ModalFrame
      title={program ? "Edit Study Program" : "Add Study Program"}
      onClose={onClose}
    >
      {faculties.length === 0 ? (
        <p className="academic-warning">
          Please create a faculty before adding a program.
        </p>
      ) : (
        <form onSubmit={submit}>
          <div className="academic-form-grid">
            <FormField label="Faculty (Hanya Fakultas Aktif) *">
              {activeFaculties.length === 0 ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600 flex-shrink-0" />
                  <span>Semua fakultas sedang nonaktif. Anda tidak dapat memilih fakultas sebelum mengaktifkannya di tab Fakultas!</span>
                </div>
              ) : (
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  required
                >
                  {activeFaculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name} ({faculty.code})
                    </option>
                  ))}
                </select>
              )}

              {isCurrentFacultyInactive && (
                <p className="text-[11px] font-semibold text-amber-800 mt-1.5 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                  <span>Fakultas asal program studi ini ("{currentFaculty?.name}") telah dinonaktifkan. Silakan pilih fakultas aktif di atas.</span>
                </p>
              )}
            </FormField>

            <FormField label="Program Name *">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Program Code *">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Degree *">
              <select
                value={degree}
                onChange={(e) =>
                  setDegree(e.target.value as StudyProgram["degree"])
                }
              >
                <option value="D3">D3</option>
                <option value="D4">D4</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </FormField>

            <FormField label="Head of Program *">
              <input
                value={headOfProgram}
                onChange={(e) => setHeadOfProgram(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Status">
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as AcademicStatus)
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>

          <ModalActions
            onClose={onClose}
            submitLabel={program ? "Save Changes" : "Create Program"}
            disabled={activeFaculties.length === 0}
          />
        </form>
      )}
    </ModalFrame>
  );
}

// SHARED MODAL

function ModalFrame({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop">
      <div className="user-form-modal">
        <div className="modal-header">
          <div>
            <div className="modal-heading-icon">
              <GraduationCap size={21} />
            </div>
            <h2>{title}</h2>
            <p>Enter the academic information below.</p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function ModalActions({
  onClose,
  submitLabel,
  disabled,
}: {
  onClose: () => void;
  submitLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="modal-actions">
      <button
        type="button"
        className="secondary-action"
        onClick={onClose}
      >
        Cancel
      </button>

      <button
        type="submit"
        className="primary-action disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        {submitLabel}
      </button>
    </div>
  );
}
