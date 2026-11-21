
import type {
  BarDatum,
  DonutSlice,
  TrendPoint,
} from "../models/report";

// CHART PALETTE (ALIGNED WITH globals.css)

export const chartColors = {
  blue: "#3264a5",
  green: "#23945e",
  purple: "#8554c5",
  orange: "#c78629",
  red: "#dc5555",
  gray: "#c4ccd8",
};

// ===== ADMIN REPORTS =====

export const adminStudentsByFaculty: BarDatum[] = [
  { label: "FCS", value: 540 },
  { label: "FE", value: 312 },
  { label: "FECO", value: 286 },
  { label: "FMed", value: 74 },
  { label: "FL", value: 36 },
];

export const adminUsersByRole: DonutSlice[] = [
  { label: "Students", value: 1248, color: chartColors.blue },
  { label: "Lecturers", value: 86, color: chartColors.purple },
  { label: "Admins", value: 4, color: chartColors.orange },
];

export const adminEnrollmentsByCourse: BarDatum[] = [
  { label: "IF101", value: 32 },
  { label: "IF202", value: 28 },
  { label: "SI101", value: 36 },
  { label: "TS201", value: 25 },
  { label: "MN101", value: 40 },
];

export const adminMaterialsByType: DonutSlice[] = [
  { label: "PDF", value: 3, color: chartColors.red },
  { label: "Video", value: 1, color: chartColors.purple },
  { label: "Document", value: 2, color: chartColors.blue },
  { label: "Presentation", value: 1, color: chartColors.orange },
];

export const adminMonthlyActiveUsers: TrendPoint[] = [
  { label: "Mar", value: 610 },
  { label: "Apr", value: 680 },
  { label: "May", value: 720 },
  { label: "Jun", value: 695 },
  { label: "Jul", value: 760 },
  { label: "Aug", value: 815 },
  { label: "Sep", value: 880 },
  { label: "Oct", value: 942 },
];

// ===== LECTURER REPORTS (DEMO LECTURER: LEC001 - DR. BUDI SANTOSO) =====

export const lecturerMaterialsByType: DonutSlice[] = [
  { label: "PDF", value: 1, color: chartColors.red },
  { label: "Document", value: 1, color: chartColors.blue },
];

export const lecturerDownloadsByMaterial: BarDatum[] = [
  { label: "Week 1", value: 128 },
  { label: "Lab 1", value: 96 },
];

export const lecturerDownloadsTrend: TrendPoint[] = [
  { label: "Mar", value: 18 },
  { label: "Apr", value: 22 },
  { label: "May", value: 25 },
  { label: "Jun", value: 20 },
  { label: "Jul", value: 28 },
  { label: "Aug", value: 30 },
  { label: "Sep", value: 35 },
  { label: "Oct", value: 46 },
];
