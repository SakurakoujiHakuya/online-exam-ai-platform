import React, { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Empty, Row, Space, Spin, Table, Tag, message } from 'antd'
import dashboardApi from '@/api/dashboard'
import collaborationApi from '@/api/collaboration'
import { chinaTimestamp } from '@/utils/time'
import './index.css'

const statusEnum = {
    1: '待批改',
    2: '已完成'
}

const statusTag = {
    1: 'warning',
    2: 'success'
}

const effectScoreText = {
    1: '不适合',
    2: '一般',
    3: '有帮助'
}

const Dashboard = () => {
    const [loading, setLoading] = useState(false)
    const [taskLoading, setTaskLoading] = useState(false)
    const [recommendationLoading, setRecommendationLoading] = useState(false)
    const [buildingKey, setBuildingKey] = useState('')
    const [ratingKey, setRatingKey] = useState('')
    const [aiPaper, setAiPaper] = useState([])
    const [taskList, setTaskList] = useState([])
    const [resData, setResData] = useState({})
    const [recommendationData, setRecommendationData] = useState({ summary: '', items: [] })
    const [recommendationState, setRecommendationState] = useState({})

    useEffect(() => {
        loadDashboard()
        loadTasks()
        loadRecommendations()
    }, [])

    const loadDashboard = () => {
        setLoading(true)
        dashboardApi.index().then(res => {
            if (res && res.code === 1) {
                setResData(res.response)
                setAiPaper(res.response.aiPaper || [])
            }
        }).finally(() => setLoading(false))
    }

    const loadTasks = () => {
        setTaskLoading(true)
        dashboardApi.task().then(res => {
            if (res && res.code === 1) {
                setTaskList(res.response || [])
            }
        }).finally(() => setTaskLoading(false))
    }

    const loadRecommendations = () => {
        setRecommendationLoading(true)
        collaborationApi.dailyRecommendation().then(res => {
            if (res && res.code === 1) {
                setRecommendationData(res.response || { summary: '', items: [] })
            }
        }).finally(() => setRecommendationLoading(false))
    }

    const buildRecommendationPractice = async item => {
        const buildKey = `${item.strategyKey}-${item.subjectId}-${item.questionType || 0}`
        setBuildingKey(buildKey)
        try {
            const res = await collaborationApi.buildRecommendation(item)
            if (res && res.code === 1) {
                const response = res.response || {}
                setRecommendationState(prev => ({
                    ...prev,
                    [buildKey]: {
                        paperId: response.paperId,
                        recommendationId: response.recommendationId,
                        effectScore: prev[buildKey]?.effectScore
                    }
                }))
                message.success('推荐练习卷已生成')
                if (response.paperId) {
                    window.open(`/#/do?id=${response.paperId}`, '_blank')
                }
            }
        } finally {
            setBuildingKey('')
        }
    }

    const rateRecommendation = async (buildKey, effectScore) => {
        const current = recommendationState[buildKey]
        if (!current?.recommendationId) {
            return
        }
        setRatingKey(`${buildKey}-${effectScore}`)
        try {
            const res = await collaborationApi.rateRecommendation({
                recommendationId: current.recommendationId,
                effectScore
            })
            if (res && res.code === 1) {
                setRecommendationState(prev => ({
                    ...prev,
                    [buildKey]: {
                        ...prev[buildKey],
                        effectScore
                    }
                }))
                message.success('反馈已记录')
            }
        } finally {
            setRatingKey('')
        }
    }

    const flatTaskList = taskList.flatMap(task =>
        (task.paperItems || []).map(paper => ({
            taskId: task.id,
            taskTitle: task.title,
            startTime: task.startTime,
            endTime: task.endTime,
            ...paper
        }))
    )

    const columns = [
        {
            title: '考试标题',
            dataIndex: 'taskTitle',
            key: 'taskTitle'
        },
        {
            title: '试卷名称',
            dataIndex: 'examPaperName',
            key: 'examPaperName'
        },
        {
            title: '有效时间',
            key: 'validTime',
            render: (_, record) => (
                <div style={{ fontSize: '12px', color: '#666' }}>
                    <div>{record.startTime}</div>
                    <div>{record.endTime}</div>
                </div>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: status => (
                <Tag color={statusTag[status] || 'default'}>
                    {status === null ? '未开始' : (statusEnum[status] || '未知')}
                </Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => {
                const status = record.status
                if (status === null) {
                    const now = new Date().getTime()
                    const start = record.startTime ? chinaTimestamp(record.startTime) : 0
                    const end = record.endTime ? chinaTimestamp(record.endTime) : Infinity

                    if (now < start) {
                        return <Button type="primary" size="small" shape="round" disabled>未到时间</Button>
                    }
                    if (now > end) {
                        return <Button type="primary" size="small" shape="round" disabled>已过期</Button>
                    }
                    return <Button type="primary" size="small" shape="round" onClick={() => window.open(`/#/do?id=${record.examPaperId}&isTask=1&taskId=${record.taskId}`, '_blank')}>开始答题</Button>
                }
                if (status === 1) {
                    return <span style={{ color: '#faad14' }}>待教师批改</span>
                }
                if (status === 2) {
                    return <Button type="primary" size="small" shape="round" onClick={() => window.open(`/#/read?id=${record.examPaperAnswerId}`, '_blank')}>查看试卷</Button>
                }
                return null
            }
        }
    ]

    return (
        <div className="dashboard-container">
            <div className="section">
                <h3 className="section-title" style={{ borderLeftColor: '#3651d4' }}>考试中心</h3>
                <Table
                    dataSource={flatTaskList}
                    columns={columns}
                    loading={taskLoading}
                    rowKey={record => `${record.taskId}-${record.examPaperId}`}
                    pagination={false}
                />
            </div>

            <div className="section">
                <h3 className="section-title" style={{ borderLeftColor: '#16a085' }}>今日推荐练习</h3>
                <Spin spinning={recommendationLoading}>
                    {recommendationData.summary && (
                        <Alert
                            type="info"
                            showIcon
                            message={recommendationData.summary}
                            description={`来源：${recommendationData.sourceLabel || '规则兜底'}`}
                            style={{ marginBottom: 16 }}
                        />
                    )}
                    {(recommendationData.items || []).length === 0 ? (
                        <Empty description="暂时还没有推荐练习" />
                    ) : (
                        <Row gutter={[16, 16]}>
                            {(recommendationData.items || []).map(item => {
                                const buildKey = `${item.strategyKey}-${item.subjectId}-${item.questionType || 0}`
                                const state = recommendationState[buildKey] || {}
                                return (
                                    <Col span={8} key={buildKey}>
                                        <Card
                                            title={item.title}
                                            extra={<Tag color="blue">{item.questionTypeName || item.subjectName}</Tag>}
                                        >
                                            <p style={{ minHeight: 44, color: '#666' }}>{item.reason}</p>
                                            <Space wrap style={{ marginBottom: 12 }}>
                                                <Tag>{item.subjectName}</Tag>
                                                {item.questionTypeName && <Tag color="purple">{item.questionTypeName}</Tag>}
                                                <Tag color={item.source === 'llm' ? 'geekblue' : 'default'}>
                                                    {item.sourceLabel || '规则兜底'}
                                                </Tag>
                                            </Space>
                                            <div>
                                                <Button
                                                    type="primary"
                                                    loading={buildingKey === buildKey}
                                                    onClick={() => buildRecommendationPractice(item)}
                                                >
                                                    生成练习卷
                                                </Button>
                                                {state.paperId && (
                                                    <Button style={{ marginLeft: 8 }} onClick={() => window.open(`/#/do?id=${state.paperId}`, '_blank')}>
                                                        再次打开
                                                    </Button>
                                                )}
                                            </div>
                                            {state.recommendationId && (
                                                <div style={{ marginTop: 12 }}>
                                                    <div style={{ marginBottom: 8, color: '#666' }}>这份推荐对你有帮助吗？</div>
                                                    <Space wrap>
                                                        {[3, 2, 1].map(score => (
                                                            <Button
                                                                key={score}
                                                                size="small"
                                                                type={state.effectScore === score ? 'primary' : 'default'}
                                                                loading={ratingKey === `${buildKey}-${score}`}
                                                                onClick={() => rateRecommendation(buildKey, score)}
                                                            >
                                                                {effectScoreText[score]}
                                                            </Button>
                                                        ))}
                                                    </Space>
                                                </div>
                                            )}
                                        </Card>
                                    </Col>
                                )
                            })}
                        </Row>
                    )}
                </Spin>
            </div>

            <div className="section">
                <h3 className="section-title" style={{ borderLeftColor: '#9b59b6' }}>AI练习</h3>
                <Spin spinning={loading}>
                    <Row gutter={[16, 16]}>
                        {aiPaper.length === 0 ? (
                            <Col span={24}>
                                <Empty description="暂无AI练习卷" />
                            </Col>
                        ) : aiPaper.map(item => (
                            <Col span={6} key={item.id}>
                                <Card hoverable>
                                    <Card.Meta title={item.name} description="进入后可直接开始练习" />
                                    <Button type="link" style={{ paddingLeft: 0, marginTop: 12 }} onClick={() => window.open(`/#/do?id=${item.id}`, '_blank')}>
                                        开始做题
                                    </Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Spin>
            </div>

            <div className="section">
                <h3 className="section-title" style={{ borderLeftColor: '#f39c12' }}>向榜样学习</h3>
                <Row gutter={[16, 16]}>
                    {(resData.excellentStudents || []).map((item, index) => (
                        <Col span={8} key={`${item.name}-${index}`}>
                            <Card>
                                <div style={{ fontWeight: 600, marginBottom: 8 }}>{item.name}</div>
                                <div style={{ color: '#666' }} dangerouslySetInnerHTML={{ __html: item.comment || '' }} />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    )
}

export default Dashboard
