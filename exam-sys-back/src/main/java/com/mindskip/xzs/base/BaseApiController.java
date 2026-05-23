package com.mindskip.xzs.base;

import com.mindskip.xzs.context.WebContext;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.domain.enums.RoleEnum;
import com.mindskip.xzs.utility.ModelMapperSingle;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;

/**
 * @version 3.5.0
 * @description: The type Base api controller.
 * @date 2021/12/25 9:45
 */
public class BaseApiController {
    /**
     * The constant DEFAULT_PAGE_SIZE.
     */
    protected final static String DEFAULT_PAGE_SIZE = "10";
    /**
     * The constant modelMapper.
     */
    protected final static ModelMapper modelMapper = ModelMapperSingle.Instance();
    /**
     * The Web context.
     */
    @Autowired
    protected WebContext webContext;

    /**
     * Gets current user.
     *
     * @return the current user
     */
    protected User getCurrentUser() {
        return webContext.getCurrentUser();
    }

    protected void requireAdmin() {
        User currentUser = getCurrentUser();
        if (currentUser == null || !RoleEnum.ADMIN.getCodeAsInteger().equals(currentUser.getRole())) {
            throw new AccessDeniedException("Only administrators can manage user groups.");
        }
    }
}
