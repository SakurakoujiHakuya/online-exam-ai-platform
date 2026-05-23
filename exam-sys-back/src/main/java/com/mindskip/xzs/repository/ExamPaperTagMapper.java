package com.mindskip.xzs.repository;

import com.mindskip.xzs.domain.ExamPaperTag;
import com.mindskip.xzs.domain.other.EntityTagRef;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ExamPaperTagMapper extends BaseMapper<ExamPaperTag> {

    int deleteByExamPaperId(@Param("examPaperId") Integer examPaperId);

    int insertBatch(@Param("records") List<ExamPaperTag> records);

    List<Integer> selectTagIdsByExamPaperId(@Param("examPaperId") Integer examPaperId);

    List<EntityTagRef> selectTagRefsByExamPaperIds(@Param("examPaperIds") List<Integer> examPaperIds);
}
