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

import { useEffect, useState } from 'react';
import { fetchTokenKeys, getServerAddress } from '../../helpers/token';
import { showError } from '../../helpers';

export function useTokenKeys(id) {
  const [keys, setKeys] = useState([]);
  const [serverAddress, setServerAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      const fetchedKeys = await fetchTokenKeys();
      if (fetchedKeys.length === 0) {
        showError('无法自动准备 Moon Studio 令牌，请前往令牌管理手动创建一个启用令牌。');
        setTimeout(() => {
          window.location.href = '/console/token';
        }, 2000); // 延迟 2 秒后跳转
      }
      setKeys(fetchedKeys);
      setIsLoading(false);

      const address = getServerAddress();
      setServerAddress(address);
    };

    loadAllData();
  }, []);

  return { keys, serverAddress, isLoading };
}
