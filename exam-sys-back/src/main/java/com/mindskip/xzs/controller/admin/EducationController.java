package com.mindskip.xzs.controller.admin;

import com.github.pagehelper.PageInfo;
import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.Subject;
import com.mindskip.xzs.domain.Tag;
import com.mindskip.xzs.domain.UserGroup;
import com.mindskip.xzs.service.SubjectService;
import com.mindskip.xzs.service.TagService;
import com.mindskip.xzs.service.UserGroupService;
import com.mindskip.xzs.utility.PageInfoHelper;
import com.mindskip.xzs.viewmodel.admin.education.SubjectEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.education.SubjectPageRequestVM;
import com.mindskip.xzs.viewmodel.admin.education.SubjectResponseVM;
import com.mindskip.xzs.viewmodel.admin.education.TagEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.education.TagPageRequestVM;
import com.mindskip.xzs.viewmodel.admin.education.TagResponseVM;
import com.mindskip.xzs.viewmodel.admin.education.UserGroupEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.education.UserGroupPageRequestVM;
import com.mindskip.xzs.viewmodel.admin.education.UserGroupResponseVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.Date;

@RestController("AdminEducationController")
@RequestMapping(value = "/api/admin/education")
public class EducationController extends BaseApiController {

    private final SubjectService subjectService;
    private final UserGroupService userGroupService;
    private final TagService tagService;

    @Autowired
    public EducationController(SubjectService subjectService, UserGroupService userGroupService, TagService tagService) {
        this.subjectService = subjectService;
        this.userGroupService = userGroupService;
        this.tagService = tagService;
    }

    @RequestMapping(value = "/subject/list", method = RequestMethod.POST)
    public RestResponse<java.util.List<Subject>> list() {
        requireAdmin();
        return RestResponse.ok(subjectService.allSubject());
    }

    @RequestMapping(value = "/subject/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<SubjectResponseVM>> subjectPageList(@RequestBody SubjectPageRequestVM model) {
        requireAdmin();
        PageInfo<Subject> pageInfo = subjectService.page(model);
        PageInfo<SubjectResponseVM> page = PageInfoHelper.copyMap(pageInfo, subject -> modelMapper.map(subject, SubjectResponseVM.class));
        return RestResponse.ok(page);
    }

    @RequestMapping(value = "/subject/edit", method = RequestMethod.POST)
    public RestResponse subjectEdit(@RequestBody @Valid SubjectEditRequestVM model) {
        requireAdmin();
        Subject subject = modelMapper.map(model, Subject.class);
        if (model.getId() == null) {
            subject.setDeleted(false);
            subjectService.insertByFilter(subject);
        } else {
            subjectService.updateByIdFilter(subject);
        }
        return RestResponse.ok();
    }

    @RequestMapping(value = "/subject/select/{id}", method = RequestMethod.POST)
    public RestResponse<SubjectEditRequestVM> subjectSelect(@PathVariable Integer id) {
        requireAdmin();
        Subject subject = subjectService.selectById(id);
        SubjectEditRequestVM vm = modelMapper.map(subject, SubjectEditRequestVM.class);
        return RestResponse.ok(vm);
    }

    @RequestMapping(value = "/subject/delete/{id}", method = RequestMethod.POST)
    public RestResponse subjectDelete(@PathVariable Integer id) {
        requireAdmin();
        Subject subject = subjectService.selectById(id);
        subject.setDeleted(true);
        subjectService.updateByIdFilter(subject);
        return RestResponse.ok();
    }

    @RequestMapping(value = "/tag/list", method = RequestMethod.POST)
    public RestResponse<java.util.List<Tag>> tagList(@RequestBody(required = false) java.util.Map<String, String> query) {
        String keyword = query == null ? null : query.get("keyword");
        return RestResponse.ok(tagService.list(keyword));
    }

    @RequestMapping(value = "/tag/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<TagResponseVM>> tagPageList(@RequestBody TagPageRequestVM model) {
        requireAdmin();
        PageInfo<Tag> pageInfo = tagService.page(model);
        PageInfo<TagResponseVM> page = PageInfoHelper.copyMap(pageInfo, tag -> {
            TagResponseVM vm = modelMapper.map(tag, TagResponseVM.class);
            vm.setReferenceCount(tagService.countReferences(tag.getId()));
            return vm;
        });
        return RestResponse.ok(page);
    }

    @RequestMapping(value = "/tag/edit", method = RequestMethod.POST)
    public RestResponse tagEdit(@RequestBody @Valid TagEditRequestVM model) {
        requireAdmin();
        if (tagService.existsByName(model.getName(), model.getId())) {
            return RestResponse.fail(2, "标签名称已存在");
        }
        tagService.saveTag(model, getCurrentUser().getId());
        return RestResponse.ok();
    }

    @RequestMapping(value = "/tag/select/{id}", method = RequestMethod.POST)
    public RestResponse<TagEditRequestVM> tagSelect(@PathVariable Integer id) {
        requireAdmin();
        Tag tag = tagService.selectById(id);
        if (tag == null || Boolean.TRUE.equals(tag.getDeleted())) {
            return RestResponse.fail(2, "标签不存在");
        }
        TagEditRequestVM vm = modelMapper.map(tag, TagEditRequestVM.class);
        return RestResponse.ok(vm);
    }

    @RequestMapping(value = "/tag/delete/{id}", method = RequestMethod.POST)
    public RestResponse tagDelete(@PathVariable Integer id) {
        requireAdmin();
        Tag tag = tagService.selectById(id);
        if (tag == null || Boolean.TRUE.equals(tag.getDeleted())) {
            return RestResponse.fail(2, "标签不存在");
        }
        Integer referenceCount = tagService.countReferences(id);
        if (referenceCount != null && referenceCount > 0) {
            return RestResponse.fail(3, "当前标签仍被引用，无法删除");
        }
        tag.setDeleted(true);
        tagService.updateByIdFilter(tag);
        return RestResponse.ok();
    }

    @RequestMapping(value = "/tag/remove-question/{tagId}/{questionId}", method = RequestMethod.POST)
    public RestResponse tagRemoveQuestion(@PathVariable Integer tagId, @PathVariable Integer questionId) {
        requireAdmin();
        Tag tag = tagService.selectById(tagId);
        if (tag == null || Boolean.TRUE.equals(tag.getDeleted())) {
            return RestResponse.fail(2, "标签不存在");
        }
        boolean removed = tagService.removeQuestionTag(questionId, tagId);
        if (!removed) {
            return RestResponse.fail(3, "该题目未关联当前标签");
        }
        return RestResponse.ok();
    }

    @RequestMapping(value = "/tag/remove-questions/{tagId}", method = RequestMethod.POST)
    public RestResponse tagRemoveQuestions(@PathVariable Integer tagId, @RequestBody(required = false) java.util.Map<String, java.util.List<Integer>> body) {
        requireAdmin();
        Tag tag = tagService.selectById(tagId);
        if (tag == null || Boolean.TRUE.equals(tag.getDeleted())) {
            return RestResponse.fail(2, "标签不存在");
        }
        java.util.List<Integer> questionIds = body == null ? java.util.Collections.emptyList() : body.get("questionIds");
        int removedCount = tagService.removeQuestionTags(questionIds, tagId);
        if (removedCount <= 0) {
            return RestResponse.fail(3, "没有题目被移出当前标签");
        }
        return RestResponse.ok();
    }

    @RequestMapping(value = "/group/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<UserGroupResponseVM>> pageList(@RequestBody UserGroupPageRequestVM model) {
        requireAdmin();
        PageInfo<UserGroup> pageInfo = userGroupService.page(model);
        PageInfo<UserGroupResponseVM> page = PageInfoHelper.copyMap(pageInfo, group -> {
            UserGroupResponseVM vm = modelMapper.map(group, UserGroupResponseVM.class);
            vm.setReferenceCount(userGroupService.countReferences(group.getId()));
            return vm;
        });
        return RestResponse.ok(page);
    }

    @RequestMapping(value = "/group/edit", method = RequestMethod.POST)
    public RestResponse edit(@RequestBody @Valid UserGroupEditRequestVM model) {
        requireAdmin();
        if (userGroupService.existsByName(model.getName(), model.getId())) {
            return RestResponse.fail(2, "用户组名称已存在");
        }

        UserGroup userGroup = modelMapper.map(model, UserGroup.class);
        if (model.getId() == null) {
            userGroup.setDeleted(false);
            userGroup.setCreateTime(new Date());
            userGroupService.insertByFilter(userGroup);
        } else {
            userGroup.setModifyTime(new Date());
            userGroupService.updateByIdFilter(userGroup);
        }
        return RestResponse.ok();
    }

    @RequestMapping(value = "/group/select/{id}", method = RequestMethod.POST)
    public RestResponse<UserGroupEditRequestVM> select(@PathVariable Integer id) {
        requireAdmin();
        UserGroup userGroup = userGroupService.selectById(id);
        if (userGroup == null || Boolean.TRUE.equals(userGroup.getDeleted())) {
            return RestResponse.fail(2, "用户组不存在");
        }
        UserGroupEditRequestVM vm = modelMapper.map(userGroup, UserGroupEditRequestVM.class);
        return RestResponse.ok(vm);
    }

    @RequestMapping(value = "/group/delete/{id}", method = RequestMethod.POST)
    public RestResponse delete(@PathVariable Integer id) {
        requireAdmin();
        UserGroup userGroup = userGroupService.selectById(id);
        if (userGroup == null || Boolean.TRUE.equals(userGroup.getDeleted())) {
            return RestResponse.fail(2, "用户组不存在");
        }
        Integer referenceCount = userGroupService.countReferences(id);
        if (referenceCount != null && referenceCount > 0) {
            return RestResponse.fail(3, "当前用户组仍被使用，无法删除");
        }
        userGroup.setDeleted(true);
        userGroup.setModifyTime(new Date());
        userGroupService.updateByIdFilter(userGroup);
        return RestResponse.ok();
    }
}
