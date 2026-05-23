import { post } from '@/utils/request'

export const pageList = query => post('/api/admin/task/page', query)
export const edit = query => post('/api/admin/task/edit', query)
export const select = id => post('/api/admin/task/select/' + id)
export const deleteTask = id => post('/api/admin/task/delete/' + id)
