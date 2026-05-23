import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Input, Button, Table } from 'antd';
import { useSearchParams } from 'react-router-dom';
import * as userApi from '@/api/user';
import TableTooltip from '@/components/TableTooltip';
import { formatChinaDateTime } from '@/utils/time';

const LogUserList = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [total, setTotal] = useState(0);
    const [queryParams, setQueryParams] = useState({
        userId: null,
        userName: null,
        pageIndex: 1,
        pageSize: 10
    });
    const [searchParams] = useSearchParams();

    const queryParamsRef = useRef(queryParams);
    useEffect(() => {
        queryParamsRef.current = queryParams;
    }, [queryParams]);

    const search = useCallback((overrides) => {
        setLoading(true);
        const params = { ...queryParamsRef.current, ...overrides };
        userApi.getUserEventPageList(params).then(res => {
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
        const userId = searchParams.get('userId');
        if (userId && parseInt(userId) !== 0) {
            const newParams = { ...queryParamsRef.current, userId };
            setQueryParams(newParams);
            queryParamsRef.current = newParams;
            form.setFieldsValue({ userId });
            search({ userId });
        } else {
            search();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, form]); // search is stable, omitting it is fine but searchParams/form change less frequently

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
            width: 100
        },
        {
            title: '用户名',
            dataIndex: 'userName',
            key: 'userName',
            width: 150
        },
        {
            title: '真实姓名',
            dataIndex: 'realName',
            key: 'realName',
            width: 150
        },
        {
            title: '动态',
            dataIndex: 'content',
            key: 'content',
            width: 520,
            render: (text) => <TableTooltip text={text} maxWidth={480} />
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 160,
            render: (text) => formatChinaDateTime(text)
        }
    ];

    return (
        <div className="app-container">
            <Form
                form={form}
                layout="inline"
                onFinish={onFinish}
                style={{ marginBottom: 16 }}
            >
                <Form.Item name="userId" label="用户Id">
                    <Input placeholder="请输入用户Id" />
                </Form.Item>
                <Form.Item name="userName" label="用户名">
                    <Input placeholder="请输入用户名" />
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

export default LogUserList;
