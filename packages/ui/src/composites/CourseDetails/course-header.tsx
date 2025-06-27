import React from 'react';

interface CourseHeaderProps {
  courseIndex: string;
  courseName: string;
  assigneeDisplayName?: string;
  breadcrumbItems?: Array<{
    label: string;
    onClick?: () => void;
  }>;
  children?: React.ReactNode;
  // Labels for localization
  labels: {
    currentContributor: string;
    noContributor: string;
  };
  className?: string;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  courseIndex,
  courseName,
  assigneeDisplayName,
  breadcrumbItems = [],
  children,
  labels,
  className = '',
}) => {
  return (
    <div className={className}>
      {/* Breadcrumb Navigation */}
      {breadcrumbItems.length > 0 && (
        <div className="flex items-center gap-2 text-sm mb-6">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={`breadcrumb-${index}-${item.label}`}>
              {item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-gray-600">{item.label}</span>
              )}
              {index < breadcrumbItems.length - 1 && (
                <span className="text-gray-400">•</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Course Title with Index */}
      <div className="flex items-center gap-4 mb-6">
        <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-800 rounded-md">
          {courseIndex}
        </span>
        <h1 className="title-large-sb-24px text-dashboardSectionTitle">
          {courseName}
        </h1>
      </div>

      {/* Current contributor info */}
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <span className="text-sm font-medium text-gray-700 mr-3">
            {labels.currentContributor}
          </span>
          <span className="text-sm text-gray-600">
            {assigneeDisplayName || labels.noContributor}
          </span>
        </div>

        {/* Additional content */}
        {children}
      </div>
    </div>
  );
};
