package com.mindskip.xzs.service.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.mindskip.xzs.domain.UserGroup;
import com.mindskip.xzs.repository.UserGroupMapper;
import com.mindskip.xzs.service.UserGroupService;
import com.mindskip.xzs.viewmodel.admin.education.UserGroupPageRequestVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserGroupServiceImpl extends BaseServiceImpl<UserGroup> implements UserGroupService {

    private final UserGroupMapper userGroupMapper;

    @Autowired
    public UserGroupServiceImpl(UserGroupMapper userGroupMapper) {
        super(userGroupMapper);
        this.userGroupMapper = userGroupMapper;
    }

    @Override
    public List<UserGroup> allGroups() {
        return userGroupMapper.allGroups();
    }

    @Override
    public PageInfo<UserGroup> page(UserGroupPageRequestVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize()).doSelectPageInfo(() ->
                userGroupMapper.page(requestVM)
        );
    }

    @Override
    public boolean existsByName(String name, Integer excludeId) {
        return userGroupMapper.countByName(name, excludeId) > 0;
    }

    @Override
    public Integer countReferences(Integer groupId) {
        return userGroupMapper.countReferences(groupId);
    }
}
