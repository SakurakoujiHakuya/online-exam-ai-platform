package com.mindskip.xzs.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.mindskip.xzs.domain.AiRecommendationRecord;

@Mapper
public interface AiRecommendationRecordMapper extends BaseMapper<AiRecommendationRecord> {

    List<AiRecommendationRecord> selectByStudentId(Integer studentId);

    Integer countAll();

    Integer countAccepted();

    Integer countUseful();
}
