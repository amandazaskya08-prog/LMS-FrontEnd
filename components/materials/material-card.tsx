
import {
  FileText,
  Video,
  File,
  Presentation,
  Users,
  BookOpen,
  Download,
  Eye,
  Pencil,
} from "lucide-react";

import type {
  Material,
  MaterialType,
} from "../../src/models/material";

const typeIcons: Record<MaterialType, typeof FileText> = {
  PDF: FileText,
  Video: Video,
  Document: File,
  Presentation: Presentation,
};

export default function MaterialCard({
  material,
  onView,
  onEdit,
  onDownload,
  canEdit,
  canDownload,
}: {
  material: Material;
  onView: () => void;
  onEdit: () => void;
  onDownload: () => void;
  canEdit: boolean;
  canDownload: boolean;
}) {
  const Icon = typeIcons[material.type] ?? FileText;

  return (
    <article className="course-card">
      <div className="course-card-top">
        <div className="course-card-icon">
          <Icon size={23} />
        </div>

        <span className={`status-badge ${material.status}`}>
          <span />
          {material.status}
        </span>
      </div>

      <span className="course-code">{material.courseCode}</span>

      <h3>{material.title}</h3>

      <p className="course-description">
        {material.description}
      </p>

      <div className="course-information">
        <div>
          <FileText size={16} />
          <span>{material.type}</span>
        </div>

        <div>
          <BookOpen size={16} />
          <span>{material.courseName}</span>
        </div>

        <div>
          <Users size={16} />
          <span>{material.lecturerName}</span>
        </div>
      </div>

      <div className="course-card-bottom">
        <span>{material.category}</span>

        <span>{material.fileSize}</span>
      </div>

      <div className="course-card-actions">
        <button onClick={onView} className="secondary-action">
          <Eye size={16} />
          Details
        </button>

        {canDownload && (
          <button onClick={onDownload} className="primary-action">
            <Download size={16} />
            Download
          </button>
        )}

        {canEdit && (
          <button onClick={onEdit} className="primary-action">
            <Pencil size={16} />
            Edit
          </button>
        )}
      </div>
    </article>
  );
}
