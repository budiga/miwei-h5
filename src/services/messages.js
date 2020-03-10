import { stringify } from '../utils/util';
import request from '../utils/request';

export async function queryMessages(params) {
  return request(`/mobile/message/list?${stringify(params)}`, {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function setPermissionService(params) {
  return request('/mobile/device/setPermission', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}