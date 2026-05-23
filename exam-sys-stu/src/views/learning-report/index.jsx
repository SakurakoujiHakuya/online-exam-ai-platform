import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Card, Col, Empty, List, Progress, Row, Select, Space, Spin, Statistic, Table, Tag, Typography } from 'antd';
import aiApi from '@/api/ai';

const { Title, Text } = Typography;

const LearningReport = () => {
    const [loading, setLoading] = useState(true);
    const [rangeDays, setRangeDays] = useState(15);
    const [data, setData] = useState(null);

    const fetchReport = (days = rangeDays) => {
        setLoading(true);
        aiApi.getMyLearningAnalysis({ rangeDays: days })
            .then(res => {
                if (res.code === 1) {
                    setData(res.response);
                }
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const subjectColumns = [
        { title: '学科', dataIndex: 'subjectName', key: 'subjectName' },
        { title: '得分率', dataIndex: 'avgScoreRate', key: 'avgScoreRate', width: 100, render: value => `${value}%` },
        { title: '正确率', dataIndex: 'avgCorrectRate', key: 'avgCorrectRate', width: 100, render: value => `${value}%` },
        { title: '平均耗时', dataIndex: 'avgDoTime', key: 'avgDoTime', width: 100, render: value => `${value}s` },
        { title: '评价', dataIndex: 'evaluation', key: 'evaluation' }
    ];

    const weakestSubjects = useMemo(() => {
        return (data?.subjectStats || [])
            .slice()
            .sort((a, b) => (a.avgScoreRate || 0) - (b.avgScoreRate || 0))
            .slice(0, 3);
    }, [data]);

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Card style={{ marginBottom: 16 }}>
                <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <div>
                        <Title level={3} style={{ marginBottom: 4 }}>我的学习报告</Title>
                        <Text type="secondary">查看最近一段时间的整体学习情况与各学科评估。</Text>
                    </div>
                    <Space>
                        <span>统计范围</span>
                        <Select value={rangeDays} style={{ width: 120 }} onChange={value => setRangeDays(value)}>
                            <Select.Option value={7}>近 7 天</Select.Option>
                            <Select.Option value={15}>近 15 天</Select.Option>
                            <Select.Option value={30}>近 30 天</Select.Option>
                        </Select>
                        <a onClick={() => fetchReport(rangeDays)}>刷新</a>
                    </Space>
                </Space>
            </Card>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                    <Spin size="large" tip="正在生成学习报告..." />
                </div>
            ) : !data ? (
                <Empty description="暂无学习数据" />
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={6}><Card><Statistic title="练习试卷数" value={data.totalPapers} /></Card></Col>
                        <Col xs={24} md={6}><Card><Statistic title="作答题目数" value={data.totalQuestions} /></Card></Col>
                        <Col xs={24} md={6}><Card><Statistic title="平均得分率" value={data.avgScoreRate} suffix="%" /></Card></Col>
                        <Col xs={24} md={6}><Card><Statistic title="平均正确率" value={data.avgQuestionCorrectRate} suffix="%" /></Card></Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} md={12}>
                            <Card title="AI 学习状态" extra={<Tag color={data.report?.aiGenerated ? 'green' : 'gold'}>{data.report?.aiGenerated ? 'AI' : '规则回退'}</Tag>}>
                                <Alert type="info" showIcon message={data.report?.learningStatus || '暂无总结'} style={{ marginBottom: 16 }} />
                                <List
                                    header="改进建议"
                                    dataSource={data.report?.studentSuggestions || []}
                                    renderItem={item => <List.Item>{item}</List.Item>}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card title="学科预警">
                                {weakestSubjects.length ? weakestSubjects.map(item => (
                                    <div key={item.subjectId} style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <Text strong>{item.subjectName}</Text>
                                            <Text type="secondary">{item.avgScoreRate}%</Text>
                                        </div>
                                        <Progress
                                            percent={item.avgScoreRate}
                                            showInfo={false}
                                            strokeColor={item.avgScoreRate >= 70 ? '#52c41a' : item.avgScoreRate >= 60 ? '#faad14' : '#ff4d4f'}
                                        />
                                        <Text type="secondary">{item.evaluation}</Text>
                                    </div>
                                )) : <Empty description="暂无学科数据" />}
                            </Card>
                        </Col>
                    </Row>

                    <Card title="总体与学科评估" style={{ marginTop: 16 }}>
                        <Table columns={subjectColumns} dataSource={data.subjectStats || []} rowKey="subjectId" pagination={false} />
                    </Card>

                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} md={12}>
                            <Card title="学习优势">
                                <List dataSource={data.report?.strengths || []} renderItem={item => <List.Item>{item}</List.Item>} />
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card title="薄弱项">
                                <List dataSource={data.report?.weaknesses || []} renderItem={item => <List.Item>{item}</List.Item>} />
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default LearningReport;
