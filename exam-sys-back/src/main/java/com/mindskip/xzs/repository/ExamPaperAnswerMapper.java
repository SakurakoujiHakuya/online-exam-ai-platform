package com.mindskip.xzs.repository;

import com.mindskip.xzs.domain.ExamPaperAnswer;
import com.mindskip.xzs.domain.other.KeyValue;
import com.mindskip.xzs.viewmodel.student.exampaper.ExamPaperAnswerPageVM;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

@Mapper
public interface ExamPaperAnswerMapper extends BaseMapper<ExamPaperAnswer> {

    List<ExamPaperAnswer> studentPage(ExamPaperAnswerPageVM requestVM);

    Integer selectAllCount();

    List<KeyValue> selectCountByDate(@Param("startTime") Date startTime, @Param("endTime") Date endTime);

    ExamPaperAnswer getByPidUid(@Param("pid") Integer paperId, @Param("uid") Integer uid);
    
    ExamPaperAnswer getByPidUidStatus(@Param("pid") Integer pid, @Param("uid") Integer uid, @Param("status") Integer status);

    List<ExamPaperAnswer> adminPage(com.mindskip.xzs.viewmodel.admin.paper.ExamPaperAnswerPageRequestVM requestVM);

    List<ExamPaperAnswer> selectListByPaperId(Integer paperId);

    List<ExamPaperAnswer> selectByUserIdAndDateRange(@Param("userId") Integer userId, @Param("startTime") Date startTime,
                                                     @Param("endTime") Date endTime, @Param("subjectId") Integer subjectId);
}
