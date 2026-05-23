import { post } from '@/utils/request'

export const pageList = query => post('/api/admin/message/page', query)
export const send = query => post('/api/admin/message/send', query)
