import { useRoutes, Navigate } from 'react-router-dom'
import React, { lazy, Suspense } from 'react'
import Layout from '@/layout'
import Login from '@/views/login'

// Lazy load components
const Dashboard = lazy(() => import('@/views/dashboard'))
const PaperIndex = lazy(() => import('@/views/paper'))
const RecordIndex = lazy(() => import('@/views/record'))
const QuestionErrorIndex = lazy(() => import('@/views/question-error'))
const UserInfo = lazy(() => import('@/views/user-info'))
const UserMessage = lazy(() => import('@/views/user-info/message'))
const LearningReport = lazy(() => import('@/views/learning-report'))
const DoExam = lazy(() => import('@/views/exam/paper/do'))
const AiPractice = lazy(() => import('@/views/ai-practice'))

const ReadExam = lazy(() => import('@/views/exam/paper/read'))
const EditExam = lazy(() => import('@/views/exam/paper/edit'))
const Register = lazy(() => import('@/views/register'))

const Router = () => {
  const routes = [
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: (
        <Suspense fallback={<div>加载中...</div>}>
          <Register />
        </Suspense>
      ),
    },
    {
      path: '/do',
      element: (
        <Suspense fallback={<div>加载中...</div>}>
          <DoExam />
        </Suspense>
      ),
    },
    {
      path: '/read',
      element: (
        <Suspense fallback={<div>加载中...</div>}>
          <ReadExam />
        </Suspense>
      ),
    },
    {
      path: '/edit',
      element: (
        <Suspense fallback={<div>加载中...</div>}>
          <EditExam />
        </Suspense>
      ),
    },
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path: '/index',
          element: (
            <Suspense fallback={<div>加载中...</div>}>
              <Dashboard />
            </Suspense>
          ),
        },
        {
          path: '/paper/index',
          element: (
            <Suspense fallback={<div>加载中...</div>}>
              <PaperIndex />
            </Suspense>
          ),
        },
        {
          path: '/ai/practice',
          element: (
            <Suspense fallback={<div>加载中...</div>}>
              <AiPractice />
            </Suspense>
          ),
        },
        {
          path: '/ai/report',
          element: (
            <Suspense fallback={<div>加载中...</div>}>
              <LearningReport />
            </Suspense>
          ),
        },
        {
          path: '/record/index',
          element: (
            <Suspense fallback={<div>加载中...</div>}>
              <RecordIndex />
            </Suspense>
          ),
        },
        {
          path: '/question/index',
          element: (
            <Suspense fallback={<div>加载中...</div>}>
              <QuestionErrorIndex />
            </Suspense>
          ),
        },
        {
          path: '/user/index',
          element: (
            <Suspense fallback={<div>加载中...</div>}>
              <UserInfo />
            </Suspense>
          ),
        },
        {
          path: '/user/message',
          element: (
            <Suspense fallback={<div>加载中...</div>}>
              <UserMessage />
            </Suspense>
          ),
        },
        {
          path: '/',
          element: <Navigate to="/index" replace />,
        },
      ],
    },
    {
      path: '*',
      element: <div>404 页面不存在</div>,
    },
  ]

  return useRoutes(routes)
}

export default Router
