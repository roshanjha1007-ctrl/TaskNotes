import { useEffect, useMemo, useState } from 'react';
import { DailyReflectionResponse, ReflectionQuestion } from '../types';
import { getAnswerForQuestion, getTodayKey } from '../lib/reflections';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input, Textarea } from './ui/Input';

interface DynamicCheckInPanelProps {
  questions: ReflectionQuestion[];
  responses: DailyReflectionResponse[];
  saving: boolean;
  onSave: (response: DailyReflectionResponse) => Promise<unknown>;
  onCustomize: () => void;
  onNotify?: (message: string, tone?: 'success' | 'error' | 'info') => void;
}

type FormValues = Record<string, unknown>;

function isEmptyValue(value: unknown) {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return !value.trim();
  return value === null || value === undefined;
}

export function DynamicCheckInPanel({
  questions,
  responses,
  saving,
  onSave,
  onCustomize,
  onNotify,
}: DynamicCheckInPanelProps) {
  const [values, setValues] = useState<FormValues>({});
  const [error, setError] = useState<string | null>(null);
  const todayKey = getTodayKey();

  const todaysResponse = useMemo(
    () => responses.find((response) => response.date === todayKey),
    [responses, todayKey],
  );

  useEffect(() => {
    const nextValues = questions.reduce<FormValues>((acc, question) => {
      const answer = getAnswerForQuestion(todaysResponse, question.id);
      if (answer) {
        acc[question.id] = answer.value;
        return acc;
      }

      acc[question.id] =
        question.type === 'multi_select' ? [] : question.type === 'yes_no' ? null : '';
      return acc;
    }, {});
    setValues(nextValues);
  }, [questions, todaysResponse]);

  const handleSubmit = async () => {
    if (!questions.length) {
      onCustomize();
      return;
    }

    const answers = questions
      .map((question) => ({
        questionId: question.id,
        value: values[question.id],
      }))
      .filter((answer) => !isEmptyValue(answer.value));

    if (!answers.length) {
      setError('Answer at least one question before saving today’s check-in.');
      return;
    }

    try {
      await onSave({ date: todayKey, answers });
      setError(null);
      onNotify?.('Daily reflection saved.', 'success');
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message ?? 'We couldn’t save today’s reflection.');
      onNotify?.(err.message ?? 'We couldn’t save today’s reflection.', 'error');
    }
  };

  return (
    <Card className="rounded-[32px] border-0 bg-[color:color-mix(in_srgb,var(--surface-primary)_84%,transparent)] p-6 backdrop-blur-xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Daily check-in
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Reflect with your own prompts
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
            Your custom questions render here automatically, including number inputs, ratings,
            toggles, chips, and a single color-based state tracker.
          </p>
        </div>
        <Button variant="secondary" onClick={onCustomize}>
          Customize Your Questions
        </Button>
      </div>

      {!questions.length ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[color:color-mix(in_srgb,var(--surface-secondary)_72%,transparent)] p-6 text-sm leading-7 text-[var(--text-secondary)]">
          No custom questions yet. Start with a template or build your own reflection flow.
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {questions.map((question) => {
            const value = values[question.id];

            if (question.type === 'number') {
              return (
                <Input
                  key={question.id}
                  label={question.questionText}
                  type="number"
                  value={typeof value === 'number' || typeof value === 'string' ? String(value) : ''}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [question.id]: event.target.value === '' ? '' : Number(event.target.value),
                    }))
                  }
                  placeholder="0"
                />
              );
            }

            if (question.type === 'text') {
              return (
                <Textarea
                  key={question.id}
                  label={question.questionText}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [question.id]: event.target.value }))
                  }
                  rows={4}
                  placeholder="Write your reflection"
                />
              );
            }

            if (question.type === 'rating') {
              return (
                <div key={question.id}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    {question.questionText}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const ratingValue = index + 1;
                      const active = value === ratingValue;
                      return (
                        <button
                          key={ratingValue}
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                            active
                              ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--text-inverse)]'
                              : 'border-[var(--border)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                          }`}
                          onClick={() =>
                            setValues((current) => ({ ...current, [question.id]: ratingValue }))
                          }
                          type="button"
                        >
                          {ratingValue}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (question.type === 'yes_no') {
              return (
                <div key={question.id}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    {question.questionText}
                  </p>
                  <div className="mt-3 flex gap-3">
                    {[
                      { label: 'Yes', value: true },
                      { label: 'No', value: false },
                    ].map((option) => {
                      const active = value === option.value;
                      return (
                        <button
                          key={option.label}
                          className={`rounded-2xl border px-5 py-3 text-sm font-medium transition ${
                            active
                              ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--text-inverse)]'
                              : 'border-[var(--border)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                          }`}
                          onClick={() =>
                            setValues((current) => ({ ...current, [question.id]: option.value }))
                          }
                          type="button"
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (question.type === 'multi_select') {
              const selectedValues = Array.isArray(value) ? (value as string[]) : [];
              return (
                <div key={question.id}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    {question.questionText}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.options.map((option) => {
                      const active = selectedValues.includes(option.label);
                      return (
                        <button
                          key={option.label}
                          className="rounded-full border px-4 py-2 text-sm font-medium transition"
                          style={{
                            borderColor: active ? option.color : 'var(--border)',
                            backgroundColor: active ? `${option.color}22` : 'var(--surface-primary)',
                            color: active ? option.color : 'var(--text-secondary)',
                          }}
                          onClick={() =>
                            setValues((current) => {
                              const currentValues = Array.isArray(current[question.id])
                                ? (current[question.id] as string[])
                                : [];
                              return {
                                ...current,
                                [question.id]: active
                                  ? currentValues.filter((item) => item !== option.label)
                                  : [...currentValues, option.label],
                              };
                            })
                          }
                          type="button"
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div key={question.id}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  {question.questionText}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {question.options.map((option) => {
                    const active = value === option.label;
                    return (
                      <button
                        key={option.label}
                        className="rounded-full border px-4 py-2 text-sm font-semibold transition"
                        style={{
                          borderColor: option.color,
                          backgroundColor: active ? option.color : `${option.color}22`,
                          color: active ? '#111827' : option.color,
                          boxShadow: active ? `0 0 0 3px ${option.color}33` : 'none',
                        }}
                        onClick={() =>
                          setValues((current) => ({ ...current, [question.id]: option.label }))
                        }
                        type="button"
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error ? (
        <div className="mt-5 rounded-2xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-fg)]">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end">
        <Button disabled={saving || !questions.length} onClick={() => void handleSubmit()}>
          {saving ? 'Saving...' : 'Save today’s check-in'}
        </Button>
      </div>
    </Card>
  );
}
