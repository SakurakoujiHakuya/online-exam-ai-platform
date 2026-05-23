import React, { useEffect, useState } from 'react'
import { Card, Form, Input, Select, Rate, Button, InputNumber, Space, Divider, message, Spin } from 'antd'
import { RobotOutlined, PlayCircleOutlined } from '@ant-design/icons'
import subjectApi from '@/api/subject'
import aiApi from '@/api/ai'

const { Option } = Select
const { TextArea } = Input

const AiPractice = () => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [subjects, setSubjects] = useState([])
    const [generating, setGenerating] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await subjectApi.list()
                if (res && res.code === 1) {
                    setSubjects(res.response)
                }
            } catch (e) {
                console.error(e)
            }
        }
        fetchSubjects()
    }, [])

    const onFinish = async (values) => {
        setGenerating(true)
        try {
            const { subjectId, topic, difficult, ...counts } = values
            const questionCountMap = {}
            Object.keys(counts).forEach(key => {
                if (key.startsWith('count_')) {
                    const type = key.replace('count_', '')
                    if (counts[key] > 0) {
                        questionCountMap[type] = counts[key]
                    }
                }
            })

            if (Object.keys(questionCountMap).length === 0) {
                messageApi.warning('请至少选择一种题型并设置数量')
                setGenerating(false)
                return
            }

            const res = await aiApi.generatePaper({
                subjectId,
                topic,
                difficult,
                questionCountMap
            })

            if (res && res.code === 1) {
                messageApi.success('试卷生成成功！准备进入练习...')
                // Wait a bit and redirect
                setTimeout(() => {
                    window.open(`/#/do?id=${res.response}`, '_blank')
                    setGenerating(false)
                }, 1500)
            } else {
                messageApi.error(res?.message || '生成试卷失败，请重试')
                setGenerating(false)
            }
        } catch (e) {
            console.error(e)
            messageApi.error('由于系统繁忙或AI响应超时，请重试')
            setGenerating(false)
        }
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}>
            {contextHolder}
            <Spin spinning={generating} tip="AI 正在玩命生成题目并组装试卷，请稍候...">
                <Card 
                    title={<span><RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} />AI 智能练习</span>}
                    variant="none"
                    className="premium-card"
                    style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                >
                    <div style={{ marginBottom: 24, color: '#666' }}>
                        告诉 AI 你想练习的内容，它会为你实时生成一套针对性的练习卷。
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{
                            difficult: 3,
                            count_1: 5, // Default 5 single choice questions
                            count_2: 0,
                            count_3: 0,
                            count_4: 0,
                            count_5: 0,
                        }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                            <Form.Item
                                name="subjectId"
                                label="选择学科"
                                rules={[{ required: true, message: '请选择学科' }]}
                            >
                                <Select placeholder="请选择学科" size="large">
                                    {subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="difficult"
                                label="难度要求"
                                rules={[{ required: true }]}
                            >
                                <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
                                    <Rate />
                                </div>
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="topic"
                            label="练习主题 / 知识点"
                            rules={[{ required: true, message: '请输入你想练习的具体内容，描述越详细 AI 出题越精准' }]}
                        >
                            <TextArea 
                                placeholder="例如：Java 多线程、React Hooks 的使用、高中数学三角函数、英语定语从句等..." 
                                rows={4} 
                                size="large"
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>

                        <div style={{ borderBottom: '1px solid #e8e8e8', margin: '24px 0 16px', fontSize: 16, fontWeight: 500, paddingBottom: 8, color: '#333' }}>题型分配</div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 40px' }}>
                            <Form.Item name="count_1" label="单选题数量">
                                <InputNumber min={0} max={20} />
                            </Form.Item>
                            <Form.Item name="count_2" label="多选题数量">
                                <InputNumber min={0} max={10} />
                            </Form.Item>
                            <Form.Item name="count_3" label="判断题数量">
                                <InputNumber min={0} max={20} />
                            </Form.Item>
                            <Form.Item name="count_4" label="填空题数量">
                                <InputNumber min={0} max={10} />
                            </Form.Item>
                            <Form.Item name="count_5" label="简答题数量">
                                <InputNumber min={0} max={5} />
                            </Form.Item>
                        </div>

                        <Form.Item style={{ marginTop: 32, textAlign: 'center' }}>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                size="large" 
                                icon={<PlayCircleOutlined />}
                                style={{ height: 50, padding: '0 40px', borderRadius: 25, fontSize: 18, background: 'linear-gradient(135deg, #1890ff 0%, #001529 100%)', border: 'none' }}
                                loading={generating}
                            >
                                立即生成并练习
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Spin>
        </div>
    )
}

export default AiPractice
