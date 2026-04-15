import { cn } from '../lib/cn';
import { MoonIcon, SunIcon } from './ui/Icons';

interface ThemeToggleButtonProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
}

export function ThemeToggleButton({
  theme,
  onToggle,
  className = '',
}: ThemeToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition duration-200',
        'border-[var(--border)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]',
        className,
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}
    </button>
  );
}
