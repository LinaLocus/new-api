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

import React, { useEffect, useMemo, useState } from 'react';
import { useMoonStudioKey } from '../../hooks/chat/useMoonStudioKey';
import { API } from '../../helpers/api';

// Moon Studio 无限画布地址（你部署的 infinite-canvas）
const MOON_STUDIO_URL = 'https://canvas.moonisapi.com';

const MoonStudio = () => {
  const { keys, serverAddress, isLoading } = useMoonStudioKey();
  const [ticket, setTicket] = useState('');
  const [ticketReady, setTicketReady] = useState(false);

  // 向后端申请一张签名票据，交给画布中间件校验，防止直接访问 canvas 域名
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await API.get('/api/moon_studio/ticket');
        if (mounted && res.data?.success) {
          setTicket(res.data.data?.ticket || '');
        }
      } catch {
        // 忽略：拿不到票据时由画布中间件决定是否放行
      } finally {
        if (mounted) setTicketReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const iframeSrc = useMemo(() => {
    if (!keys || keys.length === 0 || !serverAddress) return '';
    const url = new URL(MOON_STUDIO_URL);
    url.searchParams.set('apiKey', `sk-${keys[0]}`);
    url.searchParams.set('baseUrl', serverAddress);
    // locked=1 锁定渠道配置，禁止用户切换到其他供应商
    url.searchParams.set('locked', '1');
    // ticket 为签名票据，画布中间件据此放行（防止绕过 Moon API 直接访问）
    if (ticket) url.searchParams.set('ticket', ticket);
    return url.toString();
  }, [keys, serverAddress, ticket]);

  if (isLoading || !ticketReady) {
    return (
      <div className='mt-[60px] px-2'>
        <h3>正在加载 Moon Studio，请稍候...</h3>
      </div>
    );
  }

  if (!iframeSrc) {
    return (
      <div className='mt-[60px] px-2'>
        <h3>无法打开 Moon Studio，请确认已有可用的启用令牌。</h3>
      </div>
    );
  }

  return (
    <iframe
      src={iframeSrc}
      title='Moon Studio'
      className='w-full border-0'
      style={{ height: 'calc(100vh - 64px)', marginTop: '64px' }}
      allow='camera; microphone; clipboard-write'
    />
  );
};

export default MoonStudio;
