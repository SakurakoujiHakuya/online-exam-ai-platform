import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import * as questionApi from '@/api/question'
import { removeQuestion, removeQuestions, select as selectTag } from '@/api/tag'
import { fetchSubjects } from '@/store/slices/subjectSlice'
import { formatEnum } from '@/store/slices/enumItemSlice'
import TableTooltip from '@/components/TableTooltip'

const { Title, Text } = Typography

const TagQuestionList = () => {
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [searchParams] = useSearchParams()
    const tagId = Number(searchParams.get('id'))
    const { userInfo } = useSelector(state => state.user)
    const isAdmin = userInfo?.role === 3
    const subjects = useSelector(state => state.subject.subjects)
    const questionTypeEnum = useSelector(state => state.enumItem.exam.question.typeEnum)
    const editUrlEnum = useSelector(state => state.enumItem.exam.question.editUrlEnum)

    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0, showSizeChanger: true })
    const [tagName, setTagName] = useState('')
    const [selectedRowKeys, setSelectedRowKeys] = useState([])

    const subjectNameMap = useMemo(() => {
        const map = new Map()
        subjects.forEach(item => {
            map.set(item.id, item.userGroupName ? `${item.name} (${item.userGroupName})` : item.name)
        })
        return map
    }, [subjects])

    const fetchData = async (page = 1, size = 10) => {
        if (!tagId) {
            return
        }
        setLoading(true)
        try {
            const values = form.getFieldsValue()
            const res = await questionApi.pageList({
                pageIndex: page,
                pageSize: size,
                id: values.id || null,
                questionType: values.questionType || null,
                content: values.content || null,
                tagIds: [tagId],
                tagMatchMode: 1
            })
            if (res.code === 1) {
                setTableData(res.response.list || [])
                setPagination(prev => ({
                    ...prev,
                    current: res.response.pageNum,
                    total: res.response.total,
                    pageSize: size
                }))
                setSelectedRowKeys([])
            } else {
                message.error(res.message)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAdmin || !tagId) {
            return
        }
        dispatch(fetchSubjects())
        fetchData(1, pagination.pageSize)
        selectTag(tagId).then(res => {
            if (res.code === 1) {
                setTagName(res.response?.name || '')
            }
        })
    }, [dispatch, isAdmin, tagId])

    const editQuestion = record => {
        const urlItem = editUrlEnum.find(item => item.key === record.questionType)
        if (urlItem) {
            navigate(`${urlItem.value}?id=${record.id}`)
        }
    }

    const reloadCurrentPage = () => {
        const nextPage = tableData.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current
        fetchData(nextPage, pagination.pageSize)
    }

    const handleRemove = async questionId => {
        const res = await removeQuestion(tagId, questionId)
        if (res.code === 1) {
            message.success('已移出当前标签')
            reloadCurrentPage()
        } else {
            message.error(res.message)
        }
    }

    const handleBatchRemove = async () => {
        if (selectedRowKeys.length === 0) {
            return
        }
        const res = await removeQuestions(tagId, selectedRowKeys)
        if (res.code === 1) {
            message.success(`已批量移出 ${selectedRowKeys.length} 道题目`)
            reloadCurrentPage()
        } else {
            message.error(res.message)
        }
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
        return <Tag color={color}>{value || '0.0%'}</Tag>
    }

    if (!isAdmin) {
        return <Navigate to="/401" replace />
    }

    if (!tagId) {
        return <Navigate to="/education/tag/list" replace />
    }

    return (
        <div className="app-container">
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
                    <Space align="center">
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/education/tag/list')}>
                            返回标签列表
                        </Button>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>标签关联题目</Title>
                            <Text type="secondary">当前标签：{tagName || `标签 #${tagId}`}</Text>
                        </div>
                    </Space>
                    <Popconfirm
                        title={`确定将选中的 ${selectedRowKeys.length} 道题目移出标签“${tagName || tagId}”吗？`}
                        onConfirm={handleBatchRemove}
                        disabled={selectedRowKeys.length === 0}
                    >
                        <Button danger disabled={selectedRowKeys.length === 0}>
                            批量移出
                        </Button>
                    </Popconfirm>
                </Space>

                <Form form={form} layout="inline" onFinish={() => fetchData(1, pagination.pageSize)}>
                    <Form.Item name="id" label="题目ID">
                        <Input allowClear style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item name="questionType" label="题型">
                        <Select placeholder="题型" allowClear style={{ width: 140 }}>
                            {questionTypeEnum.map(item => (
                                <Select.Option key={item.key} value={item.key}>
                                    {item.value}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="content" label="题干">
                        <Input allowClear placeholder="输入题干关键词" style={{ width: 260 }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">查询</Button>
                    </Form.Item>
                </Form>

                <Table
                    loading={loading}
                    rowKey="id"
                    bordered
                    rowSelection={{
                        selectedRowKeys,
                        onChange: keys => setSelectedRowKeys(keys)
                    }}
                    dataSource={tableData}
                    pagination={pagination}
                    onChange={nextPagination => {
                        setPagination(nextPagination)
                        fetchData(nextPagination.current, nextPagination.pageSize)
                    }}
                    columns={[
                        { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
                        {
                            title: '学科',
                            dataIndex: 'subjectId',
                            key: 'subjectId',
                            width: 160,
                            render: value => subjectNameMap.get(value) || '-'
                        },
                        {
                            title: '题型',
                            dataIndex: 'questionType',
                            key: 'questionType',
                            width: 120,
                            render: value => formatEnum(questionTypeEnum, value)
                        },
                        {
                            title: '题干',
                            dataIndex: 'shortTitle',
                            key: 'shortTitle',
                            width: 520,
                            render: value => <TableTooltip text={value} maxWidth={480} />
                        },
                        {
                            title: '当前标签',
                            dataIndex: 'tagNames',
                            key: 'tagNames',
                            width: 160,
                            render: values => (values || []).length > 0
                                ? values.map(name => <Tag key={name}>{name}</Tag>)
                                : '-'
                        },
                        {
                            title: '\u505A\u9898\u6B21\u6570',
                            dataIndex: 'answerCount',
                            key: 'answerCount',
                            width: 120,
                            render: value => `${value ?? 0} \u6B21`
                        },
                        {
                            title: '\u6B63\u786E\u7387',
                            dataIndex: 'correctRate',
                            key: 'correctRate',
                            width: 120,
                            render: renderCorrectRate
                        },
                        { title: '分数', dataIndex: 'score', key: 'score', width: 80 },
                        { title: '难度', dataIndex: 'difficult', key: 'difficult', width: 80 },
                        { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
                        {
                            title: '操作',
                            key: 'action',
                            width: 220,
                            render: (_, record) => (
                                <Space>
                                    <Button size="small" onClick={() => editQuestion(record)}>编辑题目</Button>
                                    <Popconfirm
                                        title={`确定将题目 #${record.id} 移出标签“${tagName || tagId}”吗？`}
                                        onConfirm={() => handleRemove(record.id)}
                                    >
                                        <Button size="small" danger>移出标签</Button>
                                    </Popconfirm>
                                </Space>
                            )
                        }
                    ]}
                    scroll={{ x: 'max-content' }}
                />
            </Space>
        </div>
    )
}

export default TagQuestionList
