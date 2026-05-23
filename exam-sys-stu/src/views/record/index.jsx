import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Avatar, Divider, Button, Pagination } from 'antd'
import { UserOutlined, FileTextOutlined } from '@ant-design/icons'
import examPaperAnswerApi from '@/api/examPaperAnswer'
import { useNavigate } from 'react-router-dom'
import './index.css' // Reuse styles or create new

const RecordIndex = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [total, setTotal] = useState(0)
    const [queryParam, setQueryParam] = useState({
        pageIndex: 1,
        pageSize: 10
    })
    const [selectItem, setSelectItem] = useState({
        systemScore: '0',
        userScore: '0',
        doTime: '0',
        paperScore: '0',
        questionCorrect: 0,
        questionCount: 0
    })

    useEffect(() => {
        search()
    }, [queryParam.pageIndex, queryParam.pageSize])

    const search = async () => {
        setLoading(true)
        try {
            const res = await examPaperAnswerApi.pageList(queryParam)
            if (res && res.response) {
                const list = res.response.list || []
                setTableData(list)
                setTotal(res.response.total)
                // Select first item if not already selected to avoid showing 0s
                if (list.length > 0) {
                    setSelectItem(list[0])
                } else {
                    setSelectItem({
                        systemScore: '0',
                        userScore: '0',
                        doTime: '0',
                        paperScore: '0',
                        questionCorrect: 0,
                        questionCount: 0
                    })
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        { title: '序号', dataIndex: 'id', width: 80, align: 'center' },
        { title: '名称', dataIndex: 'paperName', minWidth: 120 },
        { title: '学科', dataIndex: 'subjectName', width: 80, align: 'center' },
        {
            title: '状态',
            dataIndex: 'status',
            width: 110,
            align: 'center',
            render: (status) => {
                const statusEnum = { 1: '待批改', 2: '完成' }
                const statusTag = { 1: 'warning', 2: 'success' }
                return <Tag color={statusTag[status]}>{statusEnum[status] || 'Unknown'}</Tag>
            }
        },
        { title: '做题时间', dataIndex: 'createTime', width: 170, align: 'center' },
        {
            title: '操作',
            key: 'action',
            width: 100,
            align: 'center',
            render: (_, row) => (
                <>
                    {row.status === 1 && (
                        row.paperType === 6 ? 
                        <span style={{ color: '#faad14' }}>待教师批改</span> :
                        <Button type="primary" size="small" shape="round" onClick={() => window.open(`/#/edit?id=${row.id}`, '_blank')}>批改</Button>
                    )}
                    {row.status === 2 && (
                        <Button type="default" size="small" shape="round" onClick={() => window.open(`/#/read?id=${row.id}`, '_blank')} style={{ borderColor: '#52c41a', color: '#52c41a' }}>查看试卷</Button>
                    )}
                </>
            )
        }
    ]

    return (
        <div className="modern-record-page">
            <div className="modern-column-layout">
                <Card className="modern-info-card">
                    <div className="modern-info-header">
                        <Avatar size={64} icon={<UserOutlined />} className="modern-info-avatar" />
                        <span className="modern-info-title">答题统计</span>
                    </div>
                    <Divider />
                    <div className="modern-info-list">
                        {[
                            { label: '系统判分', value: selectItem.systemScore },
                            { label: '最终得分', value: selectItem.userScore, highlight: true },
                            { label: '试卷总分', value: selectItem.paperScore },
                            { label: '正确题数', value: selectItem.questionCorrect },
                            { label: '总题数', value: selectItem.questionCount },
                            { label: '用时', value: selectItem.doTime },
                        ].map((item, idx) => (
                            <div key={idx} className="modern-info-item">
                                <span className="modern-info-label">{item.label}</span>
                                <span className={`modern-info-value ${item.highlight ? 'highlight' : ''}`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="modern-table-card">
                    <div className="modern-table-title">
                        <Avatar size="small" icon={<FileTextOutlined />} className="modern-avatar" />
                        <span>我的答题记录</span>
                    </div>
                    <Divider />
                    <Table
                        dataSource={tableData}
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                        onRow={(record) => ({
                            onClick: () => setSelectItem(record)
                        })}
                        pagination={false}
                        className="modern-table"
                    />
                    <div style={{ marginTop: 24, textAlign: 'right' }}>
                        <Pagination
                            current={queryParam.pageIndex}
                            pageSize={queryParam.pageSize}
                            total={total}
                            onChange={(page, pageSize) => setQueryParam({ pageIndex: page, pageSize })}
                        />
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default RecordIndex
