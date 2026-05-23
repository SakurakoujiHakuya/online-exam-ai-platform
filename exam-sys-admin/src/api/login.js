import { post } from '@/utils/request'

export const login = query => post('/api/user/login', query)

export const logout = query => post(`/api/user/logout`, query)
