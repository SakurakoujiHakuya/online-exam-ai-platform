import { post } from '@/utils/request'

export const list = query => post('/api/admin/education/tag/list', query)
export const pageList = query => post('/api/admin/education/tag/page', query)
export const edit = query => post('/api/admin/education/tag/edit', query)
export const select = id => post('/api/admin/education/tag/select/' + id)
export const deleteTag = id => post('/api/admin/education/tag/delete/' + id)
export const removeQuestion = (tagId, questionId) => post(`/api/admin/education/tag/remove-question/${tagId}/${questionId}`)
export const removeQuestions = (tagId, questionIds) => post(`/api/admin/education/tag/remove-questions/${tagId}`, { questionIds })
