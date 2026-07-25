import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, BellOff } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotificationTypeBadge } from '@/components/ui/StatusBadges';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/lib/hooks';
import { timeAgo, cn } from '@/lib/utils';
import { Bell as BellIcon, Wrench, CheckCircle2, AlertTriangle, Package } from 'lucide-react';

const ICONS: Record<string, typeof BellIcon> = {
  new_request: BellIcon,
  assignment: Wrench,
  completed: CheckCircle2,
  low_stock: Package,
  breakdown: AlertTriangle,
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const unread = notifications.filter((n) => !n.is_read);

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader
        title="Notifications"
        description={`${unread.length} unread of ${notifications.length} notifications`}
        actions={
          unread.length > 0 && (
            <Button variant="secondary" onClick={() => markAll.mutate()}><CheckCheck className="h-4 w-4" /> Mark all read</Button>
          )
        }
      />

      <Card>
        <CardBody className="p-0">
          {notifications.length === 0 ? (
            <EmptyState title="No notifications" description="You're all caught up." icon={BellOff} />
          ) : (
            <div className="divide-y divide-steel-200 dark:divide-steel-800/60">
              {notifications.map((n) => {
                const Icon = ICONS[n.type] ?? Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.is_read) markRead.mutate(n.id);
                      if (n.link) navigate(n.link);
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-steel-50 dark:hover:bg-steel-800/40',
                      !n.is_read && 'bg-brand-50/40 dark:bg-brand-600/5',
                    )}
                  >
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', !n.is_read ? 'bg-brand-100 text-brand-600 dark:bg-brand-600/20 dark:text-brand-400' : 'bg-steel-100 text-steel-400 dark:bg-steel-800')}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('text-sm', n.is_read ? 'font-medium text-steel-700 dark:text-steel-300' : 'font-semibold text-steel-900 dark:text-steel-100')}>{n.title}</p>
                        <span className="shrink-0 text-xs text-steel-400">{timeAgo(n.created_at)}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-steel-500 dark:text-steel-400">{n.message}</p>
                      <div className="mt-1.5"><NotificationTypeBadge type={n.type} /></div>
                    </div>
                    {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
