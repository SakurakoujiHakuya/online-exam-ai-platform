import { post } from '@/utils/request'

export default {
    submitFeedback: (data) => post('/api/student/collaboration/feedback/submit', data),
    myFeedback: () => post('/api/student/collaboration/feedback/my'),
    submitSolution: (data) => post('/api/student/collaboration/solution/submit', data),
    adoptedSolutions: (questionId) => post(`/api/student/collaboration/question/${questionId}/adopted-solutions`),
    dailyRecommendation: () => post('/api/student/collaboration/recommendation/daily'),
    buildRecommendation: (data) => post('/api/student/collaboration/recommendation/build', data),
    rateRecommendation: (data) => post('/api/student/collaboration/recommendation/rate', data)
}
