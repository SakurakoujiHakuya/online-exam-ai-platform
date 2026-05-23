import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { updateUser } from '@/api/user';
import './Account.css';

const Account = ({ userInfo, onUpdate }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        form.setFieldsValue({
            realName: userInfo.realName,
            phone: userInfo.phone
        });
    }, [userInfo, form]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await updateUser({
                ...userInfo,
                ...values
            });
            if (res.code === 1) {
                message.success(res.message);
                if (onUpdate) {
                    onUpdate(res.response);
                }
            } else {
                message.error(res.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} className="account-form">
            <Form.Item
                label="真实姓名"
                name="realName"
                rules={[{ required: true, message: '请输入真实姓名' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="手机号"
                name="phone"
                rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    更新
                </Button>
            </Form.Item>
        </Form>
    );
};

export default Account;
