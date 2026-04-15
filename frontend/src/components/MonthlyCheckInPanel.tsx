import { useEffect, useMemo, useState } from 'react';
import { Task } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input, Textarea } from './ui/Input';
import { CalendarDaysIcon, CheckIcon, SparkIcon } from './ui/Icons';

type SamosaChoice = 'idk' | 'who-cares' | 'i-still-care-i-guess' | 'genjutsu';

interface BaseCheckInEntry {
  date: string;
  totalTasks: number;
  completedTasks: number;
  reflection: string;
  score: number;
  quote: string;
}

interface RoshanCheckInEntry extends BaseCheckInEntry {
  samosaChoice: SamosaChoice;
}

type CheckInEntry = BaseCheckInEntry | RoshanCheckInEntry;

interface MonthlyCheckInPanelProps {
  storageKey: string;
  tasks: Task[];
  title: string;
  submitLabel: string;
  quoteLabel?: string;
  showSamosaQuestion?: boolean;
  compact?: boolean;
  onNotify?: (message: string, tone?: 'success' | 'error' | 'info') => void;
}

const APPRECIATION_QUOTES = [
  'You showed up for the day. That counts more than perfection.',
  'Progress logged. Keep going, one honest day at a time.',
  'Nice work. Small follow-through builds serious momentum.',
  'You checked in and closed the loop. That is real discipline.',
  'Good job staying honest with the day. Tomorrow gets easier from here.',
];

const SAMOSA_OPTIONS: Array<{ value: SamosaChoice; label: string; color: string }> = [
  { value: 'idk', label: 'idk', color: '#2563eb' },
  { value: 'who-cares', label: 'who cares', color: '#f97316' },
  { value: 'i-still-care-i-guess', label: 'i still care i guess', color: '#eab308' },
  { value: 'genjutsu', label: 'genjutsu of that level doesnt work on me', color: '#10b981' },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readEntries(storageKey: string) {
  if (typeof window === 'undefined') return [] as CheckInEntry[];

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as CheckInEntry[];
  } catch {
    window.localStorage.removeItem(storageKey);
    return [];
  }
}

function writeEntries(storageKey: string, entries: CheckInEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, JSON.stringify(entries));
}

function clampNumber(value: string, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
}

function getScore(totalTasks: number, completedTasks: number, reflection: string) {
  if (totalTasks <= 0) {
    return reflection.trim() ? 4 : 1;
  }

  const ratio = Math.min(1, completedTasks / totalTasks);
  const completionPoints = Math.round(ratio * 7);
  const reflectionPoints = reflection.trim().length >= 30 ? 3 : reflection.trim() ? 2 : 0;
  return Math.min(10, Math.max(1, completionPoints + reflectionPoints));
}

function getIntensityClass(score: number) {
  if (score >= 9) return 'bg-[var(--accent)]';
  if (score >= 7) return 'bg-[color:color-mix(in_srgb,var(--accent)_78%,white)]';
  if (score >= 5) return 'bg-[color:color-mix(in_srgb,var(--accent)_58%,white)]';
  if (score >= 3) return 'bg-[color:color-mix(in_srgb,var(--accent)_34%,white)]';
  if (score >= 1) return 'bg-[color:color-mix(in_srgb,var(--accent)_18%,white)]';
  return 'bg-[var(--surface-primary)]';
}

function getMonthCells(entries: CheckInEntry[]) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());
  const end = new Date(lastDay);
  end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
  const entryMap = new Map(entries.map((entry) => [entry.date, entry]));

  const cells = [];
  for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const dateKey = day.toISOString().slice(0, 10);
    cells.push({
      dateKey,
      dayNumber: day.getDate(),
      inCurrentMonth: day.getMonth() === month,
      entry: entryMap.get(dateKey) ?? null,
    });
  }

  return {
    monthLabel: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    cells,
  };
}

function getRandomQuote() {
  return APPRECIATION_QUOTES[Math.floor(Math.random() * APPRECIATION_QUOTES.length)] ?? APPRECIATION_QUOTES[0];
}

function getSamosaColor(choice?: SamosaChoice) {
  return SAMOSA_OPTIONS.find((option) => option.value === choice)?.color ?? 'transparent';
}

function isRoshanEntry(entry: CheckInEntry): entry is RoshanCheckInEntry {
  return 'samosaChoice' in entry;
}

export function MonthlyCheckInPanel({
  storageKey,
  tasks,
  title,
  submitLabel,
  quoteLabel = 'Appreciation note',
  showSamosaQuestion = false,
  compact = false,
  onNotify,
}: MonthlyCheckInPanelProps) {
  const [entries, setEntries] = useState<CheckInEntry[]>([]);
  const [totalTasks, setTotalTasks] = useState('');
  const [completedTasks, setCompletedTasks] = useState('');
  const [reflection, setReflection] = useState('');
  const [samosaChoice, setSamosaChoice] = useState<SamosaChoice>('idk');
  const [error, setError] = useState<string | null>(null);
  const todayKey = getTodayKey();

  useEffect(() => {
    const storedEntries = readEntries(storageKey).sort((left, right) => right.date.localeCompare(left.date));
    const todaysEntry = storedEntries.find((entry) => entry.date === todayKey) ?? null;
    const defaultTotal = tasks.length;
    const defaultCompleted = tasks.filter((task) => task.completed).length;

    setEntries(storedEntries);
    setTotalTasks(String(todaysEntry?.totalTasks ?? defaultTotal));
    setCompletedTasks(String(todaysEntry?.completedTasks ?? defaultCompleted));
    setReflection(todaysEntry?.reflection ?? '');

    if (showSamosaQuestion && todaysEntry && isRoshanEntry(todaysEntry)) {
      setSamosaChoice(todaysEntry.samosaChoice);
    }
  }, [showSamosaQuestion, storageKey, tasks, todayKey]);

  const todaysEntry = useMemo(
    () => entries.find((entry) => entry.date === todayKey) ?? null,
    [entries, todayKey],
  );
  const monthView = useMemo(() => getMonthCells(entries), [entries]);
  const latestQuote = todaysEntry?.quote ?? null;

  const handleSubmit = () => {
    const plannedCount = clampNumber(totalTasks, tasks.length);
    const completedCount = clampNumber(completedTasks, tasks.filter((task) => task.completed).length);
    const cleanedReflection = reflection.trim();

    if (!cleanedReflection) {
      setError('Please share what stuck with you today.');
      return;
    }

    if (completedCount > plannedCount) {
      setError('Completed tasks cannot be greater than planned tasks.');
      return;
    }

    const nextQuote = getRandomQuote();
    const score = getScore(plannedCount, completedCount, cleanedReflection);
    const nextEntry: CheckInEntry = showSamosaQuestion
      ? {
          date: todayKey,
          totalTasks: plannedCount,
          completedTasks: completedCount,
          reflection: cleanedReflection,
          score,
          quote: nextQuote,
          samosaChoice,
        }
      : {
          date: todayKey,
          totalTasks: plannedCount,
          completedTasks: completedCount,
          reflection: cleanedReflection,
          score,
          quote: nextQuote,
        };

    setError(null);
    setEntries((current) => {
      const next = [...current.filter((entry) => entry.date !== todayKey), nextEntry].sort((left, right) =>
        right.date.localeCompare(left.date),
      );
      writeEntries(storageKey, next);
      return next;
    });
    onNotify?.('Check-in saved successfully.', 'success');
  };

  return (
    <Card className="rounded-[32px] border-0 bg-[color:color-mix(in_srgb,var(--surface-primary)_84%,transparent)] p-6 backdrop-blur-xl sm:p-7">
      <div className={compact ? 'grid gap-6' : 'grid gap-6 xl:grid-cols-[1.1fr_0.9fr]'}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Daily check-in
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h3>

          <div className="mt-6 grid gap-5">
            <div className={compact ? 'grid gap-4 lg:grid-cols-2' : 'grid gap-4 sm:grid-cols-2'}>
              <Input
                label="How many tasks did you plan today?"
                type="number"
                min={0}
                value={totalTasks}
                onChange={(event) => {
                  setTotalTasks(event.target.value);
                  if (error) setError(null);
                }}
                placeholder="0"
              />
              <Input
                label="How many tasks did you complete?"
                type="number"
                min={0}
                value={completedTasks}
                onChange={(event) => {
                  setCompletedTasks(event.target.value);
                  if (error) setError(null);
                }}
                placeholder="0"
              />
            </div>

            {showSamosaQuestion ? (
              <fieldset className="grid gap-3">
                <legend className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  samosa?
                </legend>
                <div className="grid gap-3">
                  {SAMOSA_OPTIONS.map((option) => {
                    const active = samosaChoice === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-[22px] border px-4 py-3 transition ${
                          active
                            ? 'border-[var(--accent)] bg-[color:color-mix(in_srgb,var(--surface-secondary)_92%,transparent)]'
                            : 'border-[var(--border)] bg-[var(--surface-primary)]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="samosa-choice"
                          className="sr-only"
                          checked={active}
                          onChange={() => setSamosaChoice(option.value)}
                        />
                        <span
                          className="h-3.5 w-3.5 rounded-full"
                          style={{ backgroundColor: option.color }}
                          aria-hidden="true"
                        />
                        <span className="text-sm text-[var(--text-primary)]">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            <Textarea
              label="What stuck with you today?"
              value={reflection}
              onChange={(event) => {
                setReflection(event.target.value);
                if (error) setError(null);
              }}
              placeholder="Write what stayed with you, what felt blocked, or what went better than expected."
              error={error}
              rows={5}
            />

            <div className={`flex gap-3 ${compact ? 'flex-col lg:flex-row' : 'flex-wrap'}`}>
              <Button onClick={handleSubmit} className={compact ? 'w-full justify-center lg:w-auto' : ''}>
                <CheckIcon width={16} height={16} />
                {submitLabel}
              </Button>
              <div className={`rounded-2xl border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-secondary)_88%,transparent)] px-4 py-3 text-sm text-[var(--text-secondary)] ${compact ? 'w-full lg:flex-1' : ''}`}>
                Logged today: {todaysEntry ? `${todaysEntry.completedTasks}/${todaysEntry.totalTasks} tasks` : 'Not yet'}
              </div>
            </div>
          </div>
        </div>

        <div className={compact ? 'grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] lg:items-start' : ''}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Monthly graph
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{monthView.monthLabel}</p>
            </div>
          </div>

          <div className={`${compact ? 'mt-0 lg:col-span-2' : 'mt-5'} rounded-[28px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-secondary)_88%,transparent)] p-4`}>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <CalendarDaysIcon width={14} height={14} />
              This month
            </div>
            <div className={`grid grid-flow-col grid-rows-7 gap-2 pb-1 ${compact ? 'overflow-visible' : 'overflow-x-auto'}`}>
              {monthView.cells.map((cell) => {
                const entryChoice =
                  cell.entry && isRoshanEntry(cell.entry) ? cell.entry.samosaChoice : undefined;
                return (
                  <div
                    key={cell.dateKey}
                    className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border text-xs font-semibold ${
                      cell.inCurrentMonth
                        ? 'border-[var(--border)] text-[var(--text-primary)]'
                        : 'border-transparent text-[var(--text-muted)] opacity-45'
                    } ${cell.entry ? getIntensityClass(cell.entry.score) : 'bg-[var(--surface-primary)]'}`}
                    title={
                      cell.entry
                        ? `${cell.dateKey}: ${cell.entry.completedTasks}/${cell.entry.totalTasks} tasks`
                        : `${cell.dateKey}: no check-in`
                    }
                  >
                    <span>{cell.dayNumber}</span>
                    {entryChoice ? (
                      <span
                        className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/80"
                        style={{ backgroundColor: getSamosaColor(entryChoice) }}
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>

          </div>

          <div className={`${compact ? 'mt-0 h-full' : 'mt-5'} rounded-[24px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-primary)_76%,transparent)] p-4`}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[color:color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)]">
                <SparkIcon width={18} height={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{quoteLabel}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  {latestQuote ?? 'Submit today’s response to unlock an appreciation quote here.'}
                </p>
              </div>
            </div>
          </div>

          <div className={`${compact ? 'mt-0 h-full' : 'mt-4'} rounded-[24px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-primary)_76%,transparent)] p-4`}>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {todaysEntry ? 'Today’s note' : 'Waiting for today'}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {todaysEntry?.reflection ?? 'Your latest reflection will appear here after you submit the check-in.'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
