import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Empty, Form, Input, List, Pagination, Row, Select, Space, Spin, Table, Tag, message } from 'antd'
import questionAnswerApi from '@/api/questionAnswer'
import collaborationApi from '@/api/collaboration'
import QuestionAnswerShow from '@/views/exam/components/QuestionAnswerShow'

const feedbackOptions = [
    '题干表述不清',
    '答案有争议',
    '解析看不懂',
    '难度不匹配',
    '知识点标签可疑'
]

const questionTypeEnum = {
    1: '单选题',
    2: '多选题',
    3: '判断题',
    4: '填空题',
    5: '简答题'
}

const QuestionErrorIndex = () => {
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [total, setTotal] = useState(0)
    const [queryParam, setQueryParam] = useState({
        pageIndex: 1,
        pageSize: 10
    })
    const [qAnswerLoading, setQAnswerLoading] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [selectItem, setSelectItem] = useState({
        questionType: 0,
        questionItem: null,
        answerItem: null
    })
    const [adoptedSolutions, setAdoptedSolutions] = useState([])
    const [feedbackForm] = Form.useForm()
    const [solutionForm] = Form.useForm()

    useEffect(() => {
        search()
    }, [queryParam.pageIndex, queryParam.pageSize])

    const search = async () => {
        setLoading(true)
        try {
            const res = await questionAnswerApi.pageList(queryParam)
            if (res && res.response) {
                setTableData(res.response.list || [])
                setTotal(res.response.total || 0)
                if ((res.response.list || []).length > 0) {
                    qAnswerShow(res.response.list[0].id)
                } else {
                    setSelectItem({ questionType: 0, questionItem: null, answerItem: null })
                    setAdoptedSolutions([])
                }
            }
        } finally {
            setLoading(false)
        }
    }

    const qAnswerShow = async id => {
        setQAnswerLoading(true)
        setDetailLoading(true)
        try {
            const res = await questionAnswerApi.select(id)
            if (res && res.response) {
                const { questionVM, questionAnswerVM } = res.response
                setSelectItem({
                    questionType: questionVM.questionType,
                    questionItem: questionVM,
                    answerItem: questionAnswerVM
                })
                feedbackForm.setFieldsValue({ feedbackType: '解析看不懂' })
                solutionForm.resetFields()
                const adoptedRes = await collaborationApi.adoptedSolutions(questionVM.id)
                setAdoptedSolutions(adoptedRes?.response || [])
            }
        } finally {
            setQAnswerLoading(false)
            setDetailLoading(false)
        }
    }

    const submitFeedback = async values => {
        const questionId = selectItem.questionItem?.id
        if (!questionId) {
            return
        }
        const res = await collaborationApi.submitFeedback({
            questionId,
            ...values
        })
        if (res && res.code === 1) {
            message.success('反馈已提交，等待教师审核')
            feedbackForm.resetFields()
            feedbackForm.setFieldsValue({ feedbackType: '解析看不懂' })
        }
    }

    const submitSolution = async values => {
        const questionId = selectItem.questionItem?.id
        if (!questionId) {
            return
        }
        const res = await collaborationApi.submitSolution({
            questionId,
            content: values.content
        })
        if (res && res.code === 1) {
            message.success('解法/错因总结已提交')
            solutionForm.resetFields()
        }
    }

    const columns = [
        { title: '题干', dataIndex: 'shortTitle', ellipsis: true },
        {
            title: '题型',
            dataIndex: 'questionType',
            align: 'center',
            width: 100,
            render: type => <Tag>{questionTypeEnum[type] || type}</Tag>
        },
        { title: '学科', dataIndex: 'subjectName', width: 100, align: 'center' },
        { title: '做题时间', dataIndex: 'createTime', width: 180, align: 'center' }
    ]

    return (
        <div style={{ padding: 20 }}>
            <Card title="我的错题本" bordered={false}>
                <Row gutter={24}>
                    <Col span={10}>
                        <Table
                            dataSource={tableData}
                            columns={columns}
                            loading={loading}
                            rowKey="id"
                            onRow={record => ({
                                onClick: () => qAnswerShow(record.id),
                                style: { cursor: 'pointer' }
                            })}
                            pagination={false}
                        />
                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <Pagination
                                current={queryParam.pageIndex}
                                pageSize={queryParam.pageSize}
                                total={total}
                                onChange={(page, pageSize) => setQueryParam({ pageIndex: page, pageSize })}
                            />
                        </div>
                    </Col>
                    <Col span={14}>
                        <Spin spinning={qAnswerLoading || detailLoading}>
                            {selectItem.questionItem ? (
                                <>
                                    <Card title="题目详情与解析" bordered={false} style={{ background: '#fafafa', marginBottom: 16 }}>
                                        <QuestionAnswerShow
                                            qType={selectItem.questionType}
                                            question={selectItem.questionItem}
                                            answer={selectItem.answerItem}
                                        />
                                    </Card>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Card title="题目反馈" bordered={false}>
                                                <Form form={feedbackForm} layout="vertical" onFinish={submitFeedback} initialValues={{ feedbackType: '解析看不懂' }}>
                                                    <Form.Item name="feedbackType" label="反馈类型" rules={[{ required: true, message: '请选择反馈类型' }]}>
                                                        <Select options={feedbackOptions.map(item => ({ label: item, value: item }))} />
                                                    </Form.Item>
                                                    <Form.Item name="feedbackContent" label="反馈内容" rules={[{ required: true, message: '请填写反馈内容' }]}>
                                                        <Input.TextArea rows={4} placeholder="例如：第二步推导跳得太快，看不明白为什么这样变形。" />
                                                    </Form.Item>
                                                    <div style={{ marginBottom: 12, color: '#666', fontSize: 12 }}>
                                                        系统会结合题目上下文和你的反馈做模型分析；如果模型暂时不可用，会自动回退到规则分析。
                                                    </div>
                                                    <Button type="primary" htmlType="submit">提交反馈</Button>
                                                </Form>
                                            </Card>
                                        </Col>
                                        <Col span={12}>
                                            <Card title="我的解法 / 错因总结" bordered={false}>
                                                <Form form={solutionForm} layout="vertical" onFinish={submitSolution}>
                                                    <Form.Item name="content" label="内容" rules={[{ required: true, message: '请填写解法或错因总结' }]}>
                                                        <Input.TextArea rows={6} placeholder="例如：我错在把已知条件漏掉了，正确思路应先列式，再代入求值。" />
                                                    </Form.Item>
                                                    <Button type="primary" htmlType="submit">提交共建内容</Button>
                                                </Form>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Card title="已采纳的学生优秀思路" bordered={false} style={{ marginTop: 16 }}>
                                        {adoptedSolutions.length === 0 ? (
                                            <Empty description="当前题目还没有被采纳的学生思路" />
                                        ) : (
                                            <List
                                                dataSource={adoptedSolutions}
                                                renderItem={item => (
                                                    <List.Item>
                                                        <div style={{ width: '100%' }}>
                                                            <Space wrap style={{ marginBottom: 8 }}>
                                                                <Tag color="green">{item.studentName}</Tag>
                                                                <Tag color="blue">质量分 {item.qualityScore || 0}</Tag>
                                                                <Tag color={item.analysisSource === 'llm' ? 'geekblue' : 'default'}>
                                                                    {item.analysisSourceLabel || '规则兜底'}
                                                                </Tag>
                                                                <Tag>{item.createTime}</Tag>
                                                            </Space>
                                                            <div style={{ marginBottom: 8, color: '#333' }}>{item.content}</div>
                                                            {item.aiSummary && <div style={{ color: '#666' }}>模型提炼：{item.aiSummary}</div>}
                                                            {item.reviewComment && <div style={{ color: '#999', marginTop: 6 }}>教师评语：{item.reviewComment}</div>}
                                                        </div>
                                                    </List.Item>
                                                )}
                                            />
                                        )}
                                    </Card>
                                </>
                            ) : (
                                <Empty description="请选择一道错题查看详情" />
                            )}
                        </Spin>
                    </Col>
                </Row>
            </Card>
        </div>
    )
}

export default QuestionErrorIndex
