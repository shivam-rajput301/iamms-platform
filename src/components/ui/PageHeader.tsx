import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4"
      style={{ borderBottom: '1px solid rgba(23,199,232,0.1)' }}
    >
      <div>
        <h1
          className="text-xl font-bold tracking-tight"
          style={{ color: '#E2E8F0' }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-1 text-xs font-medium"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      )}
    </div>
  );
}
