import { post } from '@/utils/request'

const registerApi = {
    register: (data) => post('/api/student/user/register', data)
}

export default registerApi
