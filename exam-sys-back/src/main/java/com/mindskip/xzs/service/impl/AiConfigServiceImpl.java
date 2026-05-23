package com.mindskip.xzs.service.impl;

import com.mindskip.xzs.domain.AiConfig;
import com.mindskip.xzs.repository.AiConfigMapper;
import com.mindskip.xzs.service.AiConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class AiConfigServiceImpl implements AiConfigService {

    private final AiConfigMapper aiConfigMapper;

    @Autowired
    public AiConfigServiceImpl(AiConfigMapper aiConfigMapper) {
        this.aiConfigMapper = aiConfigMapper;
    }

    @Override
    public List<AiConfig> allList() {
        return aiConfigMapper.allList();
    }

    @Override
    public AiConfig selectById(Integer id) {
        return aiConfigMapper.selectByPrimaryKey(id);
    }

    @Override
    public void saveOrUpdate(AiConfig aiConfig) {
        if (aiConfig.getId() == null) {
            aiConfig.setCreateTime(new Date());
            aiConfig.setModifyTime(new Date());
            aiConfigMapper.insertSelective(aiConfig);
        } else {
            aiConfig.setModifyTime(new Date());
            aiConfigMapper.updateByPrimaryKeySelective(aiConfig);
        }
    }

    @Override
    public void deleteById(Integer id) {
        aiConfigMapper.deleteByPrimaryKey(id);
    }

    @Override
    @Transactional
    public void setActive(Integer id) {
        aiConfigMapper.resetAllActive();
        aiConfigMapper.setActive(id);
    }

    @Override
    public AiConfig getActive() {
        return aiConfigMapper.selectActive();
    }
}
