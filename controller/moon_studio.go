/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

For commercial licensing, please contact support@quantumnous.com
*/

package controller

import (
	"net/http"

	"github.com/QuantumNous/new-api/common"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// GetMoonStudioVerify 供 Moon Studio（画布）中间件跨子域校验当前是否处于登录状态。
// 直接读会话（不依赖 New-Api-User 头，因此中间件转发 session cookie 即可校验），
// 登录且账号启用返回 success=true，否则 false。用于确保退出登录后画布立即失去访问权。
func GetMoonStudioVerify(c *gin.Context) {
	session := sessions.Default(c)
	id := session.Get("id")
	if id == nil {
		c.JSON(http.StatusOK, gin.H{"success": false})
		return
	}
	if status, ok := session.Get("status").(int); ok && status != common.UserStatusEnabled {
		c.JSON(http.StatusOK, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}
