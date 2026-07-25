import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, CheckCircle, User, Mail, Phone,
  Lock, EyeOff, Eye, AlertCircle, MapPin, Layers, Briefcase, CreditCard,
} from 'lucide-react';
import { COMPANY_NAME, COMPANY_SHORT, DEPARTMENTS } from '@/lib/constants';
import { useAuth } from '@/lib/auth';

/* ── Shared input style helpers ─────────────────────────────── */
const INPUT_BASE: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#f1f5f9',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
};

const SELECT_BASE: React.CSSProperties = {
  ...INPUT_BASE,
  background: 'rgba(15,23,42,0.90)',
};

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = '#2563eb';
  e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(37,99,235,0.16)';
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
  e.currentTarget.style.boxShadow   = 'none';
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em]"
      style={{ color: '#475569' }}>
      {children}
    </label>
  );
}

/* ── Plants list ─────────────────────────────────────────────── */
const PLANTS = ['Head Office', 'Plant A', 'Plant B', 'Plant C', 'Smelter Complex', 'Rolling Unit'];
const AREAS  = ['Administration', 'Production', 'Quality', 'Safety & EHS', 'Engineering', 'Maintenance', 'Logistics', 'IT & Systems'];

/* ════════════════════════════════════════════════════════════════
   REQUEST ACCESS PAGE
════════════════════════════════════════════════════════════════ */
export function RequestAccessPage() {
  const navigate = useNavigate();
  const { requestAccess } = useAuth();

  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [showPw,    setShowPw]    = useState(false);
  const [showCPw,   setShowCPw]   = useState(false);
  const [apiError,  setApiError]  = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName:    '',
    employeeId:  '',
    email:       '',
    phone:       '',
    plant:       '',
    area:        '',
    department:  '',
    designation: '',
    password:    '',
    confirmPassword: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setApiError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    if (form.password !== form.confirmPassword) {
      setApiError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setApiError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { error } = await requestAccess({
      name:        form.fullName,
      employeeId:  form.employeeId,
      email:       form.email,
      phone:       form.phone || undefined,
      plant:       form.plant || undefined,
      area:        form.area  || undefined,
      department:  form.department  || undefined,
      designation: form.designation || undefined,
      password:    form.password,
    });
    setLoading(false);

    if (error) {
      setApiError(error);
    } else {
      setSubmitted(true);
    }
  }

  /* ── Shared input with icon ──────────────────────────────── */
  function Field({
    name, label, type = 'text', placeholder, required = true,
    icon: Icon, autoComplete,
  }: {
    name: keyof typeof form;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    icon: typeof User;
    autoComplete?: string;
  }) {
    return (
      <div>
        <Label>{label}{required && <span style={{ color: '#ef4444' }}> *</span>}</Label>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
          <input
            name={name}
            type={type}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            style={{ ...INPUT_BASE, paddingLeft: 36 }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-start justify-center p-6 pt-10"
      style={{
        background: 'linear-gradient(145deg, #020817 0%, #060f22 50%, #020c1a 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Blueprint grid */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      {/* Glow */}
      <div className="fixed right-0 top-0 h-[500px] w-[500px] rounded-full opacity-10 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #2563eb, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-2xl pb-10">
        {/* Back button */}
        <button
          onClick={() => navigate('/login')}
          className="mb-6 flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: '#64748b' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </button>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(11,20,40,0.80)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(37,99,235,0.14)',
            boxShadow: '0 28px 70px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div className="px-8 py-5 flex items-center gap-3"
            style={{ borderBottom: '1px solid rgba(37,99,235,0.10)', background: 'rgba(2,8,23,0.4)' }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}>
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-black tracking-widest text-white uppercase">{COMPANY_SHORT}</p>
              <p className="text-[10px] tracking-wider" style={{ color: '#475569' }}>Employee Access Request Portal</p>
            </div>
            {/* Status chip */}
            <div className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.18)' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: '#60a5fa' }}>
                Registration Open
              </span>
            </div>
          </div>

          <div className="px-8 py-8">
            {submitted ? (
              /* ── Success state ── */
              <div className="py-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-black text-white mb-2">Request Submitted</h2>
                <p className="text-sm leading-relaxed mb-2" style={{ color: '#94a3b8', maxWidth: 400, margin: '0 auto 16px' }}>
                  Your registration request has been submitted successfully.
                  Please wait for administrator approval.
                </p>
                <p className="text-xs mb-8" style={{ color: '#475569' }}>
                  You will be notified once your account is approved.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <h2 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Request Access</h2>
                  <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
                    Fill in your details below. An administrator will review and approve your request.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Section: Personal Information */}
                  <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#2563eb' }}>
                      Personal Information
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="col-span-2">
                        <Field name="fullName" label="Full Name" placeholder="John Smith" icon={User} autoComplete="name" />
                      </div>
                      {/* Employee ID */}
                      <div>
                        <Label>Employee ID <span style={{ color: '#ef4444' }}>*</span></Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
                          <input
                            name="employeeId" type="text" value={form.employeeId}
                            onChange={handleChange} placeholder="e.g. EMP-2026-001"
                            required style={{ ...INPUT_BASE, paddingLeft: 36 }}
                            onFocus={onFocus} onBlur={onBlur}
                          />
                        </div>
                      </div>
                      {/* Designation */}
                      <div>
                        <Label>Designation <span style={{ color: '#ef4444' }}>*</span></Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
                          <input
                            name="designation" type="text" value={form.designation}
                            onChange={handleChange} placeholder="e.g. Maintenance Engineer"
                            required style={{ ...INPUT_BASE, paddingLeft: 36 }}
                            onFocus={onFocus} onBlur={onBlur}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Contact Details */}
                  <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#2563eb' }}>
                      Contact Details
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Field name="email" label="Official Email" type="email" placeholder="you@company.com" icon={Mail} autoComplete="email" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <Label>Mobile Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
                          <input
                            name="phone" type="tel" value={form.phone}
                            onChange={handleChange} placeholder="+91 98765 43210"
                            required={false} style={{ ...INPUT_BASE, paddingLeft: 36 }}
                            onFocus={onFocus} onBlur={onBlur}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Plant & Department */}
                  <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#2563eb' }}>
                      Plant & Department
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Plant */}
                      <div>
                        <Label>Plant <span style={{ color: '#ef4444' }}>*</span></Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none z-10" style={{ color: '#475569' }} />
                          <select name="plant" value={form.plant} onChange={handleChange} required
                            style={{ ...SELECT_BASE, paddingLeft: 36, color: form.plant ? '#f1f5f9' : '#475569' }}
                            onFocus={onFocus} onBlur={onBlur}>
                            <option value="">Select plant</option>
                            {PLANTS.map((p) => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                      {/* Area */}
                      <div>
                        <Label>Area / Section <span style={{ color: '#ef4444' }}>*</span></Label>
                        <div className="relative">
                          <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none z-10" style={{ color: '#475569' }} />
                          <select name="area" value={form.area} onChange={handleChange} required
                            style={{ ...SELECT_BASE, paddingLeft: 36, color: form.area ? '#f1f5f9' : '#475569' }}
                            onFocus={onFocus} onBlur={onBlur}>
                            <option value="">Select area</option>
                            {AREAS.map((a) => <option key={a}>{a}</option>)}
                          </select>
                        </div>
                      </div>
                      {/* Department */}
                      <div className="col-span-2">
                        <Label>Department <span style={{ color: '#ef4444' }}>*</span></Label>
                        <select name="department" value={form.department} onChange={handleChange} required
                          style={{ ...SELECT_BASE, color: form.department ? '#f1f5f9' : '#475569' }}
                          onFocus={onFocus} onBlur={onBlur}>
                          <option value="">Select department</option>
                          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section: Set Password */}
                  <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#2563eb' }}>
                      Set Password
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Password */}
                      <div>
                        <Label>Password <span style={{ color: '#ef4444' }}>*</span></Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
                          <input
                            name="password" type={showPw ? 'text' : 'password'}
                            value={form.password} onChange={handleChange}
                            placeholder="Min. 8 characters" required autoComplete="new-password"
                            style={{ ...INPUT_BASE, paddingLeft: 36, paddingRight: 40 }}
                            onFocus={onFocus} onBlur={onBlur}
                          />
                          <button type="button" tabIndex={-1} onClick={() => setShowPw((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                            style={{ color: '#475569' }}
                            aria-label={showPw ? 'Hide password' : 'Show password'}>
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      {/* Confirm Password */}
                      <div>
                        <Label>Confirm Password <span style={{ color: '#ef4444' }}>*</span></Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
                          <input
                            name="confirmPassword" type={showCPw ? 'text' : 'password'}
                            value={form.confirmPassword} onChange={handleChange}
                            placeholder="Re-enter password" required autoComplete="new-password"
                            style={{ ...INPUT_BASE, paddingLeft: 36, paddingRight: 40 }}
                            onFocus={onFocus} onBlur={onBlur}
                          />
                          <button type="button" tabIndex={-1} onClick={() => setShowCPw((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                            style={{ color: '#475569' }}
                            aria-label={showCPw ? 'Hide password' : 'Show password'}>
                            {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Banner */}
                  {apiError && (
                    <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs"
                      style={{ background: 'rgba(127,29,29,0.18)', border: '1px solid rgba(185,28,28,0.3)', color: '#fca5a5' }}>
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  {/* Notice */}
                  <div className="rounded-xl px-4 py-3 text-xs"
                    style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.18)', color: '#93c5fd' }}>
                    Your request will be reviewed by the IT Administrator. New accounts require approval before system access is granted.
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all active:scale-[0.98]"
                    style={{
                      background: loading ? 'rgba(37,99,235,0.45)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                            strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round" />
                        </svg>
                        Submitting Request…
                      </span>
                    ) : 'Submit Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px]" style={{ color: '#1e293b' }}>
          © 2026 {COMPANY_NAME} · For internal use only
        </p>
      </div>
    </div>
  );
}
