import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import {
  DailyReflectionAnswer,
  ReflectionGraphType,
  ReflectionOption,
  ReflectionQuestion,
  ReflectionQuestionType,
  SaveQuestionsBody,
  SaveResponsesBody,
} from '../types';
import { AppError } from '../middleware/errorHandler';

const QUESTION_TYPES: ReflectionQuestionType[] = [
  'number',
  'text',
  'rating',
  'yes_no',
  'multi_select',
  'color_select',
];
const GRAPH_TYPES: ReflectionGraphType[] = ['line', 'bar', 'dots'];

function getUserId(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Authentication required.');
  return req.user.id;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

function normalizeOption(option: unknown, index: number): ReflectionOption {
  if (!isPlainObject(option)) {
    throw new AppError(400, `Option ${index + 1} must be an object.`);
  }

  const label = typeof option.label === 'string' ? option.label.trim() : '';
  const color = typeof option.color === 'string' ? option.color.trim() : '';

  if (!label) throw new AppError(400, `Option ${index + 1} label is required.`);
  if (!isHexColor(color)) throw new AppError(400, `Option ${index + 1} must have a valid hex color.`);

  return { label, color };
}

function normalizeQuestion(question: unknown, index: number): ReflectionQuestion {
  if (!isPlainObject(question)) {
    throw new AppError(400, `Question ${index + 1} must be an object.`);
  }

  const id = typeof question.id === 'string' && question.id.trim() ? question.id.trim() : randomUUID();
  const questionText =
    typeof question.questionText === 'string' ? question.questionText.trim() : '';
  const type = typeof question.type === 'string' ? question.type : '';
  const graphType = typeof question.graphType === 'string' ? question.graphType : '';
  const defaultColorRaw =
    typeof question.defaultColor === 'string' ? question.defaultColor.trim() : '';
  const optionsRaw = Array.isArray(question.options) ? question.options : [];

  if (!questionText) throw new AppError(400, `Question ${index + 1} text is required.`);
  if (!QUESTION_TYPES.includes(type as ReflectionQuestionType)) {
    throw new AppError(400, `Question ${index + 1} has an invalid type.`);
  }
  if (!GRAPH_TYPES.includes(graphType as ReflectionGraphType)) {
    throw new AppError(400, `Question ${index + 1} has an invalid graph type.`);
  }

  const normalizedType = type as ReflectionQuestionType;
  const options = optionsRaw.map(normalizeOption);
  if ((normalizedType === 'multi_select' || normalizedType === 'color_select') && !options.length) {
    throw new AppError(400, `Question ${index + 1} needs at least one option.`);
  }
  if (normalizedType !== 'multi_select' && normalizedType !== 'color_select' && options.length) {
    throw new AppError(400, `Question ${index + 1} cannot include options for this type.`);
  }

  if (normalizedType === 'color_select' && graphType !== 'dots') {
    throw new AppError(400, 'Color select questions must use the dots graph type.');
  }

  const defaultColor =
    normalizedType === 'color_select'
      ? null
      : defaultColorRaw
        ? isHexColor(defaultColorRaw)
          ? defaultColorRaw
          : (() => {
              throw new AppError(400, `Question ${index + 1} must have a valid default hex color.`);
            })()
        : '#60A5FA';

  return {
    id,
    questionText,
    type: normalizedType,
    options,
    graphType: graphType as ReflectionGraphType,
    defaultColor,
  };
}

function parseQuestions(value: Prisma.JsonValue | null): ReflectionQuestion[] {
  return Array.isArray(value) ? (value as unknown as ReflectionQuestion[]) : [];
}

function parseAnswers(value: Prisma.JsonValue | null): DailyReflectionAnswer[] {
  return Array.isArray(value) ? (value as unknown as DailyReflectionAnswer[]) : [];
}

async function getQuestionResponseMap(userId: string) {
  const responses = await prisma.dailyResponse.findMany({
    where: { userId },
    select: { answers: true },
  });

  const responseMap = new Map<string, boolean>();
  for (const response of responses) {
    for (const answer of parseAnswers(response.answers)) {
      if (answer.questionId) {
        responseMap.set(answer.questionId, true);
      }
    }
  }

  return responseMap;
}

function assertQuestionRestrictions(
  questions: ReflectionQuestion[],
  existingQuestions: ReflectionQuestion[],
  responseMap: Map<string, boolean>,
) {
  const ids = new Set<string>();
  const colorSelectCount = questions.filter((question) => question.type === 'color_select').length;
  if (colorSelectCount > 1) {
    throw new AppError(400, 'Only one color select question is allowed.');
  }

  const existingById = new Map(existingQuestions.map((question) => [question.id, question]));

  for (const question of questions) {
    if (ids.has(question.id)) {
      throw new AppError(400, 'Each question must have a unique id.');
    }
    ids.add(question.id);

    const existing = existingById.get(question.id);
    if (existing && existing.type !== question.type && responseMap.get(question.id)) {
      throw new AppError(
        400,
        `Question "${existing.questionText}" cannot change type after responses have been saved.`,
      );
    }
  }
}

function normalizeAnswer(question: ReflectionQuestion, answer: unknown): DailyReflectionAnswer {
  if (!isPlainObject(answer)) {
    throw new AppError(400, `Answer for "${question.questionText}" must be an object.`);
  }

  const questionId = typeof answer.questionId === 'string' ? answer.questionId.trim() : '';
  if (questionId !== question.id) {
    throw new AppError(400, `Answer is linked to the wrong question for "${question.questionText}".`);
  }

  if (question.type === 'number') {
    const numeric = typeof answer.value === 'number' ? answer.value : Number(answer.value);
    if (!Number.isFinite(numeric)) throw new AppError(400, `"${question.questionText}" must be a number.`);
    return { questionId, value: numeric };
  }

  if (question.type === 'text') {
    const value = typeof answer.value === 'string' ? answer.value.trim() : '';
    if (!value) throw new AppError(400, `"${question.questionText}" cannot be empty.`);
    return { questionId, value };
  }

  if (question.type === 'rating') {
    const numeric = typeof answer.value === 'number' ? answer.value : Number(answer.value);
    if (!Number.isInteger(numeric) || numeric < 1 || numeric > 5) {
      throw new AppError(400, `"${question.questionText}" must be a rating from 1 to 5.`);
    }
    return { questionId, value: numeric };
  }

  if (question.type === 'yes_no') {
    if (typeof answer.value !== 'boolean') {
      throw new AppError(400, `"${question.questionText}" must be true or false.`);
    }
    return { questionId, value: answer.value };
  }

  if (question.type === 'multi_select') {
    if (!Array.isArray(answer.value)) {
      throw new AppError(400, `"${question.questionText}" must be an array.`);
    }
    const values = answer.value
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean);
    const allowed = new Set(question.options.map((option) => option.label));
    if (!values.length || values.some((value) => !allowed.has(value))) {
      throw new AppError(400, `"${question.questionText}" contains an invalid option.`);
    }
    return { questionId, value: Array.from(new Set(values)) };
  }

  if (typeof answer.value !== 'string' || !answer.value.trim()) {
    throw new AppError(400, `"${question.questionText}" must have a selected option.`);
  }
  const value = answer.value.trim();
  const match = question.options.find((option) => option.label === value);
  if (!match) {
    throw new AppError(400, `"${question.questionText}" contains an invalid color option.`);
  }
  return {
    questionId,
    value,
    selectedColor: match.color,
  };
}

export async function saveQuestions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const payload = req.body as SaveQuestionsBody;
    const incomingQuestions = Array.isArray(payload.questions) ? payload.questions : [];
    const questions = incomingQuestions.map(normalizeQuestion);

    const existingConfig = await prisma.userQuestionConfig.findUnique({ where: { userId } });
    const existingQuestions = parseQuestions(existingConfig?.questions ?? null);
    const responseMap = await getQuestionResponseMap(userId);

    assertQuestionRestrictions(questions, existingQuestions, responseMap);

    const config = await prisma.userQuestionConfig.upsert({
      where: { userId },
      update: { questions: questions as unknown as Prisma.JsonArray },
      create: {
        userId,
        questions: questions as unknown as Prisma.JsonArray,
      },
    });

    const questionsWithMeta = questions.map((question) => ({
      ...question,
      hasResponses: responseMap.get(question.id) ?? false,
    }));

    res.status(201).json({
      success: true,
      data: {
        id: config.id,
        userId,
        questions: questionsWithMeta,
      },
      message: 'Questions saved successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getQuestions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const [config, responseMap] = await Promise.all([
      prisma.userQuestionConfig.findUnique({ where: { userId } }),
      getQuestionResponseMap(userId),
    ]);

    const questions = parseQuestions(config?.questions ?? null).map((question) => ({
      ...question,
      hasResponses: responseMap.get(question.id) ?? false,
    }));

    res.json({
      success: true,
      data: {
        userId,
        questions,
      },
      message: 'Questions fetched successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function saveResponses(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const body = req.body as SaveResponsesBody;
    const date = typeof body.date === 'string' ? body.date.trim() : '';
    const answersInput = Array.isArray(body.answers) ? body.answers : [];

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError(400, 'date must be in YYYY-MM-DD format.');
    }

    const config = await prisma.userQuestionConfig.findUnique({ where: { userId } });
    const questions = parseQuestions(config?.questions ?? null);
    if (!questions.length) {
      throw new AppError(400, 'Create at least one custom question before saving responses.');
    }

    const questionById = new Map(questions.map((question) => [question.id, question]));
    const normalizedAnswers = answersInput.map((answer) => {
      const questionId = isPlainObject(answer) && typeof answer.questionId === 'string' ? answer.questionId : '';
      const question = questionById.get(questionId);
      if (!question) throw new AppError(400, 'Response contains an unknown question.');
      return normalizeAnswer(question, answer);
    });

    const uniqueIds = new Set(normalizedAnswers.map((answer) => answer.questionId));
    if (uniqueIds.size !== normalizedAnswers.length) {
      throw new AppError(400, 'Each question can only be answered once per day.');
    }

    const response = await prisma.dailyResponse.upsert({
      where: { userId_date: { userId, date } },
      update: { answers: normalizedAnswers as unknown as Prisma.JsonArray },
      create: {
        userId,
        date,
        answers: normalizedAnswers as unknown as Prisma.JsonArray,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: response.id,
        userId,
        date: response.date,
        answers: normalizedAnswers,
      },
      message: 'Responses saved successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getResponses(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const startDate =
      typeof req.query.startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.startDate)
        ? req.query.startDate
        : undefined;
    const endDate =
      typeof req.query.endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.endDate)
        ? req.query.endDate
        : undefined;

    const responses = await prisma.dailyResponse.findMany({
      where: {
        userId,
        ...(startDate || endDate
          ? {
              date: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
      orderBy: { date: 'asc' },
    });

    res.json({
      success: true,
      data: responses.map((response: (typeof responses)[number]) => ({
        id: response.id,
        userId,
        date: response.date,
        answers: parseAnswers(response.answers),
      })),
      message: 'Responses fetched successfully.',
    });
  } catch (error) {
    next(error);
  }
}
