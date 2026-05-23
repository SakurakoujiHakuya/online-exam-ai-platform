import { post } from '@/utils/request'

export const page = query => post('/api/admin/examPaperAnswer/page', query)
export const read = id => post(`/api/admin/examPaperAnswer/read/${id}`)
export const edit = query => post('/api/admin/examPaperAnswer/edit', query)
