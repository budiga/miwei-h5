import { stringify } from '../utils/util';
import request from '../utils/request';


export async function normalLogin(params) {
  return request('/mobile/user/login', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function queryUserInfo_service() {
  return request('/mobile/user/queryUserInfo', {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function register_service(params) {
  return request('/mobile/user/register', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function getVerifiedCodeService(params) {
  return request('/common/verifiedCode/send', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function changePassword_service(params) {
  return request('/mobile/user/changePassword', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function resetPassword_service(params) {
  return request('/mobile/user/resetPassword', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function logout_service() {
  return request('/mobile/user/logout', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function editUserInfo_service(params) {
  return request('/mobile/user/editUserInfo', {
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: stringify(params),
  });
}

export async function uploadImage_service(params) {
  return request('/common/file/upload', {
    method: 'post',
    headers: {},
    body: params,
  });
}

export async function queryIssueCategory_service() {
  return request('/mobile/user/queryIssueCategory', {
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function submitIssue_service(params) {
  return request('/mobile/user/submitIssue', {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(params),
  });
}

