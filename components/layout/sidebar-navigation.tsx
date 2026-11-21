"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardList,
  CalendarDays,
  CreditCard,
  UserCircle,
  Users,
  Building2,
  BarChart3,
  GraduationCap,
  ClipboardCheck,
  Settings,
} from "lucide-react";

import type { UserRole } from "../../src/models/types";

const navigation = {
  admin: [
    {
      title: "OVERVIEW",
      items: [
        {
          name: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        {
          name: "Users",
          href: "/admin/users",
          icon: Users,
        },
        {
          name: "Students Directory",
          href: "/admin/students",
          icon: GraduationCap,
        },
        {
          name: "Faculties",
          href: "/admin/faculties",
          icon: Building2,
        },
        {
          name: "Courses",
          href: "/admin/courses",
          icon: BookOpen,
        },
      ],
    },
    {
      title: "ACADEMIC",
      items: [
        {
          name: "Study Materials",
          href: "/admin/materials",
          icon: FileText,
        },
        {
          name: "Quizzes",
          href: "/admin/quizzes",
          icon: ClipboardList,
        },
        {
          name: "Assignments",
          href: "/assignments",
          icon: ClipboardCheck,
        },
        {
          name: "Academic Calendar",
          href: "/admin/calendar",
          icon: CalendarDays,
        },
      ],
    },
    {
      title: "FINANCIAL",
      items: [
        {
          name: "UKT Management",
          href: "/admin/ukt",
          icon: CreditCard,
        },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        {
          name: "Reports",
          href: "/admin/reports",
          icon: BarChart3,
        },
        {
          name: "Settings",
          href: "/admin/settings",
          icon: Settings,
        },
        {
          name: "Profile",
          href: "/profile",
          icon: UserCircle,
        },
      ],
    },
  ],

  student: [
    {
      title: "OVERVIEW",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "ACADEMIC",
      items: [
        {
          name: "My Courses",
          href: "/courses",
          icon: BookOpen,
        },
        {
          name: "Study Materials",
          href: "/materials",
          icon: FileText,
        },
        {
          name: "Quizzes",
          href: "/quizzes",
          icon: ClipboardList,
        },
        {
          name: "Assignments",
          href: "/assignments",
          icon: ClipboardCheck,
        },
        {
          name: "Academic Calendar",
          href: "/calendar",
          icon: CalendarDays,
        },
      ],
    },
    {
      title: "FINANCIAL",
      items: [
        {
          name: "UKT Payments",
          href: "/ukt",
          icon: CreditCard,
        },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        {
          name: "My Profile",
          href: "/profile",
          icon: UserCircle,
        },
      ],
    },
  ],

  lecturer: [
    {
      title: "OVERVIEW",
      items: [
        {
          name: "Dashboard",
          href: "/lecturer/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "TEACHING",
      items: [
        {
          name: "My Courses",
          href: "/courses",
          icon: BookOpen,
        },
        {
          name: "Study Materials",
          href: "/lecturer/materials",
          icon: FileText,
        },
        {
          name: "Quizzes",
          href: "/quizzes",
          icon: ClipboardList,
        },
        {
          name: "Assignments",
          href: "/assignments",
          icon: ClipboardCheck,
        },
        {
          name: "Reports",
          href: "/lecturer/reports",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "ACADEMIC",
      items: [
        {
          name: "Academic Calendar",
          href: "/calendar",
          icon: CalendarDays,
        },
        {
          name: "My Students",
          href: "/lecturer/students",
          icon: GraduationCap,
        },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        {
          name: "My Profile",
          href: "/profile",
          icon: UserCircle,
        },
      ],
    },
  ],
} satisfies Record<
  UserRole,
  {
    title: string;
    items: {
      name: string;
      href: string;
      icon: typeof LayoutDashboard;
    }[];
  }[]
>;

export default function SidebarNavigation({
  role,
  onNavigate,
}: {
  role: UserRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const groups = navigation[role];

  return (
    <nav className="sidebar-navigation">
      {groups.map((group) => (
        <div className="nav-group" key={group.title}>
          <p className="nav-group-title">{group.title}</p>

          {group.items.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/admin/dashboard" &&
                item.href !== "/lecturer/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`nav-link ${
                  active ? "nav-link-active" : ""
                }`}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
