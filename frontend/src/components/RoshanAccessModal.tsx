import { FormEvent, useEffect, useRef, useState } from 'react';
import { writeRoshanSession } from '../lib/roshan';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface RoshanAccessModalProps {
  onClose: () => void;
  onVerified: () => void;
}

export function RoshanAccessModal({ onClose, onVerified }: RoshanAccessModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setCode('');
    setPassword('');
    setStep(1);
    setError(null);
    setSuccess(false);

    const timeout = window.setTimeout(() => inputRef.current?.focus(), 120);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
      window.clearTimeout(timeout);
    };
  }, [loading, onClose]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (step === 1) {
      if (code.trim() !== '050407') {
        setError('Invalid first passcode.');
        return;
      }

      setError(null);
      setStep(2);
      window.setTimeout(() => inputRef.current?.focus(), 30);
      return;
    }

    if (!password.trim()) {
      setError('Enter the second password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (password !== 'FUCKYOU') {
        throw new Error('Invalid second password.');
      }

      writeRoshanSession({
        token: 'local-roshan-access',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      });
      setSuccess(true);
      window.setTimeout(() => {
        onVerified();
      }, 450);
    } catch (nextError: unknown) {
      const message = (nextError as { message?: string }).message;
      setError(message ?? 'Invalid second password.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--backdrop)] px-4 py-6 backdrop-blur-sm"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="w-full max-w-md animate-[modal-in_220ms_ease-out] rounded-[32px] border border-[var(--border)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
          Private access
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          For Roshan
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          {step === 1
            ? 'Enter the first passcode to continue.'
            : 'Enter the second password to unlock the private dashboard.'}
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {step === 1 ? (
            <Input
              key="roshan-first-passcode"
              ref={inputRef}
              label="First passcode"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              name="roshan-first-passcode"
              spellCheck={false}
              maxLength={6}
              value={code}
              onChange={(event) => {
                const nextValue = event.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(nextValue);
                if (error) setError(null);
              }}
              placeholder="Enter first passcode"
              error={error}
              data-1p-ignore="true"
              data-lpignore="true"
              data-form-type="other"
            />
          ) : (
            <Input
              key="roshan-second-password"
              ref={inputRef}
              label="Second password"
              type="password"
              autoComplete="new-password"
              name="roshan-second-password"
              spellCheck={false}
              maxLength={24}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value.slice(0, 24));
                if (error) setError(null);
              }}
              placeholder="Enter second password"
              error={error}
              data-1p-ignore="true"
              data-lpignore="true"
              data-form-type="other"
            />
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                if (step === 2 && !loading) {
                  setStep(1);
                  setPassword('');
                  setError(null);
                  window.setTimeout(() => inputRef.current?.focus(), 30);
                  return;
                }

                onClose();
              }}
              disabled={loading}
            >
              {step === 2 ? 'Back' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={loading || (step === 1 ? code.length !== 6 : !password.trim())}
            >
              {success
                ? 'Access granted'
                : loading
                  ? 'Verifying...'
                  : step === 1
                    ? 'Continue'
                    : 'Unlock'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
