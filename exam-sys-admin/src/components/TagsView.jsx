import React, { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CloseOutlined } from '@ant-design/icons'
import { addVisitedView, delVisitedView } from '@/store/slices/tagsViewSlice'
import './index.scss'

const TagsView = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const visitedViews = useSelector(state => state.tagsView.visitedViews)
    const scrollPaneRef = useRef(null)

    const routeTitles = {
        '/dashboard': '首页',
        '/user/student/list': '学生列表',
        '/user/student/edit': '学生编辑',
        '/user/admin/list': '教师列表',
        '/user/admin/edit': '教师编辑',
        '/exam/paper/list': '试卷列表',
        '/exam/paper/edit': '试卷编辑',
        '/exam/question/list': '题目列表',
        '/exam/question/edit/singleChoice': '单选题',
        '/exam/question/edit/multipleChoice': '多选题',
        '/exam/question/edit/trueFalse': '判断题',
        '/exam/question/edit/gapFilling': '填空题',
        '/exam/question/edit/shortAnswer': '简答题',
        '/exam/task/list': '考试列表',
        '/exam/task/edit': '考试编辑',
        '/education/subject/list': '学科列表',
        '/education/subject/edit': '编辑学科',
        '/education/tag/list': '标签列表',
        '/education/tag/edit': '编辑标签',
        '/education/tag/questions': '标签关联题目',
        '/answer/list': '成绩列表',
        '/answer/edit': '成绩编辑',
        '/answer/read': '查看详情',
        '/message/list': '消息列表',
        '/message/send': '发送消息',
        '/profile/index': '个人中心',
        '/log/user/list': '用户日志'
    }

    useEffect(() => {
        const title = routeTitles[location.pathname]
        if (title) {
            dispatch(addVisitedView({
                path: location.pathname,
                title,
                query: location.search
            }))
        }
    }, [dispatch, location])

    const isActive = path => path === location.pathname

    const closeSelectedTag = (event, tag) => {
        event.preventDefault()
        event.stopPropagation()
        dispatch(delVisitedView(tag))
        if (isActive(tag.path)) {
            const lastView = visitedViews[visitedViews.length - 2]
            navigate(lastView ? lastView.path : '/')
        }
    }

    return (
        <div className="tags-view-container">
            <div className="tags-view-wrapper" ref={scrollPaneRef}>
                {visitedViews.map(tag => (
                    <Link
                        key={tag.path}
                        to={tag.path + (tag.query || '')}
                        className={`tags-view-item ${isActive(tag.path) ? 'active' : ''}`}
                    >
                        {tag.title}
                        {!['/dashboard'].includes(tag.path) && (
                            <span className="close-icon" onClick={event => closeSelectedTag(event, tag)}>
                                <CloseOutlined style={{ fontSize: '10px', marginLeft: '5px' }} />
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default TagsView
