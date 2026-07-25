import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  Play,
  CheckCircle2,
  Send,
  Clock,
  Wrench,
  IndianRupee,
  AlertCircle,
  ShieldAlert,
  Star,
  History,
  MessageSquare,
  Paperclip,
  Building2,
  Calendar,
  User,
  Activity,
  Layers,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { PriorityBadge, RequestStatusBadge } from '@/components/ui/StatusBadges';
import {
  useRequest,
  useRequestLogs,
  useUpdateRequest,
  useAddLog,
  useEngineers,
  useInventory,
  useDecrementInventory,
  useSubmitRating,
} from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { PRIORITIES, REQUEST_STATUS_META } from '@/lib/constants';
import { formatCurrency, formatDateTime, formatDate, timeAgo, cn } from '@/lib/utils';
import type { Priority, RequestStatus } from '@/lib/types';

export function RequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can, profile } = useAuth();
  const { data: request, isLoading } = useRequest(id);
  const { data: logs = [], isLoading: logsLoading } = useRequestLogs(id);
  const { data: engineers = [] } = useEngineers();
  const { data: inventory = [] } = useInventory();
  const updateRequest = useUpdateRequest();
  const addLog = useAddLog();
  const decrement = useDecrementInventory();
  const submitRatingMutation = useSubmitRating();

  const [assignOpen, setAssignOpen] = useState(false);
  const [engineerId, setEngineerId] = useState('');
  const [logNote, setLogNote] = useState('');
  const [logProgress, setLogProgress] = useState(0);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [repairNotes, setRepairNotes] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [cost, setCost] = useState('');
  const [downtime, setDowntime] = useState('');
  const [partsOpen, setPartsOpen] = useState(false);
  const [partId, setPartId] = useState('');
  const [partQty, setPartQty] = useState(1);

  /* Service Rating Modal / State */
  const [starRating, setStarRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const lowStock = useMemo(() => inventory.filter((i) => i.quantity <= i.minimum_stock), [inventory]);

  if (isLoading) return <PageLoader />;

  if (!request) {
    return (
      <div className="animate-fade-in space-y-4">
        <Button variant="ghost" onClick={() => navigate('/requests')}>
          <ArrowLeft className="h-4 w-4" /> Back to Requests
        </Button>
        <EmptyState
          icon={Wrench}
          title="Request Not Found"
          description="The maintenance request you are trying to view does not exist or was removed."
          action={<Button onClick={() => navigate('/requests')}>Return to Requests</Button>}
        />
      </div>
    );
  }

  /* Role-Based Access Control: Employee can only view their own requests */
  const isEmployee = profile?.role === 'employee';
  const isOwnRequest =
    request.requested_by === profile?.id ||
    request.requester?.id === profile?.id;

  if (isEmployee && !isOwnRequest) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-steel-900 dark:text-steel-100">403 Access Denied</h2>
        <p className="mt-2 text-xs text-steel-500 dark:text-steel-400 max-w-sm">
          You do not have permission to view maintenance requests created by other employees.
        </p>
        <Button className="mt-5" onClick={() => navigate('/requests')}>
          Back to My Requests
        </Button>
      </div>
    );
  }

  const isEngineerAssigned = request.assigned_engineer === profile?.id;
  const isManager = can('requests:assign');
  const isCompleted = request.status === 'completed' || request.status === 'closed';

  /* Handlers */
  async function handleAssign() {
    if (!engineerId || !id) return;
    await updateRequest.mutateAsync({
      id,
      assigned_engineer: engineerId,
      assigned_by: profile!.id,
      status: 'assigned' as RequestStatus,
      assigned_at: new Date().toISOString(),
    });
    await addLog.mutateAsync({
      request_id: id,
      author_id: profile!.id,
      note: 'Job assigned to engineer.',
      log_type: 'assignment',
      progress: 20,
    });
    setAssignOpen(false);
    setEngineerId('');
  }

  async function handleAccept() {
    if (!id) return;
    await updateRequest.mutateAsync({
      id,
      status: 'in_progress' as RequestStatus,
      started_at: new Date().toISOString(),
    });
    await addLog.mutateAsync({
      request_id: id,
      author_id: profile!.id,
      note: 'Engineer accepted job & initiated work on equipment.',
      log_type: 'update',
      progress: 40,
    });
  }

  async function handleAddLog() {
    if (!logNote || !id) return;
    await addLog.mutateAsync({
      request_id: id,
      author_id: profile!.id,
      note: logNote,
      log_type: 'note',
      progress: logProgress,
    });
    setLogNote('');
    setLogProgress(0);
  }

  async function handleComplete() {
    if (!id) return;
    await updateRequest.mutateAsync({
      id,
      status: 'completed' as RequestStatus,
      repair_notes: repairNotes,
      actual_hours: actualHours ? Number(actualHours) : null,
      maintenance_cost: cost ? Number(cost) : 0,
      downtime_hours: downtime ? Number(downtime) : 0,
      completed_at: new Date().toISOString(),
    });
    await addLog.mutateAsync({
      request_id: id,
      author_id: profile!.id,
      note: repairNotes || 'Repair completed successfully.',
      log_type: 'completion',
      progress: 100,
    });
    setCompleteOpen(false);
    setRepairNotes('');
  }

  async function handleClose() {
    if (!id) return;
    await updateRequest.mutateAsync({
      id,
      status: 'closed' as RequestStatus,
      closed_at: new Date().toISOString(),
    });
  }

  async function handleUsePart() {
    if (!partId || !id) return;
    await decrement.mutateAsync({ id: partId, quantity: partQty });
    const item = inventory.find((i) => i.id === partId);
    await addLog.mutateAsync({
      request_id: id,
      author_id: profile!.id,
      note: `Consumed ${partQty} × ${item?.item_name ?? 'part'} (${item?.part_number ?? ''}) from store.`,
      log_type: 'update',
      progress: 60,
    });
    setPartsOpen(false);
    setPartId('');
    setPartQty(1);
  }

  async function handleRatingSubmit() {
    if (!id) return;
    try {
      await submitRatingMutation.mutateAsync({
        id,
        rating: starRating,
        feedback_comment: feedbackComment.trim() || undefined,
      });
      setRatingSubmitted(true);
    } catch (err) {
      console.error('[submit-rating-err]', err);
    }
  }

  async function changePriority(p: Priority) {
    if (!id) return;
    await updateRequest.mutateAsync({ id, priority: p });
  }

  /* 6-Stage Timeline Bar */
  const isAssigned = !!request.assigned_engineer || request.status === 'assigned' || request.status === 'in_progress' || isCompleted;
  const isStarted = request.status === 'in_progress' || isCompleted;

  const stages = [
    { label: 'Request Submitted', state: 'done', date: formatDate(request.created_at) },
    { label: 'Manager Approved', state: 'done', date: 'Approved' },
    { label: 'Engineer Assigned', state: isAssigned ? 'done' : 'pending', date: request.engineer?.full_name ?? 'Pending' },
    { label: 'Work Started', state: isStarted ? 'current' : 'pending', date: request.started_at ? formatDate(request.started_at) : 'In Queue' },
    { label: 'Spare Parts Ordered', state: isCompleted ? 'done' : 'pending', date: 'Parts Verified' },
    { label: 'Completed', state: isCompleted ? 'done' : 'pending', date: request.completed_at ? formatDate(request.completed_at) : 'In Progress' },
  ];

  /* Progress % Calculation */
  const progressPercent = isCompleted ? 100 : isStarted ? 70 : isAssigned ? 40 : 20;

  /* Filter Complaint History & Engineer Comment Logs */
  const historyLogs = logs.filter((l) => l.note?.toLowerCase().includes('complaint') || l.note?.toLowerCase().includes('vibration') || l.note?.toLowerCase().includes('leakage') || l.note?.toLowerCase().includes('overheating'));
  const engineerComments = logs.filter((l) => l.note?.toLowerCase().includes('engineer') || l.note?.toLowerCase().includes('replacement') || l.log_type === 'update');

  return (
    <div className="animate-fade-in space-y-6">
      {/* 4. Back Button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/requests')}
          className="text-steel-600 dark:text-steel-400 hover:text-steel-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Requests
        </Button>
      </div>

      {/* Header */}
      <PageHeader
        title={request.title}
        description={`Request Code: ${request.request_code}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isManager && request.status === 'pending' && (
              <Button onClick={() => setAssignOpen(true)}><UserCheck className="h-4 w-4" /> Assign Engineer</Button>
            )}
            {isManager && (request.status === 'completed') && (
              <Button variant="secondary" onClick={handleClose}><CheckCircle2 className="h-4 w-4" /> Close Request</Button>
            )}
            {isEngineerAssigned && request.status === 'assigned' && (
              <Button onClick={handleAccept}><Play className="h-4 w-4" /> Accept & Start</Button>
            )}
            {isEngineerAssigned && request.status === 'in_progress' && (
              <>
                <Button variant="secondary" onClick={() => setPartsOpen(true)}><Wrench className="h-4 w-4" /> Use Parts</Button>
                <Button onClick={() => setCompleteOpen(true)}><CheckCircle2 className="h-4 w-4" /> Mark Completed</Button>
              </>
            )}
          </div>
        }
      />

      {/* Primary Request Specs Summary Card */}
      <Card>
        <CardBody className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-b border-steel-200 dark:border-steel-800">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">Current Status</span>
            <div className="mt-1 flex items-center gap-2">
              <RequestStatusBadge status={request.status} />
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">Priority Level</span>
            <div className="mt-1 flex items-center gap-2">
              <PriorityBadge priority={request.priority} />
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">Asset & Equipment</span>
            <p className="mt-1 text-sm font-semibold text-steel-900 dark:text-white">
              {request.asset?.name ?? 'Cold Rolling Mill #2 Drive Motor'}
            </p>
            <p className="text-[11px] font-mono text-steel-500 dark:text-steel-400">
              {request.asset?.asset_id ?? 'HIN-CRM-002'}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">Department</span>
            <p className="mt-1 text-sm font-semibold text-steel-900 dark:text-white flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              {request.asset?.department?.name ?? 'Rolling Mill'}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Progress & 6-Stage Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Request Timeline & Repair Progress</CardTitle>
          <CardDescription>Live tracking for work order stages and maintenance milestones</CardDescription>
        </CardHeader>
        <CardBody className="p-5 space-y-6">
          {/* Progress Bar % */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-steel-700 dark:text-steel-300">Overall Repair Progress</span>
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-steel-200 dark:bg-steel-800">
              <div className="h-full bg-brand-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* 6-Stage Timeline Icons */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            {stages.map((stage) => {
              const isDone = stage.state === 'done';
              const isCurrent = stage.state === 'current';

              return (
                <div key={stage.label} className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                      isDone ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20' : isCurrent ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 animate-pulse' : 'bg-steel-100 text-steel-500 border border-steel-300 dark:bg-steel-800 dark:border-steel-700 dark:text-steel-400'
                    )}
                  >
                    {isDone ? '✓' : isCurrent ? '⏳' : '○'}
                  </div>
                  <p className={cn('mt-2 text-[11px] font-semibold', isDone ? 'text-steel-900 dark:text-steel-200' : isCurrent ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-steel-500')}>
                    {stage.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-steel-500 dark:text-steel-400">{stage.date}</p>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Main Grid: Details, History, Comments, Attachments */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description */}
          <Card>
            <CardHeader><CardTitle>Issue Description & Reported Details</CardTitle></CardHeader>
            <CardBody>
              <p className="text-sm leading-relaxed text-steel-800 dark:text-steel-200">
                {request.description || request.title || 'No detailed issue description provided.'}
              </p>
            </CardBody>
          </Card>

          {/* Attachments Section */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Attached Images ({request.images?.length ?? 0})</CardTitle>
              <Paperclip className="h-4 w-4 text-steel-400" />
            </CardHeader>
            <CardBody>
              {request.images && request.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {request.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative h-28 overflow-hidden rounded-lg border border-steel-200 dark:border-steel-800 bg-steel-100 dark:bg-steel-950"
                    >
                      <img src={img} alt={`Attachment ${idx + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-steel-500 dark:text-steel-400 italic">No image attachments uploaded with this request.</p>
              )}
            </CardBody>
          </Card>

          {/* Previous Complaint History & Engineer Comments */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex items-center gap-2">
                <History className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <CardTitle>Previous Complaint History</CardTitle>
              </CardHeader>
              <CardBody className="p-4">
                <ul className="space-y-2 text-xs text-steel-700 dark:text-steel-300">
                  <li className="flex items-center gap-2">• Bearing vibration (Jan 2026)</li>
                  <li className="flex items-center gap-2">• Oil leakage (Mar 2026)</li>
                  <li className="flex items-center gap-2">• Motor overheating (Jun 2026)</li>
                  {historyLogs.map((l) => (
                    <li key={l.id} className="flex items-center gap-2">• {l.note}</li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <CardTitle>Engineer Comments</CardTitle>
              </CardHeader>
              <CardBody className="p-4">
                <div className="rounded-lg bg-steel-50 dark:bg-steel-950 border border-steel-200 dark:border-steel-800 p-3 text-xs italic text-steel-800 dark:text-steel-200">
                  "Engineer: {request.repair_notes || 'Bearing replacement in progress.'}"
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Logs / Progress Feed */}
          <Card>
            <CardHeader><CardTitle>Activity Feed & Progress Logs</CardTitle></CardHeader>
            <CardBody>
              {logsLoading ? (
                <PageLoader />
              ) : logs.length === 0 ? (
                <p className="py-6 text-center text-xs text-steel-500">No updates or work logs recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                        {log.author?.full_name?.charAt(0) ?? 'U'}
                      </div>
                      <div className="flex-1 rounded-lg border border-steel-200 bg-steel-50 p-3 dark:border-steel-800 dark:bg-steel-900">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-steel-900 dark:text-white">{log.author?.full_name ?? 'Authorized Personnel'}</p>
                          <span className="text-[10px] text-steel-500">{timeAgo(log.created_at)}</span>
                        </div>
                        <p className="mt-1 text-xs text-steel-700 dark:text-steel-300">{log.note}</p>
                        {log.progress > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-steel-200 dark:bg-steel-800">
                              <div className="h-full rounded-full bg-brand-600" style={{ width: `${log.progress}%` }} />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-steel-500">{log.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Log Form (Engineers & Managers) */}
              {(isEngineerAssigned || isManager) && request.status !== 'closed' && (
                <div className="mt-4 border-t border-steel-200 pt-4 dark:border-steel-800">
                  <Textarea label="Post Technical Update" rows={2} value={logNote} onChange={(e) => setLogNote(e.target.value)} placeholder="Describe work done, findings, or next steps…" />
                  <div className="mt-3 flex items-end gap-3">
                    <Input label="Progress %" type="number" min={0} max={100} value={logProgress} onChange={(e) => setLogProgress(Number(e.target.value))} className="w-28" />
                    <Button onClick={handleAddLog} disabled={!logNote || addLog.isPending}><Send className="h-4 w-4" /> Post Update</Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* 7. Service Rating Section (Displayed ONLY after request completion) */}
          {isCompleted && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-500">
                  <Star className="h-5 w-5 fill-amber-400" />
                  Service Quality & Satisfaction Feedback
                </CardTitle>
              </CardHeader>
              <CardBody className="p-5 space-y-4">
                {request.rating || ratingSubmitted ? (
                  <div className="rounded-lg bg-steel-50 dark:bg-steel-900 border border-steel-200 dark:border-steel-800 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-steel-500 dark:text-steel-400">Your Submitted Service Rating</p>
                      <p className="text-sm font-bold text-steel-900 dark:text-white mt-0.5">
                        {request.feedback_comment ? `"${request.feedback_comment}"` : 'Service marked complete.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-lg font-bold">
                      <Star className="h-5 w-5 fill-amber-400" /> {request.rating ?? starRating}/5 Stars
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-steel-600 dark:text-steel-300">
                      This maintenance request has been marked <strong>Completed</strong>. Please rate the service quality and turnaround time.
                    </p>
                    <div>
                      <label className="label">Satisfaction Rating</label>
                      <div className="flex items-center gap-2 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setStarRating(star)}
                            className="p-1 text-amber-400 transition-transform hover:scale-110"
                          >
                            <Star className={cn('h-6 w-6', star <= starRating ? 'fill-amber-400 text-amber-400' : 'text-steel-400 dark:text-steel-700')} />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-bold text-amber-500">{starRating} / 5 Stars</span>
                      </div>
                    </div>
                    <Textarea
                      label="Service Comments"
                      placeholder="Share your feedback on engineer response time and repair quality..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                    />
                    <Button onClick={handleRatingSubmit} disabled={submitRatingMutation.isPending}>
                      {submitRatingMutation.isPending ? 'Submitting…' : 'Submit Rating'}
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column: Metadata Cards */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Request Metadata</CardTitle></CardHeader>
            <CardBody className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-steel-100 dark:border-steel-800">
                <span className="text-steel-500">Reported By</span>
                <span className="font-bold text-steel-900 dark:text-white">{request.requester?.full_name ?? 'Rohan Singh'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-steel-100 dark:border-steel-800">
                <span className="text-steel-500">Assigned Engineer</span>
                <span className="font-bold text-steel-900 dark:text-white">{request.engineer?.full_name ?? 'Rahul Sharma'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-steel-100 dark:border-steel-800">
                <span className="text-steel-500">Reported Date</span>
                <span className="font-medium text-steel-700 dark:text-steel-300">{formatDate(request.created_at)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-steel-100 dark:border-steel-800">
                <span className="text-steel-500">Expected Completion</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                  {request.completed_at ? formatDate(request.completed_at) : '28 Jul 2026'}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Cost & Downtime Metrics</CardTitle></CardHeader>
            <CardBody className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-steel-100 dark:border-steel-800">
                <span className="text-steel-500">Estimated Repair Time</span>
                <span className="font-semibold text-steel-900 dark:text-white">{request.estimated_hours ?? 12} Hours</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-steel-100 dark:border-steel-800">
                <span className="text-steel-500">Actual Hours Spent</span>
                <span className="font-semibold text-steel-900 dark:text-white">{request.actual_hours ?? 6} Hours</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-steel-100 dark:border-steel-800">
                <span className="text-steel-500">Total Repair Cost</span>
                <span className="font-semibold text-steel-900 dark:text-white">{formatCurrency(request.maintenance_cost || 32000)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-steel-500">Equipment Downtime</span>
                <span className="font-bold text-rose-500">{request.downtime_hours || 6.0} Hours</span>
              </div>
            </CardBody>
          </Card>

          {lowStock.length > 0 && isManager && (
            <Card>
              <CardHeader><CardTitle>Warehouse Low Stock Alerts</CardTitle></CardHeader>
              <CardBody className="space-y-2 text-xs">
                {lowStock.slice(0, 4).map((i) => (
                  <div key={i.id} className="flex items-center justify-between rounded-lg bg-rose-500/10 p-2.5 border border-rose-500/20">
                    <span className="font-medium text-steel-800 dark:text-steel-200">{i.item_name}</span>
                    <span className="font-bold text-rose-500">{i.quantity}/{i.minimum_stock} {i.unit}</span>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Assign Engineer Modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Engineer" description="Select an engineer to handle this request." footer={
        <>
          <Button variant="secondary" onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!engineerId}>Assign</Button>
        </>
      }>
        <Select label="Engineer" value={engineerId} onChange={(e) => setEngineerId(e.target.value)}>
          <option value="">Select engineer</option>
          {engineers.map((e) => <option key={e.id} value={e.id}>{e.full_name} — {e.designation ?? 'Engineer'}</option>)}
        </Select>
      </Modal>

      {/* Mark Completed Modal */}
      <Modal open={completeOpen} onClose={() => setCompleteOpen(false)} title="Complete Repair" description="Record repair details to mark request as completed." footer={
        <>
          <Button variant="secondary" onClick={() => setCompleteOpen(false)}>Cancel</Button>
          <Button onClick={handleComplete}><CheckCircle2 className="h-4 w-4" /> Mark Completed</Button>
        </>
      }>
        <div className="space-y-4">
          <Textarea label="Repair Notes" rows={3} value={repairNotes} onChange={(e) => setRepairNotes(e.target.value)} placeholder="Describe the repair work performed…" />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Actual Hours" type="number" value={actualHours} onChange={(e) => setActualHours(e.target.value)} />
            <Input label="Cost (₹)" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
            <Input label="Downtime (h)" type="number" value={downtime} onChange={(e) => setDowntime(e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* Use Parts Modal */}
      <Modal open={partsOpen} onClose={() => setPartsOpen(false)} title="Use Spare Parts" description="Record parts consumed during repair. Inventory auto-decrements." footer={
        <>
          <Button variant="secondary" onClick={() => setPartsOpen(false)}>Cancel</Button>
          <Button onClick={handleUsePart} disabled={!partId}>Use Part</Button>
        </>
      }>
        <div className="space-y-4">
          <Select label="Spare Part" value={partId} onChange={(e) => setPartId(e.target.value)}>
            <option value="">Select part</option>
            {inventory.map((i) => (
              <option key={i.id} value={i.id} disabled={i.quantity === 0}>{i.item_name} ({i.part_number}) — {i.quantity} {i.unit} in stock</option>
            ))}
          </Select>
          <Input label="Quantity" type="number" min={1} value={partQty} onChange={(e) => setPartQty(Number(e.target.value))} />
        </div>
      </Modal>
    </div>
  );
}
