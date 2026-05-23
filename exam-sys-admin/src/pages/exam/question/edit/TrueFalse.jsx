import React, { useEffect, useRef, useState } from 'react'
import { Button, Form, Input, InputNumber, Radio, Select, Space, message } from 'antd'
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

const defaultItems = [
    { prefix: 'A', content: '是' },
    { prefix: 'B', content: '否' }
]

const TrueFalse = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [searchParams] = useSearchParams()
    const id = searchParams.get('id')
    const [form] = Form.useForm()
    const groups = useSelector(state => state.group.groups)
    const subjects = useSelector(state => state.subject.subjects)
    const { tags: availableTags, loading: tagLoading } = useTagOptions()

    const [items, setItems] = useState(defaultItems)
    const [subjectFilter, setSubjectFilter] = useState([])
    const [loading, setLoading] = useState(false)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [aiVisible, setAiVisible] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const editableTags = availableTags.filter(tag => tag.name !== PRACTICE_HIDDEN_TAG_NAME)

    useRouteLayoutRefresh()

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
                setItems(data.items?.length ? data.items : defaultItems)
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

    const updateItem = (index, content) => {
        const nextItems = [...items]
        nextItems[index] = { ...nextItems[index], content }
        setItems(nextItems)
    }

    const resetForm = () => {
        form.resetFields()
        setItems(defaultItems)
        setSubjectFilter([])
    }

    const handleAiConfirm = data => {
        if (!data) {
            return
        }

        let correct = data.correct
        if (['正确', '是', '对', 'true', true].includes(correct)) {
            correct = 'A'
        } else if (['错误', '否', '错', 'false', false].includes(correct)) {
            correct = 'B'
        }

        form.setFieldsValue({
            title: data.title,
            correct,
            analyze: data.analyze,
            score: data.score,
            difficult: data.difficult
        })
    }

    const handleAiAnalyze = async event => {
        event?.preventDefault?.()
        const values = form.getFieldsValue(['title', 'correct'])
        if (!values.title || values.title === '<p><br></p>') {
            message.warning('请先输入题干内容')
            return
        }

        setAiLoading(true)
        try {
            const res = await generateAnalyze({
                title: values.title,
                content: `正确答案: ${values.correct === 'A' ? '是' : '否'}`
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
            questionType: 3,
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

                <Form.Item label="选项">
                    {items.map((item, index) => (
                        <div key={item.prefix} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ width: 24, marginRight: 8, fontWeight: 600 }}>{item.prefix}</span>
                            <Input value={item.content} onChange={event => updateItem(index, event.target.value)} />
                        </div>
                    ))}
                </Form.Item>

                <Form.Item name="correct" label="正确答案" rules={[{ required: true, message: '请选择正确答案' }]}>
                    <Radio.Group>
                        {items.map(item => <Radio key={item.prefix} value={item.prefix}>{item.content}</Radio>)}
                    </Radio.Group>
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
                qType={3}
                question={previewVisible ? { ...form.getFieldsValue(), items } : null}
            />

            <AiGenerateModal
                visible={aiVisible}
                onClose={() => setAiVisible(false)}
                onConfirm={handleAiConfirm}
                questionType={3}
            />
        </div>
    )
}

export default TrueFalse
