import React, { useState, useEffect } from 'react';
import { Tabs, Card } from 'antd';
import { getCurrentUser } from '@/api/user';
import UserCard from './components/UserCard';
import TimelineComponent from './components/Timeline';
import Account from './components/Account';
import './Profile.css';

const Profile = () => {
    const [userInfo, setUserInfo] = useState({
        realName: '',
        phone: '',
        lastActiveTime: '',
        createTime: '',
        role: '1',
        imagePath: null
    });

    useEffect(() => {
        getCurrentUser().then(res => {
            if (res.code === 1) {
                setUserInfo(res.response);
            }
        });
    }, []);

    const handleUserUpdate = (updatedUser) => {
        if (updatedUser) {
            setUserInfo(updatedUser);
        }
    };

    const tabItems = [
        {
            key: 'timeline',
            label: '时间线',
            children: <TimelineComponent userInfo={userInfo} />
        },
        {
            key: 'account',
            label: '账号',
            children: <Account userInfo={userInfo} onUpdate={handleUserUpdate} />
        }
    ];

    return (
        <div className="app-container">
            <div>
                <UserCard userInfo={userInfo} />
                <Card style={{ marginTop: 20 }}>
                    <Tabs defaultActiveKey="timeline" items={tabItems} />
                </Card>
            </div>
        </div>
    );
};

export default Profile;
