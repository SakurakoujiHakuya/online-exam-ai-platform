import { post } from '@/utils/request'

export const getUserPageList = query => post('/api/admin/user/page/list', query)
export const getUserEventPageList = query => post('/api/admin/user/event/page/list', query)
export const createUser = query => post('/api/admin/user/edit', query)
export const selectUser = id => post('/api/admin/user/select/' + id)
export const getCurrentUser = () => post('/api/admin/user/current')
export const updateUser = query => post('/api/admin/user/update', query)
export const changeStatus = id => post('/api/admin/user/changeStatus/' + id)
export const deleteUser = id => post('/api/admin/user/delete/' + id)
export const selectByUserName = query => post('/api/admin/user/selectByUserName', query)
