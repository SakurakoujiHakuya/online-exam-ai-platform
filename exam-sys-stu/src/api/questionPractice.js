import { post } from '@/utils/request'

export default {
    pageList: (query) => post('/api/student/question/pageList', query),
    select: (id) => post(`/api/student/question/select/${id}`),
    buildPractice: (data) => post('/api/student/question/practice/build', data),
    buildPracticeByQuery: (query) => post('/api/student/question/practice/build-by-query', query)
}
