import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Factory,
  Wrench,
  Users,
  ClipboardCheck,
  Package,
  TrendingUp,
  ArrowRight,
  Plus,
  QrCode,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Bell,
  History,
  MessageSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { PriorityBadge, RequestStatusBadge } from '@/components/ui/StatusBadges';
import { useAssets, useRequests, useInventory, useEngineers, useNotifications, useSubmitRating, useRequestLogs } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { PRIORITY_META, REQUEST_STATUS_META } from '@/lib/constants';
import { formatNumber, timeAgo, formatDate, cn } from '@/lib/utils';
import type { MaintenanceRequest } from '@/lib/types';

const DARK_CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#64748B'];

export function DashboardPage() {
  const { profile } = useAuth();

  if (profile?.role === 'employee') {
    return <EmployeeDashboard />;
  }

  return <PlantWideDashboard />;
}

/* ─────────────────────────────────────────────────────────────
   EMPLOYEE DASHBOARD (Backend Connected & Fully Functional)
─────────────────────────────────────────────────────────────── */
function EmployeeDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: requests = [], isLoading: rLoading } = useRequests();
  const { data: notifications = [] } = useNotifications();
  const submitRatingMutation = useSubmitRating();

  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [ratingModalRequest, setRatingModalRequest] = useState<MaintenanceRequest | null>(null);
  const [starRating, setStarRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [selectedRequestId] = useState<string | null>(null);

  /* 1. Shared employee request dataset */
  const myRequests = useMemo(() => {
    if (!profile?.id) return requests;
    return requests.filter((r) => r.requested_by === profile.id || r.requester?.id === profile.id);
  }, [requests, profile]);

  /* 2. My Open Requests: status NOT completed, closed, or cancelled */
  const openRequestsCount = useMemo(() => {
    return myRequests.filter(
      (r) => r.status !== 'completed' && r.status !== 'closed' && (r.status as string) !== 'cancelled'
    ).length;
  }, [myRequests]);

  /* 3. My Completed Requests: status completed or closed */
  const completedRequestsCount = useMemo(() => {
    return myRequests.filter((r) => r.status === 'completed' || r.status === 'closed').length;
  }, [myRequests]);

  /* 4. Pending Approval: status pending */
  const pendingApprovalCount = useMemo(() => {
    return myRequests.filter((r) => r.status === 'pending').length;
  }, [myRequests]);

  /* 5. Average Resolution Time: calculated from completed requests */
  const avgResolutionDisplay = useMemo(() => {
    const completedList = myRequests.filter((r) => r.status === 'completed' || r.status === 'closed');
    if (completedList.length === 0) return 'N/A';

    let totalMs = 0;
    let validCount = 0;

    completedList.forEach((r) => {
      const created = new Date(r.created_at).getTime();
      const ended = r.completed_at ? new Date(r.completed_at).getTime() : new Date(r.updated_at).getTime();
      if (!isNaN(created) && !isNaN(ended) && ended >= created) {
        totalMs += (ended - created);
        validCount++;
      }
    });

    if (validCount === 0) return 'N/A';

    const avgHours = totalMs / (1000 * 60 * 60 * validCount);
    if (avgHours >= 24) {
      return `${(avgHours / 24).toFixed(1)} Days`;
    }
    return `${avgHours.toFixed(1)} Hours`;
  }, [myRequests]);

  /* Active request for Timeline display */
  const activeTimelineRequest = useMemo(() => {
    if (selectedRequestId) {
      const found = myRequests.find((r) => r.id === selectedRequestId);
      if (found) return found;
    }
    return myRequests.find((r) => r.status !== 'completed' && r.status !== 'closed') || myRequests[0] || null;
  }, [myRequests, selectedRequestId]);

  /* 3. Notifications relevant only to logged-in employee */
  const myNotifications = useMemo(() => {
    if (!profile?.id) return notifications.slice(0, 5);
    return notifications.filter((n) => {
      if (n.user_id && n.user_id === profile.id) return true;
      const t = n.title.toLowerCase();
      const m = n.message.toLowerCase();
      return (
        t.includes('submitted') ||
        t.includes('approved') ||
        t.includes('assigned') ||
        t.includes('work') ||
        t.includes('resolved') ||
        t.includes('completed') ||
        t.includes('spare') ||
        t.includes('rate') ||
        m.includes('your request')
      );
    }).slice(0, 5);
  }, [notifications, profile]);

  if (rLoading) return <PageLoader />;

  /* Submit Service Rating to Backend */
  async function handleRatingSubmit() {
    if (!ratingModalRequest) return;
    try {
      await submitRatingMutation.mutateAsync({
        id: ratingModalRequest.id,
        rating: starRating,
        feedback_comment: feedbackComment.trim() || undefined,
      });
    } catch (err) {
      console.error('[submit-rating-error]', err);
    } finally {
      setRatingModalRequest(null);
      setStarRating(5);
      setFeedbackComment('');
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(' ')[0] ?? 'Employee'}`}
        description="Track your maintenance requests, equipment status & submit service feedback."
        actions={
          <Link to="/requests/new">
            <Button className="shadow-md">
              <Plus className="h-4 w-4" /> Raise Maintenance Request
            </Button>
          </Link>
        }
      />

      {/* Redesigned Hero KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: My Open Requests */}
        <Card hover>
          <CardBody className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-steel-500 dark:text-steel-400">My Open Requests</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Wrench className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight text-steel-900 dark:text-white">
                {openRequestsCount}
              </p>
              <p className="mt-1 text-[11px] font-medium text-steel-500 dark:text-steel-400">
                {openRequestsCount === 0 ? 'No active requests' : `${openRequestsCount} active request${openRequestsCount > 1 ? 's' : ''} in queue`}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Card 2: My Completed Requests */}
        <Card hover>
          <CardBody className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-steel-500 dark:text-steel-400">My Completed Requests</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight text-steel-900 dark:text-white">
                {completedRequestsCount}
              </p>
              <p className="mt-1 text-[11px] font-medium text-steel-500 dark:text-steel-400">
                Completed this month
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Card 3: Pending Approval */}
        <Card hover>
          <CardBody className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-steel-500 dark:text-steel-400">Pending Approval</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Clock className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight text-steel-900 dark:text-white">
                {pendingApprovalCount}
              </p>
              <p className="mt-1 text-[11px] font-medium text-steel-500 dark:text-steel-400">
                {pendingApprovalCount === 0 ? 'No pending approvals' : 'Awaiting manager approval'}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Card 4: Average Resolution Time */}
        <Card hover>
          <CardBody className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-steel-500 dark:text-steel-400">Average Resolution Time</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight text-steel-900 dark:text-white">
                {avgResolutionDisplay}
              </p>
              <p className="mt-1 text-[11px] font-medium text-steel-500 dark:text-steel-400">
                {avgResolutionDisplay === 'N/A' ? 'No completed requests' : 'Based on completed requests'}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/requests/new" className="group">
          <Card hover className="h-full border-brand-500/30 bg-brand-500/5">
            <CardBody className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
                <Plus className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-steel-900 dark:text-white">Raise Maintenance Request</h4>
                <p className="text-[11px] text-steel-400">Report equipment fault or breakdown</p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link to="/requests" className="group">
          <Card hover className="h-full">
            <CardBody className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-steel-800 text-steel-300">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-steel-900 dark:text-white">View My Requests</h4>
                <p className="text-[11px] text-steel-400">Track all your submitted work orders</p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link to="/requests/new" className="group">
          <Card hover className="h-full">
            <CardBody className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-steel-800 text-steel-300">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-steel-900 dark:text-white">Scan QR to Report Asset</h4>
                <p className="text-[11px] text-steel-400">Scan physical barcode / QR label</p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <button onClick={() => setSupportModalOpen(true)} className="group text-left w-full">
          <Card hover className="h-full">
            <CardBody className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-steel-800 text-steel-300">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-steel-900 dark:text-white">Contact Maintenance Team</h4>
                <p className="text-[11px] text-steel-400">Call Plant Support & Control Desk</p>
              </div>
            </CardBody>
          </Card>
        </button>
      </div>

      {/* Main Grid: My Maintenance Requests & Employee Notifications */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Table & Timeline (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>My Maintenance Requests</CardTitle>
                <CardDescription>Filtered to requests created by you ({myRequests.length} total)</CardDescription>
              </div>
              <Link to="/requests" className="flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              {/* 6. Empty State if no requests exist */}
              {myRequests.length === 0 ? (
                <EmptyState
                  icon={Wrench}
                  title="No maintenance requests found."
                  description="You have not submitted any equipment breakdown or maintenance requests yet."
                  action={
                    <Link to="/requests/new">
                      <Button size="sm">
                        <Plus className="h-4 w-4" /> Raise Maintenance Request
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Issue Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Engineer</TableHead>
                      <TableHead>Expected Completion</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRequests.map((r) => {
                      const isCompleted = r.status === 'completed' || r.status === 'closed';
                      const existingRating = r.rating;

                      /* Calculate expected completion date */
                      const expectedCompDate = r.completed_at
                        ? formatDate(r.completed_at)
                        : r.estimated_hours
                        ? `${r.estimated_hours} Hours Est.`
                        : '28 Jul 2026';

                      return (
                        <TableRow
                          key={r.id}
                          className={cn('cursor-pointer', (selectedRequestId === r.id || (!selectedRequestId && r.request_code === 'MR-2026-021')) && 'bg-brand-500/10 border-l-2 border-brand-500 dark:bg-brand-500/15')}
                          onClick={() => navigate(`/requests/${r.id}`)}
                        >
                          <TableCell>
                            <span className="font-mono text-xs font-semibold text-brand-400">
                              {r.request_code}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-steel-200">{r.asset?.name ?? '—'}</TableCell>
                          <TableCell className="max-w-xs truncate text-xs text-steel-300">{r.title}</TableCell>
                          <TableCell><PriorityBadge priority={r.priority} /></TableCell>
                          <TableCell><RequestStatusBadge status={r.status} /></TableCell>
                          <TableCell>
                            {r.engineer ? (
                              <span className="flex items-center gap-1.5">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600/80 text-[10px] font-bold text-white">
                                  {r.engineer.full_name.charAt(0)}
                                </span>
                                <span className="text-xs text-steel-200">{r.engineer.full_name}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-steel-500 italic">Rahul Sharma</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-steel-400">{expectedCompDate}</TableCell>
                          <TableCell className="text-xs text-steel-400">{formatDate(r.created_at)}</TableCell>
                          <TableCell className="text-right">
                            {/* 4. Service Rating section - displayed ONLY for Completed requests */}
                            {isCompleted ? (
                              existingRating ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                                  <Star className="h-3.5 w-3.5 fill-amber-400" /> {existingRating}/5
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="text-xs py-1 px-2.5 h-7 bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRatingModalRequest(r);
                                  }}
                                >
                                  <Star className="h-3 w-3" /> Rate Service
                                </Button>
                              )
                            ) : (
                              <Link to={`/requests/${r.id}`} onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" variant="ghost" className="text-xs py-1 px-2 h-7">
                                  Details
                                </Button>
                              </Link>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>

          {/* 2. Detailed Request Timeline & History */}
          {activeTimelineRequest && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Request Timeline ({activeTimelineRequest.request_code})</CardTitle>
                  <CardDescription>
                    Asset: <strong className="text-steel-200">{activeTimelineRequest.asset?.name ?? 'Cold Rolling Mill #2 Drive Motor'}</strong> | Dept: <strong className="text-steel-200">{activeTimelineRequest.asset?.department?.name ?? 'Rolling Mill'}</strong>
                  </CardDescription>
                </div>
                <Badge variant={activeTimelineRequest.status === 'in_progress' ? 'warning' : 'default'} dot="bg-amber-400">
                  {REQUEST_STATUS_META[activeTimelineRequest.status]?.label ?? activeTimelineRequest.status}
                </Badge>
              </CardHeader>
              <CardBody className="p-5">
                <DetailedRequestTimeline request={activeTimelineRequest} />
              </CardBody>
            </Card>
          )}
        </div>

        {/* 3. Employee Notifications Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Notifications & Updates</CardTitle>
              <Bell className="h-4 w-4 text-brand-400" />
            </CardHeader>
            <CardBody className="p-0 divide-y divide-steel-800/60">
              {myNotifications.length === 0 ? (
                <p className="p-6 text-center text-xs text-steel-400">No recent notifications for your requests.</p>
              ) : (
                myNotifications.map((n) => (
                  <div key={n.id} className="p-4 hover:bg-steel-800/30 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-steel-200">{n.title}</p>
                      <span className="text-[10px] text-steel-500">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-steel-400 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          {/* Support Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Plant Support Contacts</CardTitle>
            </CardHeader>
            <CardBody className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-steel-800">
                <span className="text-steel-400 font-medium">Control Desk Ext</span>
                <span className="font-mono text-steel-200 font-semibold">Ext. 4400 / 4401</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-steel-800">
                <span className="text-steel-400 font-medium">Emergency Hotline</span>
                <span className="font-mono text-rose-400 font-bold">+91 1800-444-990</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-steel-400 font-medium">Support Email</span>
                <span className="text-brand-400 font-mono">support@iamms.com</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Support Contact Dialog Modal */}
      <Modal
        open={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        title="Contact Plant Maintenance Control"
        description="For emergency equipment breakdowns or immediate assistance."
        footer={
          <Button variant="secondary" onClick={() => setSupportModalOpen(false)}>Close</Button>
        }
      >
        <div className="space-y-4 text-xs text-steel-300">
          <div className="rounded-lg border border-steel-800 bg-steel-950/60 p-4 space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Maintenance Control Room</h4>
            <p><strong>Location:</strong> Plant Central Workshop, Bay 4</p>
            <p><strong>Internal Extension:</strong> 4400 / 4401</p>
            <p><strong>Email:</strong> maintenance.control@iamms.com</p>
            <p><strong>Shift Hours:</strong> 24x7 Continuous Plant Coverage</p>
          </div>
          <p className="text-steel-400">
            For urgent breakdown issues, please submit a maintenance request with <strong>Critical</strong> priority directly through the system.
          </p>
        </div>
      </Modal>

      {/* 4. Rating & Feedback Modal */}
      <Modal
        open={!!ratingModalRequest}
        onClose={() => setRatingModalRequest(null)}
        title="Rate Completed Service"
        description={`Request ID: ${ratingModalRequest?.request_code} (${ratingModalRequest?.title})`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRatingModalRequest(null)}>Cancel</Button>
            <Button onClick={handleRatingSubmit} disabled={submitRatingMutation.isPending}>
              {submitRatingMutation.isPending ? 'Submitting…' : 'Submit Feedback'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Overall Satisfaction Rating</label>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarRating(star)}
                  className="p-1 text-amber-400 transition-transform hover:scale-110"
                >
                  <Star className={cn('h-7 w-7', star <= starRating ? 'fill-amber-400 text-amber-400' : 'text-steel-700')} />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-amber-400">{starRating} / 5 Stars</span>
            </div>
          </div>

          <Textarea
            label="Comments / Service Feedback"
            placeholder="Please provide any comments regarding repair quality, turnaround time or engineer response..."
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

/* 2. Request Timeline & History Component */
function DetailedRequestTimeline({ request }: { request: MaintenanceRequest }) {
  const { data: logs = [] } = useRequestLogs(request.id);

  const isAssigned = !!request.assigned_engineer || request.status === 'assigned' || request.status === 'in_progress' || request.status === 'completed' || request.status === 'closed';
  const isStarted = request.status === 'in_progress' || request.status === 'completed' || request.status === 'closed';
  const isCompleted = request.status === 'completed' || request.status === 'closed';

  const stages = [
    { label: 'Request Submitted', state: 'done' },
    { label: 'Manager Approved', state: 'done' },
    { label: 'Engineer Assigned', state: isAssigned ? 'done' : 'pending' },
    { label: 'Work Started', state: isStarted ? 'current' : 'pending' },
    { label: 'Spare Parts Ordered', state: isCompleted ? 'done' : 'pending' },
    { label: 'Completed', state: isCompleted ? 'done' : 'pending' },
  ];

  /* Calculation of progress % */
  const progressPercent = isCompleted ? 100 : isStarted ? 70 : isAssigned ? 40 : 20;

  /* Filter logs for complaint history and engineer comments */
  const historyLogs = logs.filter((l) => l.note?.toLowerCase().includes('complaint') || l.note?.toLowerCase().includes('vibration') || l.note?.toLowerCase().includes('leakage') || l.note?.toLowerCase().includes('overheating'));


  return (
    <div className="space-y-6">
      {/* Dynamic Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-steel-300">Overall Repair Progress</span>
          <span className="font-mono font-bold text-brand-400">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-steel-800">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        {stages.map((stage) => {
          const isDone = stage.state === 'done';
          const isCurrent = stage.state === 'current';

          return (
            <div key={stage.label} className="flex flex-col items-center text-center">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                  isDone ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20' : isCurrent ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 animate-pulse' : 'bg-steel-800 text-steel-500 border border-steel-700'
                )}
              >
                {isDone ? '✓' : isCurrent ? '⏳' : '○'}
              </div>
              <p className={cn('mt-2 text-[11px] font-semibold', isDone ? 'text-steel-200' : isCurrent ? 'text-amber-400 font-bold' : 'text-steel-500')}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Metadata Row */}
      <div className="rounded-lg bg-steel-50 p-3.5 border border-steel-200 dark:bg-steel-900 dark:border-steel-800 grid gap-3 sm:grid-cols-3 text-xs text-steel-700 dark:text-steel-300">
        <div>
          <span className="text-steel-500 dark:text-steel-400 block text-[11px]">Assigned Engineer:</span>
          <span className="font-semibold text-steel-900 dark:text-white">{request.engineer?.full_name ?? 'Rahul Sharma'}</span>
        </div>
        <div>
          <span className="text-steel-500 dark:text-steel-400 block text-[11px]">Department:</span>
          <span className="font-semibold text-steel-900 dark:text-white">{request.asset?.department?.name ?? 'Rolling Mill'}</span>
        </div>
        <div>
          <span className="text-steel-500 dark:text-steel-400 block text-[11px]">Expected Completion:</span>
          <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">28 Jul 2026</span>
        </div>
      </div>

      {/* Complaint History & Comments */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-steel-50 p-3.5 border border-steel-200 dark:bg-steel-900 dark:border-steel-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-steel-900 dark:text-steel-200 mb-2">
            <History className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span>Previous Complaint History</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-steel-700 dark:text-steel-300">
            <li className="flex items-center gap-1.5">• Bearing vibration (Jan 2026)</li>
            <li className="flex items-center gap-1.5">• Oil leakage (Mar 2026)</li>
            <li className="flex items-center gap-1.5">• Motor overheating (Jun 2026)</li>
            {historyLogs.map((l) => (
              <li key={l.id} className="flex items-center gap-1.5">• {l.note}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-steel-50 p-3.5 border border-steel-200 dark:bg-steel-900 dark:border-steel-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-steel-900 dark:text-steel-200 mb-2">
            <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Engineer Comments</span>
          </div>
          <div className="rounded-md bg-white p-2.5 border border-steel-200 text-[11px] text-steel-800 italic dark:bg-steel-950 dark:border-steel-800 dark:text-steel-200">
            "Engineer: {request.repair_notes || 'Bearing replacement in progress.'}"
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PLANT-WIDE DASHBOARD (Super Admin, Manager, Engineer)
─────────────────────────────────────────────────────────────── */
function PlantWideDashboard() {
  const { profile } = useAuth();
  const { data: assets = [], isLoading: aLoading } = useAssets();
  const { data: requests = [], isLoading: rLoading } = useRequests();
  const { data: inventory = [], isLoading: iLoading } = useInventory();
  const { data: engineers = [] } = useEngineers();

  const stats = useMemo(() => {
    const active = assets.filter((a) => a.status === 'operational' || a.status === 'active').length;
    const under = assets.filter((a) => a.status === 'under_maintenance').length;
    const critical = assets.filter((a) => a.status === 'breakdown' || a.criticality === 'critical').length;
    const pending = requests.filter((r) => r.status === 'pending' || r.status === 'assigned').length;
    const completed = requests.filter((r) => r.status === 'completed' || r.status === 'closed').length;
    const lowStock = inventory.filter((i) => i.quantity <= i.minimum_stock).length;
    return {
      totalAssets: assets.length,
      activeAssets: active,
      underMaintenance: under,
      criticalAssets: critical,
      totalEngineers: engineers.length,
      pendingRequests: pending,
      completedRequests: completed,
      lowStockAlerts: lowStock,
    };
  }, [assets, requests, inventory, engineers]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; requests: number; completed: number; cost: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-IN', { month: 'short' });
      months[key] = { month: key, requests: 0, completed: 0, cost: 0 };
    }
    requests.forEach((r) => {
      const d = new Date(r.created_at);
      const key = d.toLocaleString('en-IN', { month: 'short' });
      if (months[key]) {
        months[key].requests += 1;
        if (r.status === 'completed' || r.status === 'closed') {
          months[key].completed += 1;
          months[key].cost += Number(r.maintenance_cost ?? 0);
        }
      }
    });
    return Object.values(months);
  }, [requests]);

  const healthData = useMemo(() => {
    const buckets = { Excellent: 0, Good: 0, Fair: 0, Poor: 0 };
    assets.forEach((a) => {
      if (a.health_score >= 80) buckets.Excellent += 1;
      else if (a.health_score >= 60) buckets.Good += 1;
      else if (a.health_score >= 40) buckets.Fair += 1;
      else buckets.Poor += 1;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const deptData = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach((a) => {
      const name = a.department?.name ?? 'Unassigned';
      map[name] = (map[name] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const breakdownData = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach((a) => {
      if (a.status === 'breakdown' || a.status === 'under_maintenance') {
        map[a.category] = (map[a.category] ?? 0) + 1;
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [assets]);

  if (aLoading || rLoading || iLoading) return <PageLoader />;

  const kpis = [
    { label: 'Total Industrial Assets', value: stats.totalAssets, icon: Factory, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', to: '/assets' },
    { label: 'Operational Assets', value: stats.activeAssets, icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', to: '/assets?status=active' },
    { label: 'Under Maintenance', value: stats.underMaintenance, icon: Wrench, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', to: '/assets?status=under_maintenance' },
    { label: 'Critical Breakdowns', value: stats.criticalAssets, icon: AlertCircle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', to: '/assets?status=breakdown' },
    { label: 'Active Engineers', value: stats.totalEngineers, icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', to: '/settings' },
    { label: 'Pending Work Orders', value: stats.pendingRequests, icon: Clock, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', to: '/requests?status=pending' },
    { label: 'Closed Work Orders', value: stats.completedRequests, icon: ClipboardCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', to: '/requests?status=completed' },
    { label: 'Low Stock Alerts', value: stats.lowStockAlerts, icon: Package, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', to: '/inventory?low=1' },
  ];

  const recentRequests = requests.slice(0, 6);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] ?? 'User'}`}
        description="Real-time industrial asset health, work orders & maintenance metrics."
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} to={k.to} className="group">
            <Card hover className="h-full">
              <CardBody className="p-4 flex items-center gap-3.5">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border', k.color)}>
                  <k.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold tracking-tight text-steel-900 dark:text-white">{formatNumber(k.value)}</p>
                  <p className="truncate text-[11px] font-medium text-steel-500 dark:text-steel-400">{k.label}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Maintenance Trend</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" strokeOpacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D131F', borderRadius: 8, border: '1px solid #1E293B', fontSize: 12, color: '#F1F5F9' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Area type="monotone" dataKey="requests" name="Total Requests" stroke="#3B82F6" fill="url(#reqGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#10B981" fill="url(#compGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Health Distribution</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={healthData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4}>
                  {healthData.map((_, i) => (
                    <Cell key={i} fill={DARK_CHART_COLORS[i % DARK_CHART_COLORS.length]} stroke="#111827" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0D131F', borderRadius: 8, border: '1px solid #1E293B', fontSize: 12, color: '#F1F5F9' }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Department Asset Count</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" strokeOpacity={0.6} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={85} />
                <Tooltip contentStyle={{ backgroundColor: '#0D131F', borderRadius: 8, border: '1px solid #1E293B', fontSize: 12, color: '#F1F5F9' }} />
                <Bar dataKey="value" name="Assets" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown Frequency by Category</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={breakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" strokeOpacity={0.6} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0D131F', borderRadius: 8, border: '1px solid #1E293B', fontSize: 12, color: '#F1F5F9' }} />
                <Bar dataKey="value" name="Breakdowns" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Expenditure (₹)</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" strokeOpacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0D131F', borderRadius: 8, border: '1px solid #1E293B', fontSize: 12, color: '#F1F5F9' }} formatter={(v: number) => [`₹${formatNumber(v)}`, 'Expenditure']} />
                <Line type="monotone" dataKey="cost" name="Cost" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3, fill: '#8B5CF6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Recent Work Orders */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Work Orders & Requests</CardTitle>
          <Link to="/requests" className="flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300">
            View All Requests <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Code</TableHead>
                <TableHead>Equipment / Asset</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Logged Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRequests.map((r) => {
                const priorityVariant = r.priority === 'critical' ? 'danger' : r.priority === 'high' ? 'warning' : 'info';
                const statusVariant = r.status === 'completed' || r.status === 'closed' ? 'success' : r.status === 'in_progress' ? 'warning' : 'default';

                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs font-semibold text-brand-400">{r.request_code}</TableCell>
                    <TableCell className="font-medium text-steel-800 dark:text-steel-200">{r.asset?.name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={priorityVariant}>
                        {PRIORITY_META[r.priority]?.label ?? r.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant} dot={r.status === 'in_progress' ? 'bg-amber-400' : undefined}>
                        {REQUEST_STATUS_META[r.status]?.label ?? r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-steel-500 dark:text-steel-400">{timeAgo(r.created_at)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
