import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Form, Input, Select, Button, Table, Pagination, message, Popconfirm, Tag as AntTag } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RobotOutlined } from '@ant-design/icons'
import * as examPaperApi from '@/api/examPaper'
import { fetchGroups } from '@/store/slices/groupSlice'
import { fetchSubjects } from '@/store/slices/subjectSlice'
import TableTooltip from '@/components/TableTooltip'
import AiPaperGenerateModal from './components/AiPaperGenerateModal'
import PaperPreviewModal from './components/PaperPreviewModal'
import { formatChinaDateTime } from '@/utils/time'

const ExamPaperList = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [total, setTotal] = useState(0)
    const subjects = useSelector(state => state.subject.subjects)
    const groups = useSelector(state => state.group.groups)
    const [subjectFilter, setSubjectFilter] = useState([])
    const [queryParam, setQueryParam] = useState({
        id: null,
        userGroupId: null,
        subjectId: null,
        pageIndex: 1,
        pageSize: 10
    })
    const [aiVisible, setAiVisible] = useState(false)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [previewPaperId, setPreviewPaperId] = useState(null)
    const dispatch = useDispatch()

    const queryParamRef = useRef(queryParam)
    useEffect(() => {
        queryParamRef.current = queryParam
    }, [queryParam])

    const search = useCallback((page, size) => {
        const current = queryParamRef.current
        const params = {
            ...current,
            pageIndex: page ?? current.pageIndex,
            pageSize: size ?? current.pageSize
        }
        setLoading(true)
        examPaperApi.pageList(params).then(res => {
            if (res.code === 1) {
                setTableData(res.response.list || [])
                setTotal(res.response.total || 0)
            } else {
                message.error(res.message)
            }
        }).finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        dispatch(fetchGroups())
        dispatch(fetchSubjects())
        search()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const onFinish = values => {
        const newParam = { ...queryParamRef.current, ...values, pageIndex: 1 }
        setQueryParam(newParam)
        queryParamRef.current = newParam
        search(1, newParam.pageSize)
    }

    const deletePaper = id => {
        examPaperApi.deletePaper(id).then(res => {
            if (res.code === 1) {
                message.success(res.message)
                search(queryParamRef.current.pageIndex, queryParamRef.current.pageSize)
            } else {
                message.error(res.message)
            }
        })
    }

    const userGroupChange = value => {
        form.setFieldsValue({ subjectId: null })
        if (value) {
            setSubjectFilter(subjects.filter(data => data.userGroupId === value))
        } else {
            setSubjectFilter([])
        }
    }

    const subjectFormatter = subjectId => {
        const subject = subjects.find(item => item.id === subjectId)
        return subject ? `${subject.name} (${subject.userGroupName})` : ''
    }

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 90 },
        {
            title: '学科',
            dataIndex: 'subjectId',
            width: 180,
            render: text => subjectFormatter(text)
        },
        {
            title: '名称',
            dataIndex: 'name',
            width: 360,
            render: text => <TableTooltip text={text} maxWidth={320} />
        },
        {
            title: '标签',
            dataIndex: 'tagNames',
            width: 220,
            render: tagNames => (tagNames || []).length > 0
                ? tagNames.map(name => <AntTag key={name}>{name}</AntTag>)
                : '-'
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            width: 220,
            render: text => formatChinaDateTime(text)
        },
        {
            title: '操作',
            width: 280,
            render: (_, record) => (
                <>
                    <Button size="small" onClick={() => { setPreviewPaperId(record.id); setPreviewVisible(true) }} style={{ marginRight: 8 }}>
                        预览
                    </Button>
                    <Button size="small" onClick={() => navigate(`/exam/paper/stats/${record.id}`, { state: { title: record.name } })} style={{ marginRight: 8 }}>
                        统计
                    </Button>
                    <Button size="small" onClick={() => navigate(`/exam/paper/edit?id=${record.id}`)} style={{ marginRight: 8 }}>
                        编辑
                    </Button>
                    <Popconfirm title="确认删除吗？" onConfirm={() => deletePaper(record.id)}>
                        <Button size="small" danger>
                            删除
                        </Button>
                    </Popconfirm>
                </>
            )
        }
    ]

    return (
        <div className="app-container">
            <Form form={form} layout="inline" onFinish={onFinish} style={{ marginBottom: 16 }}>
                <Form.Item name="id" label="试卷ID">
                    <Input allowClear />
                </Form.Item>
                <Form.Item name="userGroupId" label="用户组">
                    <Select placeholder="用户组" onChange={userGroupChange} allowClear style={{ width: 120 }}>
                        {groups.map(item => (
                            <Select.Option key={item.userGroupId} value={item.userGroupId}>
                                {item.userGroupName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="subjectId" label="学科">
                    <Select placeholder="学科" allowClear style={{ width: 160 }}>
                        {subjectFilter.map(item => (
                            <Select.Option key={item.id} value={item.id}>
                                {`${item.name} (${item.userGroupName})`}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="paperTypeArray" label="试卷类型">
                    <Select mode="multiple" placeholder="试卷类型" allowClear style={{ width: 220 }}>
                        <Select.Option value={1}>固定试卷</Select.Option>
                        <Select.Option value={6}>考试试卷</Select.Option>
                        <Select.Option value={7}>AI练习试卷</Select.Option>
                        <Select.Option value={8}>自选练习试卷</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">查询</Button>
                    <Button type="primary" onClick={() => navigate('/exam/paper/edit')} style={{ marginLeft: 8 }}>
                        添加
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => setAiVisible(true)}
                        icon={<RobotOutlined />}
                        style={{ marginLeft: 8, background: '#52c41a', borderColor: '#52c41a' }}
                    >
                        AI智能组卷
                    </Button>
                </Form.Item>
            </Form>

            <Table
                loading={loading}
                columns={columns}
                dataSource={tableData}
                rowKey="id"
                pagination={false}
                bordered
                scroll={{ x: 'max-content' }}
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Pagination
                    total={total}
                    current={queryParam.pageIndex}
                    pageSize={queryParam.pageSize}
                    onChange={(page, pageSize) => {
                        setQueryParam(prev => ({ ...prev, pageIndex: page, pageSize }))
                        search(page, pageSize)
                    }}
                    showSizeChanger
                    showQuickJumper
                />
            </div>
            <AiPaperGenerateModal
                visible={aiVisible}
                onClose={() => setAiVisible(false)}
                onSuccess={() => {
                    setAiVisible(false)
                    search(1, queryParamRef.current.pageSize)
                }}
            />
            <PaperPreviewModal
                open={previewVisible}
                onClose={() => setPreviewVisible(false)}
                paperId={previewPaperId}
            />
        </div>
    )
}

export default ExamPaperList
