import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Popconfirm, Select, Table, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { deleteTask, pageList } from '@/api/task';
import { groupList } from '@/api/subject';
import TableTooltip from '@/components/TableTooltip';
import './TaskList.css';

const TaskList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [total, setTotal] = useState(0);
    const [groups, setGroups] = useState([]);
    const [queryParam, setQueryParam] = useState({
        userGroupId: null,
        pageIndex: 1,
        pageSize: 10
    });

    const queryParamRef = useRef(queryParam);
    useEffect(() => {
        queryParamRef.current = queryParam;
    }, [queryParam]);

    const search = useCallback((overrides) => {
        setLoading(true);
        const params = { ...queryParamRef.current, ...overrides };
        pageList(params).then(data => {
            if (data.code === 1) {
                setTableData(data.response.list);
                setTotal(data.response.total);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        groupList().then(res => {
            if (res.code === 1) {
                setGroups(res.response);
            }
        });
        search();
    }, []);

    const handleDelete = row => {
        deleteTask(row.id).then(data => {
            if (data.code === 1) {
                message.success(data.message);
                search();
            } else {
                message.error(data.message);
            }
        });
    };

    const columns = [
        { title: 'Id', dataIndex: 'id', key: 'id', width: 100 },
        { title: '标题', dataIndex: 'title', key: 'title', width: 360, render: text => <TableTooltip text={text} maxWidth={320} /> },
        {
            title: '用户组',
            dataIndex: 'userGroupName',
            key: 'userGroupName',
            width: 140,
            render: (userGroupName, record) => <Tag color="blue">{userGroupName || record.userGroupId}</Tag>
        },
        { title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 160 },
        { title: '结束时间', dataIndex: 'endTime', key: 'endTime', width: 160 },
        { title: '发布人', dataIndex: 'createUserName', key: 'createUserName', width: 100 },
        { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
        {
            title: '操作',
            key: 'action',
            width: 160,
            render: (_, record) => (
                <div>
                    <Button type="link" onClick={() => navigate(`/exam/task/edit?id=${record.id}`)}>编辑</Button>
                    <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record)} okText="确定" cancelText="取消">
                        <Button type="link" danger>删除</Button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    return (
        <div className="task-list-container">
            <Form layout="inline" className="query-form">
                <div className="left-side">
                    <Form.Item label="用户组：">
                        <Select
                            style={{ width: 180 }}
                            placeholder="用户组"
                            allowClear
                            onChange={value => setQueryParam(prev => ({ ...prev, userGroupId: value }))}
                            value={queryParam.userGroupId}
                        >
                            {groups.map(item => (
                                <Select.Option key={item.userGroupId} value={item.userGroupId}>
                                    {item.userGroupName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" onClick={() => {
                            const newParam = { ...queryParamRef.current, pageIndex: 1 };
                            setQueryParam(newParam);
                            queryParamRef.current = newParam;
                            search({ pageIndex: 1 });
                        }}>查询</Button>
                    </Form.Item>
                </div>
                <div className="right-side">
                    <Button type="primary" onClick={() => navigate('/exam/task/edit')} style={{ background: '#10b981', borderColor: '#10b981' }}>
                        创建考试
                    </Button>
                </div>
            </Form>

            <Table
                loading={loading}
                dataSource={tableData}
                columns={columns}
                rowKey="id"
                scroll={{ x: 'max-content' }}
                pagination={{
                    total,
                    current: queryParam.pageIndex,
                    pageSize: queryParam.pageSize,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: currentTotal => `共 ${currentTotal} 条`,
                    onChange: (page, pageSize) => {
                        const newParam = { ...queryParamRef.current, pageIndex: page, pageSize };
                        setQueryParam(newParam);
                        queryParamRef.current = newParam;
                        search({ pageIndex: page, pageSize });
                    }
                }}
            />
        </div>
    );
};

export default TaskList;
