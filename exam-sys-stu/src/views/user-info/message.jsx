import React, { useEffect, useState } from 'react'
import { Card, Collapse, Tag, Pagination, Empty } from 'antd'
import userApi from '@/api/user'
import useUserStore from '@/store/userStore' // Assume we might update global badge state here?

const UserMessage = () => {
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [total, setTotal] = useState(0)
    const [queryParam, setQueryParam] = useState({
        pageIndex: 1,
        pageSize: 10
    })

    const { messageCount, setMessageCount } = useUserStore()

    useEffect(() => {
        search()
    }, [queryParam.pageIndex, queryParam.pageSize])

    const search = async () => {
        setLoading(true)
        try {
            const res = await userApi.messagePageList(queryParam)
            if (res && res.response) {
                setTableData(res.response.list)
                setTotal(res.response.total)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (key) => {
        if (!key) return
        // Ant Design Collapse accordion mode might return string or number
        const id = Array.isArray(key) ? key[0] : key
        if (!id) return

        // Ensure id type matches the item id (usually number or string from API)
        const item = tableData.find(d => String(d.id) === String(id))
        if (item && !item.readed) {
            userApi.read(id).then(() => {
                // update local state
                setTableData(prev => prev.map(p => String(p.id) === String(id) ? { ...p, readed: true } : p))
                // update global badge count
                if (messageCount > 0) {
                    setMessageCount(messageCount - 1)
                }
            })
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <Card>
                {total === 0 ? <Empty description="暂无消息" /> : (
                    <Collapse accordion onChange={handleChange}>
                        {tableData.map(item => (
                            <Collapse.Panel
                                key={item.id}
                                header={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <span>{item.title}</span>
                                        <Tag color={item.readed ? 'success' : 'warning'}>
                                            {item.readed ? '已读' : '未读'}
                                        </Tag>
                                    </div>
                                }
                            >
                                <p>发送人：{item.sendUserName}</p>
                                <p>发送时间：{item.createTime}</p>
                                <p>发送内容：<span dangerouslySetInnerHTML={{ __html: item.content }} /></p>
                            </Collapse.Panel>
                        ))}
                    </Collapse>
                )}
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                    <Pagination
                        current={queryParam.pageIndex}
                        pageSize={queryParam.pageSize}
                        total={total}
                        onChange={(page, pageSize) => setQueryParam({ pageIndex: page, pageSize })}
                    />
                </div>
            </Card>
        </div>
    )
}

export default UserMessage
