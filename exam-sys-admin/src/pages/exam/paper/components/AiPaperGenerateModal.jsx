import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Rate, InputNumber, message, Spin } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { generatePaper } from '@/api/aiGeneration';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const AiPaperGenerateModal = ({ visible, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [generating, setGenerating] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const subjects = useSelector(state => state.subject.subjects);

    useEffect(() => {
        if (visible) {
            form.resetFields();
        }
    }, [visible, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setGenerating(true);
            
            const { subjectId, topic, difficult, paperType, ...counts } = values;
            const questionCountMap = {};
            Object.keys(counts).forEach(key => {
                if (key.startsWith('count_')) {
                    const type = key.replace('count_', '');
                    if (counts[key] > 0) {
                        questionCountMap[type] = counts[key];
                    }
                }
            });

            if (Object.keys(questionCountMap).length === 0) {
                messageApi.warning('请至少选择一种题型并设置数量');
                setGenerating(false);
                return;
            }

            const res = await generatePaper({
                subjectId,
                topic,
                difficult,
                paperType,
                questionCountMap
            });

            if (res && res.code === 1) {
                messageApi.success('AI智能组卷成功，即将进入预览及编辑页！');
                setGenerating(false);
                onSuccess();
                navigate('/exam/paper/edit', { state: { paperVM: res.response } });
            } else {
                messageApi.error(res?.message || '生成试卷失败，请重试');
                setGenerating(false);
            }
        } catch (error) {
            console.error(error);
            // Ignore form validation errors or show generic error
            if (!error.errorFields) {
                messageApi.error('由于系统繁忙或AI响应超时，请重试');
            }
            setGenerating(false);
        }
    };

    return (
        <Modal
            title={<span><RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} />AI 智能组卷</span>}
            open={visible}
            onOk={handleOk}
            onCancel={() => {
                if (!generating) onClose();
            }}
            confirmLoading={generating}
            okText="立即生成并添加到题库"
            cancelText="取消"
            width={700}
            maskClosable={false}
            keyboard={false}
        >
            {contextHolder}
            <Spin spinning={generating} tip="AI 正在玩命生成题目并组装试卷，请稍候...">
                <div style={{ padding: '10px 0' }}>
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            difficult: 3,
                            paperType: 1, // Default to Fixed paper
                            count_1: 5,
                            count_2: 0,
                            count_3: 0,
                            count_4: 0,
                            count_5: 0,
                        }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
                            <Form.Item
                                name="subjectId"
                                label="选择学科"
                                rules={[{ required: true, message: '请选择学科' }]}
                            >
                                <Select placeholder="请选择学科">
                                    {subjects.map(s => <Option key={s.id} value={s.id}>{s.name} ( {s.userGroupName} )</Option>)}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="paperType"
                                label="试卷类型"
                                rules={[{ required: true, message: '请选择试卷类型' }]}
                            >
                                <Select placeholder="请选择类型">
                                    <Option value={1}>固定试卷</Option>
                                    <Option value={6}>考试试卷</Option>
                                    <Option value={7}>AI练习试卷</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="difficult"
                                label="难度要求"
                                rules={[{ required: true }]}
                            >
                                <div style={{ height: 32, display: 'flex', alignItems: 'center' }}>
                                    <Rate style={{ fontSize: 16 }} />
                                </div>
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="topic"
                            label="组卷主题 / 知识点要求"
                            rules={[{ required: true, message: '请输入你想出题的具体内容要求，描述越详细 AI 出题越精准' }]}
                        >
                            <TextArea 
                                placeholder="例如：出这份卷子用来测试本周学习的定语从句，重点考察关系代词的用法，可以包含一些容易混淆的历年真题改编..." 
                                rows={3} 
                            />
                        </Form.Item>

                        <div style={{ borderBottom: '1px solid #e8e8e8', margin: '16px 0 12px', fontSize: 14, fontWeight: 500, paddingBottom: 8, color: '#333' }}>题型分布</div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
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
                    </Form>
                </div>
            </Spin>
        </Modal>
    );
};

export default AiPaperGenerateModal;
