import React, { useEffect, useState } from 'react'
import { Layout, Button, Tag, Card, Form, Spin, Radio, message, Modal } from 'antd'
import examPaperAnswerApi from '@/api/examPaperAnswer'
import QuestionAnswerShow from '../components/QuestionAnswerShow'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './do.css'

const { Header, Content } = Layout

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

const EditExam = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const id = searchParams.get('id')
    const [loading, setLoading] = useState(false)
    const [formLoading, setFormLoading] = useState(false)
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
            const res = await examPaperAnswerApi.read(answerId)
            if (res && res.response) {
                setForm(res.response.paper)
                setAnswer(res.response.answer)
            }
        } catch (e) {
            console.error(e)
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

    const submitForm = async () => {
        setFormLoading(true)
        try {
            const res = await examPaperAnswerApi.edit(answer)
            if (res.code === 1) {
                Modal.success({
                    title: '考试结果',
                    content: `试卷得分：${res.response}分`,
                    okText: '返回考试记录',
                    onOk: () => {
                         navigate('/record/index')
                    }
                })
            } else {
                 message.error(res.message)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setFormLoading(false)
        }
    }

    const scoreSelect = (score) => {
        let array = []
        for (let i = 0; i <= parseInt(score); i++) {
            array.push(i.toString())
        }
        if (score.toString().indexOf('.') !== -1) {
            array.push(score)
        }
        return array
    }

    const handleScoreChange = (itemOrder, val) => {
        setAnswer(prev => {
            const newItems = [...prev.answerItems]
            const index = newItems.findIndex(i => i.itemOrder === itemOrder)
            if (index > -1) {
                newItems[index] = { ...newItems[index], score: val }
            }
            return { ...prev, answerItems: newItems }
        })
    }

    if (!form || !answer) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />

    const doRightTag = {
        true: 'success',
        false: 'error',
        null: 'warning'
    }

    return (
        <div className="do-exam-container">
             <div className="do-exam-header fixed-header" style={{ background: '#F5F5DC' }}>
                 <div>
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
                        <span style={{ marginRight: 20 }}>试卷得分：{answer.score}</span>
                        <span>试卷耗时：{formatSeconds(answer.doTime)}</span>
                    </div>
                 </Header>
                 <Content style={{ padding: 20 }}>
                     <Form layout="vertical">
                         {form.titleItems.map((titleItem, index) => (
                             <div key={index} style={{ marginBottom: 20 }}>
                                 <h3>{titleItem.name}</h3>
                                 <Card>
                                     {titleItem.questionItems.length > 0 && titleItem.questionItems.map(question => {
                                         const answerItem = answer.answerItems.find(a => a.itemOrder === question.itemOrder) || {}
                                         return (
                                             <div key={question.itemOrder} id={`question-${question.itemOrder}`} className="question-item">
                                                  <div style={{ marginBottom: 10 }}>
                                                      <Tag color="blue">{question.itemOrder}</Tag>
                                                  </div>
                                                 <QuestionAnswerShow 
                                                     qType={question.questionType} 
                                                     question={question} 
                                                     answer={answerItem}
                                                 />
                                                 {answerItem.doRight === null && (
                                                     <div style={{ marginTop: 10, padding: 10, background: '#fffbe6', border: '1px solid #ffe58f' }}>
                                                         <span style={{ color: '#faad14', fontWeight: 'bold', marginRight: 10 }}>批改：</span>
                                                         <Radio.Group 
                                                            value={answerItem.score ? answerItem.score.toString() : ''}
                                                            onChange={e => handleScoreChange(question.itemOrder, e.target.value)}
                                                         >
                                                             {scoreSelect(question.score).map(s => (
                                                                 <Radio key={s} value={s}>{s}</Radio>
                                                             ))}
                                                         </Radio.Group>
                                                     </div>
                                                 )}
                                             </div>
                                         )
                                     })}
                                 </Card>
                             </div>
                         ))}
                         <div style={{ textAlign: 'center', marginTop: 30 }}>
                             <Button type="primary" size="large" onClick={submitForm} loading={formLoading}>提交</Button>
                             <Button size="large" style={{ marginLeft: 20 }} onClick={() => window.close()}>取消</Button>
                         </div>
                     </Form>
                 </Content>
             </Layout>
        </div>
    )
}

export default EditExam
