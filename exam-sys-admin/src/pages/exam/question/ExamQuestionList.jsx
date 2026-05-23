import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Form, Input, Select, Button, Table, Pagination, message, Popconfirm, Popover, Tag as AntTag } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import * as questionApi from '@/api/question'
import { fetchGroups } from '@/store/slices/groupSlice'
import { fetchSubjects } from '@/store/slices/subjectSlice'
import { formatEnum } from '@/store/slices/enumItemSlice'
import QuestionShow from './components/QuestionShow'
import TableTooltip from '@/components/TableTooltip'
import TagSelect from '@/components/TagSelect'
import useTagOptions from '@/hooks/useTagOptions'
import { PRACTICE_HIDDEN_TAG_NAME } from '@/utils/tag'
import './ExamQuestionList.css'

const QuestionList = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [total, setTotal] = useState(0)
    const subjects = useSelector(state => state.subject.subjects)
    const groups = useSelector(state => state.group.groups)
    const [subjectFilter, setSubjectFilter] = useState([])
    const [previewVisible, setPreviewVisible] = useState(false)
    const [previewQuestion, setPreviewQuestion] = useState(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [queryParam, setQueryParam] = useState({
        id: null,
        questionType: null,
        userGroupId: null,
        subjectId: null,
        questionSource: null,
        hideInPracticeCenter: null,
        tagIds: [],
        tagMatchMode: 1,
        pageIndex: 1,
        pageSize: 10
    })

    const questionTypeEnum = useSelector(state => state.enumItem.exam.question.typeEnum)
    const editUrlEnum = useSelector(state => state.enumItem.exam.question.editUrlEnum)
    const { tags: availableTags, loading: tagLoading } = useTagOptions()
    const filterTags = availableTags.filter(tag => tag.name !== PRACTICE_HIDDEN_TAG_NAME)
    const dispatch = useDispatch()

    const queryParamRef = useRef(queryParam)
    useEffect(() => {
        queryParamRef.current = queryParam
    }, [queryParam])

    const search = useCallback((page, size) => {
        const current = queryParamRef.current
        const params = {
            ...current,
            pageIndex: page ?? current.pageIndex,
            pageSize: size ?? current.pageSize
        }
        setLoading(true)
        questionApi.pageList(params).then(res => {
            if (res.code === 1) {
                setTableData(res.response.list || [])
                setTotal(res.response.total || 0)
            } else {
                message.error(res.message)
            }
        }).finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        dispatch(fetchGroups())
        dispatch(fetchSubjects())
        search(1, 10)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const onFinish = values => {
        const newParam = { ...queryParamRef.current, ...values, pageIndex: 1 }
        setQueryParam(newParam)
        queryParamRef.current = newParam
        search(1, newParam.pageSize)
    }

    const deleteQuestion = id => {
        questionApi.deleteQuestion(id).then(res => {
            if (res.code === 1) {
                message.success(res.message)
                search(queryParamRef.current.pageIndex, queryParamRef.current.pageSize)
            } else {
                message.error(res.message)
            }
        })
    }

    const adoptQuestion = id => {
        questionApi.adoptQuestion(id).then(res => {
            if (res.code === 1) {
                message.success('采纳成功，题目已移入教师题库')
                search(queryParamRef.current.pageIndex, queryParamRef.current.pageSize)
            } else {
                message.error(res.message)
            }
        })
    }

    const userGroupChange = value => {
        form.setFieldsValue({ subjectId: null })
        if (value) {
            setSubjectFilter(subjects.filter(data => data.userGroupId === value))
        } else {
            setSubjectFilter([])
        }
    }

    const subjectFormatter = subjectId => {
        const subject = subjects.find(item => item.id === subjectId)
        return subject ? `${subject.name} (${subject.userGroupName})` : ''
    }

    const editQuestion = record => {
        const urlItem = editUrlEnum.find(item => item.key === record.questionType)
        if (urlItem) {
            navigate(`${urlItem.value}?id=${record.id}`)
        }
    }

    const showQuestion = record => {
        setPreviewLoading(true)
        setPreviewVisible(true)
        questionApi.select(record.id).then(res => {
            if (res.code === 1) {
                setPreviewQuestion(res.response)
            } else {
                message.error(res.message)
            }
        }).finally(() => setPreviewLoading(false))
    }

    const renderCorrectRate = value => {
        const rate = Number.parseFloat(value || '0')
        let color = 'default'
        if (rate >= 80) {
            color = 'success'
        } else if (rate >= 60) {
            color = 'processing'
        } else if (rate > 0) {
            color = 'warning'
        }
        return <AntTag color={color}>{value || '0.0%'}</AntTag>
    }

    const renderPracticeVisibility = (_, record) => (
        record.hideInPracticeCenter
            ? <AntTag color="volcano">试题中心隐藏</AntTag>
            : <AntTag color="success">试题中心可见</AntTag>
    )

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        {
            title: '学科',
            dataIndex: 'subjectId',
            width: 160,
            render: text => subjectFormatter(text)
        },
        {
            title: '题型',
            dataIndex: 'questionType',
            width: 100,
            render: text => formatEnum(questionTypeEnum, text)
        },
        {
            title: '题干',
            dataIndex: 'shortTitle',
            width: 520,
            render: text => <TableTooltip text={text} maxWidth={480} />
        },
        {
            title: '标签',
            dataIndex: 'tagNames',
            width: 160,
            render: tagNames => (tagNames || []).length > 0
                ? tagNames.map(name => <AntTag key={name}>{name}</AntTag>)
                : '-'
        },
        {
            title: '试题中心',
            dataIndex: 'hideInPracticeCenter',
            width: 140,
            render: renderPracticeVisibility
        },
        {
            title: '\u505A\u9898\u6B21\u6570',
            dataIndex: 'answerCount',
            width: 120,
            render: value => `${value ?? 0} \u6B21`
        },
        {
            title: '\u6B63\u786E\u7387',
            dataIndex: 'correctRate',
            width: 120,
            render: renderCorrectRate
        },
        { title: '分数', dataIndex: 'score', width: 80 },
        { title: '难度', dataIndex: 'difficult', width: 80 },
        { title: '创建时间', dataIndex: 'createTime', width: 180 },
        {
            title: '操作',
            width: 300,
            render: (_, record) => (
                <>
                    <Button size="small" onClick={() => navigate(`/exam/question/stats/${record.id}`, { state: { title: record.shortTitle } })} style={{ marginRight: 8 }}>
                        统计
                    </Button>
                    <Button size="small" onClick={() => showQuestion(record)} style={{ marginRight: 8 }}>
                        预览
                    </Button>
                    {record.isAi === 1 && (
                        <Popconfirm title="确认采纳该题进入教师题库吗？" onConfirm={() => adoptQuestion(record.id)}>
                            <Button size="small" type="primary" style={{ marginRight: 8, backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                                采纳
                            </Button>
                        </Popconfirm>
                    )}
                    <Button size="small" onClick={() => editQuestion(record)} style={{ marginRight: 8 }}>
                        编辑
                    </Button>
                    <Popconfirm title="确认删除吗？" onConfirm={() => deleteQuestion(record.id)}>
                        <Button size="small" danger>
                            删除
                        </Button>
                    </Popconfirm>
                </>
            )
        }
    ]

    const addContent = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {editUrlEnum.map(item => (
                <Button key={item.key} type="dashed" onClick={() => navigate(item.value)}>
                    {item.name}
                </Button>
            ))}
        </div>
    )

    return (
        <div className="app-container question-list-page">
            <Form form={form} className="question-list-search" layout="inline" onFinish={onFinish} style={{ marginBottom: 16 }} initialValues={{ tagMatchMode: 1 }}>
                <Form.Item name="id" label="题目ID">
                    <Input allowClear style={{ width: 100 }} />
                </Form.Item>
                <Form.Item name="userGroupId" label="用户组">
                    <Select placeholder="用户组" onChange={userGroupChange} allowClear style={{ width: 120 }}>
                        {groups.map(item => (
                            <Select.Option key={item.userGroupId} value={item.userGroupId}>
                                {item.userGroupName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="subjectId" label="学科">
                    <Select placeholder="学科" allowClear style={{ width: 160 }}>
                        {subjectFilter.map(item => (
                            <Select.Option key={item.id} value={item.id}>
                                {`${item.name} (${item.userGroupName})`}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="questionSource" label="题库来源">
                    <Select placeholder="题库来源" allowClear style={{ width: 120 }}>
                        <Select.Option value={1}>教师题库</Select.Option>
                        <Select.Option value={2}>AI题库</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="questionType" label="题型">
                    <Select placeholder="题型" allowClear style={{ width: 120 }}>
                        {questionTypeEnum.map(item => (
                            <Select.Option key={item.key} value={item.key}>
                                {item.value}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="hideInPracticeCenter" label="试题中心状态">
                    <Select placeholder="全部状态" allowClear style={{ width: 140 }}>
                        <Select.Option value={0}>仅可见</Select.Option>
                        <Select.Option value={1}>仅隐藏</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="tagIds" label="标签">
                    <TagSelect tags={filterTags} loading={tagLoading} placeholder="按标签筛选" style={{ width: 220 }} />
                </Form.Item>
                <Form.Item name="tagMatchMode" label="匹配方式">
                    <Select style={{ width: 140 }}>
                        <Select.Option value={1}>任一匹配</Select.Option>
                        <Select.Option value={2}>全部匹配</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">查询</Button>
                    <Popover content={addContent} title="选择题型" trigger="click">
                        <Button type="primary" style={{ marginLeft: 8 }}>添加</Button>
                    </Popover>
                </Form.Item>
            </Form>

            <Table
                className="question-list-table"
                loading={loading}
                columns={columns}
                dataSource={tableData}
                rowKey="id"
                pagination={false}
                bordered
                scroll={{ x: 'max-content' }}
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Pagination
                    total={total}
                    current={queryParam.pageIndex}
                    pageSize={queryParam.pageSize}
                    onChange={(page, pageSize) => {
                        setQueryParam(prev => ({ ...prev, pageIndex: page, pageSize }))
                        search(page, pageSize)
                    }}
                    showSizeChanger
                    showQuickJumper
                />
            </div>

            <QuestionShow
                open={previewVisible}
                onClose={() => setPreviewVisible(false)}
                qType={previewQuestion?.questionType}
                question={previewQuestion}
                loading={previewLoading}
            />
        </div>
    )
}

export default QuestionList
