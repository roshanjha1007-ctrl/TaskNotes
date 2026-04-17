import { FormEvent, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { EyeIcon, EyeOffIcon, ShieldIcon, TaskNotesLogoIcon } from './ui/Icons';
import { cn } from '../lib/cn';
import { RoshanAccessModal } from './RoshanAccessModal';

interface AuthScreenProps {
  onAuthenticated: () => void;
  onRoshanVerified: () => void;
}

function getFriendlyMessage(message: string) {
  const loweredMessage = message.toLowerCase();

  if (
    loweredMessage.includes('invalid login credentials') ||
    loweredMessage.includes('invalid-credential') ||
    loweredMessage.includes('wrong-password') ||
    loweredMessage.includes('user-not-found')
  ) {
    return 'That email and password combination didn’t work. Please check your credentials and try again.';
  }

  if (
    loweredMessage.includes('user already registered') ||
    loweredMessage.includes('already been registered') ||
    loweredMessage.includes('email-already-in-use')
  ) {
    return 'This email already has an account. Sign in instead, or use forgot password if needed.';
  }

  if (loweredMessage.includes('too-many-requests')) {
    return 'Too many attempts were made. Please wait a moment, then try again.';
  }

  if (loweredMessage.includes('invalid-email')) {
    return 'Use a valid email address.';
  }

  if (loweredMessage.includes('weak-password')) {
    return 'Use a stronger password with at least 6 characters.';
  }

  return message;
}

export function AuthScreen({
  onAuthenticated,
  onRoshanVerified,
}: AuthScreenProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up' | 'forgot-password'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRoshanAccess, setShowRoshanAccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const inlineErrors = useMemo(() => {
    const next: { email?: string; password?: string } = {};

    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = 'Use a valid work email.';
    }

    if (mode !== 'forgot-password' && password && password.length < 6) {
      next.password = 'Use at least 6 characters.';
    }

    return next;
  }, [email, mode, password]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === 'forgot-password') {
        await sendPasswordResetEmail(firebaseAuth, email.trim());
        setNotice('Password reset instructions are on the way if that account exists.');
        return;
      }

      if (mode === 'sign-up') {
        await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
        onAuthenticated();
        return;
      }

      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      onAuthenticated();
    } catch (err: unknown) {
      const nextError = err as { message?: string };
      setError(getFriendlyMessage(nextError.message ?? 'Authentication failed.'));
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    loading ||
    Boolean(inlineErrors.email) ||
    !email.trim() ||
    (mode !== 'forgot-password' && (Boolean(inlineErrors.password) || !password));

  return (
    <div
      className={cn(
        'min-h-screen px-4 py-4 sm:px-6 lg:px-8',
        'bg-transparent text-[var(--text-primary)]',
      )}
    >
      <div className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-[760px] items-center justify-center">
        <Card
          elevated
          className="auth-card relative flex w-full flex-col justify-between overflow-hidden rounded-[36px] p-6 sm:p-8"
        >
          <div>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-[var(--surface-inverse)] p-2 shadow-[var(--shadow-sm)]">
                    <TaskNotesLogoIcon width={42} height={42} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                      TaskNotes
                    </p>
                    <p className="truncate text-sm text-[var(--text-secondary)]">Hybrid productivity workspace</p>
                  </div>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--text-muted)]">
                  Secure workspace
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-[var(--text-primary)]">
                  {mode === 'sign-up'
                    ? 'Create your account'
                    : mode === 'forgot-password'
                      ? 'Reset your password'
                      : 'Welcome back'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {mode === 'forgot-password'
                    ? 'We’ll send recovery instructions to your email.'
                    : 'Sign in with Firebase to access your private workspace.'}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-secondary)] px-3 py-2 text-xs font-semibold whitespace-nowrap text-[var(--text-secondary)]">
                <ShieldIcon width={16} height={16} />
                Encrypted auth
              </div>
            </div>

            {error ? (
              <div className="mb-4 rounded-2xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-fg)]">
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="mb-4 rounded-2xl border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success-fg)]">
                {notice}
              </div>
            ) : null}

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <Input
                label="Work email"
                type="email"
                autoComplete="email"
                required
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                error={inlineErrors.email ?? null}
              />

              {mode !== 'forgot-password' ? (
                <label className="grid gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    Password
                  </span>
                  <span className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] px-4 transition focus-within:border-[var(--accent)] focus-within:ring-4 focus-within:ring-[var(--focus-ring)]">
                    <input
                      className="w-full border-0 bg-transparent py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      className="text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
                    </button>
                  </span>
                  {inlineErrors.password ? (
                    <span className="text-xs font-medium text-[var(--error-fg)]">{inlineErrors.password}</span>
                  ) : null}
                </label>
              ) : null}

              <Button type="submit" size="lg" fullWidth disabled={isSubmitDisabled}>
                {loading
                  ? 'Working...'
                  : mode === 'sign-up'
                    ? 'Create account'
                    : mode === 'forgot-password'
                      ? 'Send reset instructions'
                      : 'Sign in'}
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--text-secondary)]">
              {mode === 'sign-in' ? (
                <>
                  <button className="transition hover:text-[var(--text-primary)]" type="button" onClick={() => setMode('forgot-password')}>
                    Forgot password?
                  </button>
                  <button className="transition hover:text-[var(--text-primary)]" type="button" onClick={() => setMode('sign-up')}>
                    Need an account? Sign up
                  </button>
                </>
              ) : null}

              {mode === 'sign-up' ? (
                <button className="transition hover:text-[var(--text-primary)]" type="button" onClick={() => setMode('sign-in')}>
                  Already have an account? Sign in
                </button>
              ) : null}

              {mode === 'forgot-password' ? (
                <button className="transition hover:text-[var(--text-primary)]" type="button" onClick={() => setMode('sign-in')}>
                  Back to sign in
                </button>
              ) : null}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="group inline-flex items-center gap-3 rounded-[20px] border border-[color:color-mix(in_srgb,var(--accent)_34%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-primary)_92%,transparent),color-mix(in_srgb,var(--surface-secondary)_88%,transparent))] px-3 py-2 pr-4 text-left shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)]"
                onClick={() => setShowRoshanAccess(true)}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[color:color-mix(in_srgb,var(--accent)_20%,transparent)] text-[var(--accent)] transition group-hover:bg-[color:color-mix(in_srgb,var(--accent)_28%,transparent)]">
                  R
                </span>
                <span className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    Private Access
                  </span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    For Roshan
                  </span>
                </span>
              </button>
            </div>
          </div>
        </Card>
      </div>
      {showRoshanAccess ? (
        <RoshanAccessModal
          onClose={() => setShowRoshanAccess(false)}
          onVerified={onRoshanVerified}
        />
      ) : null}
    </div>
  );
}
