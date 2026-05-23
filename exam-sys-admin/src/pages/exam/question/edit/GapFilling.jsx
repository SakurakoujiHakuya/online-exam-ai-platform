import React, { useEffect, useRef, useState } from 'react'
import { Button, Form, Input, InputNumber, Select, Space, message } from 'antd'
import { RobotOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import * as questionApi from '@/api/question'
import { generateAnalyze } from '@/api/aiGeneration'
import TagSelect from '@/components/TagSelect'
import useTagOptions from '@/hooks/useTagOptions'
import useRouteLayoutRefresh from '@/hooks/useRouteLayoutRefresh'
import { fetchGroups } from '@/store/slices/groupSlice'
import { fetchSubjects } from '@/store/slices/subjectSlice'
import { PRACTICE_HIDDEN_TAG_NAME, sanitizeEditableTagNames, splitTagSelection } from '@/utils/tag'
import QuestionShow from '../components/QuestionShow'
import AiGenerateModal from './components/AiGenerateModal'
import PracticeVisibilityField from './components/PracticeVisibilityField'
import '../../editor-form.css'

const GapFilling = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [searchParams] = useSearchParams()
    const id = searchParams.get('id')
    const [form] = Form.useForm()
    const groups = useSelector(state => state.group.groups)
    const subjects = useSelector(state => state.subject.subjects)
    const { tags: availableTags, loading: tagLoading } = useTagOptions()

    const [items, setItems] = useState([])
    const [subjectFilter, setSubjectFilter] = useState([])
    const [loading, setLoading] = useState(false)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [aiVisible, setAiVisible] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const editableTags = availableTags.filter(tag => tag.name !== PRACTICE_HIDDEN_TAG_NAME)

    useRouteLayoutRefresh([items.length])

    const subjectsRef = useRef([])

    useEffect(() => {
        subjectsRef.current = subjects
    }, [subjects])

    const levelChange = (value, resetSubject = true) => {
        if (resetSubject) {
            form.setFieldsValue({ subjectId: null })
        }
        if (!value) {
            setSubjectFilter([])
            return
        }
        setSubjectFilter(subjectsRef.current.filter(item => item.userGroupId === value))
    }

    useEffect(() => {
        dispatch(fetchGroups())
        dispatch(fetchSubjects())
    }, [dispatch])

    useEffect(() => {
        if (!id) {
            return
        }
        setLoading(true)
        questionApi.select(id).then(res => {
            if (res.code === 1) {
                const data = res.response
                form.setFieldsValue({
                    ...data,
                    tagNames: sanitizeEditableTagNames(data.tagNames),
                    hideInPracticeCenter: !!data.hideInPracticeCenter
                })
                setItems(data.items || [])
                if (data.userGroupId) {
                    levelChange(data.userGroupId, false)
                }
            } else {
                message.error(res.message)
            }
        }).finally(() => {
            setLoading(false)
        })
    }, [form, id])

    useEffect(() => {
        const userGroupId = form.getFieldValue('userGroupId')
        if (userGroupId && subjects.length > 0) {
            setSubjectFilter(subjects.filter(item => item.userGroupId === userGroupId))
        }
    }, [form, subjects])

    const addItem = () => {
        setItems([
            ...items,
            { prefix: String(items.length + 1), content: '', score: '' }
        ])
    }

    const removeItem = index => {
        const nextItems = items
            .filter((_, itemIndex) => itemIndex !== index)
            .map((item, itemIndex) => ({ ...item, prefix: String(itemIndex + 1) }))
        setItems(nextItems)
    }

    const updateItem = (index, field, value) => {
        const nextItems = [...items]
        nextItems[index] = { ...nextItems[index], [field]: value }
        setItems(nextItems)
    }

    const resetForm = () => {
        form.resetFields()
        setItems([])
        setSubjectFilter([])
    }

    const handleAiConfirm = data => {
        if (!data) {
            return
        }
        form.setFieldsValue({
            title: data.title,
            analyze: data.analyze,
            score: data.score,
            difficult: data.difficult
        })

        if (data.correct) {
            const answers = String(data.correct).split(/[，,]/).map(item => item.trim()).filter(Boolean)
            const perScore = answers.length > 0 && data.score ? Number(data.score) / answers.length : 0
            setItems(answers.map((answer, index) => ({
                prefix: String(index + 1),
                content: answer,
                score: perScore ? perScore.toFixed(1) : ''
            })))
        }
    }

    const handleAiAnalyze = async event => {
        event?.preventDefault?.()
        const { title } = form.getFieldsValue(['title'])
        if (!title || title === '<p><br></p>') {
            message.warning('请先输入题干内容')
            return
        }

        setAiLoading(true)
        try {
            const res = await generateAnalyze({
                title,
                content: `正确答案: ${items.map(item => item.content).join(', ')}`
            })
            if (res.code === 1) {
                form.setFieldsValue({ analyze: res.response })
                message.success('解析生成成功')
            } else {
                message.error(res.message)
            }
        } catch (error) {
            message.error('生成解析失败')
        } finally {
            setAiLoading(false)
        }
    }

    const onFinish = values => {
        const tagPayload = splitTagSelection(values.tagNames, editableTags)
        setLoading(true)
        questionApi.edit({
            ...values,
            ...tagPayload,
            id,
            questionType: 4,
            items
        }).then(res => {
            if (res.code === 1) {
                message.success(res.message)
                navigate('/exam/question/list')
            } else {
                message.error(res.message)
            }
        }).catch(error => {
            message.error(error.message || '系统内部错误')
        }).finally(() => {
            setLoading(false)
        })
    }

    return (
        <div className="app-container exam-editor-page">
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button type="primary" ghost icon={<RobotOutlined />} onClick={() => setAiVisible(true)}>AI 智能出题</Button>
            </div>
            <Form className="exam-editor-form" form={form} layout="vertical" onFinish={onFinish}>
                <PracticeVisibilityField />
                <Form.Item name="userGroupId" label="用户组" rules={[{ required: true, message: '请选择用户组' }]}>
                    <Select placeholder="请选择用户组" onChange={value => levelChange(value)}>
                        {groups.map(item => <Select.Option key={item.userGroupId} value={item.userGroupId}>{item.userGroupName}</Select.Option>)}
                    </Select>
                </Form.Item>
                <Form.Item name="subjectId" label="学科" rules={[{ required: true, message: '请选择学科' }]}>
                    <Select placeholder="请选择学科">
                        {subjectFilter.map(item => <Select.Option key={item.id} value={item.id}>{`${item.name} (${item.userGroupName})`}</Select.Option>)}
                    </Select>
                </Form.Item>
                <Form.Item name="tagNames" label="标签">
                    <TagSelect
                        tags={editableTags}
                        loading={tagLoading}
                        allowCreate
                        placeholder="请选择或输入标签"
                    />
                </Form.Item>
                <Form.Item name="title" label="题干" rules={[{ required: true, message: '请输入题干' }]}>
                    <ReactQuill theme="snow" />
                </Form.Item>

                <Form.Item label="填空答案">
                    {items.map((item, index) => (
                        <div key={item.prefix} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                            <span style={{ minWidth: 56, fontWeight: 600 }}>{`填空 ${item.prefix}`}</span>
                            <Input
                                value={item.content}
                                onChange={event => updateItem(index, 'content', event.target.value)}
                                placeholder="请输入答案"
                            />
                            <Input
                                value={item.score}
                                onChange={event => updateItem(index, 'score', event.target.value)}
                                placeholder="分数"
                                style={{ width: 120 }}
                            />
                            <Button danger onClick={() => removeItem(index)}>删除</Button>
                        </div>
                    ))}
                    <Button type="dashed" onClick={addItem} style={{ width: '100%' }}>
                        添加填空
                    </Button>
                </Form.Item>

                <Form.Item
                    name="analyze"
                    label={(
                        <Space>
                            解析
                            <Button
                                size="small"
                                type="link"
                                icon={<ThunderboltOutlined />}
                                loading={aiLoading}
                                onClick={handleAiAnalyze}
                            >
                                AI 智能生成
                            </Button>
                        </Space>
                    )}
                    rules={[{ required: true, message: '请输入解析' }]}
                >
                    <ReactQuill theme="snow" />
                </Form.Item>

                <Form.Item name="score" label="分数" rules={[{ required: true, message: '请输入分数' }]}>
                    <InputNumber min={0} precision={1} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="difficult" label="难度" rules={[{ required: true, message: '请输入难度' }]}>
                    <InputNumber min={1} max={5} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>提交</Button>
                        <Button onClick={resetForm}>重置</Button>
                        <Button onClick={() => setPreviewVisible(true)}>预览</Button>
                        <Button onClick={() => navigate('/exam/question/list')}>取消</Button>
                    </Space>
                </Form.Item>
            </Form>

            <QuestionShow
                open={previewVisible}
                onClose={() => setPreviewVisible(false)}
                qType={4}
                question={previewVisible ? { ...form.getFieldsValue(), items } : null}
            />

            <AiGenerateModal
                visible={aiVisible}
                onClose={() => setAiVisible(false)}
                onConfirm={handleAiConfirm}
                questionType={4}
            />
        </div>
    )
}

export default GapFilling
