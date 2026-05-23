import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Table, Modal, message, Spin, DatePicker } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { edit, select } from '@/api/task'
import { taskExamPage } from '@/api/examPaper'
import { useSelector, useDispatch } from 'react-redux'
import { fetchGroups } from '@/store/slices/groupSlice'
import { fetchSubjects } from '@/store/slices/subjectSlice'
import { chinaDayjs } from '@/utils/time'
import './TaskEdit.css'

const TaskEdit = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const dispatch = useDispatch()
    const [form] = Form.useForm()

    const [formLoading, setFormLoading] = useState(false)
    const [formData, setFormData] = useState({
        id: null,
        userGroupId: null,
        title: '',
        paperItems: []
    })

    const [paperPage, setPaperPage] = useState({
        subjectFilter: [],
        multipleSelection: [],
        showDialog: false,
        queryParam: {
            subjectId: null,
            userGroupId: null,
            paperType: 6,
            pageIndex: 1,
            pageSize: 5
        },
        listLoading: true,
        tableData: [],
        total: 0
    })

    const subjects = useSelector(state => state.subject.subjects)
    const groups = useSelector(state => state.group.groups)

    useEffect(() => {
        dispatch(fetchGroups())
        dispatch(fetchSubjects())
    }, [dispatch])

    useEffect(() => {
        if (subjects.length > 0) {
            setPaperPage(prev => ({
                ...prev,
                subjectFilter: subjects
            }))
        }
    }, [subjects])

    useEffect(() => {
        const id = searchParams.get('id')
        if (id && parseInt(id) !== 0) {
            setFormLoading(true)
            select(id).then(res => {
                if (res.code === 1) {
                    const taskData = res.response
                    if (taskData.startTime && taskData.endTime) {
                        taskData.limitDateTime = [chinaDayjs(taskData.startTime), chinaDayjs(taskData.endTime)]
                    }
                    setFormData(taskData)
                    form.setFieldsValue(taskData)
                    // Ensure subject filter is initialized when editing
                    if (taskData.userGroupId && subjects.length > 0) {
                        setPaperPage(prev => ({
                            ...prev,
                            subjectFilter: subjects.filter(s => s.userGroupId === taskData.userGroupId)
                        }))
                    }
                }
                setFormLoading(false)
            }).catch(() => {
                setFormLoading(false)
            })
        }
    }, [searchParams, form, subjects])

    const searchPapers = (params) => {
        const queryParams = params || paperPage.queryParam
        setPaperPage(prev => ({ ...prev, listLoading: true }))
        taskExamPage(queryParams).then(data => {
            if (data.code === 1 && data.response) {
                setPaperPage(prev => ({
                    ...prev,
                    tableData: data.response.list || [],
                    total: data.response.total || 0,
                    queryParam: {
                        ...prev.queryParam,
                        pageIndex: data.response.pageNum || 1
                    },
                    listLoading: false
                }))
            } else {
                setPaperPage(prev => ({ ...prev, listLoading: false }))
                if (data.message) message.error(data.message)
            }
        }).catch(() => {
            setPaperPage(prev => ({ ...prev, listLoading: false }))
        })
    }

    const addPaper = () => {
        const newQueryParam = {
            ...paperPage.queryParam,
            userGroupId: formData.userGroupId
        };
        setPaperPage(prev => ({
            ...prev,
            queryParam: newQueryParam,
            showDialog: true
        }))
        searchPapers(newQueryParam)
    }

    const confirmPaperSelect = () => {
        const currentPaperIds = new Set(formData.paperItems.map(item => item.id));
        const newPapers = paperPage.multipleSelection.filter(item => !currentPaperIds.has(item.id));

        if (newPapers.length < paperPage.multipleSelection.length) {
            message.info('部分试卷已存在，已自动过滤');
        }

        if (newPapers.length === 0) {
            setPaperPage(prev => ({ ...prev, showDialog: false, multipleSelection: [] }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            paperItems: [...prev.paperItems, ...newPapers]
        }))
        setPaperPage(prev => ({
            ...prev,
            showDialog: false,
            multipleSelection: []
        }))
    }

    const handleSelectionChange = (selectedRowKeys, selectedRows) => {
        setPaperPage(prev => ({
            ...prev,
            multipleSelection: selectedRows
        }))
    }

    const examPaperSubmitForm = () => {
        const newQueryParam = {
            ...paperPage.queryParam,
            pageIndex: 1
        };
        setPaperPage(prev => ({
            ...prev,
            queryParam: newQueryParam
        }))
        searchPapers(newQueryParam)
    }

    const levelChange = (value) => {
        setFormData(prev => ({ ...prev, userGroupId: value }))
        setPaperPage(prev => ({
            ...prev,
            queryParam: {
                ...prev.queryParam,
                subjectId: null
            },
            subjectFilter: subjects.filter(data => data.userGroupId === value)
        }))
    }

    const removePaper = (row) => {
        setFormData(prev => ({
            ...prev,
            paperItems: prev.paperItems.filter(item => item.id !== row.id)
        }))
    }

    const submitForm = () => {
        form.validateFields().then(values => {
            setFormLoading(true)
            edit({
                ...formData,
                ...values,
                startTime: values.limitDateTime ? values.limitDateTime[0].format('YYYY-MM-DD HH:mm:ss') : null,
                endTime: values.limitDateTime ? values.limitDateTime[1].format('YYYY-MM-DD HH:mm:ss') : null
            }).then(data => {
                if (data.code === 1) {
                    message.success(data.message)
                    navigate('/exam/task/list')
                } else {
                    message.error(data.message)
                }
                setFormLoading(false)
            }).catch(() => {
                setFormLoading(false)
            })
        }).catch(() => {
            return false
        })
    }

    const resetForm = () => {
        const lastId = formData.id
        form.resetFields()
        setFormData({
            id: lastId,
            userGroupId: null,
            title: '',
            paperItems: []
        })
    }

    const subjectFormatter = (subjectId) => {
        const subject = subjects.find(s => s.id === subjectId)
        return subject ? subject.name : subjectId
    }

    const paperColumns = [
        {
            title: '学科',
            dataIndex: 'subjectId',
            key: 'subjectId',
            width: 120,
            render: (subjectId) => subjectFormatter(subjectId)
        },
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            width: 280
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 160
        },
        {
            title: '操作',
            key: 'action',
            width: 160,
            render: (_, record) => (
                <Button type="link" danger onClick={() => removePaper(record)}>
                    删除
                </Button>
            )
        }
    ]

    const dialogColumns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: 90
        },
        {
            title: '学科',
            dataIndex: 'subjectId',
            key: 'subjectId',
            width: 120,
            render: (subjectId) => subjectFormatter(subjectId)
        },
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            width: 320
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 160
        }
    ]

    const rowSelection = {
        onChange: handleSelectionChange,
        selectedRowKeys: paperPage.multipleSelection.map(item => item.id)
    }

    return (
        <div className="task-edit-container">
            <Spin spinning={formLoading}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={formData}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                >
                    <Form.Item
                        label="用户组："
                        name="userGroupId"
                        rules={[{ required: true, message: '请选择用户组' }]}
                    >
                        <Select
                            placeholder="用户组"
                            onChange={levelChange}
                        >
                            {groups.map(item => (
                                <Select.Option key={item.userGroupId} value={item.userGroupId}>
                                    {item.userGroupName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="标题："
                        name="title"
                        rules={[{ required: true, message: '请输入考试标题' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="考试时间："
                        name="limitDateTime"
                        rules={[{ required: true, message: '请选择考试时间' }]}
                    >
                        <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="试卷：" required>
                        <Table
                            dataSource={formData.paperItems}
                            columns={paperColumns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            locale={{ emptyText: '暂无试卷，请点击下方按钮添加' }}
                            scroll={{ x: 'max-content' }}
                        />
                    </Form.Item>

                    <div className="form-footer">
                        <Button onClick={() => navigate('/exam/task/list')}>返回列表</Button>
                        <Button onClick={resetForm}>重置</Button>
                        <Button type="success" onClick={addPaper} style={{ background: '#10b981', borderColor: '#10b981', color: '#fff' }}>添加试卷</Button>
                        <Button type="primary" onClick={submitForm}>保存考试</Button>
                    </div>
                </Form>
            </Spin>

            <Modal
                title="选择试卷"
                open={paperPage.showDialog}
                onCancel={() => setPaperPage(prev => ({ ...prev, showDialog: false }))}
                width="70%"
                footer={[
                    <Button key="cancel" onClick={() => setPaperPage(prev => ({ ...prev, showDialog: false }))}>
                        取消
                    </Button>,
                    <Button key="confirm" type="primary" onClick={confirmPaperSelect}>
                        确定
                    </Button>
                ]}
            >
                <Form layout="inline" style={{ marginBottom: 16 }}>
                    <Form.Item label="学科：">
                        <Select
                            style={{ width: 200 }}
                            placeholder="学科"
                            allowClear
                            onChange={(value) => setPaperPage(prev => ({
                                ...prev,
                                queryParam: { ...prev.queryParam, subjectId: value }
                            }))}
                            value={paperPage.queryParam.subjectId}
                        >
                            {paperPage.subjectFilter.map(item => (
                                <Select.Option key={item.id} value={item.id}>
                                    {item.name} ( {item.userGroupName} )
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" onClick={examPaperSubmitForm}>查询</Button>
                    </Form.Item>
                </Form>

                <Table
                    loading={paperPage.listLoading}
                    dataSource={paperPage.tableData}
                    columns={dialogColumns}
                    rowKey="id"
                    rowSelection={rowSelection}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        total: paperPage.total,
                        current: paperPage.queryParam.pageIndex,
                        pageSize: paperPage.queryParam.pageSize,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`,
                        onChange: (page, pageSize) => {
                            const newQueryParam = {
                                ...paperPage.queryParam,
                                pageIndex: page,
                                pageSize: pageSize
                            };
                            setPaperPage(prev => ({
                                ...prev,
                                queryParam: newQueryParam
                            }))
                            searchPapers(newQueryParam)
                        }
                    }}
                />
            </Modal>
        </div>
    )
}

export default TaskEdit
