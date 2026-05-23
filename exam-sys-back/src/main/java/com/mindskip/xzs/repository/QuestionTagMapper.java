package com.mindskip.xzs.repository;

import com.mindskip.xzs.domain.QuestionTag;
import com.mindskip.xzs.domain.other.EntityTagRef;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface QuestionTagMapper extends BaseMapper<QuestionTag> {

    int deleteByQuestionId(@Param("questionId") Integer questionId);

    int deleteByQuestionIdAndTagId(@Param("questionId") Integer questionId, @Param("tagId") Integer tagId);

    int deleteByQuestionIdsAndTagId(@Param("questionIds") List<Integer> questionIds, @Param("tagId") Integer tagId);

    int insertBatch(@Param("records") List<QuestionTag> records);

    List<Integer> selectTagIdsByQuestionId(@Param("questionId") Integer questionId);

    List<EntityTagRef> selectTagRefsByQuestionIds(@Param("questionIds") List<Integer> questionIds);
}
