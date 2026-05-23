package com.mindskip.xzs.service;

import com.github.pagehelper.PageInfo;
import com.mindskip.xzs.domain.UserGroup;
import com.mindskip.xzs.viewmodel.admin.education.UserGroupPageRequestVM;

import java.util.List;

public interface UserGroupService extends BaseService<UserGroup> {

    List<UserGroup> allGroups();

    PageInfo<UserGroup> page(UserGroupPageRequestVM requestVM);

    boolean existsByName(String name, Integer excludeId);

    Integer countReferences(Integer groupId);
}
