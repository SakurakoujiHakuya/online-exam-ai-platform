import React, { useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Spin, message } from 'antd';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { groupList } from '@/api/subject';
import * as userApi from '@/api/user';
import { chinaDayjs } from '@/utils/time';

const { Option } = Select;

const UserStudentEdit = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [groups, setGroups] = useState([]);
    const { userInfo } = useSelector(state => state.user);
    const isAdmin = userInfo?.role === 3;
    const { sexEnum, statusEnum } = useSelector(state => state.enumItem.user);

    useEffect(() => {
        if (!isAdmin) {
            return;
        }
        groupList().then(res => {
            if (res.code === 1) {
                setGroups(res.response);
            }
        });
        if (id && parseInt(id, 10) !== 0) {
            setFormLoading(true);
            userApi.selectUser(id).then(res => {
                const data = res.response;
                if (data.birthDay) {
                    data.birthDay = chinaDayjs(data.birthDay);
                }
                form.setFieldsValue(data);
            }).finally(() => setFormLoading(false));
        }
    }, [form, id, isAdmin]);

    if (!isAdmin) {
        return <Navigate to="/401" replace />;
    }

    const onFinish = values => {
        setLoading(true);
        userApi.createUser({
            ...values,
            id,
            role: 1,
            birthDay: values.birthDay ? values.birthDay.format('YYYY-MM-DD') : null
        }).then(res => {
            if (res.code === 1) {
                message.success(res.message);
                navigate('/user/student/list');
            } else {
                message.error(res.message);
            }
        }).finally(() => setLoading(false));
    };

    return (
        <div className="app-container">
            <Card title={id ? '编辑学生' : '添加学生'} bordered={false}>
                <Spin spinning={formLoading}>
                    <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={onFinish} initialValues={{ status: 1, sex: '', role: 1 }}>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="userName" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="password" label="密码">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="realName" label="真实姓名" rules={[{ required: true, message: '请输入姓名' }]}>
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
                                <Form.Item name="phone" label="手机号">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="userGroupId" label="用户组" rules={[{ required: true, message: '请选择用户组' }]}>
                                    <Select placeholder="用户组" style={{ width: '100%' }}>
                                        {groups.map(item => (
                                            <Option key={item.userGroupId} value={item.userGroupId}>{item.userGroupName}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
                                    <Select placeholder="状态" style={{ width: '100%' }}>
                                        {statusEnum.map(item => (
                                            <Option key={item.key} value={item.key}>{item.value}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="excellent" label="优秀学员">
                                    <Select placeholder="优秀学员" style={{ width: '100%' }}>
                                        <Option value={true}>是</Option>
                                        <Option value={false}>否</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="comment" label="评语">
                                    <Input.TextArea rows={4} maxLength={255} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item wrapperCol={{ offset: 3, span: 21 }}>
                            <Space>
                                <Button type="primary" htmlType="submit" loading={loading}>提交</Button>
                                <Button onClick={() => form.resetFields()}>重置</Button>
                                <Button onClick={() => navigate('/user/student/list')}>返回</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </Card>
        </div>
    );
};

export default UserStudentEdit;
