package com.mindskip.xzs.service;

import com.github.pagehelper.PageInfo;
import com.mindskip.xzs.domain.Tag;
import com.mindskip.xzs.viewmodel.admin.education.TagEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.education.TagPageRequestVM;

import java.util.List;
import java.util.Map;

public interface TagService extends BaseService<Tag> {

    String PRACTICE_HIDDEN_TAG_NAME = "考前保密";

    PageInfo<Tag> page(TagPageRequestVM requestVM);

    List<Tag> list(String keyword);

    boolean existsByName(String name, Integer excludeId);

    Integer getTagIdByName(String name);

    Tag saveTag(TagEditRequestVM model, Integer userId);

    Integer countReferences(Integer tagId);

    List<Tag> listQuestionTagsForStudent(Integer userGroupId, Integer subjectId, String keyword);

    List<Tag> listQuestionTagsForStudent(Integer userGroupId, Integer subjectId, String keyword, String excludeTagName);

    List<Integer> resolveTagIds(List<Integer> tagIds, List<String> newTagNames, Integer userId);

    List<Integer> getQuestionTagIds(Integer questionId);

    List<String> getQuestionTagNames(Integer questionId);

    void syncQuestionTags(Integer questionId, List<Integer> tagIds);

    boolean removeQuestionTag(Integer questionId, Integer tagId);

    int removeQuestionTags(List<Integer> questionIds, Integer tagId);

    Map<Integer, List<String>> mapQuestionTagNames(List<Integer> questionIds);

    List<Integer> getExamPaperTagIds(Integer examPaperId);

    List<String> getExamPaperTagNames(Integer examPaperId);

    void syncExamPaperTags(Integer examPaperId, List<Integer> tagIds);

    Map<Integer, List<String>> mapExamPaperTagNames(List<Integer> examPaperIds);
}
