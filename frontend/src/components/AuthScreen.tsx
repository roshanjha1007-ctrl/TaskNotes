import { FormEvent, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_CREDENTIALS } from '../lib/demo';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ThemeToggleButton } from './ThemeToggleButton';
import { Input } from './ui/Input';
import { EyeIcon, EyeOffIcon, ShieldIcon, TaskNotesLogoIcon } from './ui/Icons';
import { cn } from '../lib/cn';

interface AuthScreenProps {
  onAuthenticated: () => void;
  onDemoAccess: () => void | Promise<void>;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

function getFriendlyMessage(message: string) {
  const loweredMessage = message.toLowerCase();

  if (loweredMessage.includes('invalid login credentials')) {
    return `That email and password combination didn’t work. Use the demo account (${DEMO_CREDENTIALS.email}) or create a new workspace.`;
  }

  if (
    loweredMessage.includes('user already registered') ||
    loweredMessage.includes('already been registered')
  ) {
    return 'This email already has an account. Sign in instead, or use forgot password if needed.';
  }

  if (loweredMessage.includes('email not confirmed')) {
    return 'This email is not confirmed yet. Use the demo access option, or confirm the account from your inbox before signing in.';
  }

  return message;
}

export function AuthScreen({ onAuthenticated, onDemoAccess, theme, onThemeToggle }: AuthScreenProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up' | 'forgot-password'>('sign-in');
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
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
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });

        if (resetError) throw resetError;
        setNotice('Password reset instructions are on the way if that account exists.');
        return;
      }

      if (mode === 'sign-up') {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          onAuthenticated();
        } else {
          setNotice('Account created. Check your inbox if email confirmation is enabled, then sign in.');
          setMode('sign-in');
        }
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        const loweredMessage = signInError.message.toLowerCase();
        const isDemoCredentialAttempt =
          email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
          password === DEMO_CREDENTIALS.password;

        if (isDemoCredentialAttempt && loweredMessage.includes('email not confirmed')) {
          await onDemoAccess();
          return;
        }

        throw signInError;
      }
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
    <div className={cn(
      'min-h-screen px-4 py-4 sm:px-6 lg:px-8',
      'bg-transparent text-[var(--text-primary)]',
    )}>
      <div className="mx-auto flex max-w-[1800px] justify-end pb-4">
        <ThemeToggleButton theme={theme} onToggle={onThemeToggle} />
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-[760px] items-center justify-center">
        <Card elevated className="flex w-full flex-col justify-between rounded-[36px] p-6 sm:p-8">
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
                    : 'Sign in with Supabase auth, or use the seeded demo workspace instantly.'}
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
                theme={theme}
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
          </div>

          <div className="mt-8 rounded-[28px] border border-[var(--border)] bg-[var(--surface-secondary)] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Instant demo access</p>
                <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                  Demo email and password are already filled above. You can sign in directly or open the seeded workspace instantly.
                </p>
              </div>
              <Button variant="secondary" className="self-start lg:self-center" onClick={() => void onDemoAccess()}>
                Open demo
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
