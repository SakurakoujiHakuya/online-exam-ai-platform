import { post } from '@/utils/request';

export const generateQuestion = (data) => post('/api/admin/ai/generate/question', data);
export const generateAnalyze = (data) => post('/api/admin/ai/generate/analyze', data);
export const generateStats = (data) => post('/api/admin/ai/generate/stats', data, { timeout: 120000 });
export const generatePaper = (data) => post('/api/admin/ai/generate/paper', data, { timeout: 120000 });
export const getStudentLearningAnalysis = (studentId, data) => post('/api/admin/ai/learning-analysis/student/' + studentId, data || {}, { timeout: 120000 });
