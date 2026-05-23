package com.mindskip.xzs.service.impl;

import com.mindskip.xzs.domain.Subject;
import com.mindskip.xzs.domain.UserGroup;
import com.mindskip.xzs.repository.SubjectMapper;
import com.mindskip.xzs.repository.UserGroupMapper;
import com.mindskip.xzs.service.SubjectService;
import com.mindskip.xzs.viewmodel.admin.education.SubjectPageRequestVM;
import com.mindskip.xzs.viewmodel.common.education.GroupItemVM;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class SubjectServiceImpl extends BaseServiceImpl<Subject> implements SubjectService {

    private final SubjectMapper subjectMapper;
    private final UserGroupMapper userGroupMapper;

    @Autowired
    public SubjectServiceImpl(SubjectMapper subjectMapper, UserGroupMapper userGroupMapper) {
        super(subjectMapper);
        this.subjectMapper = subjectMapper;
        this.userGroupMapper = userGroupMapper;
    }

    @Override
    public Subject selectById(Integer id) {
        return super.selectById(id);
    }

    @Override
    public int updateByIdFilter(Subject record) {
        return super.updateByIdFilter(record);
    }

    @Override
    public List<Subject> getSubjectByUserGroupId(Integer userGroupId) {
        return populateUserGroupNames(subjectMapper.getSubjectByLevel(userGroupId));
    }

    @Override
    public List<Subject> allSubject() {
        return populateUserGroupNames(subjectMapper.allSubject());
    }

    @Override
    public List<GroupItemVM> allGroups() {
        return userGroupMapper.allGroups().stream()
                .collect(Collectors.toMap(
                        UserGroup::getId,
                        group -> new GroupItemVM(group.getId(), group.getName()),
                        (current, ignored) -> current
                ))
                .values()
                .stream()
                .sorted(Comparator.comparing(GroupItemVM::getUserGroupId))
                .collect(Collectors.toList());
    }

    @Override
    public Integer userGroupIdBySubjectId(Integer id) {
        Subject subject = this.selectById(id);
        return subject == null ? null : subject.getUserGroupId();
    }

    @Override
    public String userGroupNameById(Integer userGroupId) {
        if (userGroupId == null) {
            return null;
        }
        return userGroupMapper.allGroups().stream()
                .filter(group -> Objects.equals(group.getId(), userGroupId))
                .map(UserGroup::getName)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
    }

    @Override
    public PageInfo<Subject> page(SubjectPageRequestVM requestVM) {
        PageInfo<Subject> pageInfo = PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc").doSelectPageInfo(() ->
                subjectMapper.page(requestVM)
        );
        pageInfo.setList(populateUserGroupNames(pageInfo.getList()));
        return pageInfo;
    }

    private List<Subject> populateUserGroupNames(List<Subject> subjects) {
        subjects.forEach(subject -> subject.setUserGroupName(userGroupNameById(subject.getUserGroupId())));
        return subjects;
    }

}
