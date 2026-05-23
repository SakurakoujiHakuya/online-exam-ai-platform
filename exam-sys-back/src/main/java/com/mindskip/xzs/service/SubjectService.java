package com.mindskip.xzs.service;

import com.mindskip.xzs.domain.Subject;
import com.mindskip.xzs.viewmodel.admin.education.SubjectPageRequestVM;
import com.mindskip.xzs.viewmodel.common.education.GroupItemVM;
import com.github.pagehelper.PageInfo;

import java.util.List;

public interface SubjectService extends BaseService<Subject> {

    List<Subject> getSubjectByUserGroupId(Integer userGroupId);

    List<Subject> allSubject();

    List<GroupItemVM> allGroups();

    Integer userGroupIdBySubjectId(Integer id);

    String userGroupNameById(Integer userGroupId);

    default List<Subject> getSubjectByLevel(Integer level) {
        return getSubjectByUserGroupId(level);
    }

    default Integer levelBySubjectId(Integer id) {
        return userGroupIdBySubjectId(id);
    }

    default String levelNameByLevel(Integer level) {
        return userGroupNameById(level);
    }

    PageInfo<Subject> page(SubjectPageRequestVM requestVM);
}
