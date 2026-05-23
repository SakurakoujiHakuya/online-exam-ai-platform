import React, { useState, useEffect } from 'react';
import { Modal, Spin, Typography, Space, Tag, Divider, Card } from 'antd';
import * as examPaperApi from '@/api/examPaper';
import QuestionShow from '../../question/components/QuestionShow';

const { Title, Text } = Typography;

const PaperPreviewModal = ({ open, onClose, paperId }) => {
    const [loading, setLoading] = useState(false);
    const [paper, setPaper] = useState(null);

    useEffect(() => {
        if (open && paperId) {
            setLoading(true);
            examPaperApi.select(paperId).then(res => {
                if (res.code === 1) {
                    setPaper(res.response);
                }
                setLoading(false);
            }).catch(() => {
                setLoading(false);
            });
        }
    }, [open, paperId]);

    const renderContent = () => {
        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" tip="正在加载试卷..." />
                </div>
            );
        }

        if (!paper) {
            return <div style={{ textAlign: 'center', padding: '50px' }}>未找到试卷信息</div>;
        }

        return (
            <div>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3}>{paper.name}</Title>
                    <Space size="large">
                        <Text type="secondary">建议时长：{paper.suggestTime} 分钟</Text>
                    </Space>
                </div>
                <Divider />
                
                {paper.titleItems && paper.titleItems.map((titleItem, index) => (
                    <div key={index} style={{ marginBottom: 32 }}>
                        <Title level={4} style={{ background: '#fafafa', padding: '10px 16px', borderLeft: '4px solid #1890ff' }}>
                            {titleItem.name}
                        </Title>
                        
                        {titleItem.questionItems && titleItem.questionItems.length > 0 ? (
                            titleItem.questionItems.map((q, qIndex) => (
                                <Card key={q.id || qIndex} style={{ marginBottom: 16 }} bodyStyle={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ marginRight: 8, fontWeight: 'bold', color: '#1890ff', fontSize: '16px' }}>
                                            {q.itemOrder}.
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <QuestionShow 
                                                open={true} 
                                                onClose={() => {}} 
                                                qType={q.questionType} 
                                                question={q} 
                                                loading={false} 
                                                noModal={true} 
                                            />
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>该大题下暂无题目</div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Modal
            title="试卷预览"
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', padding: '24px' }}
            destroyOnClose
        >
            {renderContent()}
        </Modal>
    );
};

export default PaperPreviewModal;
