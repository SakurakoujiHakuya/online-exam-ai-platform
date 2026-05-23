import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as examPaperAnswerApi from '@/api/examPaperAnwser';
import { groupList } from '@/api/subject';
import * as userApi from '@/api/user';
import { formatEnum } from '@/store/slices/enumItemSlice';
import TableTooltip from '@/components/TableTooltip';

const { Option } = Select;

const UserStudentList = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [groups, setGroups] = useState([]);
    const [total, setTotal] = useState(0);
    const { userInfo } = useSelector(state => state.user);
    const isAdmin = userInfo?.role === 3;
    const isTeacher = userInfo?.role === 2;
    const { sexEnum, statusBtn } = useSelector(state => state.enumItem.user);
    const [queryParams, setQueryParams] = useState({
        userName: '',
        role: 1,
        userGroupId: undefined,
        sex: undefined,
        excellent: undefined,
        pageIndex: 1,
        pageSize: 10
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [examRecords, setExamRecords] = useState([]);
    const [recordTotal, setRecordTotal] = useState(0);
    const [recordParams, setRecordParams] = useState({ pageIndex: 1, pageSize: 10 });

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
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        groupList().then(res => {
            if (res.code === 1) {
                setGroups(res.response);
            }
        });
    }, []);

    useEffect(() => {
        fetchData();
    }, [queryParams.pageIndex, queryParams.pageSize, queryParams.userName, queryParams.userGroupId, queryParams.sex, queryParams.excellent, fetchData]);

    const changeStatus = row => {
        userApi.changeStatus(row.id).then(res => {
            if (res.code === 1) {
                message.success(res.message);
                fetchData();
            } else {
                message.error(res.message);
            }
        });
    };

    const deleteUser = row => {
        userApi.deleteUser(row.id).then(res => {
            if (res.code === 1) {
                message.success(res.message);
                fetchData();
            } else {
                message.error(res.message);
            }
        });
    };

    const showExamRecords = student => {
        setCurrentStudent(student);
        setModalVisible(true);
        setRecordParams({ pageIndex: 1, pageSize: 10 });
    };

    useEffect(() => {
        if (!modalVisible || !currentStudent) {
            return;
        }
        setModalLoading(true);
        examPaperAnswerApi.page({
            ...recordParams,
            createUserId: currentStudent.id
        }).then(res => {
            if (res.code === 1) {
                setExamRecords(res.response.list);
                setRecordTotal(res.response.total);
            }
            setModalLoading(false);
        }).catch(() => setModalLoading(false));
    }, [modalVisible, recordParams, currentStudent]);

    const examColumns = [
        { title: '试卷名称', dataIndex: 'paperName', key: 'paperName', width: 220 },
        { title: '学科', dataIndex: 'subjectName', key: 'subjectName', width: 120 },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: status => {
                const statusText = { 1: '待批改', 2: '完成' };
                const statusColor = { 1: 'warning', 2: 'success' };
                return <Tag color={statusColor[status]}>{statusText[status] || '未知'}</Tag>;
            }
        },
        { title: '得分', dataIndex: 'userScore', key: 'userScore', width: 80 },
        { title: '总分', dataIndex: 'paperScore', key: 'paperScore', width: 80 },
        { title: '做题时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Button type="link" onClick={() => navigate(`/answer/read?id=${record.id}`)}>
                    查看试卷
                </Button>
            )
        }
    ];

    const columns = [
        { title: 'Id', dataIndex: 'id', key: 'id', width: 80 },
        { title: '用户名', dataIndex: 'userName', key: 'userName', width: 160 },
        { title: '真实姓名', dataIndex: 'realName', key: 'realName', width: 120 },
        {
            title: '用户组',
            dataIndex: 'userGroupName',
            key: 'userGroupName',
            width: 160,
            render: (text, record) => text || record.userGroupId
        },
        {
            title: '性别',
            dataIndex: 'sex',
            key: 'sex',
            width: 80,
            render: text => formatEnum(sexEnum, text)
        },
        { title: '手机号', dataIndex: 'phone', key: 'phone', width: 140 },
        { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
        {
            title: '优秀学员',
            dataIndex: 'excellent',
            key: 'excellent',
            width: 100,
            render: (text, record) => (
                <Popconfirm
                    title={record.excellent ? '取消优秀学员吗？' : '设为优秀学员吗？'}
                    onConfirm={() => {
                        userApi.createUser({ ...record, excellent: !record.excellent }).then(res => {
                            if (res.code === 1) {
                                message.success('操作成功');
                                fetchData();
                            }
                        });
                    }}
                >
                    <Tag color={text ? 'success' : 'default'} style={{ cursor: 'pointer' }}>
                        {text ? '是' : '否'}
                    </Tag>
                </Popconfirm>
            )
        },
        { title: '评语', dataIndex: 'comment', key: 'comment', width: 240, render: text => <TableTooltip text={text} maxWidth={220} /> },
        ...(isAdmin || isTeacher ? [{
            title: '操作',
            key: 'action',
            width: isAdmin ? 330 : 150,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small"
                        type="primary"
                        ghost
                        onClick={() => navigate(`/ai/student-report/${record.id}`, { state: { studentName: record.realName || record.userName, title: '学生学情画像' } })}
                    >
                        AI学情
                    </Button>
                    {isAdmin && <Button size="small" onClick={() => changeStatus(record)}>{formatEnum(statusBtn, record.status)}</Button>}
                    {isAdmin && <Button size="small" onClick={() => navigate(`/user/student/edit?id=${record.id}`)}>编辑</Button>}
                    <Button
                        size="small"
                        onClick={() => {
                            const newComment = window.prompt('请输入评语', record.comment || '');
                            if (newComment !== null) {
                                userApi.createUser({ ...record, comment: newComment }).then(res => {
                                    if (res.code === 1) {
                                        message.success('更新成功');
                                        fetchData();
                                    }
                                });
                            }
                        }}
                    >
                        评语
                    </Button>
                    <Button size="small" onClick={() => showExamRecords(record)}>做题</Button>
                    {isAdmin && <Button size="small" onClick={() => navigate(`/log/user/list?userId=${record.id}`)}>日志</Button>}
                    {isAdmin && (
                        <Popconfirm title="确定删除吗？" onConfirm={() => deleteUser(record)}>
                            <Button size="small" danger>删除</Button>
                        </Popconfirm>
                    )}
                </Space>
            )
        }] : [])
    ];

    return (
        <div className="app-container">
            <Form form={form} layout="inline" onFinish={values => setQueryParams({ ...queryParams, ...values, pageIndex: 1 })} initialValues={{ userName: '' }} className="search-form">
                <Form.Item name="userName" label="用户名">
                    <Input placeholder="请输入用户名" allowClear />
                </Form.Item>
                <Form.Item name="userGroupId" label="用户组">
                    <Select placeholder="请选择用户组" allowClear style={{ width: 160 }}>
                        {groups.map(item => (
                            <Option key={item.userGroupId} value={item.userGroupId}>{item.userGroupName}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="sex" label="性别">
                    <Select placeholder="请选择性别" allowClear style={{ width: 100 }}>
                        {sexEnum.map(item => (
                            <Option key={item.key} value={item.key}>{item.value}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="excellent" label="优秀学员">
                    <Select placeholder="是否优秀" allowClear style={{ width: 100 }}>
                        <Option value={true}>是</Option>
                        <Option value={false}>否</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">查询</Button>
                </Form.Item>
                {isAdmin && (
                    <Form.Item>
                        <Button type="primary" onClick={() => navigate('/user/student/edit')}>添加</Button>
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
                    total,
                    onChange: (page, pageSize) => {
                        setQueryParams({
                            ...queryParams,
                            pageIndex: page,
                            pageSize
                        });
                    }
                }}
            />

            <Modal
                title={`学生 [${currentStudent?.userName}] 的做题记录`}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={900}
            >
                <Table
                    columns={examColumns}
                    dataSource={examRecords}
                    rowKey="id"
                    loading={modalLoading}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        current: recordParams.pageIndex,
                        pageSize: recordParams.pageSize,
                        total: recordTotal,
                        onChange: (page, pageSize) => {
                            setRecordParams({ pageIndex: page, pageSize });
                        }
                    }}
                />
            </Modal>
        </div>
    );
};

export default UserStudentList;
