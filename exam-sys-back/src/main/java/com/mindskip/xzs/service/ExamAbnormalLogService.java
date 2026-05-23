package com.mindskip.xzs.service;

import com.mindskip.xzs.domain.ExamAbnormalLog;
import com.mindskip.xzs.viewmodel.admin.user.UserEventPageRequestVM;
import com.github.pagehelper.PageInfo;

public interface ExamAbnormalLogService {
    void insert(ExamAbnormalLog record);
    PageInfo<ExamAbnormalLog> page(UserEventPageRequestVM model);
}
