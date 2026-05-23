import { createSlice } from '@reduxjs/toolkit'

const INITIAL_STATE = {
    user: {
        sexEnum: [{ key: 1, value: '男' }, { key: 2, value: '女' }],
        statusEnum: [{ key: 1, value: '启用' }, { key: 2, value: '禁用' }],
        levelEnum: [
            { key: 1, value: '用户组1' }, { key: 2, value: '用户组2' }, { key: 3, value: '用户组3' },
            { key: 4, value: '用户组4' }, { key: 5, value: '用户组5' }, { key: 6, value: '用户组6' },
            { key: 7, value: '用户组7' }, { key: 8, value: '用户组8' }, { key: 9, value: '用户组9' },
            { key: 10, value: '用户组10' }, { key: 11, value: '用户组11' }, { key: 12, value: '用户组12' }
        ],
        roleEnum: [{ key: 1, value: '学生' }, { key: 2, value: '老师' }, { key: 3, value: '管理员' }],
        statusTag: [{ key: 1, value: 'success' }, { key: 2, value: 'error' }],
        statusBtn: [{ key: 1, value: '禁用' }, { key: 2, value: '启用' }]
    },
    exam: {
        examPaper: {
            paperTypeEnum: [
                { key: 1, value: '固定试卷' },
                { key: 6, value: '考试试卷' },
                { key: 7, value: 'AI练习试卷' },
                { key: 8, value: '自选练习试卷' }
            ]
        },
        question: {
            typeEnum: [
                { key: 1, value: '单选题' }, { key: 2, value: '多选题' }, { key: 3, value: '判断题' },
                { key: 4, value: '填空题' }, { key: 5, value: '简答题' }
            ],
            editUrlEnum: [
                { key: 1, value: '/exam/question/edit/singleChoice', name: '单选题' },
                { key: 2, value: '/exam/question/edit/multipleChoice', name: '多选题' },
                { key: 3, value: '/exam/question/edit/trueFalse', name: '判断题' },
                { key: 4, value: '/exam/question/edit/gapFilling', name: '填空题' },
                { key: 5, value: '/exam/question/edit/shortAnswer', name: '简答题' }
            ]
        }
    }
}

const enumItemSlice = createSlice({
    name: 'enumItem',
    initialState: INITIAL_STATE,
    reducers: {}
})

export const formatEnum = (array, key) => {
    for (const item of array) {
        if (item.key === key) {
            return item.value
        }
    }
    return null
}

export default enumItemSlice.reducer
