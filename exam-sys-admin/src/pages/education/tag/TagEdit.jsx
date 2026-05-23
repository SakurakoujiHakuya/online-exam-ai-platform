import React, { useEffect, useState } from 'react'
import { Button, Form, Input, message } from 'antd'
import { useSelector } from 'react-redux'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { edit, select } from '@/api/tag'

const TagEdit = () => {
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const id = searchParams.get('id')
    const { userInfo } = useSelector(state => state.user)
    const isAdmin = userInfo?.role === 3
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isAdmin || !id) {
            return
        }
        setLoading(true)
        select(id).then(res => {
            if (res.code === 1) {
                form.setFieldsValue(res.response)
            } else {
                message.error(res.message)
            }
        }).finally(() => setLoading(false))
    }, [form, id, isAdmin])

    if (!isAdmin) {
        return <Navigate to="/401" replace />
    }

    const onFinish = async values => {
        setLoading(true)
        try {
            const res = await edit({ ...values, id })
            if (res.code === 1) {
                message.success(res.message)
                navigate('/education/tag/list')
            } else {
                message.error(res.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app-container">
            <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}>
                {id && (
                    <Form.Item label="标签ID">
                        <Input value={id} disabled />
                    </Form.Item>
                )}
                <Form.Item name="name" label="标签名称" rules={[{ required: true, message: '请输入标签名称' }]}>
                    <Input placeholder="例如：重点、易错、期中复习" maxLength={255} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>提交</Button>
                    <Button onClick={() => navigate('/education/tag/list')}>返回</Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default TagEdit
