import React from 'react'
import { Radio, Checkbox, Input, Form } from 'antd'

const QuestionEdit = ({ qType, question, answer, onAnswerChange }) => {
    // answer is mutable object in Vue, in React we should propagate changes
    // But for performance in large forms, sometimes we can use mutable or local state.
    // Here we assume onAnswerChange is passed to update parent state.
    
    // Helper to handle completion
    const handleChange = (key, value) => {
        onAnswerChange(key, value)
    }

    if (!question) return null

    // 1: Single Choice
    if (qType === 1) {
        return (
            <div>
                <div className="q-title" dangerouslySetInnerHTML={{ __html: question.title }} />
                <div className="q-content">
                    <Radio.Group 
                        value={answer.content || null} 
                        onChange={e => handleChange('content', e.target.value)}
                    >
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {question.items.map(item => (
                                <Radio key={item.prefix} value={item.prefix}>
                                    <span style={{ fontWeight: 'bold', marginRight: 8 }}>{item.prefix}.</span>
                                    <span dangerouslySetInnerHTML={{ __html: item.content }} />
                                </Radio>
                            ))}
                        </div>
                    </Radio.Group>
                </div>
            </div>
        )
    }

    // 2: Multiple Choice
    if (qType === 2) {
        return (
             <div>
                <div className="q-title" dangerouslySetInnerHTML={{ __html: question.title }} />
                 <div className="q-content">
                    <Checkbox.Group 
                        value={answer.contentArray || []} 
                        onChange={checkedValues => handleChange('contentArray', checkedValues)}
                    >
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {question.items.map(item => (
                                <Checkbox key={item.prefix} value={item.prefix}>
                                     <span style={{ fontWeight: 'bold', marginRight: 8 }}>{item.prefix}.</span>
                                     <span dangerouslySetInnerHTML={{ __html: item.content }} />
                                </Checkbox>
                            ))}
                        </div>
                    </Checkbox.Group>
                 </div>
            </div>
        )
    }

    // 3: True/False
    if (qType === 3) {
         return (
            <div>
                <div className="q-title" style={{ display: 'inline', marginRight: 10 }} dangerouslySetInnerHTML={{ __html: question.title }} />
                <span>(</span>
                <Radio.Group 
                    value={answer.content || null} 
                    onChange={e => handleChange('content', e.target.value)}
                >
                     {question.items.map(item => (
                        <Radio key={item.prefix} value={item.prefix}>
                            <span dangerouslySetInnerHTML={{ __html: item.content }} />
                        </Radio>
                     ))}
                </Radio.Group>
                <span>)</span>
            </div>
        )
    }

    // 4: Fill in blank
    if (qType === 4) {
        return (
            <div>
                <div className="q-title" dangerouslySetInnerHTML={{ __html: question.title }} />
                <div>
                    {question.items.map((item, index) => {
                        const itemPrefix = item.prefix || (index + 1).toString();
                        return (
                            <Form.Item key={itemPrefix} label={itemPrefix} style={{ marginBottom: 10 }}>
                                <Input 
                                    value={(answer.contentArray || [])[parseInt(itemPrefix) - 1] || ''} 
                                    onChange={e => {
                                        const newArray = [...(answer.contentArray || [])]
                                        const idx = parseInt(itemPrefix) - 1
                                        if (!isNaN(idx)) {
                                            newArray[idx] = e.target.value
                                            handleChange('contentArray', newArray)
                                        }
                                    }}
                                />
                            </Form.Item>
                        );
                    })}
                </div>
            </div>
        )
    }

    // 5: Short Answer
    if (qType === 5) {
        return (
             <div>
                <div className="q-title" dangerouslySetInnerHTML={{ __html: question.title }} />
                <Input.TextArea 
                    rows={5} 
                    value={answer.content || ''} 
                    onChange={e => handleChange('content', e.target.value)} 
                />
            </div>
        )
    }

    return null
}

export default QuestionEdit
