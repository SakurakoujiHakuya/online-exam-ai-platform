import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Input, Button, Table, Tag } from 'antd';
import examAbnormalApi from '@/api/examAbnormal';
import TableTooltip from '@/components/TableTooltip';
import { formatChinaDateTime } from '@/utils/time';

const abnormalTypeMap = {
    1: { text: '切屏违规', color: 'orange' },
    2: { text: '强制交卷', color: 'red' }
};

const LogAbnormalList = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [total, setTotal] = useState(0);
    const [queryParams, setQueryParams] = useState({
        userName: null,
        pageIndex: 1,
        pageSize: 10
    });

    const queryParamsRef = useRef(queryParams);
    useEffect(() => {
        queryParamsRef.current = queryParams;
    }, [queryParams]);

    const search = useCallback((overrides) => {
        setLoading(true);
        const params = { ...queryParamsRef.current, ...overrides };
        examAbnormalApi.pageList(params).then(res => {
            if (res.code === 1) {
                setTableData(res.response.list);
                setTotal(res.response.total);
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        search();
    }, [search]);

    const onFinish = (values) => {
        const newParams = {
            ...queryParamsRef.current,
            ...values,
            pageIndex: 1
        };
        setQueryParams(newParams);
        queryParamsRef.current = newParams;
        search({ ...values, pageIndex: 1 });
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
            width: 120
        },
        {
            title: '真实姓名',
            dataIndex: 'realName',
            key: 'realName',
            width: 120
        },
        {
            title: '试卷名称',
            dataIndex: 'examPaperName',
            key: 'examPaperName',
            width: 200,
            render: (text) => <TableTooltip text={text} />
        },
        {
            title: '异常类型',
            dataIndex: 'abnormalType',
            key: 'abnormalType',
            width: 120,
            render: (type) => {
                const config = abnormalTypeMap[type] || { text: '未知', color: 'default' };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        },
        {
            title: '详细描述',
            dataIndex: 'content',
            key: 'content',
            width: 360,
            render: (text) => <TableTooltip text={text} maxWidth={320} />
        },
        {
            title: '上报时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
            render: (text) => formatChinaDateTime(text)
        }
    ];

    return (
        <div className="app-container" style={{ padding: '20px' }}>
            <Form
                form={form}
                layout="inline"
                onFinish={onFinish}
                style={{ marginBottom: 16 }}
            >
                <Form.Item name="userName" label="学生姓名">
                    <Input placeholder="请输入用户名/姓名" allowClear />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">查询</Button>
                </Form.Item>
            </Form>

            <Table
                columns={columns}
                dataSource={tableData}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
                pagination={{
                    current: queryParams.pageIndex,
                    pageSize: queryParams.pageSize,
                    total: total,
                    onChange: (page, pageSize) => {
                        const newParams = {
                            ...queryParamsRef.current,
                            pageIndex: page,
                            pageSize: pageSize
                        };
                        setQueryParams(newParams);
                        queryParamsRef.current = newParams;
                        search({ pageIndex: page, pageSize: pageSize });
                    },
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条`
                }}
                bordered
            />
        </div>
    );
};

export default LogAbnormalList;
