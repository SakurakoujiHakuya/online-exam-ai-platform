package com.mindskip.xzs.service.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.mindskip.xzs.domain.ExamPaperTag;
import com.mindskip.xzs.domain.QuestionTag;
import com.mindskip.xzs.domain.Tag;
import com.mindskip.xzs.domain.other.EntityTagRef;
import com.mindskip.xzs.repository.ExamPaperTagMapper;
import com.mindskip.xzs.repository.QuestionTagMapper;
import com.mindskip.xzs.repository.TagMapper;
import com.mindskip.xzs.service.TagService;
import com.mindskip.xzs.viewmodel.admin.education.TagEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.education.TagPageRequestVM;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import static com.mindskip.xzs.utility.ModelMapperSingle.Instance;

@Service
public class TagServiceImpl extends BaseServiceImpl<Tag> implements TagService {

    private static final ModelMapper modelMapper = Instance();

    private final TagMapper tagMapper;
    private final QuestionTagMapper questionTagMapper;
    private final ExamPaperTagMapper examPaperTagMapper;

    public TagServiceImpl(TagMapper tagMapper, QuestionTagMapper questionTagMapper, ExamPaperTagMapper examPaperTagMapper) {
        super(tagMapper);
        this.tagMapper = tagMapper;
        this.questionTagMapper = questionTagMapper;
        this.examPaperTagMapper = examPaperTagMapper;
    }

    @Override
    public PageInfo<Tag> page(TagPageRequestVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc")
                .doSelectPageInfo(() -> tagMapper.page(requestVM));
    }

    @Override
    public List<Tag> list(String keyword) {
        return tagMapper.list(keyword);
    }

    @Override
    public boolean existsByName(String name, Integer excludeId) {
        String normalizedName = normalizeName(name);
        if (normalizedName == null) {
            return false;
        }
        Integer count = tagMapper.countByName(normalizedName, excludeId);
        return count != null && count > 0;
    }

    @Override
    public Integer getTagIdByName(String name) {
        String normalizedName = normalizeName(name);
        if (normalizedName == null) {
            return null;
        }
        return tagMapper.selectIdByName(normalizedName);
    }

    @Override
    @Transactional
    public Tag saveTag(TagEditRequestVM model, Integer userId) {
        Tag tag = modelMapper.map(model, Tag.class);
        String normalizedName = normalizeName(model.getName());
        tag.setName(normalizedName);
        if (tag.getId() == null) {
            Tag existingTag = tagMapper.selectAnyByName(normalizedName);
            if (existingTag != null) {
                return restoreDeletedTag(existingTag, userId);
            }
            tag = insertNewTag(normalizedName, userId);
        } else {
            Tag existingTag = tagMapper.selectAnyByName(normalizedName);
            if (existingTag != null && !existingTag.getId().equals(tag.getId()) && Boolean.TRUE.equals(existingTag.getDeleted())) {
                existingTag.setName(buildDeletedPlaceholderName(existingTag.getId()));
                tagMapper.updateByPrimaryKeySelective(existingTag);
            }
            tagMapper.updateByPrimaryKeySelective(tag);
            tag = tagMapper.selectByPrimaryKey(tag.getId());
        }
        return tag;
    }

    @Override
    public Integer countReferences(Integer tagId) {
        Integer count = tagMapper.countReferences(tagId);
        return count == null ? 0 : count;
    }

    @Override
    public List<Tag> listQuestionTagsForStudent(Integer userGroupId, Integer subjectId, String keyword) {
        return listQuestionTagsForStudent(userGroupId, subjectId, keyword, null);
    }

    @Override
    public List<Tag> listQuestionTagsForStudent(Integer userGroupId, Integer subjectId, String keyword, String excludeTagName) {
        if (userGroupId == null) {
            return Collections.emptyList();
        }
        return tagMapper.listQuestionTagsForStudent(
                userGroupId,
                subjectId,
                normalizeName(keyword),
                normalizeName(excludeTagName)
        );
    }

    @Override
    @Transactional
    public List<Integer> resolveTagIds(List<Integer> tagIds, List<String> newTagNames, Integer userId) {
        LinkedHashSet<Integer> resolvedIds = new LinkedHashSet<>();
        if (tagIds != null) {
            tagIds.stream().filter(Objects::nonNull).forEach(resolvedIds::add);
        }

        for (String newTagName : normalizeNames(newTagNames)) {
            Tag existingTag = tagMapper.selectAnyByName(newTagName);
            if (existingTag != null) {
                existingTag = restoreDeletedTag(existingTag, userId);
                resolvedIds.add(existingTag.getId());
                continue;
            }
            Tag tag = insertNewTag(newTagName, userId);
            resolvedIds.add(tag.getId());
        }
        return new ArrayList<>(resolvedIds);
    }

    @Override
    public List<Integer> getQuestionTagIds(Integer questionId) {
        List<Integer> tagIds = questionTagMapper.selectTagIdsByQuestionId(questionId);
        return tagIds == null ? Collections.emptyList() : tagIds;
    }

    @Override
    public List<String> getQuestionTagNames(Integer questionId) {
        return mapQuestionTagNames(Collections.singletonList(questionId)).getOrDefault(questionId, Collections.emptyList());
    }

    @Override
    @Transactional
    public void syncQuestionTags(Integer questionId, List<Integer> tagIds) {
        questionTagMapper.deleteByQuestionId(questionId);
        List<Integer> distinctTagIds = distinctIds(tagIds);
        if (distinctTagIds.isEmpty()) {
            return;
        }
        List<QuestionTag> records = distinctTagIds.stream().map(tagId -> {
            QuestionTag record = new QuestionTag();
            record.setQuestionId(questionId);
            record.setTagId(tagId);
            return record;
        }).collect(Collectors.toList());
        questionTagMapper.insertBatch(records);
    }

    @Override
    @Transactional
    public boolean removeQuestionTag(Integer questionId, Integer tagId) {
        if (questionId == null || tagId == null) {
            return false;
        }
        return questionTagMapper.deleteByQuestionIdAndTagId(questionId, tagId) > 0;
    }

    @Override
    @Transactional
    public int removeQuestionTags(List<Integer> questionIds, Integer tagId) {
        List<Integer> distinctQuestionIds = distinctIds(questionIds);
        if (distinctQuestionIds.isEmpty() || tagId == null) {
            return 0;
        }
        return questionTagMapper.deleteByQuestionIdsAndTagId(distinctQuestionIds, tagId);
    }

    @Override
    public Map<Integer, List<String>> mapQuestionTagNames(List<Integer> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return questionTagMapper.selectTagRefsByQuestionIds(questionIds).stream()
                .collect(Collectors.groupingBy(EntityTagRef::getEntityId, Collectors.mapping(EntityTagRef::getTagName, Collectors.toList())));
    }

    @Override
    public List<Integer> getExamPaperTagIds(Integer examPaperId) {
        List<Integer> tagIds = examPaperTagMapper.selectTagIdsByExamPaperId(examPaperId);
        return tagIds == null ? Collections.emptyList() : tagIds;
    }

    @Override
    public List<String> getExamPaperTagNames(Integer examPaperId) {
        return mapExamPaperTagNames(Collections.singletonList(examPaperId)).getOrDefault(examPaperId, Collections.emptyList());
    }

    @Override
    @Transactional
    public void syncExamPaperTags(Integer examPaperId, List<Integer> tagIds) {
        examPaperTagMapper.deleteByExamPaperId(examPaperId);
        List<Integer> distinctTagIds = distinctIds(tagIds);
        if (distinctTagIds.isEmpty()) {
            return;
        }
        List<ExamPaperTag> records = distinctTagIds.stream().map(tagId -> {
            ExamPaperTag record = new ExamPaperTag();
            record.setExamPaperId(examPaperId);
            record.setTagId(tagId);
            return record;
        }).collect(Collectors.toList());
        examPaperTagMapper.insertBatch(records);
    }

    @Override
    public Map<Integer, List<String>> mapExamPaperTagNames(List<Integer> examPaperIds) {
        if (examPaperIds == null || examPaperIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return examPaperTagMapper.selectTagRefsByExamPaperIds(examPaperIds).stream()
                .collect(Collectors.groupingBy(EntityTagRef::getEntityId, Collectors.mapping(EntityTagRef::getTagName, Collectors.toList())));
    }

    private List<String> normalizeNames(List<String> names) {
        if (names == null || names.isEmpty()) {
            return Collections.emptyList();
        }
        return names.stream()
                .map(this::normalizeName)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    private String normalizeName(String name) {
        if (name == null) {
            return null;
        }
        String trimmed = name.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Tag insertNewTag(String name, Integer userId) {
        Tag tag = new Tag();
        tag.setName(name);
        tag.setCreateUser(userId);
        tag.setCreateTime(new Date());
        tag.setDeleted(false);
        tagMapper.insertSelective(tag);
        return tag;
    }

    private Tag restoreDeletedTag(Tag tag, Integer userId) {
        if (!Boolean.TRUE.equals(tag.getDeleted())) {
            return tag;
        }
        tag.setDeleted(false);
        if (tag.getCreateUser() == null) {
            tag.setCreateUser(userId);
        }
        if (tag.getCreateTime() == null) {
            tag.setCreateTime(new Date());
        }
        tagMapper.updateByPrimaryKeySelective(tag);
        return tagMapper.selectByPrimaryKey(tag.getId());
    }

    private String buildDeletedPlaceholderName(Integer tagId) {
        return "__deleted_tag_" + tagId + "_" + System.currentTimeMillis();
    }

    private List<Integer> distinctIds(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }
        return ids.stream().filter(Objects::nonNull).distinct().collect(Collectors.toList());
    }
}
