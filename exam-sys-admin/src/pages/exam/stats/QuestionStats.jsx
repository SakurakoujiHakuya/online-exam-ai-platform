import React, { useEffect, useState } from 'react'
import { ArrowLeftOutlined, BarChartOutlined, ClockCircleOutlined, ExportOutlined, PieChartOutlined, RobotOutlined, SolutionOutlined, TeamOutlined } from '@ant-design/icons'
import { Button, Card, Col, Empty, List, Result, Row, Space, Spin, Statistic, Table, Tag, Typography, message } from 'antd'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNavigate, useParams } from 'react-router-dom'
import { generateStats } from '@/api/aiGeneration'
import * as questionApi from '@/api/question'
import QuestionShow from '../question/components/QuestionShow'

const { Title, Text } = Typography

const feedbackStatusColor = {
    '待审核': 'gold',
    '已采纳': 'green',
    '已驳回': 'red',
    '已合并': 'blue'
}

const renderPracticeVisibilityTag = hideInPracticeCenter => (
    hideInPracticeCenter
        ? <Tag color="volcano">试题中心隐藏</Tag>
        : <Tag color="success">试题中心可见</Tag>
)

const QuestionStats = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [previewQuestion, setPreviewQuestion] = useState(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [aiResult, setAiResult] = useState(null)
    const [aiLoading, setAiLoading] = useState(false)

    useEffect(() => {
        if (!id) {
            return
        }
        setLoading(true)
        questionApi.stats(id).then(res => {
            if (res.code === 1) {
                setStats(res.response)
            }
        }).finally(() => setLoading(false))
    }, [id])

    const showQuestion = () => {
        setPreviewLoading(true)
        setPreviewVisible(true)
        questionApi.select(id).then(res => {
            if (res.code === 1) {
                setPreviewQuestion(res.response)
            }
        }).finally(() => setPreviewLoading(false))
    }

    const handleExport = () => {
        if (!stats) {
            return
        }

        const rows = [
            ['项目', '数值'],
            ['题目ID', stats.id],
            ['作答总次数', stats.totalCount],
            ['正确率', stats.correctRate],
            ['平均用时(秒)', stats.avgDoTime],
            ['反馈数', stats.feedbackCount || 0],
            ['反馈采纳率', stats.feedbackAdoptRate || '0.0%'],
            ['优秀思路数', stats.adoptedSolutionCount || 0],
            ['修订次数', stats.revisionCount || 0]
        ]

        if (stats.answerDistribution?.length) {
            rows.push(['', ''])
            rows.push(['选项分布', '人数'])
            stats.answerDistribution.forEach(item => rows.push([item.name, item.value]))
        }

        if (stats.feedbackTypeDistribution?.length) {
            rows.push(['', ''])
            rows.push(['反馈类型分布', '条数'])
            stats.feedbackTypeDistribution.forEach(item => rows.push([item.name, item.value]))
        }

        rows.push(['', ''])
        rows.push(['耗时分布', '人数'])
        ;(stats.timeDistribution || []).forEach(item => rows.push([item.name, item.value]))

        const csvContent = '\ufeff' + rows.map(item => item.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `题目统计_${stats.id}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleAiAnalysis = async () => {
        if (!stats) {
            return
        }
        setAiLoading(true)

        let questionData = previewQuestion
        if (!questionData) {
            try {
                const res = await questionApi.select(id)
                if (res.code === 1) {
                    questionData = res.response
                    setPreviewQuestion(questionData)
                }
            } catch (error) {
                console.error('Fetch question failed', error)
            }
        }

        const context = `
题目详情:
题干: ${questionData?.title || '未知'}
正确答案: ${questionData?.correct || '未知'}
题目项: ${JSON.stringify(questionData?.items || [])}
解析: ${questionData?.analyze || '未知'}

统计数据:
ID: ${stats.id}
作答总次数: ${stats.totalCount}
正确率: ${stats.correctRate}
平均用时: ${stats.avgDoTime}s
选项分布: ${JSON.stringify(stats.answerDistribution || [])}
耗时分布: ${JSON.stringify(stats.timeDistribution || [])}
师生共建数据:
反馈数: ${stats.feedbackCount || 0}
反馈采纳率: ${stats.feedbackAdoptRate || '0.0%'}
优秀思路数: ${stats.adoptedSolutionCount || 0}
修订次数: ${stats.revisionCount || 0}
高频反馈: ${JSON.stringify(stats.feedbackTypeDistribution || [])}
`
        generateStats({ context }).then(res => {
            if (res.code === 1) {
                setAiResult(res.response)
                message.success('AI 深度分析生成成功')
            }
        }).catch(() => {
            message.error('AI 深度分析生成失败')
        }).finally(() => setAiLoading(false))
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="正在加载统计数据..." />
            </div>
        )
    }

    if (!stats || stats.totalCount === 0) {
        return (
            <div className="app-container">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="middle">
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
                        <Title level={3} style={{ margin: 0 }}>题目统计 (ID: {stats?.id || id})</Title>
                        {stats && renderPracticeVisibilityTag(stats.hideInPracticeCenter)}
                    </Space>
                </div>
                <Result status="info" title="暂无作答统计" subTitle="该题目当前还没有学生提交作答数据。" />
            </div>
        )
    }

    const answerDistOption = stats.answerDistribution?.length ? {
        title: { text: '选项选择分布', left: 'center' },
        tooltip: { trigger: 'item' },
        series: [{
            name: '人数',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: { show: true, formatter: '{b}: {c}人 ({d}%)' },
            data: stats.answerDistribution.map(item => ({ value: item.value, name: item.name }))
        }]
    } : null

    const timeDistOption = {
        title: { text: '作答时长分布', left: 'center' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'category', data: (stats.timeDistribution || []).map(item => item.name) },
        yAxis: { type: 'value' },
        series: [{
            name: '人数',
            type: 'bar',
            data: (stats.timeDistribution || []).map(item => item.value),
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 0.5, color: '#188df0' },
                    { offset: 1, color: '#188df0' }
                ])
            }
        }]
    }

    const feedbackDistOption = stats.feedbackTypeDistribution?.length ? {
        title: { text: '反馈类型分布', left: 'center' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'category', data: stats.feedbackTypeDistribution.map(item => item.name) },
        yAxis: { type: 'value' },
        series: [{
            name: '条数',
            type: 'bar',
            data: stats.feedbackTypeDistribution.map(item => item.value),
            itemStyle: { color: '#52c41a' }
        }]
    } : null

    return (
        <>
            <div className="app-container" style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="middle">
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
                        <Title level={3} style={{ margin: 0 }}>题目统计 (ID: {stats.id})</Title>
                        {renderPracticeVisibilityTag(stats.hideInPracticeCenter)}
                    </Space>
                    <Space>
                        <Button type="primary" ghost icon={<SolutionOutlined />} onClick={showQuestion}>查看题干</Button>
                        <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
                    </Space>
                </div>

                <Row gutter={[16, 16]}>
                    <Col span={6}>
                        <Card bordered={false}>
                            <Statistic title="作答总次数" value={stats.totalCount} prefix={<BarChartOutlined />} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card bordered={false}>
                            <Statistic title="正确率" value={stats.correctRate} valueStyle={{ color: '#3f8600' }} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card bordered={false}>
                            <Statistic title="平均用时" value={stats.avgDoTime} suffix="s" prefix={<ClockCircleOutlined />} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card bordered={false}>
                            <Statistic title="学生反馈数" value={stats.feedbackCount || 0} prefix={<TeamOutlined />} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false}>
                            <Statistic title="反馈采纳率" value={stats.feedbackAdoptRate || '0.0%'} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false}>
                            <Statistic title="优秀思路数" value={stats.adoptedSolutionCount || 0} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false}>
                            <Statistic title="修订次数" value={stats.revisionCount || 0} />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    {answerDistOption && (
                        <Col span={12}>
                            <Card title={<span><PieChartOutlined /> 选项选择分布</span>} bordered={false} style={{ height: 450 }}>
                                <ReactECharts option={answerDistOption} style={{ height: 350 }} />
                            </Card>
                        </Col>
                    )}
                    <Col span={answerDistOption ? 12 : 24}>
                        <Card title={<span><BarChartOutlined /> 作答耗时分布</span>} bordered={false} style={{ height: 450 }}>
                            <ReactECharts option={timeDistOption} style={{ height: 350 }} />
                        </Card>
                    </Col>
                </Row>

                {feedbackDistOption && (
                    <Row style={{ marginTop: 24 }}>
                        <Col span={24}>
                            <Card title={<span><TeamOutlined /> 师生共建反馈分布</span>} bordered={false}>
                                <ReactECharts option={feedbackDistOption} style={{ height: 320 }} />
                            </Card>
                        </Col>
                    </Row>
                )}

                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col span={12}>
                        <Card title="最近学生反馈" bordered={false}>
                            {stats.recentFeedbacks?.length ? (
                                <List
                                    dataSource={stats.recentFeedbacks}
                                    renderItem={item => (
                                        <List.Item>
                                            <div style={{ width: '100%' }}>
                                                <Space wrap style={{ marginBottom: 8 }}>
                                                    <Tag color="blue">{item.feedbackType}</Tag>
                                                    <Tag color={feedbackStatusColor[item.statusName] || 'default'}>{item.statusName}</Tag>
                                                    <Tag>{item.studentName}</Tag>
                                                    <Tag>{item.createTime}</Tag>
                                                </Space>
                                                <div style={{ marginBottom: 6 }}>{item.feedbackContent}</div>
                                                {item.aiSummary && <Text type="secondary">AI 摘要：{item.aiSummary}</Text>}
                                                {item.reviewComment && <div style={{ color: '#999', marginTop: 6 }}>审核意见：{item.reviewComment}</div>}
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            ) : <Empty description="暂无学生反馈" />}
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="已采纳的学生优秀思路" bordered={false}>
                            {stats.adoptedSolutions?.length ? (
                                <List
                                    dataSource={stats.adoptedSolutions}
                                    renderItem={item => (
                                        <List.Item>
                                            <div style={{ width: '100%' }}>
                                                <Space wrap style={{ marginBottom: 8 }}>
                                                    <Tag color="green">{item.studentName}</Tag>
                                                    <Tag color="purple">质量分 {item.qualityScore || 0}</Tag>
                                                    <Tag>{item.createTime}</Tag>
                                                </Space>
                                                <div style={{ marginBottom: 6 }}>{item.content}</div>
                                                {item.aiSummary && <Text type="secondary">AI 提炼：{item.aiSummary}</Text>}
                                                {item.reviewComment && <div style={{ color: '#999', marginTop: 6 }}>教师评语：{item.reviewComment}</div>}
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            ) : <Empty description="暂无被采纳的优秀思路" />}
                        </Card>
                    </Col>
                </Row>

                <Row style={{ marginTop: 24 }}>
                    <Col span={24}>
                        <Card title="题目修订记录" bordered={false}>
                            {stats.revisionLogs?.length ? (
                                <Table
                                    rowKey="id"
                                    pagination={false}
                                    dataSource={stats.revisionLogs}
                                    columns={[
                                        { title: '修订类型', dataIndex: 'revisionType', width: 160 },
                                        { title: '处理人', dataIndex: 'reviewerName', width: 140 },
                                        { title: '修订摘要', dataIndex: 'changeSummary', width: 420 },
                                        { title: '时间', dataIndex: 'createTime', width: 180 }
                                    ]}
                                    scroll={{ x: 'max-content' }}
                                />
                            ) : <Empty description="暂无修订记录" />}
                        </Card>
                    </Col>
                </Row>

                <Card
                    title={<span><RobotOutlined /> AI 错因预测</span>}
                    bordered={false}
                    style={{ marginTop: 24 }}
                    extra={(
                        <Button type="primary" size="small" icon={<RobotOutlined />} loading={aiLoading} onClick={handleAiAnalysis}>
                            生成 AI 深度分析
                        </Button>
                    )}
                >
                    <div style={{ padding: '10px 20px' }}>
                        {aiResult ? (
                            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {aiResult.replace(/<think>[\s\S]*?<\/think>\n*/g, '')}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div>
                                <Text strong>自动简析：</Text>
                                <div style={{ marginTop: 12 }}>
                                    {parseFloat(stats.correctRate) < 50 ? (
                                        <Text type="danger">该题目正确率偏低，建议教师优先结合高频反馈与学生优秀思路一起复盘这道题。</Text>
                                    ) : (
                                        <Text type="success">该题目整体表现稳定，可以结合共建反馈继续优化题干表达与解析质量。</Text>
                                    )}
                                </div>
                                <div style={{ marginTop: 12 }}>
                                    <Text type="secondary">
                                        当前共建侧共有 {stats.feedbackCount || 0} 条反馈、{stats.adoptedSolutionCount || 0} 条优秀思路、{stats.revisionCount || 0} 次修订记录。
                                    </Text>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <QuestionShow
                open={previewVisible}
                onClose={() => setPreviewVisible(false)}
                qType={previewQuestion?.questionType}
                question={previewQuestion}
                loading={previewLoading}
            />
        </>
    )
}

export default QuestionStats
