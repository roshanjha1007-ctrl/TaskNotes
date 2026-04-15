import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === 'sign-up') {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          onAuthenticated();
        } else {
          setNotice('Account created. Check your email if confirmation is enabled, then sign in.');
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
      setError(nextError.message ?? 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'radial-gradient(circle at top, rgba(124,106,255,.22), transparent 35%), var(--bg)',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div>
          <p style={{ color: 'var(--text3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>
            Secure workspace
          </p>
          <h1 style={{ marginTop: 8, fontSize: 28, lineHeight: 1.1 }}>
            Sign in to your private task space
          </h1>
          <p style={{ marginTop: 10, color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>
            Tasks are now scoped per authenticated Supabase user.
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(245,101,101,.1)', color: 'var(--red)', fontSize: 13 }}>
            {error}
          </div>
        )}

        {notice && (
          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(62,207,142,.1)', color: 'var(--green)', fontSize: 13 }}>
            {notice}
          </div>
        )}

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text2)' }}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text2)' }}>
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)' }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 16px',
            border: 'none',
            borderRadius: 'var(--radius)',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {loading ? 'Working…' : mode === 'sign-in' ? 'Sign In' : 'Create Account'}
        </button>

        <button
          type="button"
          onClick={() => setMode((current) => current === 'sign-in' ? 'sign-up' : 'sign-in')}
          style={{ border: 'none', background: 'transparent', color: 'var(--text2)', fontSize: 13 }}
        >
          {mode === 'sign-in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
