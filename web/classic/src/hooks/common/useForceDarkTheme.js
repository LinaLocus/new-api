import { useEffect } from 'react';
import { useForceTheme } from '../../context/Theme';

// 在深色设计的页面（登录/注册/找回密码/首页）锁定深色主题。
// 通过 ThemeProvider 的 forceTheme 状态实现：挂载时强制深色，卸载时解除。
// 这样无论用户在页面上如何切换主题，actualTheme 都锁定深色，
// 不会出现"切换后顶栏看不清"的问题（单一数据源，不再用 DOM hack）。
export const useForceDarkTheme = () => {
  const setForceTheme = useForceTheme();

  useEffect(() => {
    setForceTheme('dark');
    return () => setForceTheme(null);
  }, [setForceTheme]);
};
