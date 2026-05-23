import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Form, Input, Select, Button, Card, message, Modal, Table, Pagination } from 'antd'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import * as examPaperApi from '@/api/examPaper'
import { fetchGroups } from '@/store/slices/groupSlice'
import { fetchSubjects } from '@/store/slices/subjectSlice'
import * as questionApi from '@/api/question'
import { formatEnum } from '@/store/slices/enumItemSlice'
import QuestionShow from '../question/components/QuestionShow'
import TagSelect from '@/components/TagSelect'
import useTagOptions from '@/hooks/useTagOptions'
import useRouteLayoutRefresh from '@/hooks/useRouteLayoutRefresh'
import { PRACTICE_HIDDEN_TAG_NAME, splitTagSelection } from '@/utils/tag'
import '../editor-form.css'

const ExamPaperEdit = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const id = searchParams.get('id')
    const [form] = Form.useForm()
    const subjects = useSelector(state => state.subject.subjects)
    const groups = useSelector(state => state.group.groups)
    const [subjectFilter, setSubjectFilter] = useState([])
    const [titleItems, setTitleItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [previewQuestion, setPreviewQuestion] = useState(null)
    const [previewQuestionType, setPreviewQuestionType] = useState(null)
    const subjectsRef = useRef([])
    const { tags: availableTags, loading: tagLoading } = useTagOptions()

    const [questionModalVisible, setQuestionModalVisible] = useState(false)
    const [currentTitleIndex, setCurrentTitleIndex] = useState(null)
    const [questionQuery, setQuestionQuery] = useState({
        id: null,
        questionType: null,
        userGroupId: null,
        subjectId: null,
        questionSource: 1,
        tagIds: [],
        tagMatchMode: 1,
        pageIndex: 1,
        pageSize: 5
    })
    const [questionList, setQuestionList] = useState([])
    const [questionTotal, setQuestionTotal] = useState(0)
    const [questionLoading, setQuestionLoading] = useState(false)
    const [selectedQuestions, setSelectedQuestions] = useState([])

    const paperTypeEnum = useSelector(state => state.enumItem.exam.examPaper.paperTypeEnum)
    const questionTypeEnum = useSelector(state => state.enumItem.exam.question.typeEnum)
    const questionFilterTags = availableTags.filter(tag => tag.name !== PRACTICE_HIDDEN_TAG_NAME)

    useRouteLayoutRefresh([titleItems.length, questionModalVisible])

    useEffect(() => {
        subjectsRef.current = subjects
    }, [subjects])

    const dispatch = useDispatch()

    const userGroupChange = useCallback((value, resetSubject = true) => {
        if (resetSubject) {
            form.setFieldsValue({ subjectId: null })
        }
        if (value && subjectsRef.current.length > 0) {
            setSubjectFilter(subjectsRef.current.filter(data => data.userGroupId === value))
        } else {
            setSubjectFilter([])
        }
    }, [form])

    useEffect(() => {
        dispatch(fetchGroups())
        dispatch(fetchSubjects())

        const initialize = async () => {
            const routePaper = location.state?.paperVM
            if (routePaper) {
                form.setFieldsValue(routePaper)
                setTitleItems(routePaper.titleItems || [])
                if (routePaper.userGroupId) {
                    userGroupChange(routePaper.userGroupId, false)
                }
                return
            }

            if (!id) {
                return
            }

            setLoading(true)
            try {
                const res = await examPaperApi.select(id)
                if (res.code === 1) {
                    const data = res.response
                    form.setFieldsValue(data)
                    setTitleItems(data.titleItems || [])
                    if (data.userGroupId) {
                        userGroupChange(data.userGroupId, false)
                    }
                } else {
                    message.error(res.message)
                }
            } finally {
                setLoading(false)
            }
        }

        initialize()
    }, [dispatch, form, id, location.state, userGroupChange])

    useEffect(() => {
        const userGroupId = form.getFieldValue('userGroupId')
        if (userGroupId && subjects.length > 0) {
            setSubjectFilter(subjects.filter(data => data.userGroupId === userGroupId))
        }
    }, [form, subjects])

    const onFinish = values => {
        setLoading(true)
        const tagPayload = splitTagSelection(values.tagNames, availableTags)
        const submitData = { ...values, id, titleItems, ...tagPayload }

        examPaperApi.edit(submitData).then(res => {
            if (res.code === 1) {
                message.success(res.message)
                navigate('/exam/paper/list')
            } else {
                message.error(res.message)
            }
        }).catch(err => {
            message.error(err.message || '系统内部错误')
        }).finally(() => {
            setLoading(false)
        })
    }

    const addTitle = () => {
        setTitleItems([...titleItems, { name: '', questionItems: [] }])
    }

    const removeTitle = index => {
        const newItems = [...titleItems]
        newItems.splice(index, 1)
        setTitleItems(newItems)
    }

    const updateTitleName = (index, name) => {
        const newItems = [...titleItems]
        newItems[index].name = name
        setTitleItems(newItems)
    }

    const openQuestionModal = index => {
        setCurrentTitleIndex(index)
        const nextQuery = {
            ...questionQuery,
            userGroupId: form.getFieldValue('userGroupId'),
            subjectId: form.getFieldValue('subjectId'),
            pageIndex: 1
        }
        setQuestionQuery(nextQuery)
        setQuestionModalVisible(true)
        searchQuestions(1, nextQuery)
    }

    const searchQuestions = (page = 1, sourceQuery = null) => {
        setQuestionLoading(true)
        const baseQuery = sourceQuery || questionQuery
        const params = {
            ...baseQuery,
            pageIndex: page,
            userGroupId: form.getFieldValue('userGroupId'),
            subjectId: form.getFieldValue('subjectId')
        }
        questionApi.pageList(params).then(res => {
            if (res.code === 1) {
                setQuestionList(res.response.list || [])
                setQuestionTotal(res.response.total || 0)
                setQuestionQuery(params)
            } else {
                message.error(res.message)
            }
        }).finally(() => setQuestionLoading(false))
    }

    const handleQuestionSelect = () => {
        const newItems = [...titleItems]
        const currentQuestions = newItems[currentTitleIndex].questionItems
        const promises = selectedQuestions.map(questionId => questionApi.select(questionId))
        Promise.all(promises).then(results => {
            results.forEach(res => {
                if (res.code === 1) {
                    currentQuestions.push(res.response)
                }
            })
            setTitleItems(newItems)
            setQuestionModalVisible(false)
            setSelectedQuestions([])
        })
    }

    const removeQuestion = (titleIndex, questionIndex) => {
        const newItems = [...titleItems]
        newItems[titleIndex].questionItems.splice(questionIndex, 1)
        setTitleItems(newItems)
    }

    const renderPracticeVisibility = (_, record) => (
        record.hideInPracticeCenter
            ? <span style={{ color: '#d46b08', fontWeight: 500 }}>试题中心隐藏</span>
            : <span style={{ color: '#389e0d', fontWeight: 500 }}>试题中心可见</span>
    )

    const questionColumns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        {
            title: '题型',
            dataIndex: 'questionType',
            width: 90,
            render: text => formatEnum(questionTypeEnum, text)
        },
        {
            title: '标签',
            dataIndex: 'tagNames',
            width: 180,
            render: tagNames => (tagNames || []).join('、') || '-'
        },
        {
            title: '试题中心',
            dataIndex: 'hideInPracticeCenter',
            width: 120,
            render: renderPracticeVisibility
        },
        { title: '题干', dataIndex: 'shortTitle', width: 420, ellipsis: true }
    ]

    return (
        <div className="app-container exam-editor-page">
            <Form className="exam-editor-form" form={form} layout="vertical" onFinish={onFinish} initialValues={{ paperType: 1 }}>
                <Form.Item name="userGroupId" label="用户组" rules={[{ required: true, message: '请选择用户组' }]}>
                    <Select placeholder="用户组" onChange={val => userGroupChange(val)}>
                        {groups.map(item => (
                            <Select.Option key={item.userGroupId} value={item.userGroupId}>
                                {item.userGroupName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="subjectId" label="学科" rules={[{ required: true, message: '请选择学科' }]}>
                    <Select placeholder="学科">
                        {subjectFilter.map(item => (
                            <Select.Option key={item.id} value={item.id}>
                                {`${item.name} (${item.userGroupName})`}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="paperType" label="试卷类型" rules={[{ required: true, message: '请选择试卷类型' }]}>
                    <Select placeholder="试卷类型">
                        {paperTypeEnum.map(item => (
                            <Select.Option key={item.key} value={item.key}>
                                {item.value}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="name" label="试卷名称" rules={[{ required: true, message: '请输入试卷名称' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="tagNames" label="标签">
                    <TagSelect tags={availableTags} loading={tagLoading} allowCreate placeholder="选择或输入标签" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="suggestTime" label="建议时长" rules={[{ required: true, message: '请输入建议时长' }]}>
                    <Input suffix="分钟" />
                </Form.Item>

                {titleItems.map((item, index) => (
                    <Card
                        key={index}
                        title={`标题 ${index + 1}`}
                        extra={<Button type="link" danger onClick={() => removeTitle(index)}>删除</Button>}
                        style={{ marginBottom: 16 }}
                    >
                        <div style={{ display: 'flex', marginBottom: 16 }}>
                            <Input
                                value={item.name}
                                onChange={e => updateTitleName(index, e.target.value)}
                                placeholder="请输入标题名称"
                                style={{ marginRight: 16 }}
                            />
                            <Button type="primary" onClick={() => openQuestionModal(index)}>添加题目</Button>
                        </div>
                        {item.questionItems.map((question, questionIndex) => (
                            <div key={questionIndex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '8px 0' }}>
                                <div style={{ flex: 1 }}>
                                    {question.hideInPracticeCenter && (
                                        <div style={{ marginBottom: 4, color: '#d46b08', fontSize: 12, fontWeight: 500 }}>
                                            试题中心隐藏
                                        </div>
                                    )}
                                    <div dangerouslySetInnerHTML={{ __html: question.title }} />
                                </div>
                                <div>
                                    <Button type="link" onClick={() => { setPreviewQuestion(question); setPreviewQuestionType(question.questionType); setPreviewVisible(true) }}>
                                        预览
                                    </Button>
                                    <Button type="link" danger onClick={() => removeQuestion(index, questionIndex)}>
                                        删除
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </Card>
                ))}

                <Form.Item>
                    <Button type="dashed" onClick={addTitle} block style={{ marginBottom: 16 }}>
                        + 添加标题
                    </Button>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>提交</Button>
                    <Button onClick={() => navigate('/exam/paper/list')} style={{ marginLeft: 8 }}>取消</Button>
                </Form.Item>
            </Form>

            <Modal
                title="选择题目"
                open={questionModalVisible}
                onOk={handleQuestionSelect}
                onCancel={() => setQuestionModalVisible(false)}
                width={900}
            >
                <Form layout="inline" style={{ marginBottom: 16 }} initialValues={{ tagMatchMode: 1 }}>
                    <Form.Item label="ID">
                        <Input value={questionQuery.id} onChange={e => setQuestionQuery({ ...questionQuery, id: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="题型">
                        <Select value={questionQuery.questionType} onChange={val => setQuestionQuery({ ...questionQuery, questionType: val })} style={{ width: 120 }} allowClear>
                            {questionTypeEnum.map(item => (
                                <Select.Option key={item.key} value={item.key}>
                                    {item.value}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="标签">
                        <TagSelect
                            tags={questionFilterTags}
                            loading={tagLoading}
                            value={questionQuery.tagIds}
                            onChange={tagIds => setQuestionQuery(prev => ({ ...prev, tagIds }))}
                            placeholder="按标签筛选"
                            style={{ width: 220 }}
                        />
                    </Form.Item>
                    <Form.Item label="匹配方式">
                        <Select value={questionQuery.tagMatchMode} onChange={tagMatchMode => setQuestionQuery(prev => ({ ...prev, tagMatchMode }))} style={{ width: 140 }}>
                            <Select.Option value={1}>任一匹配</Select.Option>
                            <Select.Option value={2}>全部匹配</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" onClick={() => searchQuestions(1)}>查询</Button>
                    </Form.Item>
                </Form>
                <Table
                    rowSelection={{
                        type: 'checkbox',
                        onChange: selectedRowKeys => setSelectedQuestions(selectedRowKeys)
                    }}
                    columns={questionColumns}
                    dataSource={questionList}
                    rowKey="id"
                    pagination={false}
                    loading={questionLoading}
                    scroll={{ x: 'max-content' }}
                />
                <Pagination
                    total={questionTotal}
                    current={questionQuery.pageIndex}
                    pageSize={questionQuery.pageSize}
                    onChange={page => searchQuestions(page)}
                    style={{ marginTop: 16, textAlign: 'right' }}
                />
            </Modal>

            <QuestionShow
                open={previewVisible}
                onClose={() => setPreviewVisible(false)}
                qType={previewQuestionType}
                question={previewQuestion}
                loading={false}
            />
        </div>
    )
}

export default ExamPaperEdit
