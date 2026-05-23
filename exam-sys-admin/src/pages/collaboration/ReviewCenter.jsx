import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Descriptions, Drawer, Form, Input, List, Pagination, Row, Select, Space, Statistic, Table, Tag, message } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSubjects } from '@/store/slices/subjectSlice'
import * as collaborationApi from '@/api/collaboration'
import TagSelect from '@/components/TagSelect'
import useTagOptions from '@/hooks/useTagOptions'

const statusOptions = [
    { label: '待审核', value: 1 },
    { label: '已采纳', value: 2 },
    { label: '已驳回', value: 3 },
    { label: '已合并', value: 4 }
]

const feedbackTypeOptions = ['题干表述不清', '答案有争议', '解析看不懂', '难度不匹配', '知识点标签可疑']

const ReviewCenter = () => {
    const dispatch = useDispatch()
    const subjects = useSelector(state => state.subject.subjects)
    const { tags, loading: tagLoading } = useTagOptions()

    const [overview, setOverview] = useState({})

    const [feedbackLoading, setFeedbackLoading] = useState(false)
    const [feedbackQuery, setFeedbackQuery] = useState({ pageIndex: 1, pageSize: 10, status: 1 })
    const [feedbackData, setFeedbackData] = useState([])
    const [feedbackTotal, setFeedbackTotal] = useState(0)
    const [feedbackDetailVisible, setFeedbackDetailVisible] = useState(false)
    const [feedbackDetailLoading, setFeedbackDetailLoading] = useState(false)
    const [feedbackDetail, setFeedbackDetail] = useState(null)
    const [feedbackReviewLoading, setFeedbackReviewLoading] = useState(false)
    const [feedbackForm] = Form.useForm()

    const [solutionLoading, setSolutionLoading] = useState(false)
    const [solutionQuery, setSolutionQuery] = useState({ pageIndex: 1, pageSize: 10, status: 1 })
    const [solutionData, setSolutionData] = useState([])
    const [solutionTotal, setSolutionTotal] = useState(0)
    const [solutionDetailVisible, setSolutionDetailVisible] = useState(false)
    const [solutionDetailLoading, setSolutionDetailLoading] = useState(false)
    const [solutionDetail, setSolutionDetail] = useState(null)
    const [solutionReviewLoading, setSolutionReviewLoading] = useState(false)
    const [solutionForm] = Form.useForm()

    useEffect(() => {
        dispatch(fetchSubjects())
        loadOverview()
    }, [dispatch])

    useEffect(() => {
        loadFeedbacks()
    }, [feedbackQuery.pageIndex, feedbackQuery.pageSize, feedbackQuery.status, feedbackQuery.subjectId, feedbackQuery.feedbackType])

    useEffect(() => {
        loadSolutions()
    }, [solutionQuery.pageIndex, solutionQuery.pageSize, solutionQuery.status, solutionQuery.subjectId])

    const loadOverview = async () => {
        const res = await collaborationApi.overview()
        if (res.code === 1) {
            setOverview(res.response || {})
        }
    }

    const loadFeedbacks = async () => {
        setFeedbackLoading(true)
        try {
            const res = await collaborationApi.feedbackPage(feedbackQuery)
            if (res.code === 1) {
                setFeedbackData(res.response.list || [])
                setFeedbackTotal(res.response.total || 0)
            }
        } finally {
            setFeedbackLoading(false)
        }
    }

    const loadSolutions = async () => {
        setSolutionLoading(true)
        try {
            const res = await collaborationApi.solutionPage(solutionQuery)
            if (res.code === 1) {
                setSolutionData(res.response.list || [])
                setSolutionTotal(res.response.total || 0)
            }
        } finally {
            setSolutionLoading(false)
        }
    }

    const openFeedbackDetail = async record => {
        setFeedbackDetailVisible(true)
        setFeedbackDetailLoading(true)
        try {
            const res = await collaborationApi.feedbackDetail(record.id)
            if (res.code === 1) {
                const detail = res.response
                setFeedbackDetail(detail)
                feedbackForm.setFieldsValue({
                    action: 2,
                    reviewComment: '',
                    updatedTitle: detail?.question?.title,
                    updatedAnalyze: detail?.question?.analyze,
                    tagIds: detail?.question?.tagIds || [],
                    newTagNamesText: ''
                })
            }
        } finally {
            setFeedbackDetailLoading(false)
        }
    }

    const openSolutionDetail = async record => {
        setSolutionDetailVisible(true)
        setSolutionDetailLoading(true)
        try {
            const res = await collaborationApi.solutionDetail(record.id)
            if (res.code === 1) {
                setSolutionDetail(res.response)
                solutionForm.setFieldsValue({
                    action: 2,
                    reviewComment: ''
                })
            }
        } finally {
            setSolutionDetailLoading(false)
        }
    }

    const submitFeedbackReview = async values => {
        if (!feedbackDetail?.feedback?.id) {
            return
        }
        setFeedbackReviewLoading(true)
        try {
            const res = await collaborationApi.reviewFeedback({
                feedbackId: feedbackDetail.feedback.id,
                action: values.action,
                reviewComment: values.reviewComment,
                updatedTitle: values.updatedTitle,
                updatedAnalyze: values.updatedAnalyze,
                tagIds: values.tagIds || [],
                newTagNames: (values.newTagNamesText || '')
                    .split(/[,，]/)
                    .map(item => item.trim())
                    .filter(Boolean)
            })
            if (res.code === 1) {
                message.success('反馈已处理')
                setFeedbackDetailVisible(false)
                loadOverview()
                loadFeedbacks()
            }
        } finally {
            setFeedbackReviewLoading(false)
        }
    }

    const submitSolutionReview = async values => {
        if (!solutionDetail?.contribution?.id) {
            return
        }
        setSolutionReviewLoading(true)
        try {
            const res = await collaborationApi.reviewSolution({
                contributionId: solutionDetail.contribution.id,
                action: values.action,
                reviewComment: values.reviewComment
            })
            if (res.code === 1) {
                message.success('学生思路已处理')
                setSolutionDetailVisible(false)
                loadOverview()
                loadSolutions()
            }
        } finally {
            setSolutionReviewLoading(false)
        }
    }

    const feedbackColumns = [
        { title: '题目', dataIndex: 'shortTitle', width: 360, ellipsis: true },
        { title: '学科', dataIndex: 'subjectName', width: 120 },
        { title: '学生', dataIndex: 'studentName', width: 120 },
        { title: '反馈类型', dataIndex: 'feedbackType', width: 140, render: text => <Tag color="blue">{text}</Tag> },
        { title: '模型分类', dataIndex: 'aiCategory', width: 140 },
        {
            title: '分析来源',
            dataIndex: 'analysisSourceLabel',
            width: 120,
            render: (_, record) => <Tag color={record.analysisSource === 'llm' ? 'geekblue' : 'default'}>{record.analysisSourceLabel || '规则兜底'}</Tag>
        },
        { title: '状态', dataIndex: 'statusName', width: 100 },
        { title: '提交时间', dataIndex: 'createTime', width: 180 },
        {
            title: '操作',
            width: 120,
            render: (_, record) => <Button type="link" onClick={() => openFeedbackDetail(record)}>审核详情</Button>
        }
    ]

    const solutionColumns = [
        { title: '题目', dataIndex: 'shortTitle', width: 360, ellipsis: true },
        { title: '学科', dataIndex: 'subjectName', width: 120 },
        { title: '学生', dataIndex: 'studentName', width: 120 },
        { title: '质量分', dataIndex: 'qualityScore', width: 100, render: value => <Tag color="purple">{value || 0}</Tag> },
        {
            title: '分析来源',
            dataIndex: 'analysisSourceLabel',
            width: 120,
            render: (_, record) => <Tag color={record.analysisSource === 'llm' ? 'geekblue' : 'default'}>{record.analysisSourceLabel || '规则兜底'}</Tag>
        },
        { title: '状态', dataIndex: 'statusName', width: 100 },
        { title: '提交时间', dataIndex: 'createTime', width: 180 },
        {
            title: '操作',
            width: 120,
            render: (_, record) => <Button type="link" onClick={() => openSolutionDetail(record)}>审核详情</Button>
        }
    ]

    return (
        <div className="app-container">
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Card><Statistic title="学生反馈数" value={overview.feedbackCount || 0} /></Card>
                </Col>
                <Col span={8}>
                    <Card><Statistic title="反馈采纳率" value={overview.feedbackAdoptRate || 0} suffix="%" precision={2} /></Card>
                </Col>
                <Col span={8}>
                    <Card><Statistic title="修订次数" value={overview.revisionCount || 0} /></Card>
                </Col>
                <Col span={8}>
                    <Card><Statistic title="标签修订次数" value={overview.tagRevisionCount || 0} /></Card>
                </Col>
                <Col span={8}>
                    <Card><Statistic title="推荐接受率" value={overview.recommendationAcceptRate || 0} suffix="%" precision={2} /></Card>
                </Col>
                <Col span={8}>
                    <Card><Statistic title="推荐有帮助率" value={overview.recommendationUsefulRate || 0} suffix="%" precision={2} /></Card>
                </Col>
            </Row>

            <Card title="题目反馈审核台" style={{ marginBottom: 16 }}>
                <Space wrap style={{ marginBottom: 16 }}>
                    <Select
                        placeholder="审核状态"
                        allowClear
                        style={{ width: 140 }}
                        options={statusOptions}
                        value={feedbackQuery.status}
                        onChange={value => setFeedbackQuery(prev => ({ ...prev, status: value, pageIndex: 1 }))}
                    />
                    <Select
                        placeholder="反馈类型"
                        allowClear
                        style={{ width: 180 }}
                        options={feedbackTypeOptions.map(item => ({ label: item, value: item }))}
                        value={feedbackQuery.feedbackType}
                        onChange={value => setFeedbackQuery(prev => ({ ...prev, feedbackType: value, pageIndex: 1 }))}
                    />
                    <Select
                        placeholder="学科"
                        allowClear
                        style={{ width: 180 }}
                        value={feedbackQuery.subjectId}
                        onChange={value => setFeedbackQuery(prev => ({ ...prev, subjectId: value, pageIndex: 1 }))}
                        options={subjects.map(item => ({ label: `${item.name} (${item.userGroupName})`, value: item.id }))}
                    />
                </Space>
                <Table columns={feedbackColumns} dataSource={feedbackData} loading={feedbackLoading} rowKey="id" pagination={false} scroll={{ x: 'max-content' }} />
                <div style={{ textAlign: 'right', marginTop: 16 }}>
                    <Pagination
                        current={feedbackQuery.pageIndex}
                        pageSize={feedbackQuery.pageSize}
                        total={feedbackTotal}
                        onChange={(page, pageSize) => setFeedbackQuery(prev => ({ ...prev, pageIndex: page, pageSize }))}
                    />
                </div>
            </Card>

            <Card title="学生优秀思路审核台">
                <Space wrap style={{ marginBottom: 16 }}>
                    <Select
                        placeholder="审核状态"
                        allowClear
                        style={{ width: 140 }}
                        options={statusOptions}
                        value={solutionQuery.status}
                        onChange={value => setSolutionQuery(prev => ({ ...prev, status: value, pageIndex: 1 }))}
                    />
                    <Select
                        placeholder="学科"
                        allowClear
                        style={{ width: 180 }}
                        value={solutionQuery.subjectId}
                        onChange={value => setSolutionQuery(prev => ({ ...prev, subjectId: value, pageIndex: 1 }))}
                        options={subjects.map(item => ({ label: `${item.name} (${item.userGroupName})`, value: item.id }))}
                    />
                </Space>
                <Table columns={solutionColumns} dataSource={solutionData} loading={solutionLoading} rowKey="id" pagination={false} scroll={{ x: 'max-content' }} />
                <div style={{ textAlign: 'right', marginTop: 16 }}>
                    <Pagination
                        current={solutionQuery.pageIndex}
                        pageSize={solutionQuery.pageSize}
                        total={solutionTotal}
                        onChange={(page, pageSize) => setSolutionQuery(prev => ({ ...prev, pageIndex: page, pageSize }))}
                    />
                </div>
            </Card>

            <Drawer
                title="反馈审核详情"
                width={720}
                open={feedbackDetailVisible}
                onClose={() => setFeedbackDetailVisible(false)}
                destroyOnClose
            >
                {feedbackDetailLoading ? null : feedbackDetail && (
                    <>
                        <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="题目">{feedbackDetail.feedback.shortTitle}</Descriptions.Item>
                            <Descriptions.Item label="学生">{feedbackDetail.feedback.studentName}</Descriptions.Item>
                            <Descriptions.Item label="反馈类型">{feedbackDetail.feedback.feedbackType}</Descriptions.Item>
                            <Descriptions.Item label="模型分类">{feedbackDetail.feedback.aiCategory}</Descriptions.Item>
                            <Descriptions.Item label="分析来源">
                                <Tag color={feedbackDetail.feedback.analysisSource === 'llm' ? 'geekblue' : 'default'}>
                                    {feedbackDetail.feedback.analysisSourceLabel || '规则兜底'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                        <Card
                            title="模型聚合建议"
                            size="small"
                            style={{ marginBottom: 16 }}
                            extra={<Tag color={feedbackDetail.aggregateSource === 'llm' ? 'geekblue' : 'default'}>{feedbackDetail.aggregateSourceLabel || '规则兜底'}</Tag>}
                        >
                            <p>{feedbackDetail.aggregateSummary}</p>
                            <p style={{ color: '#666', marginBottom: 0 }}>{feedbackDetail.aggregateSuggestion}</p>
                        </Card>
                        <Card title="题目内容" size="small" style={{ marginBottom: 16 }}>
                            <div dangerouslySetInnerHTML={{ __html: feedbackDetail.question?.title || '' }} />
                            <div style={{ marginTop: 12, color: '#666' }} dangerouslySetInnerHTML={{ __html: feedbackDetail.question?.analyze || '' }} />
                        </Card>
                        <Card title="相关反馈" size="small" style={{ marginBottom: 16 }}>
                            <List
                                dataSource={feedbackDetail.relatedFeedbacks || []}
                                renderItem={item => (
                                    <List.Item>
                                        <Space direction="vertical" size={4}>
                                            <Space wrap>
                                                <Tag>{item.studentName}</Tag>
                                                <Tag color="blue">{item.feedbackType}</Tag>
                                                <Tag>{item.createTime}</Tag>
                                            </Space>
                                            <div>{item.feedbackContent}</div>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </Card>
                        <Form form={feedbackForm} layout="vertical" onFinish={submitFeedbackReview}>
                            <Form.Item name="action" label="审核结果" rules={[{ required: true, message: '请选择审核结果' }]}>
                                <Select options={[
                                    { label: '采纳', value: 2 },
                                    { label: '驳回', value: 3 },
                                    { label: '合并处理', value: 4 }
                                ]} />
                            </Form.Item>
                            <Form.Item name="updatedTitle" label="修订后的题干">
                                <Input.TextArea rows={3} />
                            </Form.Item>
                            <Form.Item name="updatedAnalyze" label="修订后的解析">
                                <Input.TextArea rows={5} />
                            </Form.Item>
                            <Form.Item name="tagIds" label="保留/调整标签">
                                <TagSelect tags={tags} loading={tagLoading} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="newTagNamesText" label="新增标签（逗号分隔）">
                                <Input placeholder="例如：二次函数, 解题步骤" />
                            </Form.Item>
                            <Form.Item name="reviewComment" label="审核意见">
                                <Input.TextArea rows={3} />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={feedbackReviewLoading}>提交审核</Button>
                        </Form>
                    </>
                )}
            </Drawer>

            <Drawer
                title="学生思路审核详情"
                width={640}
                open={solutionDetailVisible}
                onClose={() => setSolutionDetailVisible(false)}
                destroyOnClose
            >
                {solutionDetailLoading ? null : solutionDetail && (
                    <>
                        <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="题目">{solutionDetail.contribution?.shortTitle}</Descriptions.Item>
                            <Descriptions.Item label="学生">{solutionDetail.contribution?.studentName}</Descriptions.Item>
                            <Descriptions.Item label="质量分">{solutionDetail.contribution?.qualityScore}</Descriptions.Item>
                            <Descriptions.Item label="模型建议">{solutionDetail.contribution?.aiSuggestion}</Descriptions.Item>
                            <Descriptions.Item label="分析来源">
                                <Tag color={solutionDetail.contribution?.analysisSource === 'llm' ? 'geekblue' : 'default'}>
                                    {solutionDetail.contribution?.analysisSourceLabel || '规则兜底'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                        <Card title="学生提交内容" size="small" style={{ marginBottom: 16 }}>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{solutionDetail.contribution?.content}</div>
                        </Card>
                        <Card title="题目参考" size="small" style={{ marginBottom: 16 }}>
                            <div dangerouslySetInnerHTML={{ __html: solutionDetail.question?.title || '' }} />
                            <div style={{ marginTop: 12, color: '#666' }} dangerouslySetInnerHTML={{ __html: solutionDetail.question?.analyze || '' }} />
                        </Card>
                        <Form form={solutionForm} layout="vertical" onFinish={submitSolutionReview}>
                            <Form.Item name="action" label="审核结果" rules={[{ required: true, message: '请选择审核结果' }]}>
                                <Select options={[
                                    { label: '采纳为优秀思路', value: 2 },
                                    { label: '驳回', value: 3 },
                                    { label: '合并处理', value: 4 }
                                ]} />
                            </Form.Item>
                            <Form.Item name="reviewComment" label="教师评语">
                                <Input.TextArea rows={4} />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={solutionReviewLoading}>提交审核</Button>
                        </Form>
                    </>
                )}
            </Drawer>
        </div>
    )
}

export default ReviewCenter
