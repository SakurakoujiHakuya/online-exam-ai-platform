package com.mindskip.xzs.repository;

import com.mindskip.xzs.domain.AiConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface AiConfigMapper extends BaseMapper<AiConfig> {
    List<AiConfig> allList();
    void resetAllActive();
    void setActive(@Param("id") Integer id);
    AiConfig selectActive();
}
