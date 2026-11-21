import {
  User,
  Course,
  Material,
  Quiz,
  AcademicEvent,
  Payment,
} from "../models/types";

import type { UserRole } from "../models/types";

export const demoUsers = {
  admin: {
    id: "ADM001",
    name: "Super Administrator",
    email: "admin@campus.ac.id",
    role: "admin" as UserRole,
    faculty: "University Administration",
  },

  student: {
    id: "STD001",
    name: "Alexandra Putri",
    email: "alexandra@student.ac.id",
    role: "student" as UserRole,
    studentId: "2024001001",
    faculty: "Faculty of Computer Science",
    studyProgram: "Informatics",
  },

  lecturer: {
    id: "LEC001",
    name: "Dr. Budi Santoso",
    email: "budi@campus.ac.id",
    role: "lecturer" as UserRole,
    faculty: "Faculty of Computer Science",
    studyProgram: "Informatics",
  },
};

export const currentUser: User = {
  id: "USR001",
  name: "Alexandra Putri",
  email: "alexandra@student.ac.id",
  role: "student",
  studentId: "2024001001",
  faculty: "Faculty of Computer Science",
  studyProgram: "Informatics",
};

export const courses: Course[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Programming",
    lecturer: "Dr. Budi Santoso",
    credits: 3,
    progress: 85,
    color: "#DBEAFE",
    semester: "Semester 1",
  },
  {
    id: "2",
    code: "CS202",
    name: "Database Management",
    lecturer: "Prof. Andi Wijaya",
    credits: 3,
    progress: 65,
    color: "#DCFCE7",
    semester: "Semester 2",
  },
  {
    id: "3",
    code: "CS301",
    name: "Web Development",
    lecturer: "Dr. Siti Rahma",
    credits: 4,
    progress: 45,
    color: "#F3E8FF",
    semester: "Semester 3",
  },
  {
    id: "4",
    code: "CS401",
    name: "Software Engineering",
    lecturer: "Dr. Rudi Hartono",
    credits: 3,
    progress: 75,
    color: "#FFEDD5",
    semester: "Semester 4",
  },
];

export const materials: Material[] = [
  {
    id: "1",
    title: "Introduction to Programming",
    course: "CS101",
    type: "PDF",
    size: "2.4 MB",
    uploadedAt: "November 18, 2026",
  },
  {
    id: "2",
    title: "Database Normalization",
    course: "CS202",
    type: "PDF",
    size: "1.8 MB",
    uploadedAt: "November 17, 2026",
  },
  {
    id: "3",
    title: "React Fundamentals",
    course: "CS301",
    type: "Video",
    size: "125 MB",
    uploadedAt: "November 15, 2026",
  },
];

export const quizzes: Quiz[] = [
  {
    id: "1",
    title: "Programming Fundamentals Quiz",
    course: "CS101",
    deadline: "November 24, 2026",
    duration: 30,
    status: "upcoming",
  },
  {
    id: "2",
    title: "Database Midterm Quiz",
    course: "CS202",
    deadline: "November 26, 2026",
    duration: 45,
    status: "upcoming",
  },
  {
    id: "3",
    title: "HTML and CSS Assessment",
    course: "CS301",
    deadline: "November 15, 2026",
    duration: 30,
    status: "completed",
  },
];

export const academicEvents: AcademicEvent[] = [
  {
    id: "1",
    title: "Programming Quiz",
    date: "2026-11-24",
    type: "exam",
  },
  {
    id: "2",
    title: "Database Midterm",
    date: "2026-11-26",
    type: "exam",
  },
  {
    id: "3",
    title: "Academic Consultation",
    date: "2026-11-28",
    type: "academic",
  },
  {
    id: "4",
    title: "Final Examination",
    date: "2026-12-10",
    type: "exam",
  },
];

export const payments: Payment[] = [
  {
    id: "1",
    semester: "Odd Semester 2026/2027",
    amount: 5000000,
    dueDate: "December 15, 2026",
    status: "pending",
  },
  {
    id: "2",
    semester: "Even Semester 2025/2026",
    amount: 5000000,
    dueDate: "June 15, 2026",
    status: "paid",
  },
];

