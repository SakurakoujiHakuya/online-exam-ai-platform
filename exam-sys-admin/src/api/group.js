import { post } from '@/utils/request'

export const listGroups = () => post('/api/common/education/group/list')
export const pageGroups = query => post('/api/admin/education/group/page', query)
export const editGroup = query => post('/api/admin/education/group/edit', query)
export const selectGroup = id => post('/api/admin/education/group/select/' + id)
export const deleteGroup = id => post('/api/admin/education/group/delete/' + id)
