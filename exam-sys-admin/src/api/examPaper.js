import { post } from '@/utils/request'

export const pageList = query => post('/api/admin/exam/paper/page', query)
export const taskExamPage = query => post('/api/admin/exam/paper/taskExamPage', query)
export const edit = query => post('/api/admin/exam/paper/edit', query)
export const select = id => post('/api/admin/exam/paper/select/' + id)
export const deletePaper = (id) => post(`/api/admin/exam/paper/delete/${id}`)
export const stats = (id) => post(`/api/admin/exam/paper/stats/${id}`)
