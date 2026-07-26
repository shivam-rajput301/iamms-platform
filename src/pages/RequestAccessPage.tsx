import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Mail,
  Lock, EyeOff, Eye, AlertCircle, CreditCard,
} from 'lucide-react';
import { COMPANY_NAME } from '@/lib/constants';
import { useAuth } from '@/lib/auth';

/* ── Colour tokens (matches the login page palette) ─────────── */
const CYAN = '#17C7E8';
const NAVY = '#09111F';

/* ── Shared input style ───────────────────────────────────────── */
const INPUT_BASE: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(8,15,30,0.7)',
  border: '1px solid rgba(23,199,232,0.12)',
  color: '#E2E8F0',
  borderRadius: 10,
  padding: '11px 13px 11px 40px',
  fontSize: 13.5,
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
};

function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'rgba(23,199,232,0.45)';
  e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(23,199,232,0.08)';
}
function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'rgba(23,199,232,0.12)';
  e.currentTarget.style.boxShadow   = 'none';
}

/* ── Small label ─────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: 'block',
      marginBottom: 7,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.45)',
    }}>
      {children}
    </label>
  );
}

/* ════════════════════════════════════════════════════════════════
   REQUEST SYSTEM ACCESS — minimal 4-field form
   Fields collected: Employee ID · Email · Password · Confirm Password
   All organizational data (Name, Plant, Dept, Role) is assigned
   by the Super Admin during the approval workflow.
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
    employeeId:      '',
    email:           '',
    password:        '',
    confirmPassword: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      employeeId: form.employeeId.trim(),
      email:      form.email.trim(),
      password:   form.password,
    });
    setLoading(false);

    if (error) {
      setApiError(error);
    } else {
      setSubmitted(true);
    }
  }

  /* ── Success screen ──────────────────────────────────────────── */
  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(145deg, ${NAVY} 0%, #060f22 60%, #020c1a 100%)`,
        fontFamily: "'Inter', sans-serif",
        padding: 24,
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(23,199,232,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(23,199,232,0.025) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}/>

        <div style={{
          position: 'relative', zIndex: 10,
          background: '#0D1829',
          border: '1px solid rgba(23,199,232,0.12)',
          borderRadius: 16,
          padding: '48px 40px',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(16,185,129,0.10)',
            border: '1px solid rgba(16,185,129,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircle style={{ width: 30, height: 30, color: '#34d399' }}/>
          </div>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Request Submitted
          </h2>
          <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)' }}>
            Your access request has been submitted successfully.
          </p>
          <p style={{ margin: '0 0 28px', fontSize: 13, color: 'rgba(255,255,255,0.32)' }}>
            The system administrator will review your request and activate your account.
            You will be notified once access is granted.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%', padding: '12px 20px',
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
              background: CYAN, color: '#080F1E',
              border: 'none', borderRadius: 10,
              cursor: 'pointer', letterSpacing: '0.02em',
            }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  /* ── Form screen ─────────────────────────────────────────────── */
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(145deg, ${NAVY} 0%, #060f22 60%, #020c1a 100%)`,
      fontFamily: "'Inter', sans-serif",
      padding: '32px 24px',
    }}>
      {/* Grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(23,199,232,0.025) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(23,199,232,0.025) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}/>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460 }}>

        {/* Back link */}
        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            marginBottom: 24,
            background: 'none', border: 'none', padding: 0,
            cursor: 'pointer', color: 'rgba(255,255,255,0.35)',
            fontSize: 13, fontFamily: 'inherit',
            transition: 'color 150ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
        >
          <ArrowLeft style={{ width: 14, height: 14 }}/>
          Back to Sign In
        </button>

        {/* Card */}
        <div style={{
          background: '#0D1829',
          border: '1px solid rgba(23,199,232,0.12)',
          borderRadius: 14,
          overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{
            padding: '18px 32px',
            borderBottom: '1px solid rgba(23,199,232,0.08)',
            background: 'rgba(2,8,23,0.35)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: 'rgba(23,199,232,0.1)',
              border: '1px solid rgba(23,199,232,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-1.954l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655L5.516 16.3 4 18l2 2 1.791-1.46 2.606 1.072L11 22h2l.604-2.387 2.651-1.098C16.697 19.48 18 20 18 20l2-2-1.484-1.75 1.098-2.652 2.386-.62V11l-2.378-.605z" stroke={CYAN} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fff' }}>
                IAMMS
              </p>
              <p style={{ margin: 0, fontSize: 9.5, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Employee Access Request Portal
              </p>
            </div>
            <div style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 99,
              background: 'rgba(23,199,232,0.07)',
              border: '1px solid rgba(23,199,232,0.18)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: CYAN,
                boxShadow: `0 0 6px ${CYAN}`,
                animation: 'pulse 2s infinite',
              }}/>
              <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: CYAN }}>
                Open
              </span>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: '32px 32px 28px' }}>

            {/* Heading */}
            <h2 style={{
              margin: '0 0 6px',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}>
              Request System Access
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.4)' }}>
              Enter your official Employee ID and registered company email.
              Your request will be reviewed by the system administrator before access is granted.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Employee ID */}
                <div>
                  <Label>Employee ID <span style={{ color: '#ef4444' }}>*</span></Label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard style={{
                      position: 'absolute', left: 13, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 15, height: 15,
                      color: 'rgba(23,199,232,0.5)', pointerEvents: 'none',
                    }}/>
                    <input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      autoComplete="username"
                      value={form.employeeId}
                      onChange={handleChange}
                      placeholder="e.g. IAMMS-EMP-001"
                      required
                      style={INPUT_BASE}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>

                {/* Official Email */}
                <div>
                  <Label>Official Email Address <span style={{ color: '#ef4444' }}>*</span></Label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{
                      position: 'absolute', left: 13, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 15, height: 15,
                      color: 'rgba(23,199,232,0.5)', pointerEvents: 'none',
                    }}/>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      required
                      style={INPUT_BASE}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label>Password <span style={{ color: '#ef4444' }}>*</span></Label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{
                      position: 'absolute', left: 13, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 15, height: 15,
                      color: 'rgba(23,199,232,0.5)', pointerEvents: 'none',
                    }}/>
                    <input
                      id="password"
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      required
                      style={{ ...INPUT_BASE, paddingRight: 42 }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPw((p) => !p)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', padding: 0,
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.32)',
                        display: 'flex', alignItems: 'center',
                        transition: 'color 150ms',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.32)')}
                    >
                      {showPw
                        ? <EyeOff style={{ width: 15, height: 15 }}/>
                        : <Eye    style={{ width: 15, height: 15 }}/>
                      }
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label>Confirm Password <span style={{ color: '#ef4444' }}>*</span></Label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{
                      position: 'absolute', left: 13, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 15, height: 15,
                      color: 'rgba(23,199,232,0.5)', pointerEvents: 'none',
                    }}/>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showCPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      required
                      style={{ ...INPUT_BASE, paddingRight: 42 }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowCPw((p) => !p)}
                      aria-label={showCPw ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', padding: 0,
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.32)',
                        display: 'flex', alignItems: 'center',
                        transition: 'color 150ms',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.32)')}
                    >
                      {showCPw
                        ? <EyeOff style={{ width: 15, height: 15 }}/>
                        : <Eye    style={{ width: 15, height: 15 }}/>
                      }
                    </button>
                  </div>
                </div>

                {/* Error */}
                {apiError && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    padding: '10px 13px', borderRadius: 10,
                    background: 'rgba(127,29,29,0.20)',
                    border: '1px solid rgba(185,28,28,0.30)',
                  }}>
                    <AlertCircle style={{ width: 14, height: 14, color: '#FCA5A5', flexShrink: 0, marginTop: 1 }}/>
                    <span style={{ fontSize: 12.5, color: '#FCA5A5', lineHeight: 1.5 }}>{apiError}</span>
                  </div>
                )}

                {/* Info notice */}
                <div style={{
                  padding: '10px 13px', borderRadius: 10, fontSize: 12.5, lineHeight: 1.6,
                  background: 'rgba(23,199,232,0.05)',
                  border: '1px solid rgba(23,199,232,0.14)',
                  color: 'rgba(23,199,232,0.7)',
                }}>
                  After submission, the system administrator will verify your Employee ID, assign your name,
                  department, plant, role and designation, then activate your account.
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  id="submit-request-btn"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '13px 20px', marginTop: 4,
                    fontSize: 15, fontWeight: 700,
                    letterSpacing: '0.04em', fontFamily: 'inherit',
                    background: loading ? 'rgba(23,199,232,0.4)' : CYAN,
                    color: '#080F1E',
                    border: 'none', borderRadius: 10,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.75 : 1,
                    transition: 'opacity 150ms, filter 150ms',
                    boxShadow: '0 4px 20px rgba(23,199,232,0.22)',
                  }}
                  onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.08)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <svg style={{ width: 15, height: 15, animation: 'spin 0.9s linear infinite' }} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"
                          strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round"/>
                      </svg>
                      Submitting Request…
                    </span>
                  ) : 'Submit Request'}
                </button>

              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>
          © {new Date().getFullYear()} {COMPANY_NAME} · For internal use only
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        input::placeholder { color: rgba(255,255,255,0.22) !important; opacity: 1; }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0A1626 inset !important;
          -webkit-text-fill-color: #E2E8F0 !important;
          caret-color: #E2E8F0 !important;
        }
      `}</style>
    </div>
  );
}
