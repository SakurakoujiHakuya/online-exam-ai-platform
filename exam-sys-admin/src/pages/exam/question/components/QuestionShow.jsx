import React from 'react'
import { Divider, Modal, Spin, Tag } from 'antd'

const QuestionShow = ({ open, onClose, qType, question, loading, noModal = false }) => {
    const renderQuestionContent = () => {
        if (!question) return null

        const titleHtml = question.title || question.content
        const practiceVisibilityTag = question.hideInPracticeCenter
            ? <Tag color="volcano">试题中心隐藏</Tag>
            : <Tag color="success">试题中心可见</Tag>

        const renderItems = () => (
            question.items && question.items.map(item => (
                <div key={item.id || item.prefix} style={{ display: 'flex', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 'bold', marginRight: '6px', color: '#1890ff', whiteSpace: 'nowrap' }}>{item.prefix}.</div>
                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
                </div>
            ))
        )

        const renderAnswer = () => {
            if (!question.correct && (!question.correctArray || question.correctArray.length === 0)) return null
            let answerText = question.correct
            if (question.correctArray && question.correctArray.length > 0) {
                answerText = question.correctArray.join('、')
            }
            if (qType === 3) {
                answerText = answerText === 'T' ? '正确' : '错误'
            }
            return answerText
        }

        return (
            <div style={{ lineHeight: '1.8', fontSize: '14px' }}>
                <div style={{ marginBottom: '12px' }}>
                    {practiceVisibilityTag}
                </div>

                <div style={{ marginBottom: '12px', fontWeight: 500 }}>
                    <Tag color="blue" style={{ marginRight: '8px' }}>题干</Tag>
                    <div style={{ marginTop: '6px', paddingLeft: '4px' }}>
                        <div dangerouslySetInnerHTML={{ __html: titleHtml }} />
                    </div>
                </div>

                {(qType === 1 || qType === 2) && (
                    <div style={{ marginBottom: '12px', paddingLeft: '4px' }}>
                        {renderItems()}
                    </div>
                )}

                {qType === 3 && (
                    <div style={{ marginBottom: '12px', paddingLeft: '4px' }}>
                        {renderItems()}
                    </div>
                )}

                <Divider style={{ margin: '12px 0' }} />

                {renderAnswer() && (
                    <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
                        <Tag color="green" style={{ marginTop: '2px' }}>正确答案</Tag>
                        <div
                            style={{ marginLeft: '8px', color: '#389e0d', fontWeight: 500 }}
                            dangerouslySetInnerHTML={{ __html: renderAnswer() }}
                        />
                    </div>
                )}

                {question.analyze && (
                    <div style={{ marginTop: '8px' }}>
                        <Tag color="orange">题目解析</Tag>
                        <div
                            style={{ marginTop: '6px', paddingLeft: '4px', color: '#595959', background: '#fffbe6', borderRadius: '4px', padding: '8px 12px' }}
                            dangerouslySetInnerHTML={{ __html: question.analyze }}
                        />
                    </div>
                )}
            </div>
        )
    }

    const content = (
        loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin tip="加载中..." />
            </div>
        ) : renderQuestionContent()
    )

    if (noModal) {
        return content
    }

    return (
        <Modal
            title="题目详情"
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            {content}
        </Modal>
    )
}

export default QuestionShow
