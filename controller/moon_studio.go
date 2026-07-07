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
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// GetMoonStudioTicket 为已登录用户签发一张短期有效、HMAC 签名的票据。
// Moon Studio(画布）的中间件用共享密钥校验该票据，确保只有从 Moon API
// 跳转的已登录用户才能访问画布，直接访问域名会被拦截。
func GetMoonStudioTicket(c *gin.Context) {
	secret := os.Getenv("MOON_STUDIO_SECRET")
	if secret == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "Moon Studio 未配置 MOON_STUDIO_SECRET",
		})
		return
	}

	userId := c.GetInt("id")
	payload := map[string]interface{}{
		"uid": userId,
		"exp": time.Now().Add(12 * time.Hour).Unix(),
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "签发票据失败"})
		return
	}

	payloadB64 := base64.RawURLEncoding.EncodeToString(payloadBytes)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payloadB64))
	sig := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	ticket := payloadB64 + "." + sig

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    gin.H{"ticket": ticket},
	})
}
