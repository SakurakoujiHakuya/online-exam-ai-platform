import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Input, Button, Table, Tag, Popconfirm, message, Space } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as userApi from '@/api/user';
import { formatEnum } from '@/store/slices/enumItemSlice';

const UserAdminList = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);

    const { userInfo } = useSelector(state => state.user);
    const isAdmin = userInfo?.role === 3;

    const [queryParams, setQueryParams] = useState({
        userName: '',
        role: 2, // Search for Teachers (which now includes Admins in backend)
        pageIndex: 1,
        pageSize: 10
    });

    const { sexEnum, statusEnum, statusTag, statusBtn } = useSelector(state => state.enumItem.user);

    const queryParamsRef = useRef(queryParams);
    useEffect(() => {
        queryParamsRef.current = queryParams;
    }, [queryParams]);

    const fetchData = useCallback(() => {
        setLoading(true);
        userApi.getUserPageList(queryParamsRef.current).then(res => {
            if (res.code === 1) {
                setData(res.response.list);
                setTotal(res.response.total);
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchData();
    }, [queryParams.pageIndex, queryParams.pageSize, queryParams.userName, fetchData]);

    const onSearch = (values) => {
        setQueryParams({
            ...queryParams,
            ...values,
            pageIndex: 1
        });
    };

    const changeStatus = (row) => {
        userApi.changeStatus(row.id).then(res => {
            if (res.code === 1) {
                message.success(res.message);
                fetchData();
            } else {
                message.error(res.message);
            }
        });
    };

    const deleteUser = (row) => {
        userApi.deleteUser(row.id).then(res => {
            if (res.code === 1) {
                message.success(res.message);
                fetchData();
            } else {
                message.error(res.message);
            }
        });
    };

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: 80
        },
        {
            title: '用户名',
            dataIndex: 'userName',
            key: 'userName',
            width: 180,
            render: (text, record) => (
                <span>
                    {text}
                    {record.role === 3 && <Tag color="gold" style={{ marginLeft: 8 }}>管理员</Tag>}
                </span>
            )
        },
        {
            title: '真实姓名',
            dataIndex: 'realName',
            key: 'realName',
            width: 120
        },
        {
            title: '性别',
            dataIndex: 'sex',
            key: 'sex',
            width: 80,
            render: (text) => formatEnum(sexEnum, text)
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
            width: 140
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 200
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (text) => {
                const tagType = formatEnum(statusTag, text);
                const statusText = formatEnum(statusEnum, text);
                return <Tag color={tagType === 'danger' ? 'error' : tagType}>{statusText}</Tag>;
            }
        },
        ...(isAdmin ? [{
            title: '操作',
            key: 'action',
            width: 220,
            render: (_, record) => (
                <Space size="middle">
                    <Button size="small" onClick={() => changeStatus(record)}>
                        {formatEnum(statusBtn, record.status)}
                    </Button>
                    <Button size="small" onClick={() => navigate(`/user/admin/edit?id=${record.id}`)}>
                        编辑
                    </Button>
                    <Popconfirm title="确定删除吗?" onConfirm={() => deleteUser(record)}>
                        <Button size="small" danger>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        }] : []),
    ];

    return (
        <div className="app-container">
            <Form
                form={form}
                layout="inline"
                onFinish={onSearch}
                initialValues={{ userName: '' }}
                className="search-form"
            >
                <Form.Item name="userName" label="用户名">
                    <Input placeholder="请输入用户名" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">查询</Button>
                </Form.Item>
                {isAdmin && (
                    <Form.Item>
                        <Button type="primary" onClick={() => navigate('/user/admin/edit')}>添加</Button>
                    </Form.Item>
                )}
            </Form>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
                pagination={{
                    current: queryParams.pageIndex,
                    pageSize: queryParams.pageSize,
                    total: total,
                    onChange: (page, pageSize) => {
                        setQueryParams({
                            ...queryParams,
                            pageIndex: page,
                            pageSize: pageSize
                        });
                    }
                }}
            />
        </div>
    );
};

export default UserAdminList;
