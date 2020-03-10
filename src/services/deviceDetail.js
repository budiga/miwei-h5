import { stringify } from '../utils/util';
import request from '../utils/request';

export async function fetchDetailService(params) {
  return request(`/mobile/device/queryDetails?${stringify(params)}`, {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function setControlService(params) {
  return request('/mobile/device/control', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function deleteDeviceService(params) {
  return request('/mobile/device/removeDevice', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function fetchTimersService(params) {
  return request(`/mobile/timing/list?${stringify(params)}`, {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function addTimerService(params) {
  return request('/mobile/timing/create', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function deleteTimerService(params) {
  return request('/mobile/timing/delete', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function editTimerService(params) {
  return request('/mobile/timing/edit', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}
export async function switchAllService(params) {
  return request('/mobile/timing/switchAll', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function fetchStrainersService(params) {
  return request(`/mobile/device/queryStrainerStatus?${stringify(params)}`, {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function modifyDeviceService(params) {
  return request('/mobile/device/modifyDevice', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function fetchMatchDevicesService(params) {
  return request(`/mobile/device/queryMatchDeviceInfo?${stringify(params)}`, {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function setMatchDeviceInfoService(params) {
  return request('/mobile/device/setMatchDeviceInfo', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function fetchLineDataService(params) {
  return request(`/mobile/device/queryPM25HistoryData?${stringify(params)}`, {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function fetchBarDataService(params) {
  return request(`/mobile/device/querydeconAmountHistory?${stringify(params)}`, {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function requestOTAService(params) {
  return request('/mobile/device/requestOTA', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}