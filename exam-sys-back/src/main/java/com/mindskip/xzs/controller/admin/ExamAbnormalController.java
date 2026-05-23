package com.mindskip.xzs.controller.admin;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.ExamAbnormalLog;
import com.mindskip.xzs.service.ExamAbnormalLogService;
import com.mindskip.xzs.viewmodel.admin.user.UserEventPageRequestVM;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController("AdminExamAbnormalController")
@RequestMapping(value = "/api/admin/exam/abnormal")
public class ExamAbnormalController extends BaseApiController {

    private final ExamAbnormalLogService examAbnormalLogService;

    @Autowired
    public ExamAbnormalController(ExamAbnormalLogService examAbnormalLogService) {
        this.examAbnormalLogService = examAbnormalLogService;
    }

    @RequestMapping(value = "/page/list", method = RequestMethod.POST)
    public RestResponse<PageInfo<ExamAbnormalLog>> pageList(@RequestBody UserEventPageRequestVM model) {
        PageInfo<ExamAbnormalLog> pageInfo = examAbnormalLogService.page(model);
        return RestResponse.ok(pageInfo);
    }
}
