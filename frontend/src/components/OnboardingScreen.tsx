import { FormEvent, useState } from 'react';
import { WorkspaceUser } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { SparkIcon } from './ui/Icons';

interface OnboardingScreenProps {
  user: WorkspaceUser;
  onComplete: (profile: { name: string; focus: string }) => void;
}

export function OnboardingScreen({ user, onComplete }: OnboardingScreenProps) {
  const [name, setName] = useState(user.name === 'Product Demo' ? 'Avery' : user.name);
  const [focus, setFocus] = useState('Plan weekly priorities');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onComplete({
      name: name.trim() || 'Teammate',
      focus: focus.trim() || 'Run the day with less friction',
    });
  };

  return (
    <div className="onboarding-shell">
      <Card elevated className="onboarding-card">
        <div className="brand-mark">
          <SparkIcon width={20} height={20} />
        </div>
        <p className="eyebrow">Quick setup</p>
        <h1>Let’s tailor your workspace before you dive in.</h1>
        <p className="muted-copy">
          A short setup improves copy, dashboard messaging, and the overall product feel for your session.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="What should we call you?" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required />
          <Input
            label="What’s the main job for this workspace?"
            value={focus}
            onChange={(event) => setFocus(event.target.value)}
            placeholder="Example: Ship this week’s launch checklist"
            required
          />
          <Button type="submit" fullWidth size="lg">
            Enter workspace
          </Button>
        </form>
      </Card>
    </div>
  );
}
