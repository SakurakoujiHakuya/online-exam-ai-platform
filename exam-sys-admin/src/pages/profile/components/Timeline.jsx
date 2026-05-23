import React from 'react';
import { Timeline, Card } from 'antd';
import './Timeline.css';

const TimelineComponent = ({ userInfo }) => {
    return (
        <div className="block">
            <Timeline>
                <Timeline.Item placement="top" label={userInfo.lastActiveTime}>
                    <Card>
                        <h4>最后活动时间</h4>
                        <p>{userInfo.realName + '在校考系统中最后活动了'}</p>
                    </Card>
                </Timeline.Item>
                <Timeline.Item placement="top" label={userInfo.createTime}>
                    <Card>
                        <h4>加入时间</h4>
                        <p>{userInfo.realName + '加入了校考系统'}</p>
                    </Card>
                </Timeline.Item>
            </Timeline>
        </div>
    );
};

export default TimelineComponent;
