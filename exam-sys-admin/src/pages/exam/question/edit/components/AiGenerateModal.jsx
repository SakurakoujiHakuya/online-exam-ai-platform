import React, { useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space, Divider, message, Spin } from 'antd';
import { RobotOutlined, ReloadOutlined, CheckOutlined } from '@ant-design/icons';
import { generateQuestion } from '@/api/aiGeneration';
import QuestionShow from '../../components/QuestionShow';

const { TextArea } = Input;
const { Option } = Select;

const AiGenerateModal = ({ visible, onClose, onConfirm, questionType }) => {
    const [form] = Form.useForm();
    const [generating, setGenerating] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const handleGenerate = async () => {
        try {
            const values = await form.validateFields();
            setGenerating(true);
            const res = await generateQuestion({
                ...values,
                questionType: questionType
            });
            if (res.code === 1) {
                setPreviewData(res.response);
                setIsPreviewVisible(true);
            } else {
                message.error(res.message);
            }
        } catch (error) {
            console.error('Generate failed:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleConfirm = () => {
        onConfirm(previewData);
        setPreviewData(null);
        setIsPreviewVisible(false);
        onClose();
        message.success('已自动填充到表单');
    };

    return (
        <Modal
            title={<><RobotOutlined style={{ color: '#1890ff', marginRight: 8 }} />AI 智能出题助手</>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            destroyOnClose
        >
            <Spin spinning={generating} tip="AI 正在命题中，请稍候...">
                <Form form={form} layout="vertical" initialValues={{ difficult: 3 }}>
                    <Form.Item name="topic" label="考察知识点 / 题目主题" rules={[{ required: true, message: '请输入知识点，如：勾股定理' }]}>
                        <Input placeholder="输入知识点快速出题" />
                    </Form.Item>
                    <Form.Item name="referenceText" label="参考材料 (可选)">
                        <TextArea rows={4} placeholder="可以粘贴一段文本，让 AI 根据材料出题" />
                    </Form.Item>
                    <Form.Item name="difficult" label="题目难度">
                        <Select>
                            <Option value={1}>1 星 (基础)</Option>
                            <Option value={2}>2 星 (容易)</Option>
                            <Option value={3}>3 星 (中等)</Option>
                            <Option value={4}>4 星 (较难)</Option>
                            <Option value={5}>5 星 (极难)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={onClose}>取消</Button>
                            <Button type="primary" onClick={handleGenerate} loading={generating} icon={<RobotOutlined />}>开始生成</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Spin>

            <Modal
                title="AI 生成结果预览"
                open={isPreviewVisible}
                onCancel={() => setIsPreviewVisible(false)}
                width={800}
                style={{ top: 20 }}
                footer={[
                    <Button key="retry" icon={<ReloadOutlined />} onClick={handleGenerate} loading={generating}>重新生成</Button>,
                    <Button key="cancel" onClick={() => setIsPreviewVisible(false)}>关闭</Button>,
                    <Button key="confirm" type="primary" icon={<CheckOutlined />} onClick={handleConfirm}>确认并填充</Button>
                ]}
            >
                <QuestionShow
                    qType={questionType}
                    question={previewData}
                    open={isPreviewVisible}
                    onClose={() => setIsPreviewVisible(false)}
                    noModal={true}
                />
            </Modal>
        </Modal>
    );
};

export default AiGenerateModal;
