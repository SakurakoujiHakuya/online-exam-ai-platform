import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, message } from 'antd';
import { pageList } from '@/api/message';
import TableTooltip from '@/components/TableTooltip';
import './MessageList.css';

const MessageList = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true
    });

    const fetchData = async (page = 1, size = 10) => {
        setLoading(true);
        try {
            const values = form.getFieldsValue();
            const res = await pageList({
                pageIndex: page,
                pageSize: size,
                sendUserName: values.sendUserName
            });
            if (res.code === 1) {
                setData(res.response.list);
                setPagination(prev => ({
                    ...prev,
                    current: res.response.pageNum,
                    total: res.response.total
                }));
            } else {
                message.error(res.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(pagination.current, pagination.pageSize);
    }, []);

    const handleTableChange = (pagination) => {
        setPagination(pagination);
        fetchData(pagination.current, pagination.pageSize);
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchData(1, pagination.pageSize);
    };

    const columns = [
        { title: 'Id', dataIndex: 'id', key: 'id', width: 100 },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 240,
            render: (text) => <TableTooltip text={text} maxWidth={220} />
        },
        {
            title: '内容',
            dataIndex: 'content',
            key: 'content',
            width: 360,
            render: (text) => <TableTooltip text={text} maxWidth={320} />
        },
        { title: '发送人', dataIndex: 'sendUserName', key: 'sendUserName', width: 100 },
        {
            title: '接收人',
            dataIndex: 'receives',
            key: 'receives',
            width: 280,
            render: (text) => <TableTooltip text={text} maxWidth={240} />
        },
        { title: '已读数', dataIndex: 'readCount', key: 'readCount', width: 70 },
        { title: '接收人数', dataIndex: 'receiveUserCount', key: 'receiveUserCount', width: 100 },
        { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
    ];

    return (
        <div className="app-container">
            <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
                <Form.Item name="sendUserName" label="发送者用户名">
                    <Input placeholder="发送者用户名" allowClear />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={handleSearch}>查询</Button>
                </Form.Item>
            </Form>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                pagination={pagination}
                loading={loading}
                scroll={{ x: 'max-content' }}
                onChange={handleTableChange}
                bordered
            />
        </div>
    );
};

export default MessageList;
