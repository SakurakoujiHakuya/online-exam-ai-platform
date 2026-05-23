package com.mindskip.xzs.repository;

import com.mindskip.xzs.domain.Tag;
import com.mindskip.xzs.repository.BaseMapper;
import com.mindskip.xzs.viewmodel.admin.education.TagPageRequestVM;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TagMapper extends BaseMapper<Tag> {

    List<Tag> page(TagPageRequestVM requestVM);

    List<Tag> list(@Param("keyword") String keyword);

    Integer countByName(@Param("name") String name, @Param("excludeId") Integer excludeId);

    Tag selectByName(@Param("name") String name);

    Tag selectAnyByName(@Param("name") String name);

    Integer selectIdByName(@Param("name") String name);

    Integer countReferences(@Param("tagId") Integer tagId);

    List<Tag> selectByIds(@Param("ids") List<Integer> ids);

    List<Tag> listQuestionTagsForStudent(@Param("userGroupId") Integer userGroupId,
                                         @Param("subjectId") Integer subjectId,
                                         @Param("keyword") String keyword,
                                         @Param("excludeTagName") String excludeTagName);
}
