package com.mindskip.xzs.controller.admin;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.AiConfig;
import com.mindskip.xzs.service.AiConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("AdminAiConfigController")
@RequestMapping(value = "/api/admin/ai/config")
public class AiConfigController extends BaseApiController {

    private final AiConfigService aiConfigService;

    @Autowired
    public AiConfigController(AiConfigService aiConfigService) {
        this.aiConfigService = aiConfigService;
    }

    @RequestMapping(value = "/all", method = RequestMethod.POST)
    public RestResponse<List<AiConfig>> all() {
        List<AiConfig> list = aiConfigService.allList();
        return RestResponse.ok(list);
    }

    @RequestMapping(value = "/select/{id}", method = RequestMethod.POST)
    public RestResponse<AiConfig> select(@PathVariable Integer id) {
        AiConfig model = aiConfigService.selectById(id);
        return RestResponse.ok(model);
    }

    @RequestMapping(value = "/edit", method = RequestMethod.POST)
    public RestResponse<AiConfig> edit(@RequestBody AiConfig model) {
        aiConfigService.saveOrUpdate(model);
        return RestResponse.ok(model);
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.POST)
    public RestResponse<String> delete(@PathVariable Integer id) {
        aiConfigService.deleteById(id);
        return RestResponse.ok();
    }

    @RequestMapping(value = "/set-active/{id}", method = RequestMethod.POST)
    public RestResponse<String> setActive(@PathVariable Integer id) {
        aiConfigService.setActive(id);
        return RestResponse.ok();
    }
}
