package com.mindskip.xzs.service;

import com.mindskip.xzs.domain.AiConfig;
import java.util.List;

public interface AiConfigService {
    List<AiConfig> allList();
    AiConfig selectById(Integer id);
    void saveOrUpdate(AiConfig aiConfig);
    void deleteById(Integer id);
    void setActive(Integer id);
    AiConfig getActive();
}
