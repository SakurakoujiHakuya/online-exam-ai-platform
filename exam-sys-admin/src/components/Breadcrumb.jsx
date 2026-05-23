import React from 'react'
import { Breadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'

const BreadcrumbComponent = () => {
    const location = useLocation()
    const pathSnippets = location.pathname.split('/').filter(Boolean)

    const breadcrumbNameMap = {
        '/dashboard': '首页',
        '/user': '用户管理',
        '/user/student': '学生列表',
        '/user/student/list': '学生列表',
        '/user/student/edit': '学生编辑',
        '/user/admin': '教师管理',
        '/user/admin/list': '教师列表',
        '/user/admin/edit': '教师编辑',
        '/exam': '题库管理',
        '/exam/paper': '试卷管理',
        '/exam/paper/list': '试卷列表',
        '/exam/paper/edit': '试卷编辑',
        '/exam/paper/stats': '试卷统计',
        '/exam/question': '题目管理',
        '/exam/question/list': '题目列表',
        '/exam/question/stats': '题目统计',
        '/exam/question/edit': '题目编辑',
        '/exam/question/edit/singleChoice': '单选题',
        '/exam/question/edit/multipleChoice': '多选题',
        '/exam/question/edit/trueFalse': '判断题',
        '/exam/question/edit/gapFilling': '填空题',
        '/exam/question/edit/shortAnswer': '简答题',
        '/exam/task': '考试中心',
        '/exam/task/list': '考试列表',
        '/exam/task/edit': '考试安排',
        '/education': '教育管理',
        '/education/subject': '学科管理',
        '/education/subject/list': '学科列表',
        '/education/subject/edit': '编辑学科',
        '/education/tag': '标签管理',
        '/education/tag/list': '标签列表',
        '/education/tag/edit': '编辑标签',
        '/education/tag/questions': '标签关联题目',
        '/answer': '成绩管理',
        '/answer/list': '答卷列表',
        '/answer/edit': '批改答卷',
        '/answer/read': '查看答卷',
        '/message': '消息中心',
        '/message/list': '消息列表',
        '/message/send': '发送消息',
        '/profile': '个人中心',
        '/profile/index': '个人中心',
        '/log': '日志中心',
        '/log/user': '用户日志',
        '/log/user/list': '用户日志',
        '/log/abnormal': '异常行为',
        '/log/abnormal/list': '学生异常行为',
        '/config': '系统配置',
        '/config/ai': 'AI配置',
        '/ai-config': 'AI配置'
    }

    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
        let title = breadcrumbNameMap[url]

        if (!title && index === pathSnippets.length - 1) {
            if (location.state?.title) {
                title = location.state.title
            } else {
                return null
            }
        } else if (!title) {
            title = url
        }

        return {
            key: url,
            title: <span>{title}</span>,
            titleText: title
        }
    }).filter(Boolean).filter((item, index, self) => {
        if (index > 0 && item.titleText === self[index - 1].titleText) {
            return false
        }
        return true
    })

    const breadcrumbItems = [
        {
            key: 'home',
            title: <Link to="/"><HomeOutlined /> 首页</Link>
        }
    ].concat(extraBreadcrumbItems)

    const finalItems = location.pathname === '/dashboard'
        ? [{ key: 'home', title: '首页' }]
        : breadcrumbItems.filter(item => item.key !== '/dashboard')

    return <Breadcrumb items={finalItems} style={{ marginLeft: '10px', float: 'left' }} />
}

export default BreadcrumbComponent
