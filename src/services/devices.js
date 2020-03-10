import { stringify } from '../utils/util';
import request from '../utils/request';

export async function queryDevices(params) {
  return request(`/mobile/device/list?${stringify(params)}`, {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function getControlAuthService(params) {
  return request('/mobile/device/requestPermission', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}