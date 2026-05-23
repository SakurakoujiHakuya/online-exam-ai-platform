import { post } from '@/utils/request'

export const pageList = query => post('/api/admin/question/page', query)
export const adoptQuestion = id => post(`/api/admin/question/adopt/${id}`)
export const edit = query => post('/api/admin/question/edit', query)
export const select = id => post('/api/admin/question/select/' + id)
export const deleteQuestion = (id) => post(`/api/admin/question/delete/${id}`)
export const stats = (id) => post(`/api/admin/question/stats/${id}`)
