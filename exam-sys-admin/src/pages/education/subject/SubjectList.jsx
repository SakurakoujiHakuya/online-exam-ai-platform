import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Popconfirm, Space, Table, message } from 'antd';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { deleteGroup, pageGroups } from '@/api/group';
import './list.css';

const SubjectList = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { userInfo } = useSelector(state => state.user);
    const isAdmin = userInfo?.role === 3;
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0, showSizeChanger: true });

    const fetchData = async (page = 1, size = 10) => {
        setLoading(true);
        try {
            const values = form.getFieldsValue();
            const res = await pageGroups({ pageIndex: page, pageSize: size, id: values.id, name: values.name });
            if (res.code === 1) {
                setData(res.response.list);
                setPagination(prev => ({ ...prev, current: res.response.pageNum, total: res.response.total }));
            } else {
                message.error(res.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchData(pagination.current, pagination.pageSize);
        }
    }, []);

    if (!isAdmin) {
        return <Navigate to="/401" replace />;
    }

    return (
        <div className="app-container">
            <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
                <Form.Item name="id" label="组 ID">
                    <Input placeholder="组 ID" style={{ width: 120 }} allowClear />
                </Form.Item>
                <Form.Item name="name" label="用户组">
                    <Input placeholder="用户组名称" style={{ width: 220 }} allowClear />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={() => fetchData(1, pagination.pageSize)}>查询</Button>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={() => navigate('/education/subject/edit')}>新增用户组</Button>
                </Form.Item>
            </Form>
            <Table
                columns={[
                    { title: 'ID', dataIndex: 'id', key: 'id', width: 120 },
                    { title: '用户组名称', dataIndex: 'name', key: 'name' },
                    { title: '关联数量', dataIndex: 'referenceCount', key: 'referenceCount', width: 140 },
                    {
                        title: '操作',
                        key: 'action',
                        width: 220,
                        render: (_, record) => (
                            <Space size="middle">
                                <Button size="small" onClick={() => navigate(`/education/subject/edit?id=${record.id}`)}>编辑</Button>
                                <Popconfirm
                                    title={record.referenceCount > 0 ? '当前用户组仍被使用，无法删除' : '确定删除吗？'}
                                    onConfirm={async () => {
                                        const res = await deleteGroup(record.id);
                                        if (res.code === 1) {
                                            message.success(res.message);
                                            fetchData(pagination.current, pagination.pageSize);
                                        } else {
                                            message.error(res.message);
                                        }
                                    }}
                                    okButtonProps={{ disabled: record.referenceCount > 0 }}
                                >
                                    <Button size="small" danger disabled={record.referenceCount > 0}>删除</Button>
                                </Popconfirm>
                            </Space>
                        )
                    }
                ]}
                dataSource={data}
                rowKey="id"
                pagination={pagination}
                loading={loading}
                scroll={{ x: 'max-content' }}
                onChange={nextPagination => {
                    setPagination(nextPagination);
                    fetchData(nextPagination.current, nextPagination.pageSize);
                }}
                bordered
            />
        </div>
    );
};

export default SubjectList;
