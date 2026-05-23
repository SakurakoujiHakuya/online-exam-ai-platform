import React from 'react'
import { Radio, Checkbox, Input, Form, Tag, Rate } from 'antd'

const QuestionAnswerShow = ({ qType, question, answer }) => {
    if (!question || !answer) return null

    const doRightEnum = {
        true: '正确',
        false: '错误',
        null: '待批改'
    }

    const doRightTag = {
        true: 'success',
        false: 'error',
        null: 'warning'
    }

    const getTrueFalseContent = (q) => {
        const item = q.items.find(d => d.prefix === q.correct)
        return item ? item.content : ''
    }

    return (
        <div className="q-answer-show" style={{ lineHeight: 1.8 }}>
            <div className="q-title" dangerouslySetInnerHTML={{ __html: question.title }}></div>
            
            <div className="q-content">
                {qType === 1 && (
                    <Radio.Group value={answer.content} disabled>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {question.items.map(item => (
                                <Radio key={item.prefix} value={item.prefix}>
                                    <span style={{ fontWeight: 'bold', marginRight: 8 }}>{item.prefix}.</span>
                                    <span dangerouslySetInnerHTML={{ __html: item.content }} />
                                </Radio>
                            ))}
                        </div>
                    </Radio.Group>
                )}

                {qType === 2 && (
                    <Checkbox.Group value={answer.contentArray} disabled>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {question.items.map(item => (
                                <Checkbox key={item.prefix} value={item.prefix}>
                                    <span style={{ fontWeight: 'bold', marginRight: 8 }}>{item.prefix}.</span>
                                    <span dangerouslySetInnerHTML={{ __html: item.content }} />
                                </Checkbox>
                            ))}
                        </div>
                    </Checkbox.Group>
                )}

                {qType === 3 && (
                     <div>
                        <span>(</span>
                        <Radio.Group value={answer.content} disabled>
                             {question.items.map(item => (
                                <Radio key={item.prefix} value={item.prefix}>
                                     <span dangerouslySetInnerHTML={{ __html: item.content }} />
                                </Radio>
                             ))}
                        </Radio.Group>
                        <span>)</span>
                    </div>
                )}

                {qType === 4 && (
                    <div>
                        {question.items.map((item, index) => (
                            <div key={item.prefix} style={{ marginBottom: 10 }}>
                                <span style={{ marginRight: 8 }}>{item.prefix}:</span>
                                <Input 
                                    style={{ width: 'calc(100% - 40px)' }}
                                    value={answer.contentArray && answer.contentArray[item.prefix - 1]} 
                                    disabled 
                                />
                            </div>
                        ))}
                    </div>
                )}

                {qType === 5 && (
                     <Input.TextArea rows={5} value={answer.content} disabled />
                )}
            </div>

            <div className="q-result-info" style={{ marginTop: 15, background: '#fafafa', padding: 10, borderRadius: 4 }}>
                <div className="info-item">
                    <span className="label">结果：</span>
                    <Tag color={doRightTag[answer.doRight] || 'default'}>
                        {doRightEnum[answer.doRight] || 'Unknown'}
                    </Tag>
                </div>
                <div className="info-item">
                    <span className="label">分数：</span>
                    <span>{question.score}</span>
                </div>
                <div className="info-item">
                     <span className="label">难度：</span>
                     <Rate disabled value={question.difficult} />
                </div>
                <div className="info-item">
                     <span className="label">解析：</span>
                     <span dangerouslySetInnerHTML={{ __html: question.analyze }} />
                </div>
                <div className="info-item">
                     <span className="label">正确答案：</span>
                     {(qType === 1 || qType === 2 || qType === 5) && <span dangerouslySetInnerHTML={{ __html: question.correct }} />}
                     {qType === 3 && <span dangerouslySetInnerHTML={{ __html: getTrueFalseContent(question) }} />}
                     {qType === 4 && <span>{question.correctArray && question.correctArray.join(', ')}</span>}
                </div>
            </div>
        </div>
    )
}

export default QuestionAnswerShow
