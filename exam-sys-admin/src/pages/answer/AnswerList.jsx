import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Select, Table, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { page } from '@/api/examPaperAnwser';
import { groupList } from '@/api/subject';
import TableTooltip from '@/components/TableTooltip';
import './AnswerList.css';

const getStudentDisplayName = record => record.studentName || record.realName || record.userName || '-';

const AnswerList = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [groups, setGroups] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true
    });

    useEffect(() => {
        groupList().then(res => {
            if (res.code === 1) {
                setGroups(res.response || []);
            }
        });
        fetchData(pagination.current, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async (pageIndex = 1, size = 10) => {
        setLoading(true);
        try {
            const values = form.getFieldsValue();
            const res = await page({
                pageIndex,
                pageSize: size,
                subjectId: values.subjectId,
                userGroupId: values.userGroupId,
                level: values.userGroupId,
                paperName: values.paperName,
                studentName: values.studentName
            });
            if (res.code === 1) {
                setData(res.response.list || []);
                setPagination(prev => ({
                    ...prev,
                    current: res.response.pageNum,
                    total: res.response.total
                }));
            } else {
                message.error(res.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
        {
            title: '试卷名称',
            dataIndex: 'paperName',
            key: 'paperName',
            width: 280,
            render: text => <TableTooltip text={text} maxWidth={240} />
        },
        {
            title: '考生姓名',
            dataIndex: 'studentName',
            key: 'studentName',
            width: 160,
            render: (_, record) => <TableTooltip text={getStudentDisplayName(record)} maxWidth={140} />
        },
        {
            title: '学生账号',
            dataIndex: 'userName',
            key: 'userName',
            width: 160,
            render: text => <TableTooltip text={text || '-'} maxWidth={140} />
        },
        {
            title: '用户组',
            dataIndex: 'userGroupName',
            key: 'userGroupName',
            width: 160,
            render: (text, record) => text || record.userGroupId
        },
        {
            title: '得分',
            key: 'score',
            width: 100,
            render: (_, record) => `${record.userScore} / ${record.paperScore}`
        },
        {
            title: '答对题数',
            key: 'questionCorrect',
            width: 100,
            render: (_, record) => `${record.questionCorrect} / ${record.questionCount}`
        },
        { title: '耗时', dataIndex: 'doTime', key: 'doTime', width: 100 },
        { title: '提交时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <>
                    {record.status === 1 && record.paperType === 6 && (
                        <Button type="primary" size="small" onClick={() => navigate(`/answer/edit?id=${record.id}`)}>
                            批改
                        </Button>
                    )}
                    {record.status === 2 && (
                        <Button type="link" size="small" onClick={() => navigate(`/answer/read?id=${record.id}`)}>
                            查看
                        </Button>
                    )}
                </>
            )
        }
    ];

    return (
        <div className="app-container">
            <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
                <Form.Item name="userGroupId" label="用户组">
                    <Select placeholder="用户组" style={{ width: 160 }} allowClear>
                        {groups.map(item => (
                            <Select.Option key={item.userGroupId} value={item.userGroupId}>
                                {item.userGroupName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="paperName" label="试卷名称">
                    <Input placeholder="试卷名称" style={{ width: 160 }} allowClear />
                </Form.Item>
                <Form.Item name="studentName" label="学生">
                    <Input placeholder="账号或姓名" style={{ width: 160 }} allowClear />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={() => fetchData(1, pagination.pageSize)}>
                        查询
                    </Button>
                </Form.Item>
            </Form>
            <Table
                columns={columns}
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

export default AnswerList;
