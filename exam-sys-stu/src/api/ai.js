import { post } from '@/utils/request'

export default {
    generatePaper: (data) => post('/api/student/ai/generatePaper', data, { timeout: 120000 }),
    getMyLearningAnalysis: (data) => post('/api/student/ai/learning-analysis/me', data || {}, { timeout: 120000 })
}
