import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-steel-200 dark:border-steel-800/80 pb-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-steel-900 dark:text-white">{title}</h1>
        {description && <p className="mt-1 text-xs text-steel-500 dark:text-steel-400 font-medium">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
