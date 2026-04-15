import { FormEvent, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_CREDENTIALS } from '../lib/demo';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import {
  CalendarIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldIcon,
  SparkIcon,
} from './ui/Icons';

interface AuthScreenProps {
  onAuthenticated: () => void;
  onDemoAccess: () => void;
}

function getFriendlyMessage(message: string) {
  if (message.toLowerCase().includes('invalid login credentials')) {
    return `That email and password combination didn’t work. Use the demo account (${DEMO_CREDENTIALS.email}) or start a new workspace.`;
  }

  return message;
}

export function AuthScreen({ onAuthenticated, onDemoAccess }: AuthScreenProps) {
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
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;
        onAuthenticated();
      }
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
    (mode !== 'forgot-password' && (Boolean(inlineErrors.password) || !password));

  return (
    <div className="auth-shell">
      <div className="auth-ambient auth-ambient-one" />
      <div className="auth-ambient auth-ambient-two" />

      <section className="auth-layout">
        <div className="auth-intro">
          <div className="brand-mark">
            <SparkIcon width={22} height={22} />
          </div>
          <p className="eyebrow">TaskNotes</p>
          <h1 className="hero-title">A calmer task workspace for teams that move fast.</h1>
          <p className="hero-copy">
            Production-grade task management with stronger hierarchy, cleaner writing surfaces, and a safer auth experience.
          </p>

          <div className="auth-feature-grid">
            <Card className="feature-card">
              <ShieldIcon width={18} height={18} />
              <div>
                <h3>Secure by default</h3>
                <p>Private workspaces, helpful auth states, and human-readable recovery paths.</p>
              </div>
            </Card>
            <Card className="feature-card">
              <CheckIcon width={18} height={18} />
              <div>
                <h3>Faster execution</h3>
                <p>Focused task flows with clear next actions, priorities, and due dates.</p>
              </div>
            </Card>
            <Card className="feature-card">
              <CalendarIcon width={18} height={18} />
              <div>
                <h3>Built for routine</h3>
                <p>Dashboard snapshots and onboarding that make coming back feel effortless.</p>
              </div>
            </Card>
          </div>
        </div>

        <Card elevated className="auth-panel">
          <div className="auth-panel-header">
            <div>
              <p className="eyebrow">Secure workspace</p>
              <h2>{mode === 'sign-up' ? 'Create your account' : mode === 'forgot-password' ? 'Reset your password' : 'Welcome back'}</h2>
              <p className="muted-copy">
                {mode === 'forgot-password'
                  ? 'We’ll send recovery instructions to your email.'
                  : 'Use your Supabase account or jump into the guided demo instantly.'}
              </p>
            </div>
            <div className="secure-badge">
              <ShieldIcon width={16} height={16} />
              <span>Encrypted auth</span>
            </div>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}
          {notice ? <div className="alert alert-success">{notice}</div> : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Work email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              error={inlineErrors.email ?? null}
            />

            {mode !== 'forgot-password' ? (
              <label className="field">
                <span className="field-label">Password</span>
                <span className={`field-control ${inlineErrors.password ? 'field-control-error' : ''}`}>
                  <input
                    className="field-input"
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
                    className="field-action"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
                  </button>
                </span>
                {inlineErrors.password ? <span className="field-error">{inlineErrors.password}</span> : null}
              </label>
            ) : null}

            <Button type="submit" fullWidth size="lg" disabled={isSubmitDisabled}>
              {loading
                ? 'Working...'
                : mode === 'sign-up'
                  ? 'Create account'
                  : mode === 'forgot-password'
                    ? 'Send reset instructions'
                    : 'Sign in'}
            </Button>
          </form>

          <div className="auth-actions">
            {mode === 'sign-in' ? (
              <>
                <button className="text-link" type="button" onClick={() => setMode('forgot-password')}>
                  Forgot password?
                </button>
                <button className="text-link" type="button" onClick={() => setMode('sign-up')}>
                  Need an account? Sign up
                </button>
              </>
            ) : null}

            {mode === 'sign-up' ? (
              <button className="text-link" type="button" onClick={() => setMode('sign-in')}>
                Already have an account? Sign in
              </button>
            ) : null}

            {mode === 'forgot-password' ? (
              <button className="text-link" type="button" onClick={() => setMode('sign-in')}>
                Back to sign in
              </button>
            ) : null}
          </div>

          <div className="demo-panel">
            <div>
              <p className="demo-title">Instant demo access</p>
              <p className="demo-copy">
                Use seeded workspace data instead of getting blocked by invalid credentials.
              </p>
            </div>
            <Button variant="secondary" onClick={onDemoAccess}>
              Open demo workspace
            </Button>
          </div>

          <p className="demo-credentials">
            Demo credentials: <strong>{DEMO_CREDENTIALS.email}</strong> / <strong>{DEMO_CREDENTIALS.password}</strong>
          </p>
        </Card>
      </section>
    </div>
  );
}
