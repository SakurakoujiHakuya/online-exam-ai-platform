import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, Tag, message } from 'antd';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { deleteSubject, edit as editSubject, pageList as pageSubjectList } from '@/api/subject';
import { editGroup, listGroups, selectGroup } from '@/api/group';
import './edit.css';

const createDraftSubject = (name = '') => ({
    tempId: `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name
});

const normalizeErrorMessage = error => {
    if (typeof error === 'string') {
        return error;
    }
    return error?.message || '系统内部错误';
};

const SubjectEdit = () => {
    const [form] = Form.useForm();
    const [subjectForm] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const { userInfo } = useSelector(state => state.user);
    const isAdmin = userInfo?.role === 3;
    const watchedGroupName = Form.useWatch('name', form);
    const [pageLoading, setPageLoading] = useState(false);
    const [groupSaving, setGroupSaving] = useState(false);
    const [subjectTableLoading, setSubjectTableLoading] = useState(false);
    const [subjectSaving, setSubjectSaving] = useState(false);
    const [subjectModalOpen, setSubjectModalOpen] = useState(false);
    const [subjectModalState, setSubjectModalState] = useState({ mode: 'create', source: 'draft', record: null });
    const [subjects, setSubjects] = useState([]);
    const [draftSubjects, setDraftSubjects] = useState([]);
    const [persistedGroupName, setPersistedGroupName] = useState('');
    const initializedLocationStateRef = useRef(false);

    const currentGroupId = id ? Number(id) : null;
    const isEditMode = currentGroupId !== null && !Number.isNaN(currentGroupId);

    const effectiveDraftGroupName = isEditMode ? (persistedGroupName || watchedGroupName || '') : (watchedGroupName || '');

    const loadSubjects = async groupId => {
        setSubjectTableLoading(true);
        try {
            const res = await pageSubjectList({ pageIndex: 1, pageSize: 1000, userGroupId: groupId });
            if (res.code === 1) {
                setSubjects(res.response?.list || []);
            } else {
                message.error(res.message);
            }
        } catch (error) {
            message.error(normalizeErrorMessage(error));
        } finally {
            setSubjectTableLoading(false);
        }
    };

    useEffect(() => {
        if (initializedLocationStateRef.current) {
            return;
        }

        initializedLocationStateRef.current = true;
        const draftState = Array.isArray(location.state?.draftSubjects)
            ? location.state.draftSubjects.map(item => ({ ...createDraftSubject(item.name), name: item.name }))
            : [];
        if (draftState.length > 0) {
            setDraftSubjects(draftState);
        }
        if (location.state?.flashMessage) {
            message.warning(location.state.flashMessage);
        }
        if (location.state?.flashSuccess) {
            message.success(location.state.flashSuccess);
        }

        if (location.state) {
            navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
        }
    }, [location.pathname, location.search, location.state, navigate]);

    useEffect(() => {
        if (!isAdmin || !isEditMode) {
            if (!isEditMode) {
                form.resetFields();
                setPersistedGroupName('');
                setSubjects([]);
            }
            return;
        }

        setPageLoading(true);
        Promise.all([selectGroup(currentGroupId), pageSubjectList({ pageIndex: 1, pageSize: 1000, userGroupId: currentGroupId })])
            .then(([groupRes, subjectRes]) => {
                if (groupRes.code === 1) {
                    form.setFieldsValue(groupRes.response);
                    setPersistedGroupName(groupRes.response?.name || '');
                } else {
                    message.error(groupRes.message);
                }

                if (subjectRes.code === 1) {
                    setSubjects(subjectRes.response?.list || []);
                } else {
                    message.error(subjectRes.message);
                }
            })
            .catch(error => {
                message.error(normalizeErrorMessage(error));
            })
            .finally(() => {
                setPageLoading(false);
            });
    }, [currentGroupId, form, isAdmin, isEditMode]);

    const closeSubjectModal = () => {
        setSubjectModalOpen(false);
        setSubjectModalState({ mode: 'create', source: isEditMode ? 'persisted' : 'draft', record: null });
        subjectForm.resetFields();
    };

    const openCreateSubjectModal = () => {
        setSubjectModalState({ mode: 'create', source: isEditMode ? 'persisted' : 'draft', record: null });
        subjectForm.setFieldsValue({ name: '' });
        setSubjectModalOpen(true);
    };

    const openEditPersistedSubjectModal = record => {
        setSubjectModalState({ mode: 'edit', source: 'persisted', record });
        subjectForm.setFieldsValue({ name: record.name });
        setSubjectModalOpen(true);
    };

    const openEditDraftSubjectModal = record => {
        setSubjectModalState({ mode: 'edit', source: 'draft', record });
        subjectForm.setFieldsValue({ name: record.name });
        setSubjectModalOpen(true);
    };

    const updateDraftSubject = (tempId, updater) => {
        setDraftSubjects(prev => prev.map(item => (item.tempId === tempId ? { ...item, ...updater } : item)));
    };

    const removeDraftSubject = tempId => {
        setDraftSubjects(prev => prev.filter(item => item.tempId !== tempId));
    };

    const saveSingleSubject = async ({ id: subjectId, name, userGroupId, userGroupName }) => {
        const res = await editSubject({ id: subjectId, name, userGroupId, userGroupName });
        if (res.code !== 1) {
            throw new Error(res.message);
        }
        return res;
    };

    const resolveGroupIdByName = async groupName => {
        const res = await listGroups();
        if (res.code !== 1) {
            throw new Error(res.message);
        }
        const matchedGroup = (res.response || []).find(item => item.name === groupName);
        if (!matchedGroup?.id) {
            throw new Error('用户组已创建，但暂时无法定位到新用户组，请刷新后重试');
        }
        return matchedGroup.id;
    };

    const persistDraftSubjects = async (groupId, groupName, draftList) => {
        if (!draftList.length) {
            return { failedSubjects: [], successCount: 0 };
        }

        const results = await Promise.allSettled(
            draftList.map(item => saveSingleSubject({ name: item.name, userGroupId: groupId, userGroupName: groupName }))
        );

        const failedSubjects = [];
        let successCount = 0;

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successCount += 1;
            } else {
                failedSubjects.push({ name: draftList[index].name });
            }
        });

        return { failedSubjects, successCount };
    };

    const syncSubjectUserGroupNames = async nextGroupName => {
        if (!subjects.length) {
            return { failedCount: 0 };
        }

        const results = await Promise.allSettled(
            subjects.map(subject => saveSingleSubject({
                id: subject.id,
                name: subject.name,
                userGroupId: subject.userGroupId,
                userGroupName: nextGroupName
            }))
        );

        const failedCount = results.filter(result => result.status === 'rejected').length;
        return { failedCount };
    };

    const handleGroupSubmit = async values => {
        setGroupSaving(true);
        try {
            const trimmedGroupName = values.name?.trim();
            const res = await editGroup({ name: trimmedGroupName, id: currentGroupId });
            if (res.code !== 1) {
                message.error(res.message);
                return;
            }

            if (!isEditMode) {
                const nextGroupId = await resolveGroupIdByName(trimmedGroupName);
                const { failedSubjects } = await persistDraftSubjects(nextGroupId, trimmedGroupName, draftSubjects);
                navigate(`/education/subject/edit?id=${nextGroupId}`, {
                    replace: true,
                    state: failedSubjects.length > 0
                        ? {
                            draftSubjects: failedSubjects,
                            flashMessage: '用户组已创建，部分学科保存失败，请继续处理。'
                        }
                        : {
                            flashSuccess: '用户组创建成功，已进入学科管理页面。'
                        }
                });
                return;
            }

            let syncFailedCount = 0;
            const previousGroupName = persistedGroupName;
            if (previousGroupName && previousGroupName !== trimmedGroupName) {
                const syncResult = await syncSubjectUserGroupNames(trimmedGroupName);
                syncFailedCount = syncResult.failedCount;
            }

            setPersistedGroupName(trimmedGroupName);
            if (syncFailedCount > 0) {
                message.warning('用户组名称已更新，但部分学科组名同步失败，请稍后重试。');
            } else {
                message.success(res.message);
            }
            await loadSubjects(currentGroupId);
        } catch (error) {
            message.error(normalizeErrorMessage(error));
        } finally {
            setGroupSaving(false);
        }
    };

    const handlePersistedSubjectDelete = async subjectId => {
        setSubjectTableLoading(true);
        try {
            const res = await deleteSubject(subjectId);
            if (res.code === 1) {
                message.success('学科删除成功');
                await loadSubjects(currentGroupId);
            } else {
                message.error(res.message);
            }
        } catch (error) {
            message.error(normalizeErrorMessage(error));
        } finally {
            setSubjectTableLoading(false);
        }
    };

    const handleRetryDraftSubject = async draftRecord => {
        if (!isEditMode) {
            return;
        }

        setSubjectSaving(true);
        try {
            await saveSingleSubject({
                name: draftRecord.name,
                userGroupId: currentGroupId,
                userGroupName: persistedGroupName
            });
            message.success('学科保存成功');
            removeDraftSubject(draftRecord.tempId);
            await loadSubjects(currentGroupId);
        } catch (error) {
            message.error(normalizeErrorMessage(error));
        } finally {
            setSubjectSaving(false);
        }
    };

    const handleRetryAllDraftSubjects = async () => {
        if (!isEditMode || !draftSubjects.length) {
            return;
        }

        setSubjectSaving(true);
        try {
            const { failedSubjects, successCount } = await persistDraftSubjects(currentGroupId, persistedGroupName, draftSubjects);
            setDraftSubjects(failedSubjects.map(item => ({ ...createDraftSubject(item.name), name: item.name })));
            if (successCount > 0) {
                message.success(`已成功保存 ${successCount} 个待处理学科`);
            }
            if (failedSubjects.length > 0) {
                message.warning('仍有部分学科保存失败，请继续处理。');
            }
            await loadSubjects(currentGroupId);
        } catch (error) {
            message.error(normalizeErrorMessage(error));
        } finally {
            setSubjectSaving(false);
        }
    };

    const handleSubjectModalSubmit = async () => {
        try {
            const values = await subjectForm.validateFields();
            const trimmedName = values.name.trim();

            if (!isEditMode) {
                if (subjectModalState.mode === 'edit' && subjectModalState.record?.tempId) {
                    updateDraftSubject(subjectModalState.record.tempId, { name: trimmedName });
                } else {
                    setDraftSubjects(prev => [...prev, createDraftSubject(trimmedName)]);
                }
                closeSubjectModal();
                return;
            }

            setSubjectSaving(true);
            if (subjectModalState.source === 'persisted' && subjectModalState.mode === 'edit') {
                await saveSingleSubject({
                    id: subjectModalState.record.id,
                    name: trimmedName,
                    userGroupId: currentGroupId,
                    userGroupName: persistedGroupName
                });
                message.success('学科更新成功');
                await loadSubjects(currentGroupId);
                closeSubjectModal();
                return;
            }

            await saveSingleSubject({
                name: trimmedName,
                userGroupId: currentGroupId,
                userGroupName: persistedGroupName
            });
            message.success('学科保存成功');
            if (subjectModalState.source === 'draft' && subjectModalState.record?.tempId) {
                removeDraftSubject(subjectModalState.record.tempId);
            }
            await loadSubjects(currentGroupId);
            closeSubjectModal();
        } catch (error) {
            if (error?.errorFields) {
                return;
            }

            if (isEditMode && subjectModalState.source === 'draft' && subjectModalState.record?.tempId) {
                updateDraftSubject(subjectModalState.record.tempId, { name: subjectForm.getFieldValue('name')?.trim() || '' });
            }
            message.error(normalizeErrorMessage(error));
        } finally {
            setSubjectSaving(false);
        }
    };

    const persistedSubjectColumns = [
        { title: '学科 ID', dataIndex: 'id', key: 'id', width: 120 },
        { title: '学科名称', dataIndex: 'name', key: 'name', width: 260 },
        { title: '所属用户组', dataIndex: 'userGroupName', key: 'userGroupName', width: 180 },
        {
            title: '操作',
            key: 'action',
            width: 220,
            render: (_, record) => (
                <Space size="middle">
                    <Button size="small" onClick={() => openEditPersistedSubjectModal(record)}>编辑</Button>
                    <Popconfirm
                        title="确定删除该学科吗？"
                        onConfirm={() => handlePersistedSubjectDelete(record.id)}
                    >
                        <Button size="small" danger>删除</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const actionTitle = isEditMode ? '保存到当前用户组' : '编辑待保存学科';
    const draftSubjectColumns = [
        { title: '学科名称', dataIndex: 'name', key: 'name', width: 260 },
        {
            title: '所属用户组',
            key: 'groupName',
            width: 200,
            render: () => effectiveDraftGroupName ? (
                effectiveDraftGroupName
            ) : (
                <Tag color="gold">待填写用户组名称</Tag>
            )
        },
        {
            title: '状态',
            key: 'status',
            width: 160,
            render: () => (
                <Tag color={isEditMode ? 'orange' : 'blue'}>
                    {isEditMode ? '待重试保存' : '待首次提交'}
                </Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            width: 280,
            render: (_, record) => (
                <Space size="middle">
                    <Button size="small" onClick={() => openEditDraftSubjectModal(record)}>编辑</Button>
                    {isEditMode && (
                        <Button size="small" type="primary" ghost onClick={() => handleRetryDraftSubject(record)}>
                            {actionTitle}
                        </Button>
                    )}
                    <Button size="small" danger onClick={() => removeDraftSubject(record.tempId)}>删除</Button>
                </Space>
            )
        }
    ];

    if (!isAdmin) {
        return <Navigate to="/401" replace />;
    }

    return (
        <div className="app-container subject-edit-page">
            <div className="subject-edit-section">
                <div className="subject-edit-section__header">
                    <div>
                        <h2>{isEditMode ? '编辑用户组' : '新增用户组'}</h2>
                        <p>先维护用户组信息，再在同页管理该用户组下的学科。</p>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleGroupSubmit}
                    className="subject-edit-form"
                >
                    {isEditMode && (
                        <Form.Item label="用户组 ID">
                            <Input value={currentGroupId} disabled />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="name"
                        label="用户组名称"
                        rules={[{ required: true, message: '请输入用户组名称' }]}
                    >
                        <Input
                            placeholder="例如：实验班、考研组、A班"
                            maxLength={255}
                            disabled={pageLoading}
                        />
                    </Form.Item>
                    <Form.Item className="subject-edit-form__actions">
                        <Button type="primary" htmlType="submit" loading={groupSaving || pageLoading}>
                            {isEditMode ? '保存用户组' : '创建用户组并保存学科'}
                        </Button>
                        <Button onClick={() => navigate('/education/subject/list')}>返回</Button>
                    </Form.Item>
                </Form>
            </div>

            <div className="subject-edit-section">
                <div className="subject-edit-section__header">
                    <div>
                        <h2>学科管理</h2>
                        <p>
                            {isEditMode
                                ? '在这里维护当前用户组下的学科。新增、编辑、删除都会立即生效。'
                                : '可以先录入待保存学科，创建用户组时会一并保存。'}
                        </p>
                    </div>
                    <Space>
                        {isEditMode && draftSubjects.length > 0 && (
                            <Button loading={subjectSaving} onClick={handleRetryAllDraftSubjects}>
                                重试全部待处理学科
                            </Button>
                        )}
                        <Button type="primary" onClick={openCreateSubjectModal}>
                            {isEditMode ? '新增学科' : '添加待保存学科'}
                        </Button>
                    </Space>
                </div>

                {isEditMode ? (
                    <Table
                        columns={persistedSubjectColumns}
                        dataSource={subjects}
                        rowKey="id"
                        loading={pageLoading || subjectTableLoading || subjectSaving}
                        pagination={false}
                        locale={{ emptyText: '当前用户组下还没有学科，点击右上角“新增学科”开始添加。' }}
                        bordered
                        scroll={{ x: 'max-content' }}
                    />
                ) : (
                    <Table
                        columns={draftSubjectColumns}
                        dataSource={draftSubjects}
                        rowKey="tempId"
                        pagination={false}
                        locale={{ emptyText: '还没有待保存学科，可以先添加，提交用户组时会一并保存。' }}
                        bordered
                        scroll={{ x: 'max-content' }}
                    />
                )}

                {isEditMode && draftSubjects.length > 0 && (
                    <div className="subject-edit-draft-block">
                        <div className="subject-edit-draft-block__title">
                            <h3>待处理学科</h3>
                            <p>这些学科上次保存未成功，可以直接编辑后重新保存到当前用户组。</p>
                        </div>
                        <Table
                            columns={draftSubjectColumns}
                            dataSource={draftSubjects}
                            rowKey="tempId"
                            pagination={false}
                            loading={subjectSaving}
                            bordered
                            scroll={{ x: 'max-content' }}
                        />
                    </div>
                )}
            </div>

            <Modal
                title={
                    isEditMode
                        ? (subjectModalState.mode === 'edit' ? '编辑学科' : '新增学科')
                        : (subjectModalState.mode === 'edit' ? '编辑待保存学科' : '添加待保存学科')
                }
                open={subjectModalOpen}
                onCancel={closeSubjectModal}
                onOk={handleSubjectModalSubmit}
                confirmLoading={subjectSaving}
                destroyOnHidden
            >
                <Form form={subjectForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="学科名称"
                        rules={[
                            { required: true, message: '请输入学科名称' },
                            { whitespace: true, message: '请输入学科名称' }
                        ]}
                    >
                        <Input placeholder="例如：数学、英语、物理" maxLength={255} />
                    </Form.Item>
                    <Form.Item label="所属用户组">
                        <Input
                            value={
                                isEditMode
                                    ? (persistedGroupName || '当前用户组')
                                    : (watchedGroupName || '待创建用户组')
                            }
                            disabled
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SubjectEdit;
