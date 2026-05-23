import React, { useEffect, useState } from 'react'
import { Layout, Button, Tag, Card, Form, Spin, message } from 'antd'
import { read } from '@/api/examPaperAnwser'
import QuestionAnswerShow from '@/components/QuestionAnswerShow'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './AnswerEdit.css'

const { Header, Content } = Layout

const getStudentDisplayName = answer => answer?.studentName || answer?.realName || answer?.userName || '-'

const formatSeconds = (theTime) => {
    let theTime1 = 0
    let theTime2 = 0
    if (theTime > 60) {
        theTime1 = parseInt(theTime / 60)
        theTime = parseInt(theTime % 60)
        if (theTime1 > 60) {
            theTime2 = parseInt(theTime1 / 60)
            theTime1 = parseInt(theTime1 % 60)
        }
    }
    let result = '' + parseInt(theTime) + '秒'
    if (theTime1 > 0) {
        result = '' + parseInt(theTime1) + '分' + result
    }
    if (theTime2 > 0) {
        result = '' + parseInt(theTime2) + '小时' + result
    }
    return result
}

const AnswerRead = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const id = searchParams.get('id')
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState(null)
    const [answer, setAnswer] = useState(null)

    useEffect(() => {
        if (id) {
            initData(id)
        }
    }, [id])

    const initData = async (answerId) => {
        setLoading(true)
        try {
            const res = await read(answerId)
            if (res && res.response) {
                setForm(res.response.paper)
                setAnswer(res.response.answer)
            }
        } catch (e) {
            console.error(e)
            message.error('加载数据失败')
        } finally {
            setLoading(false)
        }
    }

    const scrollToQuestion = (order) => {
        const element = document.getElementById(`question-${order}`)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    if (loading || !form || !answer) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />

    const doRightTag = {
        true: 'success',
        false: 'error',
        null: 'warning'
    }

    return (
        <div className="do-exam-container">
            <div className="do-exam-header fixed-header" style={{ background: '#fff' }}>
                <div style={{ padding: '0 20px' }}>
                    {answer.answerItems.map(item => (
                        <Tag 
                            key={item.itemOrder} 
                            color={doRightTag[item.doRight] || 'default'}
                            onClick={() => scrollToQuestion(item.itemOrder)}
                            style={{ cursor: 'pointer', marginBottom: 5 }}
                        >
                            {item.itemOrder}
                        </Tag>
                    ))}
                </div>
            </div>

            <Layout className="exam-content">
                <Header style={{ background: '#fff', padding: '0 20px', textAlign: 'center', height: 'auto' }}>
                    <h1 style={{ margin: '10px 0' }}>{form.name}</h1>
                    <div>
                        <span style={{ marginRight: 20 }}>试卷得分：<Tag color="orange" style={{ fontSize: '1.2em' }}>{answer.score}</Tag></span>
                        <span>试卷耗时：{formatSeconds(answer.doTime)}</span>
                        <span style={{ marginLeft: 20 }}>考生：{getStudentDisplayName(answer)}</span>
                    </div>
                </Header>
                <Content style={{ padding: 20 }}>
                    <Form layout="vertical">
                        {form.titleItems.map((titleItem, index) => (
                            <div key={index} style={{ marginBottom: 20 }}>
                                <h3 style={{ padding: '0 10px', borderLeft: '4px solid #1890ff' }}>{titleItem.name}</h3>
                                <Card style={{ marginTop: 10 }}>
                                    {titleItem.questionItems.length > 0 && titleItem.questionItems.map(question => {
                                        const answerItem = answer.answerItems.find(a => a.itemOrder === question.itemOrder) || {}
                                        return (
                                            <div key={question.itemOrder} id={`question-${question.itemOrder}`} className="question-item">
                                                <div style={{ marginBottom: 10 }}>
                                                    <Tag color="cyan">{question.itemOrder}</Tag>
                                                </div>
                                                <QuestionAnswerShow 
                                                    qType={question.questionType} 
                                                    question={question} 
                                                    answer={answerItem}
                                                />
                                            </div>
                                        )
                                    })}
                                </Card>
                            </div>
                        ))}
                        <div style={{ textAlign: 'center', marginTop: 40, paddingBottom: 40 }}>
                            <Button size="large" onClick={() => navigate(-1)}>
                                返回
                            </Button>
                        </div>
                    </Form>
                </Content>
            </Layout>
        </div>
    )
}

export default AnswerRead
