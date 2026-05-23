import { post } from '@/utils/request'

export const overview = () => post('/api/admin/collaboration/overview')
export const feedbackPage = query => post('/api/admin/collaboration/feedback/page', query)
export const feedbackDetail = id => post(`/api/admin/collaboration/feedback/detail/${id}`)
export const reviewFeedback = data => post('/api/admin/collaboration/feedback/review', data)
export const solutionPage = query => post('/api/admin/collaboration/solution/page', query)
export const solutionDetail = id => post(`/api/admin/collaboration/solution/detail/${id}`)
export const reviewSolution = data => post('/api/admin/collaboration/solution/review', data)
