import { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      'border border-[var(--accent)] bg-[var(--accent)] text-[var(--text-inverse)] shadow-[var(--shadow-md)] hover:bg-[var(--accent-strong)] hover:border-[var(--accent-strong)] disabled:border-[var(--border)] disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-muted)]',
    secondary:
      'border border-[var(--border)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] disabled:text-[var(--text-muted)]',
    ghost:
      'border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] disabled:text-[var(--text-muted)]',
    danger:
      'border border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error-fg)] hover:brightness-[1.04] disabled:opacity-60',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-sm',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  );
}
