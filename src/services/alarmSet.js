import { stringify } from '../utils/util';
import request from '../utils/request';

export async function fetchAlarmsService() {
  return request('/mobile/user/queryAlarmSettings', {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function setAlarmService(params) {
  return request('/mobile/user/setAlarmSettings', {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(params)
  });
}