import React, { useEffect } from 'react'
import { Avatar, Badge, Dropdown, Layout, Menu, Space } from 'antd'
import { DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import useUserStore from '@/store/userStore'
import userApi from '@/api/user'
import loginApi from '@/api/login'
import logo from '@/assets/logo.png'

const { Header, Content, Footer } = Layout

const MainLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { userInfo, setUserInfo, logout, messageCount, setMessageCount } = useUserStore()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const [userRes, messageRes] = await Promise.all([
                    userApi.getCurrentUser(),
                    userApi.unReadCount()
                ])
                if (userRes?.code === 1) {
                    setUserInfo(userRes.response)
                }
                if (messageRes?.code === 1) {
                    setMessageCount(messageRes.response)
                }
            } catch (error) {
                console.error(error)
            }
        }
        fetchUser()
    }, [setMessageCount, setUserInfo])

    const handleLogout = async () => {
        try {
            await loginApi.logout()
        } catch (error) {
            console.error(error)
        } finally {
            logout()
            navigate('/login')
        }
    }

    const menuItems = [
        { key: '/index', label: '首页' },
        { key: '/ai/practice', label: 'AI 智能练习' },
        { key: '/ai/report', label: '学习报告' },
        { key: '/paper/index', label: '练习中心' },
        { key: '/record/index', label: '答题记录' },
        { key: '/question/index', label: '错题本' }
    ]

    const userMenu = {
        items: [
            { key: 'user', label: <Link to="/user/index">个人中心</Link> },
            { key: 'message', label: <Link to="/user/message">消息通知</Link> },
            { type: 'divider' },
            { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout }
        ]
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#fff',
                    padding: '0 20px',
                    boxShadow: '0 2px 8px #f0f1f2',
                    zIndex: 10
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/index" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={logo} alt="Logo" style={{ height: 40, marginRight: 16 }} />
                    </Link>
                </div>

                <Menu
                    theme="light"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ flex: 1, borderBottom: 'none', justifyContent: 'center' }}
                />

                <Dropdown menu={userMenu} placement="bottomRight">
                    <Space style={{ cursor: 'pointer' }}>
                        <Badge dot={messageCount > 0}>
                            <Avatar src={userInfo?.imagePath || null} icon={<UserOutlined />} />
                        </Badge>
                        <span>{userInfo?.userName || '学生'}</span>
                        <DownOutlined />
                    </Space>
                </Dropdown>
            </Header>

            <Content style={{ padding: '24px 50px', background: '#f5f7fa' }}>
                <Outlet />
            </Content>

            <Footer style={{ textAlign: 'center', background: '#eef1f6', color: '#999' }}>
                在线考试与练习平台 2026
            </Footer>
        </Layout>
    )
}

export default MainLayout
