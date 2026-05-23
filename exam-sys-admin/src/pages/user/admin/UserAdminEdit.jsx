import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, DatePicker, message, Card, Spin, Space, Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as userApi from '@/api/user';
import { chinaDayjs } from '@/utils/time';

const { Option } = Select;

const UserAdminEdit = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const { sexEnum, statusEnum, roleEnum } = useSelector(state => state.enumItem.user);

    useEffect(() => {
        if (id && parseInt(id) !== 0) {
            setFormLoading(true);
            userApi.selectUser(id).then(res => {
                const data = res.response;
                // Convert birthDay to dayjs object for DatePicker
                if (data.birthDay) {
                    data.birthDay = chinaDayjs(data.birthDay);
                }
                form.setFieldsValue(data);
                setFormLoading(false);
            }).catch(() => {
                setFormLoading(false);
            });
        }
    }, [id, form]);

    const onFinish = (values) => {
        setLoading(true);
        const submitData = {
            ...values,
            id: id,
            birthDay: values.birthDay ? values.birthDay.format('YYYY-MM-DD') : null
        };

        userApi.createUser(submitData).then(res => {
            if (res.code === 1) {
                message.success(res.message);
                navigate('/user/admin/list');
            } else {
                message.error(res.message);
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    };

    const onReset = () => {
        form.resetFields();
    };

    return (
        <div className="app-container">
            <Card title={id ? "编辑教师/管理员" : "添加教师/管理员"} bordered={false}>
                <Spin spinning={formLoading}>
                    <Form
                        form={form}
                        layout="horizontal"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        onFinish={onFinish}
                        initialValues={{
                            status: 1,
                            sex: '',
                            role: 2
                        }}
                    >
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item
                                    name="userName"
                                    label="用户名"
                                    rules={[{ required: true, message: '请输入用户名' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="password"
                                    label="密码"
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="realName"
                                    label="真实姓名"
                                    rules={[{ required: true, message: '请输入真实姓名' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="age" label="年龄">
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="sex" label="性别">
                                    <Select placeholder="性别" allowClear style={{ width: '100%' }}>
                                        {sexEnum.map(item => (
                                            <Option key={item.key} value={item.key}>{item.value}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="birthDay" label="出生日期">
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="phone" label="手机">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="status"
                                    label="状态"
                                    rules={[{ required: true, message: '请选择状态' }]}
                                >
                                    <Select placeholder="状态" style={{ width: '100%' }}>
                                        {statusEnum.map(item => (
                                            <Option key={item.key} value={item.key}>{item.value}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="role"
                                    label="角色"
                                    rules={[{ required: true, message: '请选择角色' }]}
                                >
                                    <Select placeholder="角色" style={{ width: '100%' }}>
                                        {roleEnum.filter(r => r.key !== 1).map(item => (
                                            <Option key={item.key} value={item.key}>{item.value}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item wrapperCol={{ offset: 3, span: 21 }}>
                            <Space>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    提交
                                </Button>
                                <Button onClick={onReset}>重置</Button>
                                <Button onClick={() => navigate('/user/admin/list')}>返回</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </Card>
        </div>
    );
};

export default UserAdminEdit;
