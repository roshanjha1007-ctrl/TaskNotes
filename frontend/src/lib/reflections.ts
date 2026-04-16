import {
  DailyReflectionAnswer,
  DailyReflectionResponse,
  ReflectionGraphType,
  ReflectionQuestion,
  ReflectionQuestionType,
} from '../types';

export const QUESTION_TYPE_OPTIONS: Array<{ value: ReflectionQuestionType; label: string }> = [
  { value: 'number', label: 'Number' },
  { value: 'text', label: 'Text' },
  { value: 'rating', label: 'Rating (1-5)' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'multi_select', label: 'Multi-select' },
  { value: 'color_select', label: 'Color select' },
];

export const GRAPH_TYPE_OPTIONS: Array<{ value: ReflectionGraphType; label: string }> = [
  { value: 'line', label: 'Line' },
  { value: 'bar', label: 'Bar' },
  { value: 'dots', label: 'Dots' },
];

export const REFLECTION_TEMPLATES: Array<{
  id: string;
  name: string;
  description: string;
  questions: Array<Partial<ReflectionQuestion>>;
}> = [
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Focus, completion, and momentum tracking.',
    questions: [
      {
        questionText: 'How focused did you feel today?',
        type: 'rating',
        graphType: 'line',
        defaultColor: '#38BDF8',
      },
      {
        questionText: 'How many deep-work blocks did you finish?',
        type: 'number',
        graphType: 'bar',
        defaultColor: '#22C55E',
      },
      {
        questionText: 'Which wins happened today?',
        type: 'multi_select',
        graphType: 'bar',
        defaultColor: '#F59E0B',
        options: [
          { label: 'Worked Hard', color: '#EF4444' },
          { label: 'Shipped Something', color: '#22C55E' },
          { label: 'Stayed Consistent', color: '#3B82F6' },
        ],
      },
    ],
  },
  {
    id: 'mood',
    name: 'Mood',
    description: 'Emotional trend plus a color-coded mood signal.',
    questions: [
      {
        questionText: 'How was your mood overall?',
        type: 'rating',
        graphType: 'line',
        defaultColor: '#A78BFA',
      },
      {
        questionText: 'How would you label the day?',
        type: 'color_select',
        graphType: 'dots',
        options: [
          { label: 'Calm', color: '#38BDF8' },
          { label: 'Driven', color: '#F97316' },
          { label: 'Happy', color: '#FACC15' },
          { label: 'Heavy', color: '#EF4444' },
        ],
      },
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness',
    description: 'Movement, recovery, and energy tracking.',
    questions: [
      {
        questionText: 'Did you train today?',
        type: 'yes_no',
        graphType: 'bar',
        defaultColor: '#14B8A6',
      },
      {
        questionText: 'How was your energy level?',
        type: 'rating',
        graphType: 'line',
        defaultColor: '#FB7185',
      },
      {
        questionText: 'What did you complete?',
        type: 'multi_select',
        graphType: 'bar',
        defaultColor: '#60A5FA',
        options: [
          { label: 'Workout', color: '#22C55E' },
          { label: 'Steps Goal', color: '#3B82F6' },
          { label: 'Recovery', color: '#F59E0B' },
        ],
      },
    ],
  },
];

export function createReflectionQuestion(
  overrides: Partial<ReflectionQuestion> = {},
): ReflectionQuestion {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    questionText: overrides.questionText ?? '',
    type: overrides.type ?? 'number',
    options: overrides.options ?? [],
    graphType: overrides.graphType ?? 'line',
    defaultColor: overrides.defaultColor ?? '#60A5FA',
    hasResponses: overrides.hasResponses ?? false,
  };
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getAnswerForQuestion(
  response: DailyReflectionResponse | undefined,
  questionId: string,
): DailyReflectionAnswer | undefined {
  return response?.answers.find((answer) => answer.questionId === questionId);
}

export function getNumericAnswerValue(question: ReflectionQuestion, answer?: DailyReflectionAnswer) {
  if (!answer) return null;

  if (question.type === 'number' || question.type === 'rating') {
    const value = Number(answer.value);
    return Number.isFinite(value) ? value : null;
  }

  if (question.type === 'yes_no') {
    return answer.value === true ? 1 : answer.value === false ? 0 : null;
  }

  if (question.type === 'multi_select') {
    return Array.isArray(answer.value) ? answer.value.length : null;
  }

  return null;
}
