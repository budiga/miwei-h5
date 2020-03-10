import { stringify } from '../utils/util';
import request from '../utils/request';
import JSONbig from 'json-bigint';

export function deviceBasicInfo(params) {
  return request(`/mobile/device/queryBasicInfo?${stringify(params)}`, {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export function addDeviceService(params) {
  return request('/mobile/device/addDevice', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}
export function requestPayService(params) {

  return request('/mobile/wetchat/requestPay', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}
export function queryRentDeviceInfoService(params) {
  return request(`/mobile/device/queryRentDeviceInfo?${stringify(params)}`, {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}





