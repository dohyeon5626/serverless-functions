import axios from 'axios';
import AppError from '../routes/exception';

export interface UserInfo {
  tier: number;
  [key: string]: unknown;
}

export interface ProblemItem {
  problemId: number;
  titleKo: string;
  level: number;
  averageTries: number;
  [key: string]: unknown;
}

export interface ProblemSearchResult {
  items: ProblemItem[];
  [key: string]: unknown;
}

const base = axios.create({
  baseURL: 'https://solved.ac/api/v3',
  headers: {
    'x-solvedac-language': 'ko',
  },
});

export const getUserInfo = async (userId: string): Promise<UserInfo> => {
  try {
    const { data } = await base.get<UserInfo>('/user/show', {
      params: { handle: userId },
    });
    return data;
  } catch (e: unknown) {
    const err = e as { response?: { status: number } };
    if (err.response?.status === 429) throw new AppError(429, 'Too Many Request');
    throw new AppError(404, 'User Not Found');
  }
};

export const getProblem = async (userId: string, tier: number): Promise<ProblemSearchResult> => {
  try {
    const minTier = tier > 1 ? tier - 4 : 1;
    const maxTier = tier < 30 ? tier + 4 : 30;
    const query = `(*${minTier}..${maxTier})(-@${userId})(lang:ko)`;

    const { data } = await base.get<ProblemSearchResult>('/search/problem', {
      params: { query, page: 1, sort: 'random', direction: 'asc' },
    });
    return data;
  } catch (e: unknown) {
    const err = e as { response?: { status: number } };
    if (err.response?.status === 429) throw new AppError(429, 'Too Many Request');
    throw new AppError(400, 'Bad Request');
  }
};
