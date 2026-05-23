import React, { useEffect, useState } from 'react';
import { Avatar, Button, Card, Col, Form, Input, Row, Select, Tabs, Timeline, Upload, message } from 'antd';
import Cookies from 'js-cookie';
import userApi from '@/api/user';
import { formatChinaDateTime } from '@/utils/time';

const UserInfo = () => {
    const [form] = Form.useForm();
    const [userInfo, setUserInfo] = useState({});
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [userRes, eventRes] = await Promise.all([
                userApi.getCurrentUser(),
                userApi.getUserEvent()
            ]);

            if (userRes && userRes.code === 1) {
                setUserInfo(userRes.response);
                form.setFieldsValue({ ...userRes.response });
            }
            if (eventRes && eventRes.code === 1) {
                setEvents(eventRes.response);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const onFinish = async values => {
        setLoading(true);
        try {
            const res = await userApi.update({ ...userInfo, ...values });
            if (res.code === 1) {
                message.success(res.message);
                fetchData();
            } else {
                message.error(res.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        name: 'file',
        action: '/api/student/upload/image',
        headers: {
            token: Cookies.get('studentToken') || ''
        },
        showUploadList: false,
        beforeUpload: file => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                message.error('仅支持 JPG/PNG 图片');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('图片大小不能超过 2MB');
            }
            return isJpgOrPng && isLt2M;
        },
        onChange: info => {
            if (info.file.status === 'done') {
                if (info.file.response && info.file.response.code === 1) {
                    message.success('头像上传成功');
                    setUserInfo(prev => ({ ...prev, imagePath: info.file.response.response }));
                    fetchData();
                } else {
                    message.error(info.file.response?.message || '上传失败');
                }
            } else if (info.file.status === 'error') {
                message.error('上传失败');
            }
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <Row justify="center" gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Card title="个人信息" style={{ textAlign: 'center' }}>
                        <Upload {...uploadProps}>
                            <Avatar size={120} src={userInfo.imagePath || 'src/assets/avatar.png'} style={{ cursor: 'pointer' }} />
                        </Upload>
                        <h2>{userInfo.userName}</h2>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 15, flexWrap: 'wrap' }}>
                            <span>姓名：{userInfo.realName}</span>
                            <span>用户组：{userInfo.userGroupName || userInfo.userGroupId}</span>
                            <span>创建时间：{formatChinaDateTime(userInfo.createTime)}</span>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row justify="center" style={{ marginTop: 24 }}>
                <Col xs={24} md={12}>
                    <Card>
                        <Tabs
                            defaultActiveKey="event"
                            items={[
                                {
                                    key: 'event',
                                    label: '动态记录',
                                    children: (
                                        <Timeline
                                            items={events.map(item => ({
                                                color: 'green',
                                                children: (
                                                    <>
                                                        <p>{formatChinaDateTime(item.createTime)}</p>
                                                        <p dangerouslySetInnerHTML={{ __html: item.content }} />
                                                    </>
                                                )
                                            }))}
                                        />
                                    )
                                },
                                {
                                    key: 'update',
                                    label: '编辑资料',
                                    forceRender: true,
                                    children: (
                                        <Form form={form} layout="vertical" onFinish={onFinish}>
                                            <Form.Item name="realName" label="真实姓名" rules={[{ required: true }]}>
                                                <Input />
                                            </Form.Item>
                                            <Form.Item name="age" label="年龄">
                                                <Input />
                                            </Form.Item>
                                            <Form.Item name="sex" label="性别">
                                                <Select>
                                                    <Select.Option value={1}>男</Select.Option>
                                                    <Select.Option value={2}>女</Select.Option>
                                                </Select>
                                            </Form.Item>
                                            <Form.Item name="phone" label="手机号">
                                                <Input />
                                            </Form.Item>
                                            <Button type="primary" htmlType="submit" loading={loading}>更新</Button>
                                        </Form>
                                    )
                                }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default UserInfo;
