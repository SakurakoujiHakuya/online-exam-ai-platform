package com.mindskip.xzs.repository;

import com.mindskip.xzs.domain.ExamAbnormalLog;
import com.mindskip.xzs.viewmodel.admin.user.UserEventPageRequestVM;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ExamAbnormalLogMapper {
    int insert(ExamAbnormalLog record);
    List<ExamAbnormalLog> page(UserEventPageRequestVM model);
}
