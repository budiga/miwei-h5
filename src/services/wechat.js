import request from '../utils/request';

export function jssdkConfigSevice(url) {
  const finalUrl = url || document.location.href;
  return request('/mobile/wetchat/requestJssdkConfig', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: `url=${encodeURIComponent(finalUrl)}`,
  });
}
