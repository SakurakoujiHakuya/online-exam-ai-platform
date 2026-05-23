import { post } from '@/utils/request'

export const getAiConfigList = () => post('/api/admin/ai/config/all')
export const selectAiConfig = id => post('/api/admin/ai/config/select/' + id)
export const editAiConfig = model => post('/api/admin/ai/config/edit', model)
export const deleteAiConfig = id => post('/api/admin/ai/config/delete/' + id)
export const setActiveAiConfig = id => post('/api/admin/ai/config/set-active/' + id)
