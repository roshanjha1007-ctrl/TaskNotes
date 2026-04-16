import client from './client';
import {
  ApiSuccess,
  DailyReflectionResponse,
  ReflectionQuestionSet,
  SaveQuestionsPayload,
  SaveResponsesPayload,
} from '../types';

export const reflectionsApi = {
  getQuestions: async (): Promise<ReflectionQuestionSet> => {
    const { data } = await client.get<ApiSuccess<ReflectionQuestionSet>>('/questions');
    return data.data;
  },

  saveQuestions: async (payload: SaveQuestionsPayload): Promise<ReflectionQuestionSet> => {
    const { data } = await client.post<ApiSuccess<ReflectionQuestionSet>>('/questions', payload);
    return data.data;
  },

  getResponses: async (startDate?: string, endDate?: string): Promise<DailyReflectionResponse[]> => {
    const { data } = await client.get<ApiSuccess<DailyReflectionResponse[]>>('/responses', {
      params: {
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
    });
    return data.data;
  },

  saveResponses: async (payload: SaveResponsesPayload): Promise<DailyReflectionResponse> => {
    const { data } = await client.post<ApiSuccess<DailyReflectionResponse>>('/responses', payload);
    return data.data;
  },
};
