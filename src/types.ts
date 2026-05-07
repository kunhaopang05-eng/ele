export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
}

export interface Question {
  id: string;
  type: QuestionType;
  chapter: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  tags: string[];
}

export interface ExamSession {
  id: string;
  startTime: number;
  endTime?: number;
  questions: Question[];
  userAnswers: Record<string, any>;
  score?: number;
}

export const CHAPTERS = [
  '电力系统基本概念',
  '电力系统潮流计算',
  '电力系统故障分析',
  '电力系统稳态分析',
  '电力系统暂态分析',
  '无功功率平衡与电压调整',
  '有功功率平衡与频率调整',
];
