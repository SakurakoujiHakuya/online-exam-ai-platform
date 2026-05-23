import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Space, Typography, Tag, Divider, Result, Spin, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatEnum } from '@/store/slices/enumItemSlice';
import TableTooltip from '@/components/TableTooltip';
import { ArrowLeftOutlined, BarChartOutlined, PieChartOutlined, LineChartOutlined, RobotOutlined, ExportOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as examPaperApi from '@/api/examPaper';
import { generateStats } from '@/api/aiGeneration';

const { Title, Text } = Typography;

const PaperStats = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const questionTypeEnum = useSelector(state => state.enumItem.exam.question.typeEnum);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    const handleAiAnalysis = () => {
        if (!stats) return;
        setAiLoading(true);
        const context = `
            试卷汇总信息:
            试卷名称: ${stats.name}
            试卷总分: ${stats.paperScore / 10}
            作答总人数: ${stats.totalCount}
            全卷平均分: ${stats.avgScore}
            及格率: ${stats.passRate}
            最高分: ${stats.maxScore}
            最低分: ${stats.minScore}
            全卷平均用时: ${stats.avgDoTime}s
            成绩分布: ${JSON.stringify(stats.scoreDistribution)}
            
            逐题情况分析:
            ${stats.questionItems.map(q => 
                `第${q.itemOrder}题(ID: ${q.id}): 
                题干: ${q.title || '无'}
                正确答案: ${q.correct || '无'}
                选项: ${q.items || '无'}
                准确率: ${q.correctRate}, 平均时长: ${q.avgDoTime}s, 选项分布: ${JSON.stringify(q.answerDistribution || [])}`
            ).join('\n\n')}
        `;
        generateStats({ context }).then(res => {
            if (res.code === 1) {
                setAiResult(res.response);
                message.success('AI 报告生成成功');
            }
            setAiLoading(false);
        }).catch(() => {
            setAiLoading(false);
            message.error('AI 报告生成失败');
        });
    };

    useEffect(() => {
        if (id) {
            setLoading(true);
            examPaperApi.stats(id).then(res => {
                if (res.code === 1) {
                    setStats(res.response);
                }
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="正在加载统计数据..." />
            </div>
        );
    }

    if (!stats || stats.totalCount === 0) {
        return (
            <div className="app-container">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>返回</Button>
                <Result
                    status="info"
                    title="暂无作答统计"
                    subTitle="该试卷目前还没有学生提交作答数据。"
                />
            </div>
        );
    }

    const scoreDistOption = {
        title: { text: '成绩分布', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
            {
                name: '人数',
                type: 'pie',
                radius: '50%',
                data: stats.scoreDistribution.map(item => ({ value: item.value, name: item.name })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    const handleExport = () => {
        if (!stats) return;
        
        const headers = ['序号', '题目ID', '平均准确率', '平均用时(秒)', '作答人数'];
        const csvRows = [headers.join(',')];
        
        stats.questionItems.forEach(item => {
            const row = [
                item.itemOrder,
                item.id,
                item.correctRate.replace('%', ''),
                item.avgDoTime,
                item.totalCount
            ];
            csvRows.push(row.join(','));
        });
        
        const csvContent = "\ufeff" + csvRows.join('\n'); // Add BOM for Excel UTF-8 support
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `试卷统计_${stats.name}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { title: '序号', dataIndex: 'itemOrder', width: 80 },
        { title: '题型', dataIndex: 'questionType', width: 90, render: (text) => formatEnum(questionTypeEnum, text) },
        { title: '题干', dataIndex: 'title', width: 520, render: (text) => <TableTooltip text={text ? text.replace(/<[^>]+>/g, '') : '无'} maxWidth={480} /> },
        { title: '题目ID', dataIndex: 'id', width: 90 },
        { title: '平均准确率', dataIndex: 'correctRate', width: 120, render: (text) => <Tag color={parseFloat(text) > 80 ? 'green' : (parseFloat(text) > 40 ? 'orange' : 'red')}>{text}</Tag> },
        { title: '平均用时 (秒)', dataIndex: 'avgDoTime', width: 120 },
        { title: '作答人数', dataIndex: 'totalCount', width: 100 },
        {
            title: '操作',
            width: 120,
            render: (_, record) => (
                <Button type="link" onClick={() => navigate(`/exam/question/stats/${record.id}`)}>详细统计</Button>
            )
        }
    ];

    return (
        <div className="app-container" style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="middle">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
                    <Title level={3} style={{ margin: 0 }}>试卷统计：{stats.name}</Title>
                    <Tag color="blue">总分: {stats.paperScore / 10}</Tag>
                </Space>
                <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>导出 Excel</Button>
            </div>

            <Row gutter={[16, 16]}>
                <Col span={4}>
                    <Card bordered={false}>
                        <Statistic title="总作答人数" value={stats.totalCount} prefix={<BarChartOutlined />} />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card bordered={false}>
                        <Statistic title="平均分" value={stats.avgScore} precision={1} valueStyle={{ color: '#3f8600' }} />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card bordered={false}>
                        <Statistic title="及格率" value={stats.passRate} valueStyle={{ color: '#3f8600' }} />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card bordered={false}>
                        <Statistic title="最高分" value={stats.maxScore} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card bordered={false}>
                        <Statistic title="最低分" value={stats.minScore} />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card bordered={false}>
                        <Statistic title="平均作答时间" value={stats.avgDoTime} suffix="s" />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col span={12}>
                    <Card title={<span><PieChartOutlined /> 成绩分布概览</span>} bordered={false} style={{ height: '400px' }}>
                        <ReactECharts option={scoreDistOption} style={{ height: '300px' }} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title={<span><RobotOutlined /> AI 深度分析</span>} bordered={false} style={{ height: '400px', overflowY: 'auto' }}>
                        {aiResult ? (
                            <div style={{ padding: '10px', fontSize: '14px', lineHeight: '1.6' }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {aiResult.replace(/<think>[\s\S]*?<\/think>\n*/g, '')}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                                <RobotOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                                <Title level={4}>AI 智能学习此试卷的作答模式</Title>
                                <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
                                    AI 将根据学生的平均用时、错题分布、知识点掌握情况，为您提供针对性的教学建议。
                                </Text>
                                <Button 
                                    type="primary" 
                                    icon={<RobotOutlined />} 
                                    loading={aiLoading} 
                                    onClick={handleAiAnalysis}
                                >
                                    即刻生成 AI 报告
                                </Button>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Card title={<span><LineChartOutlined /> 逐题作答情况</span>} bordered={false} style={{ marginTop: '24px' }}>
                <Table
                    columns={columns}
                    dataSource={stats.questionItems}
                    rowKey="id"
                    pagination={false}
                    bordered
                    size="middle"
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </div>
    );
};

export default PaperStats;
