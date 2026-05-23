import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Popconfirm, Space, Table, message } from 'antd'
import { useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { deleteTag, pageList } from '@/api/tag'

const TagList = () => {
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const { userInfo } = useSelector(state => state.user)
    const isAdmin = userInfo?.role === 3
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0, showSizeChanger: true })

    const fetchData = async (page = 1, size = 10) => {
        setLoading(true)
        try {
            const values = form.getFieldsValue()
            const res = await pageList({ pageIndex: page, pageSize: size, id: values.id, name: values.name })
            if (res.code === 1) {
                setData(res.response.list || [])
                setPagination(prev => ({ ...prev, current: res.response.pageNum, total: res.response.total, pageSize: size }))
            } else {
                message.error(res.message)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isAdmin) {
            fetchData(pagination.current, pagination.pageSize)
        }
    }, [])

    if (!isAdmin) {
        return <Navigate to="/401" replace />
    }

    return (
        <div className="app-container">
            <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
                <Form.Item name="id" label="标签ID">
                    <Input placeholder="标签ID" style={{ width: 120 }} allowClear />
                </Form.Item>
                <Form.Item name="name" label="标签名称">
                    <Input placeholder="标签名称" style={{ width: 220 }} allowClear />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={() => fetchData(1, pagination.pageSize)}>查询</Button>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={() => navigate('/education/tag/edit')}>新增标签</Button>
                </Form.Item>
            </Form>

            <Table
                columns={[
                    { title: 'ID', dataIndex: 'id', key: 'id', width: 120 },
                    { title: '标签名称', dataIndex: 'name', key: 'name' },
                    { title: '引用数量', dataIndex: 'referenceCount', key: 'referenceCount', width: 140 },
                    {
                        title: '题目得分率',
                        dataIndex: 'scoreRate',
                        key: 'scoreRate',
                        width: 160,
                        render: value => (value == null ? '-' : `${Number(value).toFixed(1)}%`)
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 320,
                        render: (_, record) => (
                            <Space size="middle">
                                <Button
                                    size="small"
                                    onClick={() => navigate(`/education/tag/questions?id=${record.id}`, { state: { title: `${record.name} 关联题目`, tagName: record.name } })}
                                >
                                    查看题目
                                </Button>
                                <Button size="small" onClick={() => navigate(`/education/tag/edit?id=${record.id}`)}>编辑</Button>
                                <Popconfirm
                                    title={record.referenceCount > 0 ? '当前标签仍被引用，无法删除' : '确定删除该标签吗？'}
                                    onConfirm={async () => {
                                        const res = await deleteTag(record.id)
                                        if (res.code === 1) {
                                            message.success(res.message)
                                            fetchData(pagination.current, pagination.pageSize)
                                        } else {
                                            message.error(res.message)
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
                    setPagination(nextPagination)
                    fetchData(nextPagination.current, nextPagination.pageSize)
                }}
                bordered
            />
        </div>
    )
}

export default TagList
