import React from 'react';
import { Card, Avatar } from 'antd';
import { useSelector } from 'react-redux';
import { UserOutlined } from '@ant-design/icons';
import './UserCard.css';

const UserCard = ({ userInfo }) => {
    const roleEnum = useSelector(state => state.enumItem.user.roleEnum);

    const getRoleName = (role) => {
        const roleItem = roleEnum.find(item => item.key === role);
        return roleItem ? roleItem.value : role;
    };

    if (!userInfo) {
        return null;
    }

    return (
        <Card className="user-card" title="关于我">
            <div className="user-profile">
                <div className="box-center">
                    <Avatar
                        size={100}
                        src={userInfo.imagePath}
                        icon={<UserOutlined />}
                    />
                </div>
                <div className="box-center">
                    <div className="user-name text-center">{userInfo.userName}</div>
                    <div className="user-role text-center text-muted">{getRoleName(userInfo.role)}</div>
                </div>
            </div>

            <div className="user-bio">
                <div className="user-education user-bio-section">
                    <div className="user-bio-section-header">
                        <span>个人简介</span>
                    </div>
                    <div className="user-bio-section-body">
                        <div className="text-muted">
                            无
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default UserCard;
