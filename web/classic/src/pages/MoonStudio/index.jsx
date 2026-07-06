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

import React, { useMemo } from 'react';
import { useTokenKeys } from '../../hooks/chat/useTokenKeys';

// Moon Studio 无限画布地址（你部署的 infinite-canvas）
const MOON_STUDIO_URL = 'https://canvas.moonisapi.com';

const MoonStudio = () => {
  const { keys, serverAddress, isLoading } = useTokenKeys();

  const iframeSrc = useMemo(() => {
    if (!keys || keys.length === 0 || !serverAddress) return '';
    const url = new URL(MOON_STUDIO_URL);
    url.searchParams.set('apiKey', `sk-${keys[0]}`);
    url.searchParams.set('baseUrl', serverAddress);
    // locked=1 锁定渠道配置，禁止用户切换到其他供应商
    url.searchParams.set('locked', '1');
    return url.toString();
  }, [keys, serverAddress]);

  if (isLoading) {
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
