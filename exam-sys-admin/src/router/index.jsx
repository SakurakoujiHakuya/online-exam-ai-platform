import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/layout';
import Login from '@/pages/login/Login';
import AuthGuard from '@/components/AuthGuard';

// Lazy load components
const Dashboard = lazy(() => import('@/pages/dashboard'));
const UserStudentList = lazy(() => import('@/pages/user/student/UserStudentList'));
const UserStudentEdit = lazy(() => import('@/pages/user/student/UserStudentEdit'));
const UserAdminList = lazy(() => import('@/pages/user/admin/UserAdminList'));
const UserAdminEdit = lazy(() => import('@/pages/user/admin/UserAdminEdit'));
const ExamPaperList = lazy(() => import('@/pages/exam/paper/ExamPaperList'));
const ExamPaperEdit = lazy(() => import('@/pages/exam/paper/ExamPaperEdit'));
const ExamQuestionList = lazy(() => import('@/pages/exam/question/ExamQuestionList'));
const PaperStats = lazy(() => import('@/pages/exam/stats/PaperStats'));
const QuestionStats = lazy(() => import('@/pages/exam/stats/QuestionStats'));
const SingleChoice = lazy(() => import('@/pages/exam/question/edit/SingleChoice'));
const MultipleChoice = lazy(() => import('@/pages/exam/question/edit/MultipleChoice'));
const TrueFalse = lazy(() => import('@/pages/exam/question/edit/TrueFalse'));
const GapFilling = lazy(() => import('@/pages/exam/question/edit/GapFilling'));
const ShortAnswer = lazy(() => import('@/pages/exam/question/edit/ShortAnswer'));
const TaskList = lazy(() => import('@/pages/exam/task/TaskList'));
const TaskEdit = lazy(() => import('@/pages/exam/task/TaskEdit'));
const SubjectList = lazy(() => import('@/pages/education/subject/SubjectList'));
const SubjectEdit = lazy(() => import('@/pages/education/subject/SubjectEdit'));
const TagList = lazy(() => import('@/pages/education/tag/TagList'));
const TagEdit = lazy(() => import('@/pages/education/tag/TagEdit'));
const TagQuestionList = lazy(() => import('@/pages/education/tag/TagQuestionList'));
const AnswerList = lazy(() => import('@/pages/answer/AnswerList'));
const AnswerEdit = lazy(() => import('@/pages/answer/AnswerEdit'));
const AnswerRead = lazy(() => import('@/pages/answer/AnswerRead'));
const MessageList = lazy(() => import('@/pages/message/MessageList'));
const MessageSend = lazy(() => import('@/pages/message/MessageSend'));
const Profile = lazy(() => import('@/pages/profile/Profile'));
const LogUserList = lazy(() => import('@/pages/log/user/LogUserList'));
const LogAbnormalList = lazy(() => import('@/pages/log/abnormal/LogAbnormalList'));
const AiConfigList = lazy(() => import('@/pages/config/ai/AiConfigList'));
const StudentLearningReport = lazy(() => import('@/pages/ai/StudentLearningReport'));
const ReviewCenter = lazy(() => import('@/pages/collaboration/ReviewCenter'));
const NotFound = lazy(() => import('@/pages/error/404'));
const Unauthorized = lazy(() => import('@/pages/error/401'));

const Loading = () => <div style={{ padding: '20px', textAlign: 'center' }}>加载中...</div>;

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/',
        element: <AuthGuard><MainLayout /></AuthGuard>,
        children: [
            {
                path: '/',
                element: <Navigate to="/dashboard" replace />
            },
            {
                path: 'dashboard',
                element: <Suspense fallback={<Loading />}><Dashboard /></Suspense>
            },
            {
                path: 'ai-config',
                element: <Suspense fallback={<Loading />}><AiConfigList /></Suspense>
            },
            {
                path: 'ai/student-report/:id',
                element: <Suspense fallback={<Loading />}><StudentLearningReport /></Suspense>
            },
            {
                path: 'collaboration/review',
                element: <Suspense fallback={<Loading />}><ReviewCenter /></Suspense>
            },
            {
                path: 'user/student/list',
                element: <Suspense fallback={<Loading />}><UserStudentList /></Suspense>
            },
            {
                path: 'user/student/edit',
                element: <Suspense fallback={<Loading />}><UserStudentEdit /></Suspense>
            },
            {
                path: 'user/admin/list',
                element: <Suspense fallback={<Loading />}><UserAdminList /></Suspense>
            },
            {
                path: 'user/admin/edit',
                element: <Suspense fallback={<Loading />}><UserAdminEdit /></Suspense>
            },
            {
                path: 'exam/paper/list',
                element: <Suspense fallback={<Loading />}><ExamPaperList /></Suspense>
            },
            {
                path: 'exam/paper/edit',
                element: <Suspense fallback={<Loading />}><ExamPaperEdit /></Suspense>
            },
            {
                path: 'exam/paper/stats/:id',
                element: <Suspense fallback={<Loading />}><PaperStats /></Suspense>
            },
            {
                path: 'exam/question/list',
                element: <Suspense fallback={<Loading />}><ExamQuestionList /></Suspense>
            },
            {
                path: 'exam/question/stats/:id',
                element: <Suspense fallback={<Loading />}><QuestionStats /></Suspense>
            },
            {
                path: 'exam/question/edit/singleChoice',
                element: <Suspense fallback={<Loading />}><SingleChoice /></Suspense>
            },
            {
                path: 'exam/question/edit/multipleChoice',
                element: <Suspense fallback={<Loading />}><MultipleChoice /></Suspense>
            },
            {
                path: 'exam/question/edit/trueFalse',
                element: <Suspense fallback={<Loading />}><TrueFalse /></Suspense>
            },
            {
                path: 'exam/question/edit/gapFilling',
                element: <Suspense fallback={<Loading />}><GapFilling /></Suspense>
            },
            {
                path: 'exam/question/edit/shortAnswer',
                element: <Suspense fallback={<Loading />}><ShortAnswer /></Suspense>
            },
            {
                path: 'exam/task/list',
                element: <Suspense fallback={<Loading />}><TaskList /></Suspense>
            },
            {
                path: 'exam/task/edit',
                element: <Suspense fallback={<Loading />}><TaskEdit /></Suspense>
            },
            {
                path: 'education/subject/list',
                element: <Suspense fallback={<Loading />}><SubjectList /></Suspense>
            },
            {
                path: 'education/subject/edit',
                element: <Suspense fallback={<Loading />}><SubjectEdit /></Suspense>
            },
            {
                path: 'education/tag/list',
                element: <Suspense fallback={<Loading />}><TagList /></Suspense>
            },
            {
                path: 'education/tag/edit',
                element: <Suspense fallback={<Loading />}><TagEdit /></Suspense>
            },
            {
                path: 'education/tag/questions',
                element: <Suspense fallback={<Loading />}><TagQuestionList /></Suspense>
            },
            {
                path: 'answer/list',
                element: <Suspense fallback={<Loading />}><AnswerList /></Suspense>
            },
            {
                path: 'answer/edit',
                element: <Suspense fallback={<Loading />}><AnswerEdit /></Suspense>
            },
            {
                path: 'answer/read',
                element: <Suspense fallback={<Loading />}><AnswerRead /></Suspense>
            },
            {
                path: 'message/list',
                element: <Suspense fallback={<Loading />}><MessageList /></Suspense>
            },
            {
                path: 'message/send',
                element: <Suspense fallback={<Loading />}><MessageSend /></Suspense>
            },
            {
                path: 'profile/index',
                element: <Suspense fallback={<Loading />}><Profile /></Suspense>
            },
            {
                path: 'log/user/list',
                element: <Suspense fallback={<Loading />}><LogUserList /></Suspense>
            },
            {
                path: 'log/abnormal/list',
                element: <Suspense fallback={<Loading />}><LogAbnormalList /></Suspense>
            }
        ]
    },
    {
        path: '/401',
        element: <Suspense fallback={<Loading />}><Unauthorized /></Suspense>
    },
    {
        path: '*',
        element: <Suspense fallback={<Loading />}><NotFound /></Suspense>
    }
]);

export default router;
