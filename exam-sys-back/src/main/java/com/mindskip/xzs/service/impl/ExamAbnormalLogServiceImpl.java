package com.mindskip.xzs.service.impl;

import com.mindskip.xzs.domain.ExamAbnormalLog;
import com.mindskip.xzs.repository.ExamAbnormalLogMapper;
import com.mindskip.xzs.service.ExamAbnormalLogService;
import com.mindskip.xzs.viewmodel.admin.user.UserEventPageRequestVM;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ExamAbnormalLogServiceImpl implements ExamAbnormalLogService {

    private final ExamAbnormalLogMapper examAbnormalLogMapper;

    @Autowired
    public ExamAbnormalLogServiceImpl(ExamAbnormalLogMapper examAbnormalLogMapper) {
        this.examAbnormalLogMapper = examAbnormalLogMapper;
    }

    @Override
    public void insert(ExamAbnormalLog record) {
        examAbnormalLogMapper.insert(record);
    }

    @Override
    public PageInfo<ExamAbnormalLog> page(UserEventPageRequestVM model) {
        return PageHelper.startPage(model.getPageIndex(), model.getPageSize(), "id desc").doSelectPageInfo(() ->
                examAbnormalLogMapper.page(model)
        );
    }
}
