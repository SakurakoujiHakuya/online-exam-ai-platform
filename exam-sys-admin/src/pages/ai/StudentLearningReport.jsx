import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Button,
    Card,
    Col,
    Empty,
    List,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography
} from 'antd';
import { ArrowLeftOutlined, RobotOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getStudentLearningAnalysis } from '@/api/aiGeneration';
import { list as subjectList } from '@/api/subject';

const { Title, Text } = Typography;

const StudentLearningReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [rangeDays, setRangeDays] = useState(15);
    const [subjectId, setSubjectId] = useState(undefined);
    const [data, setData] = useState(null);

    useEffect(() => {
        subjectList().then(res => {
            if (res.code === 1) {
                setSubjects(res.response || []);
            }
        });
    }, []);

    const fetchReport = (nextRangeDays = rangeDays, nextSubjectId = subjectId) => {
        setLoading(true);
        getStudentLearningAnalysis(id, { rangeDays: nextRangeDays, subjectId: nextSubjectId })
            .then(res => {
                if (res.code === 1) {
                    setData(res.response);
                }
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchReport();
    }, [id]);

    const trendOption = useMemo(() => ({
        tooltip: { trigger: 'axis' },
        legend: { data: ['得分率', '正确率'] },
        xAxis: { type: 'category', data: (data?.recentTrend || []).map(item => item.label) },
        yAxis: { type: 'value', max: 100 },
        series: [
            { name: '得分率', type: 'line', smooth: true, data: (data?.recentTrend || []).map(item => item.scoreRate) },
            { name: '正确率', type: 'line', smooth: true, data: (data?.recentTrend || []).map(item => item.correctRate) }
        ]
    }), [data]);

    const typeOption = useMemo(() => ({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: (data?.questionTypeStats || []).map(item => item.typeName) },
        yAxis: { type: 'value', max: 100 },
        series: [
            { name: '正确率', type: 'bar', data: (data?.questionTypeStats || []).map(item => item.correctRate) }
        ]
    }), [data]);

    const subjectColumns = [
        { title: '学科', dataIndex: 'subjectName', key: 'subjectName', width: 160 },
        { title: '练习试卷数', dataIndex: 'totalPapers', key: 'totalPapers', width: 120 },
        { title: '得分率', dataIndex: 'avgScoreRate', key: 'avgScoreRate', width: 100, render: value => `${value}%` },
        { title: '正确率', dataIndex: 'avgCorrectRate', key: 'avgCorrectRate', width: 100, render: value => `${value}%` },
        { title: '平均耗时', dataIndex: 'avgDoTime', key: 'avgDoTime', width: 100, render: value => `${value}s` },
        { title: '评价', dataIndex: 'evaluation', key: 'evaluation', width: 280 }
    ];

    return (
        <div className="app-container" style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    返回
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                    学生学习报告
                    <Text type="secondary" style={{ marginLeft: 12, fontSize: 16 }}>
                        {location.state?.studentName || data?.realName || data?.userName || ''}
                    </Text>
                </Title>
            </Space>

            <Card style={{ marginBottom: 16 }}>
                <Space wrap>
                    <span>统计范围</span>
                    <Select value={rangeDays} style={{ width: 120 }} onChange={value => setRangeDays(value)}>
                        <Select.Option value={7}>近 7 天</Select.Option>
                        <Select.Option value={15}>近 15 天</Select.Option>
                        <Select.Option value={30}>近 30 天</Select.Option>
                    </Select>
                    <span>学科</span>
                    <Select
                        value={subjectId}
                        allowClear
                        placeholder="全部学科"
                        style={{ width: 220 }}
                        onChange={value => setSubjectId(value)}
                    >
                        {subjects.map(item => (
                            <Select.Option key={item.id} value={item.id}>
                                {item.name}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button type="primary" onClick={() => fetchReport(rangeDays, subjectId)}>
                        刷新
                    </Button>
                </Space>
            </Card>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                    <Spin size="large" tip="正在生成学习分析..." />
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
                        <Col xs={24} md={12}><Card><Statistic title="练习天数" value={data.practiceDays} suffix="天" /></Card></Col>
                        <Col xs={24} md={12}><Card><Statistic title="平均耗时" value={data.avgDoTime} suffix="秒" /></Card></Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} xl={12}>
                            <Card title="近期趋势">
                                {data.recentTrend?.length ? (
                                    <ReactECharts option={trendOption} style={{ height: 320 }} />
                                ) : (
                                    <Empty description="暂无趋势数据" />
                                )}
                            </Card>
                        </Col>
                        <Col xs={24} xl={12}>
                            <Card title="题型表现">
                                {data.questionTypeStats?.length ? (
                                    <ReactECharts option={typeOption} style={{ height: 320 }} />
                                ) : (
                                    <Empty description="暂无题型数据" />
                                )}
                            </Card>
                        </Col>
                    </Row>

                    <Card title="总体与学科评估" style={{ marginTop: 16 }}>
                        <Table columns={subjectColumns} dataSource={data.subjectStats || []} rowKey="subjectId" pagination={false} scroll={{ x: 'max-content' }} />
                    </Card>

                    <Card
                        title={<span><RobotOutlined /> AI 学习总结</span>}
                        style={{ marginTop: 16 }}
                        extra={<Tag color={data.report?.aiGenerated ? 'green' : 'gold'}>{data.report?.aiGenerated ? 'AI' : '规则回退'}</Tag>}
                    >
                        <Alert type="info" showIcon message={data.report?.learningStatus || '暂无总结'} style={{ marginBottom: 16 }} />
                        <Row gutter={[16, 16]}>
                            <Col xs={24} xl={12}>
                                <Card size="small" title="学习优势">
                                    <List dataSource={data.report?.strengths || []} renderItem={item => <List.Item>{item}</List.Item>} />
                                </Card>
                            </Col>
                            <Col xs={24} xl={12}>
                                <Card size="small" title="薄弱项">
                                    <List dataSource={data.report?.weaknesses || []} renderItem={item => <List.Item>{item}</List.Item>} />
                                </Card>
                            </Col>
                            <Col xs={24} xl={12}>
                                <Card size="small" title="学生建议">
                                    <List dataSource={data.report?.studentSuggestions || []} renderItem={item => <List.Item>{item}</List.Item>} />
                                </Card>
                            </Col>
                            <Col xs={24} xl={12}>
                                <Card size="small" title="教师建议">
                                    <List dataSource={data.report?.teacherSuggestions || []} renderItem={item => <List.Item>{item}</List.Item>} />
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </>
            )}
        </div>
    );
};

export default StudentLearningReport;
