package com.mindskip.xzs.repository;

import com.mindskip.xzs.domain.UserGroup;
import com.mindskip.xzs.viewmodel.admin.education.UserGroupPageRequestVM;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserGroupMapper extends BaseMapper<UserGroup> {

    List<UserGroup> allGroups();

    List<UserGroup> page(UserGroupPageRequestVM requestVM);

    Integer countByName(@Param("name") String name, @Param("excludeId") Integer excludeId);

    Integer countReferences(@Param("groupId") Integer groupId);
}
