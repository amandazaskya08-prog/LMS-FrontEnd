import {
  BookOpen,
  ClipboardList,
  CalendarDays,
  CreditCard,
  FileText,
  LucideIcon,
} from "lucide-react";

import PageHeader from "./page-header";

interface ModulePageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  items: {
    title: string;
    description: string;
    detail?: string;
  }[];
}

export default function ModulePage({
  title,
  description,
  icon: Icon,
  items,
}: ModulePageProps) {
  return (
    <div className="page-container">
      <PageHeader
        title={title}
        description={description}
      />

      <div className="module-intro">
        <div className="module-icon">
          <Icon size={28} />
        </div>

        <div>
          <h2>{title}</h2>
          <p>
            Manage and access your {title.toLowerCase()}.
          </p>
        </div>
      </div>

      <div className="module-grid">
        {items.map((item, index) => (
          <div className="content-card module-card" key={index}>
            <div className="module-card-icon">
              <Icon size={22} />
            </div>

            <h3>{item.title}</h3>
            <p>{item.description}</p>

            {item.detail && (
              <span className="module-detail">{item.detail}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}