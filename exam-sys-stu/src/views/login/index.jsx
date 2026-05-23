import React, { useState } from 'react'
import { Form, Input, Button, Checkbox, message, Card } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import useUserStore from '@/store/userStore'
import loginApi from '@/api/login'
import { useNavigate, Link } from 'react-router-dom'
import logo from '@/assets/logo.png'
import './index.css' // We will create this for basic bg styling

const Login = () => {
    const navigate = useNavigate()
    const { setUserName, setToken } = useUserStore()
    const [loading, setLoading] = useState(false)

    const onFinish = async (values) => {
        setLoading(true)
        try {
            const res = await loginApi.login({
                userName: values.username,
                password: values.password,
                // remember: values.remember
            })
            if (res && res.code === 1) {
                setUserName(values.username) // Should ideally come from response
                // Token is usually handled in cookie by backend or we need to set it if returned
                // The Vue code: _this.setUserName(_this.loginForm.userName)
                // It doesn't seem to set token explicitly in Vuex, maybe cookie is httpOnly?
                // But request.js logic in Vue checks 'adminToken' cookie? No, I put 'adminToken' in my react code but need to verify.
                // Vue request.js: withCredentials: true. Likely using cookies.
                // If response provides token, we set it.
                if (res.response && res.response.token) {
                    setToken(res.response.token)
                }

                message.success('登录成功')
                navigate('/index')
            } else {
                // Error handled in interceptor mostly, but just in case
                // message.error(res.message || 'Login failed')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <Card className="login-card" bordered={false}>
                <div className="login-header">
                    <div className="logo-container">
                        {/* Placeholder for logo */}
                        <img src={logo} alt="logo" className="logo-circle" />
                    </div>
                    <h2>考试系统</h2>
                </div>
                <Form
                    name="normal_login"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名!' }]}
                    >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码!' }]}
                    >
                        <Input
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="密码"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>记住我</Checkbox>
                        </Form.Item>
                        <a className="login-form-forgot" href="">
                            忘记密码
                        </a>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button" loading={loading} block>
                            登录
                        </Button>
                        <div style={{ marginTop: 10, textAlign: 'center' }}>
                            还没有账号? <Link to="/register">注册</Link>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default Login
