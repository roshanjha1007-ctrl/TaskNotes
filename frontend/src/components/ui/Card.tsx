import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = false, className = '', ...props }: CardProps) {
  return <div className={['card', elevated ? 'card-elevated' : '', className].filter(Boolean).join(' ')} {...props} />;
}
