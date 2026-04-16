import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ReflectionQuestion, ReflectionQuestionType } from '../types';
import {
  createReflectionQuestion,
  GRAPH_TYPE_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  REFLECTION_TEMPLATES,
} from '../lib/reflections';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';

interface CustomizeQuestionsModalProps {
  questions: ReflectionQuestion[];
  saving: boolean;
  onClose: () => void;
  onSave: (questions: ReflectionQuestion[]) => Promise<unknown>;
}

function isOptionType(type: ReflectionQuestionType) {
  return type === 'multi_select' || type === 'color_select';
}

function hasColorSelect(questions: ReflectionQuestion[]) {
  return questions.some((question) => question.type === 'color_select');
}

export function CustomizeQuestionsModal({
  questions,
  saving,
  onClose,
  onSave,
}: CustomizeQuestionsModalProps) {
  const [draftQuestions, setDraftQuestions] = useState<ReflectionQuestion[]>(questions);
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftQuestions(questions);
  }, [questions]);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const colorSelectLocked = useMemo(() => hasColorSelect(draftQuestions), [draftQuestions]);

  const updateQuestion = (questionId: string, updates: Partial<ReflectionQuestion>) => {
    setDraftQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) return question;
        const next = { ...question, ...updates };
        if (!isOptionType(next.type)) {
          next.options = [];
        }
        if (next.type === 'color_select') {
          next.graphType = 'dots';
          next.defaultColor = null;
        } else if (!next.defaultColor) {
          next.defaultColor = '#60A5FA';
        }
        return next;
      }),
    );
    if (error) setError('');
  };

  const handleTypeChange = (questionId: string, nextType: ReflectionQuestionType) => {
    updateQuestion(questionId, {
      type: nextType,
      options: isOptionType(nextType) ? [{ label: '', color: '#60A5FA' }] : [],
      graphType: nextType === 'color_select' ? 'dots' : 'line',
      defaultColor: nextType === 'color_select' ? null : '#60A5FA',
    });
  };

  const addQuestion = (template?: Partial<ReflectionQuestion>) => {
    if (template?.type === 'color_select' && colorSelectLocked) return;
    setDraftQuestions((current) => [...current, createReflectionQuestion(template)]);
  };

  const applyTemplate = (templateId: string) => {
    const template = REFLECTION_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;

    setDraftQuestions((current) => {
      const next = [...current];
      let colorSelectAlreadyUsed = hasColorSelect(current);

      for (const question of template.questions) {
        if (question.type === 'color_select' && colorSelectAlreadyUsed) continue;
        next.push(createReflectionQuestion(question));
        if (question.type === 'color_select') colorSelectAlreadyUsed = true;
      }

      return next;
    });
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!draftQuestions.length) {
      setError('Add at least one question before saving.');
      return;
    }

    if (draftQuestions.filter((question) => question.type === 'color_select').length > 1) {
      setError('Only one color select question is allowed.');
      return;
    }

    if (draftQuestions.some((question) => !question.questionText.trim())) {
      setError('Every question needs a prompt.');
      return;
    }

    if (
      draftQuestions.some(
        (question) =>
          isOptionType(question.type) &&
          question.options.some((option) => !option.label.trim() || !option.color.trim()),
      )
    ) {
      setError('Every option needs both a label and a color.');
      return;
    }

    try {
      await onSave(
        draftQuestions.map((question) => ({
          ...question,
          questionText: question.questionText.trim(),
          options: question.options.map((option) => ({
            label: option.label.trim(),
            color: option.color,
          })),
        })),
      );
      onClose();
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message ?? 'We couldn’t save your questions.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--backdrop)] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        elevated
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[36px] border-[var(--border-strong)] bg-[color:color-mix(in_srgb,var(--surface-primary)_94%,black)] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--text-muted)]">
              Reflection builder
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Customize Your Questions
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              Build a daily reflection flow that fits your system. Pick input types, assign graph
              colors, and keep one special color-select question for mood or state tracking.
            </p>
          </div>
          <button
            className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
            onClick={onClose}
            aria-label="Close customize questions modal"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {REFLECTION_TEMPLATES.map((template) => (
            <button
              key={template.id}
              className="rounded-[24px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-secondary)_86%,transparent)] p-4 text-left transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-tertiary)]"
              onClick={() => applyTemplate(template.id)}
              type="button"
            >
              <p className="text-base font-semibold text-[var(--text-primary)]">{template.name}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {template.description}
              </p>
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-fg)]">
            {error}
          </div>
        ) : null}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {draftQuestions.map((question, index) => {
            const anotherColorSelectExists =
              question.type !== 'color_select' && colorSelectLocked;

            return (
              <div
                key={question.id}
                className="rounded-[28px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-primary)_88%,transparent)] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Question {index + 1}
                  </p>
                  <div className="flex items-center gap-2">
                    {question.hasResponses ? (
                      <span className="rounded-full border border-[var(--warning-border)] bg-[var(--warning-bg)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--warning-fg)]">
                        Type locked
                      </span>
                    ) : null}
                    <button
                      className="rounded-full px-3 py-1 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                      onClick={() =>
                        setDraftQuestions((current) =>
                          current.filter((item) => item.id !== question.id),
                        )
                      }
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_220px_220px]">
                  <Input
                    ref={index === 0 ? titleRef : undefined}
                    label="Question text"
                    value={question.questionText}
                    onChange={(event) =>
                      updateQuestion(question.id, { questionText: event.target.value })
                    }
                    placeholder="What do you want to reflect on?"
                  />

                  <label className="grid gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      Type
                    </span>
                    <select
                      className="min-h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--focus-ring)] disabled:opacity-60"
                      value={question.type}
                      onChange={(event) =>
                        handleTypeChange(question.id, event.target.value as ReflectionQuestionType)
                      }
                      disabled={question.hasResponses}
                    >
                      {QUESTION_TYPE_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          disabled={option.value === 'color_select' && anotherColorSelectExists}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      Graph type
                    </span>
                    <select
                      className="min-h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--focus-ring)] disabled:opacity-60"
                      value={question.graphType}
                      onChange={(event) =>
                        updateQuestion(question.id, {
                          graphType: event.target.value as ReflectionQuestion['graphType'],
                        })
                      }
                      disabled={question.type === 'color_select'}
                    >
                      {GRAPH_TYPE_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          disabled={question.type === 'color_select' && option.value !== 'dots'}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {question.type !== 'color_select' ? (
                  <div className="mt-4 max-w-[220px]">
                    <Input
                      label="Default graph color"
                      type="color"
                      value={question.defaultColor ?? '#60A5FA'}
                      onChange={(event) =>
                        updateQuestion(question.id, { defaultColor: event.target.value })
                      }
                    />
                  </div>
                ) : null}

                {isOptionType(question.type) ? (
                  <div className="mt-5 rounded-[24px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-secondary)_82%,transparent)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Options</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          updateQuestion(question.id, {
                            options: [...question.options, { label: '', color: '#60A5FA' }],
                          })
                        }
                        type="button"
                      >
                        Add option
                      </Button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={`${question.id}_${optionIndex}`}
                          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_auto]"
                        >
                          <Input
                            label={`Option ${optionIndex + 1}`}
                            value={option.label}
                            onChange={(event) =>
                              updateQuestion(question.id, {
                                options: question.options.map((item, itemIndex) =>
                                  itemIndex === optionIndex
                                    ? { ...item, label: event.target.value }
                                    : item,
                                ),
                              })
                            }
                            placeholder="Worked Hard"
                          />
                          <Input
                            label="Color"
                            type="color"
                            value={option.color}
                            onChange={(event) =>
                              updateQuestion(question.id, {
                                options: question.options.map((item, itemIndex) =>
                                  itemIndex === optionIndex
                                    ? { ...item, color: event.target.value }
                                    : item,
                                ),
                              })
                            }
                          />
                          <div className="flex items-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateQuestion(question.id, {
                                  options: question.options.filter(
                                    (_item, itemIndex) => itemIndex !== optionIndex,
                                  ),
                                })
                              }
                              type="button"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => addQuestion()} type="button">
              Add question
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                addQuestion({
                  type: 'color_select',
                  graphType: 'dots',
                  options: [{ label: '', color: '#60A5FA' }],
                  defaultColor: null,
                })
              }
              disabled={colorSelectLocked}
              type="button"
            >
              Add color select
            </Button>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button disabled={saving} onClick={() => void handleSubmit()} type="submit">
              {saving ? 'Saving...' : 'Save questions'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
