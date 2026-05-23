import { post } from '@/utils/request'

export const index = () => post('/api/admin/dashboard/index')
