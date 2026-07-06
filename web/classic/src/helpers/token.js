/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import { API } from './api';

/**
 * 按需获取单个令牌的真实 key
 * @param {number|string} tokenId
 * @returns {Promise<string>} 返回不带 sk- 前缀的真实 token key
 */
export async function fetchTokenKey(tokenId) {
  const response = await API.post(`/api/token/${tokenId}/key`);
  const { success, data, message } = response.data || {};
  if (!success || !data?.key) {
    throw new Error(message || 'Failed to fetch token key');
  }
  return data.key;
}

/**
 * 批量获取多个令牌的真实 key
 * @param {number[]} tokenIds
 * @returns {Promise<Record<number, string>>} 返回 {id: key} map，key 不带 sk- 前缀
 */
export async function fetchTokenKeysBatch(tokenIds) {
  const response = await API.post('/api/token/batch/keys', { ids: tokenIds });
  const { success, data, message } = response.data || {};
  if (!success || !data?.keys) {
    throw new Error(message || 'Failed to fetch token keys');
  }
  return data.keys;
}

/**
 * 为 Moon Studio 自动创建一个默认令牌（走用户余额计费、不过期、用默认分组）。
 * 用于用户没有任何可用令牌时的无感兜底。
 * @returns {Promise<object|null>} 创建并拉取到的启用令牌对象，失败返回 null
 */
async function createMoonStudioToken() {
  try {
    const res = await API.post('/api/token/', {
      name: 'Moon Studio',
      remain_quota: 0,
      expired_time: -1,
      unlimited_quota: true,
      model_limits_enabled: false,
      model_limits: '',
      group: '',
    });
    if (!res.data?.success) return null;
    // 重新拉取列表，拿到刚创建的令牌（带 id）
    const list = await API.get('/api/token/?p=1&size=10');
    const data = list.data?.data;
    const items = Array.isArray(data) ? data : data?.items || [];
    const active = items.filter((token) => token.status === 1);
    return active.find((token) => !token.model_limits_enabled) || active[0] || null;
  } catch (error) {
    console.error('Error creating Moon Studio token:', error);
    return null;
  }
}

/**
 * 获取可用的 token keys
 * @returns {Promise<string[]>} 返回 active 状态的不带 sk- 前缀的真实 token key 数组
 */
export async function fetchTokenKeys() {
  try {
    const response = await API.get('/api/token/?p=1&size=10');
    const { success, data } = response.data;
    if (!success) throw new Error('Failed to fetch token keys');

    const tokenItems = Array.isArray(data) ? data : data.items || [];
    let activeTokens = tokenItems.filter((token) => token.status === 1);

    // 没有可用令牌：自动创建一个用于 Moon Studio 的默认令牌，实现无感进入
    if (activeTokens.length === 0) {
      const created = await createMoonStudioToken();
      if (created) activeTokens = [created];
    }
    if (activeTokens.length === 0) return [];

    // 只请求一个令牌的密钥，避免并发请求所有令牌触发关键接口限流(429)。
    // 优先选“无模型限制”的令牌，保证能访问全部模型（图片/视频等）；
    // 若都没有无限制的，则退回第一个启用令牌。
    const preferred =
      activeTokens.find((token) => !token.model_limits_enabled) ||
      activeTokens[0];

    try {
      const key = await fetchTokenKey(preferred.id);
      return key ? [key] : [];
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Error fetching token keys:', error);
    return [];
  }
}

/**
 * 获取服务器地址
 * @returns {string} 服务器地址
 */
export function getServerAddress() {
  let status = localStorage.getItem('status');
  let serverAddress = '';

  if (status) {
    try {
      status = JSON.parse(status);
      serverAddress = status.server_address || '';
    } catch (error) {
      console.error('Failed to parse status from localStorage:', error);
    }
  }

  if (!serverAddress) {
    serverAddress = window.location.origin;
  }

  return serverAddress;
}

export const CHANNEL_CONN_CLIPBOARD_TYPE = 'newapi_channel_conn';

/**
 * @param {string} key - 完整的 API key（含 sk- 前缀）
 * @param {string} url - 服务器地址
 * @returns {string} JSON 格式的连接字符串
 */
export function encodeChannelConnectionString(key, url) {
  return JSON.stringify({
    _type: CHANNEL_CONN_CLIPBOARD_TYPE,
    key,
    url,
  });
}

/**
 * @param {string} text - 剪贴板文本
 * @returns {{ key: string, url: string } | null}
 */
export function parseChannelConnectionString(text) {
  if (!text || typeof text !== 'string') return null;
  try {
    const parsed = JSON.parse(text.trim());
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed._type === CHANNEL_CONN_CLIPBOARD_TYPE &&
      typeof parsed.key === 'string' &&
      typeof parsed.url === 'string'
    ) {
      return { key: parsed.key, url: parsed.url };
    }
  } catch {
    // not valid JSON
  }
  return null;
}
