import { useCallback, useEffect, useState } from 'react';
import { reflectionsApi } from '../api/reflections';
import { DailyReflectionResponse, ReflectionQuestion } from '../types';

function getRangeStart(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function getRangeEnd() {
  return new Date().toISOString().slice(0, 10);
}

export function useReflectionData(enabled = true) {
  const [questions, setQuestions] = useState<ReflectionQuestion[]>([]);
  const [responses, setResponses] = useState<DailyReflectionResponse[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [savingResponse, setSavingResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    try {
      const [questionSet, responseList] = await Promise.all([
        reflectionsApi.getQuestions(),
        reflectionsApi.getResponses(getRangeStart(59), getRangeEnd()),
      ]);
      setQuestions(questionSet.questions);
      setResponses(responseList);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message ?? 'Failed to load your custom questions.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveQuestions = async (nextQuestions: ReflectionQuestion[]) => {
    setSavingQuestions(true);
    setError(null);

    try {
      const result = await reflectionsApi.saveQuestions({ questions: nextQuestions });
      setQuestions(result.questions);
      return result.questions;
    } finally {
      setSavingQuestions(false);
    }
  };

  const saveResponse = async (response: DailyReflectionResponse) => {
    setSavingResponse(true);
    setError(null);

    try {
      const saved = await reflectionsApi.saveResponses(response);
      setResponses((current) => {
        const next = [...current.filter((entry) => entry.date !== saved.date), saved];
        return next.sort((left, right) => left.date.localeCompare(right.date));
      });
      return saved;
    } finally {
      setSavingResponse(false);
    }
  };

  return {
    questions,
    responses,
    loading,
    savingQuestions,
    savingResponse,
    error,
    refresh: load,
    saveQuestions,
    saveResponse,
  };
}
