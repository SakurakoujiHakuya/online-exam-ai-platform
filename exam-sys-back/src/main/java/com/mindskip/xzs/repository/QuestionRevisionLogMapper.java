package com.mindskip.xzs.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mindskip.xzs.domain.QuestionRevisionLog;

@Mapper
public interface QuestionRevisionLogMapper extends BaseMapper<QuestionRevisionLog> {

    List<QuestionRevisionLog> selectByQuestionId(Integer questionId);

    Integer countAll();

    Integer countByRevisionType(@Param("revisionType") String revisionType);
}
