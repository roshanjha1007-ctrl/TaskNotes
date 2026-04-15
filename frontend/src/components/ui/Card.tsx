import { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-[var(--border)] bg-[var(--surface-primary)] shadow-[var(--shadow-sm)] backdrop-blur-sm',
        elevated && 'shadow-[var(--shadow-lg)]',
        className,
      )}
      {...props}
    />
  );
}
