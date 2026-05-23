import React, { useEffect, useState, useRef } from 'react'
import { Card, Button, Tag, Row, Col, Layout, Form, message, Modal } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import examPaperApi from '@/api/examPaper'
import examPaperAnswerApi from '@/api/examPaperAnswer'
import examAbnormalApi from '@/api/examAbnormal'
import QuestionEdit from '../components/QuestionEdit'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
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

const DoExam = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const id = searchParams.get('id')
    const isTask = searchParams.get('isTask') === '1'
    const taskId = searchParams.get('taskId')
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState(null)
    const [answerId, setAnswerId] = useState(null)
    const [answer, setAnswer] = useState({
        questionId: null,
        doTime: 0,
        answerItems: []
    })
    const [remainTime, setRemainTime] = useState(0)
    const [passedTime, setPassedTime] = useState(0)
    const [cheatCount, setCheatCount] = useState(0)
    const timerRef = useRef(null)
    const cheatCountRef = useRef(0)
    const formRef = useRef(null)
    const answerRef = useRef(answer)

    // Update refs whenever state changes
    useEffect(() => {
        answerRef.current = answer
    }, [answer])

    useEffect(() => {
        formRef.current = form
    }, [form])

    const initRef = useRef(false)

    useEffect(() => {
        if (id && !initRef.current) {
            initRef.current = true
            initExam(id)
        }

        if (isTask) {
            const handleVisibilityChange = async () => {
                if (document.visibilityState === 'visible') {
                    try {
                        const res = await examAbnormalApi.report({
                            examPaperId: id,
                            examPaperName: formRef.current?.name || '',
                            abnormalType: 1,
                            content: `违规切屏`
                        })

                        if (res && res.code === 1) {
                            const currentCount = res.response
                            cheatCountRef.current = currentCount
                            setCheatCount(currentCount)

                            if (currentCount >= 4) {
                                Modal.error({
                                    title: '违规次数上限',
                                    content: '由于您已违规切屏 4 次，系统将自动提交您的试卷！',
                                    okText: '确认',
                                    onOk: () => {
                                        submitForm(answerRef.current)
                                    }
                                })
                                // Fallback submit if they don't click OK
                                setTimeout(() => {
                                    submitForm(answerRef.current)
                                }, 3000)
                            } else {
                                Modal.warning({
                                    title: '防作弊提示',
                                    content: `检测到您离开了考试页面，这是第 ${currentCount} 次违规。请保持在考试页面完成考试！违规 4 次将自动交卷。`,
                                    okText: '确认'
                                })
                            }
                        }
                    } catch (e) {
                        console.error('Report failed:', e)
                    }
                }
            }

            const preventCopyPaste = (e) => {
                e.preventDefault()
                message.warning('考试期间禁止复制粘贴！')
                return false
            }

            const preventContextMenu = (e) => {
                e.preventDefault()
                return false
            }

            document.addEventListener('visibilitychange', handleVisibilityChange)
            document.addEventListener('copy', preventCopyPaste)
            document.addEventListener('paste', preventCopyPaste)
            document.addEventListener('cut', preventCopyPaste)
            document.addEventListener('contextmenu', preventContextMenu)

            return () => {
                if (timerRef.current) clearInterval(timerRef.current)
                document.removeEventListener('visibilitychange', handleVisibilityChange)
                document.removeEventListener('copy', preventCopyPaste)
                document.removeEventListener('paste', preventCopyPaste)
                document.removeEventListener('cut', preventCopyPaste)
                document.removeEventListener('contextmenu', preventContextMenu)
            }
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [id, isTask])

    const initExam = async (paperId) => {
        setLoading(true)
        try {
            const res = await examPaperApi.select(paperId)
            if (res && res.code === 1) {
                const paperData = res.response
                setForm(paperData)
                
                // Get or start answer state
                const startRes = await examPaperAnswerApi.answerStart({
                    id: paperId,
                    taskExamId: taskId ? parseInt(taskId) : null
                })
                if (startRes && startRes.code === 1) {
                    const data = startRes.response
                    setAnswerId(data.id)
                    
                    const startTime = data.startTime
                    const suggestTimeSeconds = data.suggestTime * 60
                    const now = Date.now()
                    const elapsed = Math.floor((now - startTime) / 1000)
                    const newRemainTime = Math.max(0, suggestTimeSeconds - elapsed)
                    
                    setRemainTime(newRemainTime)
                    setPassedTime(elapsed)
                    cheatCountRef.current = data.cheatCount || 0
                    setCheatCount(cheatCountRef.current)
                    
                    initAnswer(paperData, elapsed)
                    startTimer()

                    if (newRemainTime <= 0 && isTask) {
                        message.warning('考试时间已到，自动交卷')
                        submitForm()
                    }
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const activeQuestionRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Find the question with the most visibility
                        const order = parseInt(entry.target.id.split('-')[1])
                        activeQuestionRef.current = order
                    }
                })
            },
            { threshold: [0.5] } // Trigger if 50% visible
        )

        const questions = document.querySelectorAll('.question-item')
        questions.forEach((q) => observer.observe(q))

        return () => {
            questions.forEach((q) => observer.unobserve(q))
        }
    }, [form])

    const initAnswer = (paperData, initialDoTime = 0) => {
        const draftKey = `exam_draft_${paperData.id}_${taskId || 'none'}`
        const draftStr = localStorage.getItem(draftKey)
        if (draftStr) {
            try {
                const parsedDraft = JSON.parse(draftStr)
                if (parsedDraft && parsedDraft.answerItems) {
                    setAnswer(parsedDraft)
                    message.success('已恢复上次未提交的作答进度')
                    return
                }
            } catch (e) {
                console.error("Failed to parse draft", e)
            }
        }

        const newAnswer = {
            id: paperData.id,
            taskExamId: taskId ? parseInt(taskId) : null,
            doTime: initialDoTime,
            answerItems: []
        }
        paperData.titleItems.forEach(titleItem => {
            titleItem.questionItems.forEach(question => {
                newAnswer.answerItems.push({
                    questionId: question.id,
                    content: null,
                    contentArray: [],
                    completed: false,
                    itemOrder: question.itemOrder,
                    doTime: 0 // Initialize per-question time
                })
            })
        })
        setAnswer(newAnswer)
    }

    // Auto-save answer to localStorage
    useEffect(() => {
        if (answer && answer.id) {
            const draftKey = `exam_draft_${answer.id}_${taskId || 'none'}`
            localStorage.setItem(draftKey, JSON.stringify(answer))
        }
    }, [answer, taskId])

    // Prevent accidental exit
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault()
            e.returnValue = '您正在考试中，确定要离开吗？您的作答进度已自动保存。'
            return e.returnValue
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [])

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            setRemainTime(prev => {
                if (prev <= 1) { // Will reach 0
                    if (prev > 0) { // On the last second transition
                         if (isTask) {
                            message.warning('考试时间已到，自动交卷')
                            submitForm()
                         }
                    }
                    return 0
                }
                return prev - 1
            })
            setPassedTime(prev => prev + 1)
             setAnswer(prev => {
                const newDoTime = prev.doTime + 1
                const newItems = [...prev.answerItems]
                
                // Increment doTime for the active question
                if (activeQuestionRef.current !== null) {
                    const index = newItems.findIndex(item => item.itemOrder === activeQuestionRef.current)
                    if (index > -1) {
                        newItems[index] = { 
                            ...newItems[index], 
                            doTime: (newItems[index].doTime || 0) + 1 
                        }
                    }
                }

                // Periodic Sync every 10 seconds
                if (newDoTime % 10 === 0) {
                    syncState(newDoTime, newItems)
                }
                return { ...prev, doTime: newDoTime, answerItems: newItems }
             })
        }, 1000)
    }

    const syncState = async (doTime, answerItems) => {
        if (!answerId) return
        try {
            await examPaperAnswerApi.stateSync({
                id: answerId,
                doTime: doTime,
                cheatCount: cheatCountRef.current,
                answerItems: answerItems // Send current items including per-question doTime
            })
        } catch (e) {
            console.error('State sync failed:', e)
        }
    }

    const handleAnswerChange = (itemOrder, key, value) => {
        setAnswer(prev => {
            const newItems = [...prev.answerItems]
            const index = newItems.findIndex(item => item.itemOrder === itemOrder)
            if (index > -1) {
                newItems[index] = { 
                    ...newItems[index], 
                    [key]: value,
                    completed: true 
                }
            }
            return { ...prev, answerItems: newItems }
        })
    }

    const submitForm = async (paperAnswer) => {
        if (timerRef.current) clearInterval(timerRef.current)
        
        let finalAnswer = answer
        // If paperAnswer is a valid answer object (not a React event/Event)
        if (paperAnswer && paperAnswer.answerItems && Array.isArray(paperAnswer.answerItems)) {
            finalAnswer = paperAnswer
        }

        setLoading(true)
        try {
            // answerSubmit expects the Paper ID in the VM's id field.
            // Our answer state already has id: paperData.id from initAnswer.
            const res = await examPaperAnswerApi.answerSubmit(finalAnswer)
            if (res.code === 1) {
                const draftKey = `exam_draft_${finalAnswer.id}_${taskId || 'none'}`
                localStorage.removeItem(draftKey)
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
            message.error('提交失败')
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

    if (!form) return null

    return (
        <div className={`do-exam-container ${isTask ? 'no-select' : ''}`}>
            <div className="do-exam-header fixed-header">
                <div>
                     {answer.answerItems.map(item => (
                        <Tag 
                            key={item.itemOrder} 
                            color={item.completed ? 'success' : 'default'}
                            onClick={() => scrollToQuestion(item.itemOrder)}
                            style={{ cursor: 'pointer', marginBottom: 5 }}
                        >
                            {item.itemOrder}
                        </Tag>
                     ))}
                </div>
                <div className="timer-badge">
                     <ClockCircleOutlined /> {isTask ? formatSeconds(remainTime) : formatSeconds(passedTime)}
                </div>
            </div>

            <Layout className="exam-content">
                 <Header style={{ background: '#fff', padding: '0 20px', textAlign: 'center', height: 'auto' }}>
                    <h1 style={{ margin: '10px 0' }}>{form.name}</h1>
                    <div>
                        <span style={{ marginRight: 20 }}>试卷总分：{form.score}</span>
                        <span>考试时间：{form.suggestTime}分钟</span>
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
                                                 <QuestionEdit 
                                                     qType={question.questionType} 
                                                     question={question} 
                                                     answer={answerItem}
                                                     onAnswerChange={(key, val) => handleAnswerChange(question.itemOrder, key, val)} 
                                                 />
                                             </div>
                                         )
                                     })}
                                 </Card>
                             </div>
                         ))}
                         <div style={{ textAlign: 'center', marginTop: 30 }}>
                             <Button type="primary" size="large" onClick={submitForm} loading={loading}>提交</Button>
                             <Button size="large" style={{ marginLeft: 20 }} onClick={() => {
                                 Modal.confirm({
                                     title: '确认离开',
                                     content: '您确定要离开考试吗？您的作答进度已自动保存，再次进入可继续作答。',
                                     okText: '确认离开',
                                     cancelText: '继续考试',
                                     onOk: () => window.close()
                                 })
                             }}>取消</Button>
                         </div>
                     </Form>
                 </Content>
            </Layout>
        </div>
    )
}

export default DoExam
