package com.mindskip.xzs.controller.student;


import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.Subject;
import com.mindskip.xzs.domain.Tag;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.service.SubjectService;
import com.mindskip.xzs.service.TagService;
import com.mindskip.xzs.viewmodel.student.education.SubjectEditRequestVM;
import com.mindskip.xzs.viewmodel.student.education.SubjectVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController("StudentEducationController")
@RequestMapping(value = "/api/student/education")
public class EducationController extends BaseApiController {

    private final SubjectService subjectService;
    private final TagService tagService;

    @Autowired
    public EducationController(SubjectService subjectService, TagService tagService) {
        this.subjectService = subjectService;
        this.tagService = tagService;
    }

    @RequestMapping(value = "/subject/list", method = RequestMethod.POST)
    public RestResponse<List<SubjectVM>> list() {
        User user = getCurrentUser();
        List<Subject> subjects = subjectService.getSubjectByUserGroupId(user.getUserGroupId());
        List<SubjectVM> subjectVMS = subjects.stream().map(d -> {
            SubjectVM subjectVM = modelMapper.map(d, SubjectVM.class);
            subjectVM.setId(String.valueOf(d.getId()));
            return subjectVM;
        }).collect(Collectors.toList());
        return RestResponse.ok(subjectVMS);
    }

    @RequestMapping(value = "/subject/select/{id}", method = RequestMethod.POST)
    public RestResponse<SubjectEditRequestVM> select(@PathVariable Integer id) {
        Subject subject = subjectService.selectById(id);
        SubjectEditRequestVM vm = modelMapper.map(subject, SubjectEditRequestVM.class);
        return RestResponse.ok(vm);
    }

    @RequestMapping(value = "/tag/list", method = RequestMethod.POST)
    public RestResponse<List<Tag>> tagList(@RequestBody(required = false) java.util.Map<String, Object> query) {
        User user = getCurrentUser();
        Integer subjectId = null;
        String keyword = null;
        if (query != null) {
            Object subjectValue = query.get("subjectId");
            if (subjectValue instanceof Number) {
                subjectId = ((Number) subjectValue).intValue();
            } else if (subjectValue instanceof String && !((String) subjectValue).trim().isEmpty()) {
                subjectId = Integer.valueOf((String) subjectValue);
            }
            Object keywordValue = query.get("keyword");
            if (keywordValue != null) {
                keyword = String.valueOf(keywordValue);
            }
        }
        return RestResponse.ok(tagService.listQuestionTagsForStudent(
                user.getUserGroupId(),
                subjectId,
                keyword,
                TagService.PRACTICE_HIDDEN_TAG_NAME
        ));
    }

}
