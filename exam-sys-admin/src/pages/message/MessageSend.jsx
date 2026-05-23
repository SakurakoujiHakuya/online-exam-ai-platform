import React, { useState } from 'react';
import { Form, Input, Select, Button, message, Card, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { send } from '@/api/message';
import { selectByUserName } from '@/api/user';

const MessageSend = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userOptions, setUserOptions] = useState([]);
    const [searching, setSearching] = useState(false);

    const handleSearchUser = async (value) => {
        if (value) {
            setSearching(true);
            try {
                const res = await selectByUserName({ userName: value });
                if (res.code === 1) {
                    setUserOptions(res.response);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setSearching(false);
            }
        } else {
            setUserOptions([]);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await send(values);
            if (res.code === 1) {
                message.success(res.message);
                navigate('/message/list');
            } else {
                message.error(res.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onReset = () => {
        form.resetFields();
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card title="发送消息" bordered={false} style={{ maxWidth: 800 }}>
                <Spin spinning={loading}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="title"
                            label="标题"
                            rules={[{ required: true, message: '请输入消息标题' }]}
                        >
                            <Input placeholder="请输入消息标题" />
                        </Form.Item>

                        <Form.Item
                            name="content"
                            label="内容"
                            rules={[{ required: true, message: '请输入消息内容' }]}
                        >
                            <Input.TextArea rows={13} placeholder="请输入消息内容" />
                        </Form.Item>

                        <Form.Item
                            name="receiveUserIds"
                            label="接收人"
                            rules={[{ required: true, message: '请选择接收人' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="请输入用户名搜索"
                                filterOption={false}
                                onSearch={handleSearchUser}
                                loading={searching}
                                showSearch
                                style={{ width: '100%' }}
                            >
                                {userOptions.map(item => (
                                    <Select.Option key={item.value} value={item.value}>
                                        {item.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
                                发送
                            </Button>
                            <Button onClick={onReset}>
                                重置
                            </Button>
                            <Button onClick={() => navigate('/message/list')} style={{ marginLeft: 8 }}>
                                返回
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Card>
        </div>
    );
};

export default MessageSend;
