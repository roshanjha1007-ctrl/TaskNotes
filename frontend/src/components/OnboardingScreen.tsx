import { FormEvent, useState } from 'react';
import { WorkspaceUser } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ThemeToggleButton } from './ThemeToggleButton';
import { Input } from './ui/Input';
import { TaskNotesLogoIcon } from './ui/Icons';

interface OnboardingScreenProps {
  user: WorkspaceUser;
  onComplete: (profile: { name: string; focus: string }) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export function OnboardingScreen({ user, onComplete, theme, onThemeToggle }: OnboardingScreenProps) {
  const [name, setName] = useState(user.name === 'Product Demo' ? 'Avery' : user.name);
  const [focus, setFocus] = useState('Ship this week’s most important tasks');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onComplete({
      name: name.trim() || 'Teammate',
      focus: focus.trim() || 'Run the day with less friction',
    });
  };

  return (
    <div className="min-h-screen bg-transparent px-4 py-4 text-[var(--text-primary)]">
      <div className="mx-auto flex max-w-[1800px] justify-end pb-4">
        <ThemeToggleButton theme={theme} onToggle={onThemeToggle} />
      </div>
      <div className="flex min-h-[calc(100vh-5.5rem)] items-center justify-center">
        <Card elevated className="w-full max-w-3xl rounded-[36px] p-6 sm:p-8">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[var(--surface-inverse)] p-2.5 text-[var(--text-inverse)] shadow-[var(--shadow-md)]">
            <TaskNotesLogoIcon width={56} height={56} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">Quick setup</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance text-[var(--text-primary)]">
            Let’s tune your workspace before you dive in.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
            We’ll use this to personalize dashboard copy, activity prompts, and your daily summary.
          </p>

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            <Input
              label="What should we call you?"
              value={name}
              autoFocus
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              required
              theme={theme}
            />
            <Input
              label="What is this workspace mainly for?"
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
              placeholder="Example: Run launch readiness and follow-ups"
              required
              theme={theme}
            />
            <Button type="submit" size="lg" fullWidth>
              Enter workspace
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
