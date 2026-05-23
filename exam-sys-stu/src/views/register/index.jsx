import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Select, message } from 'antd';
import { IdcardOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import educationApi from '@/api/education';
import registerApi from '@/api/register';
import './index.css';

const { Option } = Select;

const Register = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        educationApi.getGroupList().then(res => {
            if (res && res.code === 1) {
                setGroups(res.response);
                if (res.response.length > 0) {
                    form.setFieldsValue({ userGroupId: res.response[0].userGroupId });
                }
            }
        });
    }, [form]);

    const onFinish = async values => {
        setLoading(true);
        try {
            const res = await registerApi.register({
                userName: values.userName,
                realName: values.realName,
                password: values.password,
                userGroupId: values.userGroupId
            });
            if (res && res.code === 1) {
                message.success('注册成功，请登录');
                navigate('/login');
            } else {
                message.error(res.message || '注册失败');
            }
        } catch (error) {
            console.error(error);
            message.error('网络错误，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <Card className="register-card" bordered={false}>
                <div className="register-header">
                    <div className="logo-container">
                        <div className="logo-circle" />
                    </div>
                    <h2>考试系统 - 注册</h2>
                </div>
                <Form form={form} name="register" onFinish={onFinish} size="large" layout="vertical">
                    <Form.Item name="userName" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                        <Input prefix={<UserOutlined />} placeholder="用户名" />
                    </Form.Item>
                    <Form.Item name="realName" label="真实姓名" rules={[{ required: true, message: '请输入真实姓名' }]}>
                        <Input prefix={<IdcardOutlined />} placeholder="真实姓名" />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                    </Form.Item>
                    <Form.Item name="userGroupId" label="用户组" rules={[{ required: true, message: '请选择用户组' }]}>
                        <Select placeholder="请选择用户组">
                            {groups.map(item => (
                                <Option key={item.userGroupId} value={item.userGroupId}>{item.userGroupName}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            注册
                        </Button>
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            已有账号？<Link to="/login">去登录</Link>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Register;
