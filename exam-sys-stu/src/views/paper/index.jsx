import React, { useEffect, useMemo, useState } from 'react'
import {
    Button,
    Card,
    Col,
    Empty,
    InputNumber,
    Modal,
    Pagination,
    Row,
    Select,
    Space,
    Table,
    Tabs,
    Tag,
    Typography,
    message
} from 'antd'
import { EyeOutlined, FileTextOutlined, PlayCircleOutlined, TagsOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import examPaperApi from '@/api/examPaper'
import questionPracticeApi from '@/api/questionPractice'
import subjectApi from '@/api/subject'
import tagApi from '@/api/tag'
import QuestionEdit from '@/views/exam/components/QuestionEdit'

const { Paragraph, Text, Title } = Typography

const PAPER_TYPES = [1, 7, 8]

const QUESTION_TYPE_OPTIONS = [
    { value: 1, label: '单选题' },
    { value: 2, label: '多选题' },
    { value: 3, label: '判断题' },
    { value: 4, label: '填空题' },
    { value: 5, label: '简答题' }
]

const QUESTION_TYPE_MAP = QUESTION_TYPE_OPTIONS.reduce((acc, item) => {
    acc[item.value] = item.label
    return acc
}, {})

const emptyAnswerByType = {
    1: { content: null },
    2: { contentArray: [] },
    3: { content: null },
    4: { contentArray: [] },
    5: { content: '' }
}

const defaultQuestionQuery = {
    pageIndex: 1,
    pageSize: 10,
    questionType: null,
    tagIds: [],
    tagMatchMode: 1
}

const PracticeCenter = () => {
    const navigate = useNavigate()
    const [messageApi, contextHolder] = message.useMessage()
    const [activeMode, setActiveMode] = useState('paper')
    const [subjects, setSubjects] = useState([])
    const [activeSubjectId, setActiveSubjectId] = useState(null)
    const [questionTagOptions, setQuestionTagOptions] = useState([])
    const [tagLoading, setTagLoading] = useState(false)
    const [paperLoading, setPaperLoading] = useState(false)
    const [questionLoading, setQuestionLoading] = useState(false)
    const [buildingSelected, setBuildingSelected] = useState(false)
    const [buildingFiltered, setBuildingFiltered] = useState(false)
    const [paperData, setPaperData] = useState([])
    const [paperTotal, setPaperTotal] = useState(0)
    const [questionData, setQuestionData] = useState([])
    const [questionTotal, setQuestionTotal] = useState(0)
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([])
    const [quickBuildCount, setQuickBuildCount] = useState(20)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [previewQuestion, setPreviewQuestion] = useState(null)
    const [paperQuery, setPaperQuery] = useState({ pageIndex: 1, pageSize: 10 })
    const [questionQuery, setQuestionQuery] = useState(defaultQuestionQuery)

    const tagIdsKey = useMemo(() => (questionQuery.tagIds || []).join(','), [questionQuery.tagIds])

    useEffect(() => {
        initSubjects()
    }, [])

    useEffect(() => {
        if (!activeSubjectId) {
            return
        }
        loadPapers()
    }, [activeSubjectId, paperQuery.pageIndex, paperQuery.pageSize])

    useEffect(() => {
        if (!activeSubjectId) {
            return
        }
        loadQuestions()
    }, [
        activeSubjectId,
        questionQuery.pageIndex,
        questionQuery.pageSize,
        questionQuery.questionType,
        questionQuery.tagMatchMode,
        tagIdsKey
    ])

    useEffect(() => {
        if (!activeSubjectId) {
            return
        }
        loadQuestionTags(activeSubjectId)
    }, [activeSubjectId])

    useEffect(() => {
        if (questionTotal <= 0) {
            return
        }
        setQuickBuildCount(prev => Math.min(Math.max(prev || 1, 1), questionTotal))
    }, [questionTotal])

    const initSubjects = async () => {
        try {
            const res = await subjectApi.list()
            if (res?.code === 1) {
                const nextSubjects = res.response || []
                setSubjects(nextSubjects)
                if (nextSubjects.length > 0) {
                    setActiveSubjectId(Number(nextSubjects[0].id))
                }
            }
        } catch (error) {
            console.error(error)
            messageApi.error('加载学科失败，请稍后重试')
        }
    }

    const loadPapers = async () => {
        setPaperLoading(true)
        try {
            const res = await examPaperApi.pageList({
                ...paperQuery,
                subjectId: activeSubjectId,
                paperTypeArray: PAPER_TYPES
            })
            if (res?.response) {
                setPaperData(res.response.list || [])
                setPaperTotal(res.response.total || 0)
            }
        } catch (error) {
            console.error(error)
            messageApi.error('加载练习试卷失败')
        } finally {
            setPaperLoading(false)
        }
    }

    const loadQuestionTags = async subjectId => {
        setTagLoading(true)
        try {
            const res = await tagApi.list({ subjectId })
            if (res?.code === 1) {
                setQuestionTagOptions(res.response || [])
            }
        } catch (error) {
            console.error(error)
            messageApi.error('加载标签失败')
        } finally {
            setTagLoading(false)
        }
    }

    const loadQuestions = async () => {
        setQuestionLoading(true)
        try {
            const res = await questionPracticeApi.pageList({
                ...questionQuery,
                subjectId: activeSubjectId
            })
            if (res?.response) {
                const list = res.response.list || []
                setQuestionData(list)
                setQuestionTotal(res.response.total || 0)
                setSelectedQuestionIds(prev => prev.filter(id => list.some(item => item.id === id)))
            }
        } catch (error) {
            console.error(error)
            messageApi.error('加载试题列表失败')
        } finally {
            setQuestionLoading(false)
        }
    }

    const handlePreview = async id => {
        setPreviewOpen(true)
        setPreviewLoading(true)
        setPreviewQuestion(null)
        try {
            const res = await questionPracticeApi.select(id)
            if (res?.code === 1) {
                setPreviewQuestion(res.response)
            }
        } catch (error) {
            console.error(error)
            messageApi.error('加载题目预览失败')
        } finally {
            setPreviewLoading(false)
        }
    }

    const handleBuildPractice = async () => {
        if (selectedQuestionIds.length === 0) {
            messageApi.warning('请先勾选至少一道题目')
            return
        }
        setBuildingSelected(true)
        try {
            const res = await questionPracticeApi.buildPractice({ questionIds: selectedQuestionIds })
            if (res?.code === 1) {
                messageApi.success('练习卷已生成，正在跳转作答')
                navigate(`/do?id=${res.response}`)
            } else {
                messageApi.error(res?.message || '生成练习卷失败')
            }
        } catch (error) {
            console.error(error)
            messageApi.error('生成练习卷失败，请稍后重试')
        } finally {
            setBuildingSelected(false)
        }
    }

    const handleBuildPracticeByQuery = async () => {
        if (!questionTotal) {
            messageApi.warning('当前筛选条件下没有题目可生成练习卷')
            return
        }
        const questionCount = Math.min(Math.max(Number(quickBuildCount) || 1, 1), questionTotal)
        setBuildingFiltered(true)
        try {
            const res = await questionPracticeApi.buildPracticeByQuery({
                ...questionQuery,
                subjectId: activeSubjectId,
                questionCount
            })
            if (res?.code === 1) {
                messageApi.success(`已按当前筛选生成 ${questionCount} 题练习卷，正在跳转作答`)
                navigate(`/do?id=${res.response}`)
            } else {
                messageApi.error(res?.message || '生成练习卷失败')
            }
        } catch (error) {
            console.error(error)
            messageApi.error('生成练习卷失败，请稍后重试')
        } finally {
            setBuildingFiltered(false)
        }
    }

    const handleSubjectChange = key => {
        const nextId = Number(key)
        setActiveSubjectId(nextId)
        setPaperQuery(prev => ({ ...prev, pageIndex: 1 }))
        setQuestionQuery({ ...defaultQuestionQuery })
        setSelectedQuestionIds([])
        setQuestionTagOptions([])
        setQuickBuildCount(20)
    }

    const handleQuestionTypeChange = value => {
        setQuestionQuery(prev => ({
            ...prev,
            pageIndex: 1,
            questionType: value ?? null
        }))
    }

    const handleTagFilterChange = tagIds => {
        setQuestionQuery(prev => ({
            ...prev,
            pageIndex: 1,
            tagIds: tagIds || []
        }))
    }

    const handleTagMatchModeChange = value => {
        setQuestionQuery(prev => ({
            ...prev,
            pageIndex: 1,
            tagMatchMode: value
        }))
    }

    const resetQuestionFilter = () => {
        setQuestionQuery(prev => ({
            ...prev,
            pageIndex: 1,
            questionType: null,
            tagIds: [],
            tagMatchMode: 1
        }))
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

    const paperColumns = [
        {
            title: '练习卷',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <Space direction="vertical" size={4}>
                    <Text strong>{record.name}</Text>
                    <Space size={[6, 6]} wrap>
                        {(record.tagNames || []).map(tag => <Tag key={tag}>{tag}</Tag>)}
                    </Space>
                </Space>
            )
        },
        {
            title: '题目数',
            dataIndex: 'questionCount',
            key: 'questionCount',
            width: 100,
            align: 'center'
        },
        {
            title: '总分',
            dataIndex: 'score',
            key: 'score',
            width: 100,
            align: 'center'
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
            align: 'center'
        },
        {
            title: '操作',
            key: 'action',
            width: 140,
            align: 'center',
            render: (_, record) => (
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => navigate(`/do?id=${record.id}`)}>
                    开始练习
                </Button>
            )
        }
    ]

    const questionColumns = [
        {
            title: '试题',
            dataIndex: 'shortTitle',
            key: 'shortTitle',
            render: (_, record) => (
                <Space direction="vertical" size={6}>
                    <Text strong>{record.shortTitle || '未命名题目'}</Text>
                    <Space size={[6, 6]} wrap>
                        <Tag color="blue">{QUESTION_TYPE_MAP[record.questionType] || record.questionType}</Tag>
                        {(record.tagNames || []).map(tag => (
                            <Tag key={tag} icon={<TagsOutlined />}>{tag}</Tag>
                        ))}
                    </Space>
                </Space>
            )
        },
        {
            title: '做题次数',
            dataIndex: 'answerCount',
            key: 'answerCount',
            width: 110,
            align: 'center',
            render: value => `${value ?? 0} 次`
        },
        {
            title: '引用次数',
            dataIndex: 'referencedCount',
            key: 'referencedCount',
            width: 110,
            align: 'center'
        },
        {
            title: '正确率',
            dataIndex: 'correctRate',
            key: 'correctRate',
            width: 110,
            align: 'center',
            render: renderCorrectRate
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
            align: 'center'
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Button icon={<EyeOutlined />} onClick={() => handlePreview(record.id)}>
                    预览
                </Button>
            )
        }
    ]

    const subjectTabs = useMemo(() => (
        subjects.map(subject => ({
            key: String(subject.id),
            label: subject.name
        }))
    ), [subjects])

    return (
        <div style={{ padding: 20 }}>
            {contextHolder}
            <Card bordered={false}>
                <Space direction="vertical" size={20} style={{ width: '100%' }}>
                    <div>
                        <Title level={3} style={{ marginBottom: 8 }}>练习中心</Title>
                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                            这里会展示当前学生组可见的试卷和试题。你可以先按标签和题型筛选，再指定生成题数后一键组卷，或者手动勾选题目自由组卷。
                        </Paragraph>
                    </div>

                    <Tabs
                        activeKey={activeMode}
                        onChange={setActiveMode}
                        items={[
                            { key: 'paper', label: '试卷练习' },
                            { key: 'question', label: '试题练习' }
                        ]}
                    />

                    <Tabs
                        activeKey={activeSubjectId ? String(activeSubjectId) : undefined}
                        onChange={handleSubjectChange}
                        items={subjectTabs}
                    />

                    {activeMode === 'paper' ? (
                        <Card type="inner" title="试卷练习" extra={<Tag color="processing">固定卷 / AI 练习卷 / 自选练习卷</Tag>}>
                            <Table
                                rowKey="id"
                                loading={paperLoading}
                                dataSource={paperData}
                                columns={paperColumns}
                                pagination={false}
                                locale={{ emptyText: <Empty description="当前学科下暂无可练习试卷" /> }}
                            />
                            <div style={{ marginTop: 16, textAlign: 'right' }}>
                                <Pagination
                                    current={paperQuery.pageIndex}
                                    pageSize={paperQuery.pageSize}
                                    total={paperTotal}
                                    showSizeChanger
                                    onChange={(page, pageSize) => setPaperQuery({ pageIndex: page, pageSize })}
                                />
                            </div>
                        </Card>
                    ) : (
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <Card type="inner">
                                <Row gutter={[16, 16]} align="middle">
                                    <Col xs={24} md={13}>
                                        <Space size="large" wrap>
                                            <Text>已选题目</Text>
                                            <Text strong>{selectedQuestionIds.length} 道</Text>
                                            <Text type="secondary">支持按当前筛选一键组卷，也支持手动勾选部分题目生成练习卷。</Text>
                                        </Space>
                                    </Col>
                                    <Col xs={24} md={11} style={{ textAlign: 'right' }}>
                                        <Space wrap style={{ justifyContent: 'flex-end' }}>
                                            <Text type="secondary">生成题数</Text>
                                            <InputNumber
                                                min={1}
                                                max={Math.max(questionTotal, 1)}
                                                value={quickBuildCount}
                                                disabled={questionTotal === 0}
                                                onChange={value => setQuickBuildCount(value || 1)}
                                                style={{ width: 110 }}
                                            />
                                            <Button
                                                type="default"
                                                icon={<PlayCircleOutlined />}
                                                loading={buildingFiltered}
                                                disabled={questionTotal === 0}
                                                onClick={handleBuildPracticeByQuery}
                                            >
                                                按当前筛选生成练习卷
                                            </Button>
                                            <Button
                                                type="primary"
                                                icon={<FileTextOutlined />}
                                                loading={buildingSelected}
                                                onClick={handleBuildPractice}
                                            >
                                                勾选题目生成练习卷
                                            </Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </Card>

                            <Card
                                type="inner"
                                title="试题练习"
                                extra={(
                                    <Space wrap>
                                        <Select
                                            allowClear
                                            value={questionQuery.questionType}
                                            onChange={handleQuestionTypeChange}
                                            placeholder="按题型筛选"
                                            style={{ width: 160 }}
                                            options={QUESTION_TYPE_OPTIONS}
                                        />
                                        <Select
                                            mode="multiple"
                                            allowClear
                                            value={questionQuery.tagIds}
                                            onChange={handleTagFilterChange}
                                            placeholder="按标签筛选"
                                            loading={tagLoading}
                                            style={{ minWidth: 240 }}
                                            optionFilterProp="label"
                                            options={questionTagOptions.map(tag => ({
                                                label: tag.name,
                                                value: tag.id
                                            }))}
                                        />
                                        <Select
                                            value={questionQuery.tagMatchMode}
                                            onChange={handleTagMatchModeChange}
                                            style={{ width: 120 }}
                                            options={[
                                                { label: '任一匹配', value: 1 },
                                                { label: '全部匹配', value: 2 }
                                            ]}
                                        />
                                        <Button onClick={resetQuestionFilter}>清空筛选</Button>
                                    </Space>
                                )}
                            >
                                <Table
                                    rowKey="id"
                                    loading={questionLoading}
                                    dataSource={questionData}
                                    columns={questionColumns}
                                    pagination={false}
                                    rowSelection={{
                                        selectedRowKeys: selectedQuestionIds,
                                        onChange: keys => setSelectedQuestionIds(keys)
                                    }}
                                    locale={{ emptyText: <Empty description="当前学科下暂无可练习题目" /> }}
                                />
                                <div style={{ marginTop: 16, textAlign: 'right' }}>
                                    <Pagination
                                        current={questionQuery.pageIndex}
                                        pageSize={questionQuery.pageSize}
                                        total={questionTotal}
                                        showSizeChanger
                                        onChange={(page, pageSize) => setQuestionQuery(prev => ({ ...prev, pageIndex: page, pageSize }))}
                                    />
                                </div>
                            </Card>
                        </Space>
                    )}
                </Space>
            </Card>

            <Modal
                open={previewOpen}
                onCancel={() => setPreviewOpen(false)}
                footer={null}
                width={900}
                title="题目预览"
                destroyOnHidden
            >
                {!previewQuestion ? (
                    <Empty description={previewLoading ? '正在加载题目预览...' : '暂无预览内容'} />
                ) : (
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={6}>
                                <Card size="small">
                                    <Text type="secondary">题型</Text>
                                    <div><Text strong>{QUESTION_TYPE_MAP[previewQuestion.questionType] || previewQuestion.questionType}</Text></div>
                                </Card>
                            </Col>
                            <Col xs={24} md={6}>
                                <Card size="small">
                                    <Text type="secondary">难度</Text>
                                    <div><Text strong>{previewQuestion.difficult || '-'}</Text></div>
                                </Card>
                            </Col>
                            <Col xs={24} md={12}>
                                <Card size="small">
                                    <Text type="secondary">标签</Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Space size={[6, 6]} wrap>
                                            {(previewQuestion.tagNames || []).map(tag => <Tag key={tag}>{tag}</Tag>)}
                                        </Space>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <Card size="small">
                            <QuestionEdit
                                qType={previewQuestion.questionType}
                                question={previewQuestion}
                                answer={emptyAnswerByType[previewQuestion.questionType] || {}}
                                onAnswerChange={() => {}}
                            />
                        </Card>
                    </Space>
                )}
            </Modal>
        </div>
    )
}

export default PracticeCenter
