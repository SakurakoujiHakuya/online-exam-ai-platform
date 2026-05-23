package com.mindskip.xzs.controller;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.Subject;
import com.mindskip.xzs.service.SubjectService;
import com.mindskip.xzs.viewmodel.common.education.GroupItemVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/api/common/education")
public class CommonEducationController extends BaseApiController {

    private final SubjectService subjectService;

    @Autowired
    public CommonEducationController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @RequestMapping(value = "/subject/list", method = RequestMethod.POST)
    public RestResponse<List<Subject>> subjectList() {
        List<Subject> subjects = subjectService.allSubject().stream()
                .filter(subject -> !Boolean.TRUE.equals(subject.getDeleted()))
                .collect(Collectors.toList());
        return RestResponse.ok(subjects);
    }

    @RequestMapping(value = "/group/list", method = RequestMethod.POST)
    public RestResponse<List<GroupItemVM>> groupList() {
        return RestResponse.ok(subjectService.allGroups());
    }
}
