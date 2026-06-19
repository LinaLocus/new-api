import { useEffect } from 'react';

// 在 auth 页面（登录/注册/找回密码）强制深色外观。
// 这些页面是深色背景，但全站共用的顶栏在浅色模式下是白底深字，叠在深色页面上会看不清。
// 直接操作 DOM、不写 localStorage，卸载时恢复，避免污染用户原本的主题偏好。
export const useForceDarkTheme = () => {
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevBodyMode = body.getAttribute('theme-mode');
    const prevHtmlDark = html.classList.contains('dark');

    body.setAttribute('theme-mode', 'dark');
    html.classList.add('dark');

    return () => {
      if (prevBodyMode === null) {
        body.removeAttribute('theme-mode');
      } else {
        body.setAttribute('theme-mode', prevBodyMode);
      }
      if (!prevHtmlDark) {
        html.classList.remove('dark');
      }
    };
  }, []);
};
