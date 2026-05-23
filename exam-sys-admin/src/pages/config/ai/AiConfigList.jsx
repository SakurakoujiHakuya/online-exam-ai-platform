import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, Input, Select, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getAiConfigList, editAiConfig, deleteAiConfig, setActiveAiConfig } from '@/api/aiConfig';
import TableTooltip from '@/components/TableTooltip';
import { formatChinaDateTime } from '@/utils/time';
import './AiConfigList.css';

const { Option } = Select;
const { TextArea } = Input;

const AiConfigList = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getAiConfigList();
            if (res.code === 1) {
                setData(res.response || []);
            } else {
                message.error(res.message || '加载配置失败');
            }
        } catch (error) {
            message.error('加载配置失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个 AI 配置吗？',
            onOk: async () => {
                try {
                    const res = await deleteAiConfig(id);
                    if (res.code === 1) {
                        message.success('删除成功');
                        fetchData();
                    } else {
                        message.error(res.message || '删除失败');
                    }
                } catch (error) {
                    message.error('删除失败');
                }
            }
        });
    };

    const handleSetActive = async (id) => {
        try {
            const res = await setActiveAiConfig(id);
            if (res.code === 1) {
                message.success('已切换为当前启用模型');
                fetchData();
            } else {
                message.error(res.message || '设置失败');
            }
        } catch (error) {
            message.error('设置失败');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const res = await editAiConfig({ ...values, id: editingId });
            if (res.code === 1) {
                message.success(editingId ? '修改成功' : '新增成功');
                setIsModalVisible(false);
                fetchData();
            } else {
                message.error(res.message || '保存失败');
            }
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            message.error('保存失败');
        }
    };

    const columns = [
        {
            title: '配置名称',
            dataIndex: 'name',
            key: 'name',
            width: 220,
            render: (text, record) => (
                <div className="ai-config-list__name">
                    <span className="ai-config-list__name-text">{text || '-'}</span>
                    {record.isActive === 1 && (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                            使用中
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: '服务商',
            dataIndex: 'provider',
            key: 'provider',
            width: 120,
            render: (text) => <Tag color="blue">{text ? text.toUpperCase() : '-'}</Tag>,
        },
        {
            title: '模型名称',
            dataIndex: 'modelName',
            key: 'modelName',
            width: 180,
            render: (text) => <TableTooltip text={text} maxWidth={160} />,
        },
        {
            title: '接口地址',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            width: 300,
            render: (text) => <TableTooltip text={text} maxWidth={280} />,
        },
        {
            title: '更新时间',
            dataIndex: 'modifyTime',
            key: 'modifyTime',
            width: 180,
            render: (text) => formatChinaDateTime(text),
        },
        {
            title: '操作',
            key: 'action',
            width: 220,
            render: (_, record) => (
                <div className="ai-config-list__actions">
                    {record.isActive !== 1 && (
                        <Button
                            type="link"
                            style={{ color: '#52c41a' }}
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleSetActive(record.id)}
                        >
                            设为启用
                        </Button>
                    )}
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
                        删除
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="app-container ai-config-list">
            <Card
                title="AI 大模型配置"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        新增配置
                    </Button>
                }
            >
                <Table
                    className="ai-config-list__table"
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                />

                <Modal
                    title={editingId ? '编辑配置' : '新增配置'}
                    open={isModalVisible}
                    onOk={handleOk}
                    onCancel={() => setIsModalVisible(false)}
                    width={700}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="name"
                            label="配置名称"
                            rules={[{ required: true, message: '请输入配置名称' }]}
                        >
                            <Input placeholder="例如：OpenAI 生产环境" />
                        </Form.Item>
                        <Form.Item
                            name="provider"
                            label="服务商"
                            rules={[{ required: true, message: '请选择服务商' }]}
                        >
                            <Select placeholder="请选择服务商">
                                <Option value="openai">OpenAI</Option>
                                <Option value="azure">Azure</Option>
                                <Option value="deepseek">DeepSeek</Option>
                                <Option value="other">其他（OpenAPI 兼容）</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="apiKey"
                            label="接口密钥"
                            rules={[{ required: true, message: '请输入接口密钥' }]}
                        >
                            <Input.Password placeholder="请输入接口密钥" />
                        </Form.Item>
                        <Form.Item
                            name="baseUrl"
                            label="接口地址"
                            rules={[{ required: true, message: '请输入接口地址' }]}
                        >
                            <Input placeholder="例如：https://api.openai.com/v1" />
                        </Form.Item>
                        <Form.Item
                            name="modelName"
                            label="模型名称"
                            rules={[{ required: true, message: '请输入模型名称' }]}
                        >
                            <Input placeholder="例如：gpt-4o" />
                        </Form.Item>
                        <Form.Item name="configJson" label="高级配置（JSON）">
                            <TextArea rows={4} placeholder='{"temperature": 0.7, "max_tokens": 2048}' />
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};

export default AiConfigList;
